'use strict';

const { db } = require('../config/db');
const { isValidTransition, getAllowedTransitions } = require('../utils/workflowStateMachine');

/**
 * Mask citizenAadhaar: replace first 8 chars with 'XXXX-XXXX-', keep last 4.
 */
function maskAadhaar(aadhaar) {
  if (!aadhaar || aadhaar.length < 4) return aadhaar;
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
}

function maskRow(row) {
  if (!row) return row;
  return { ...row, citizenAadhaar: maskAadhaar(row.citizenAadhaar) };
}

/**
 * List applications with role scoping, filtering, sorting, and pagination.
 */
async function listApplications(filters = {}, pagination = {}, user) {
  const page = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.max(1, parseInt(pagination.limit) || 10);
  const offset = (page - 1) * limit;

  const allowedSortBy = ['createdAt', 'updatedAt', 'citizenName', 'status', 'district'];
  const sortBy = allowedSortBy.includes(pagination.sortBy) ? `a.${pagination.sortBy}` : 'a.createdAt';
  const order = pagination.order && pagination.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];

  if (user.role === 'User') {
    conditions.push('a.createdBy = ?');
    params.push(user.userId);
  }

  if (filters.schemeId) {
    conditions.push('a.schemeId = ?');
    params.push(filters.schemeId);
  }
  if (filters.status) {
    conditions.push('a.status = ?');
    params.push(filters.status);
  }
  if (filters.district) {
    conditions.push('a.district = ?');
    params.push(filters.district);
  }
  if (filters.search) {
    conditions.push('a.citizenName LIKE ?');
    params.push(`%${filters.search}%`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const baseQuery = `
    FROM applications a
    JOIN schemes s ON a.schemeId = s.id
    JOIN users u ON a.createdBy = u.id
    ${where}
  `;

  const countResult = await db.get(`SELECT COUNT(*) AS total ${baseQuery}`, params);
  const total = countResult.total;

  const rows = await db.all(
    `SELECT
       a.id, a.citizenName, a.citizenAadhaar, a.schemeId, a.district,
       a.status, a.createdBy, a.transitionedAt, a.transitionedBy,
       a.createdAt, a.updatedAt,
       s.name AS schemeName,
       u.username AS officerName
     ${baseQuery}
     ORDER BY ${sortBy} ${order}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows.map(maskRow),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single application by ID with role scoping.
 */
async function getApplicationById(id, user) {
  const conditions = ['a.id = ?'];
  const params = [id];

  if (user.role === 'User') {
    conditions.push('a.createdBy = ?');
    params.push(user.userId);
  }

  const row = await db.get(
    `SELECT
       a.id, a.citizenName, a.citizenAadhaar, a.schemeId, a.district,
       a.status, a.createdBy, a.transitionedAt, a.transitionedBy,
       a.createdAt, a.updatedAt,
       s.name AS schemeName,
       u.username AS officerName
     FROM applications a
     JOIN schemes s ON a.schemeId = s.id
     JOIN users u ON a.createdBy = u.id
     WHERE ${conditions.join(' AND ')}`,
    params
  );

  if (!row) {
    const err = new Error('Application not found');
    err.status = 404;
    throw err;
  }

  return maskRow(row);
}

/**
 * Create a new application with status 'Draft'.
 */
async function createApplication(data, userId) {
  const { citizenName, citizenAadhaar, schemeId, district } = data;
  const result = await db.prepare(
    `INSERT INTO applications (citizenName, citizenAadhaar, schemeId, district, status, createdBy)
     VALUES (?, ?, ?, ?, 'Draft', ?)`
  ).run(citizenName, citizenAadhaar, schemeId, district, userId);

  const row = await db.get(
    `SELECT
       a.id, a.citizenName, a.citizenAadhaar, a.schemeId, a.district,
       a.status, a.createdBy, a.transitionedAt, a.transitionedBy,
       a.createdAt, a.updatedAt,
       s.name AS schemeName,
       u.username AS officerName
     FROM applications a
     JOIN schemes s ON a.schemeId = s.id
     JOIN users u ON a.createdBy = u.id
     WHERE a.id = ?`,
    [result.lastInsertRowid]
  );

  return maskRow(row);
}

/**
 * Update editable fields of an application. Throws 422 if status is Approved.
 */
async function updateApplication(id, data, user) {
  const app = await getApplicationById(id, user);

  if (app.status === 'Approved') {
    const err = new Error('Cannot modify an application after it has been approved');
    err.status = 422;
    throw err;
  }

  const { citizenName, citizenAadhaar, schemeId, district } = data;
  await db.prepare(
    `UPDATE applications
     SET citizenName = COALESCE(?, citizenName),
         citizenAadhaar = COALESCE(?, citizenAadhaar),
         schemeId = COALESCE(?, schemeId),
         district = COALESCE(?, district)
     WHERE id = ?`
  ).run(citizenName ?? null, citizenAadhaar ?? null, schemeId ?? null, district ?? null, id);

  return getApplicationById(id, user);
}

/**
 * Delete an application. Throws 422 if status is not Draft.
 */
async function deleteApplication(id, user) {
  const app = await getApplicationById(id, user);

  if (app.status !== 'Draft') {
    const err = new Error('Only Draft applications can be deleted');
    err.status = 422;
    throw err;
  }

  await db.prepare('DELETE FROM applications WHERE id = ?').run(id);
}

/**
 * Transition an application's status. Validates transition, updates record, inserts history.
 */
async function transitionStatus(id, targetStatus, user) {
  const app = await getApplicationById(id, user);

  if (!isValidTransition(app.status, targetStatus, user.role)) {
    const allowed = getAllowedTransitions(app.status, user.role);
    const err = new Error(
      `Invalid status transition from '${app.status}' to '${targetStatus}'. ` +
      `Valid transitions: ${allowed.length ? allowed.join(', ') : 'none'}`
    );
    err.status = 422;
    throw err;
  }

  const now = new Date().toISOString();

  await db.prepare(
    `UPDATE applications
     SET status = ?, transitionedAt = ?, transitionedBy = ?
     WHERE id = ?`
  ).run(targetStatus, now, user.userId, id);

  await db.prepare(
    `INSERT INTO application_status_history (applicationId, fromStatus, toStatus, transitionedBy, transitionedAt)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, app.status, targetStatus, user.userId, now);

  return getApplicationById(id, user);
}

module.exports = {
  listApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  transitionStatus,
};
