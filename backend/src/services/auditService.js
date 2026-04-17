'use strict';

const { db } = require('../config/db');

/**
 * Write an audit log entry.
 */
async function log({ userId, userEmail, role, action, resourceType, resourceId, details, ipAddress }) {
  await db.prepare(
    `INSERT INTO audit_logs (userId, userEmail, role, action, resourceType, resourceId, details, ipAddress)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId || null,
    userEmail || null,
    role || null,
    action,
    resourceType || null,
    resourceId !== undefined ? String(resourceId) : null,
    details ? JSON.stringify(details) : null,
    ipAddress || null
  );
}

/**
 * List audit logs with optional filters and pagination.
 */
async function listAuditLogs(filters = {}, pagination = {}) {
  const page = Math.max(1, parseInt(pagination.page) || 1);
  const limit = Math.max(1, parseInt(pagination.limit) || 20);
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];

  if (filters.userId) {
    conditions.push('userId = ?');
    params.push(filters.userId);
  }
  if (filters.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }
  if (filters.resourceType) {
    conditions.push('resourceType = ?');
    params.push(filters.resourceType);
  }
  if (filters.startDate) {
    conditions.push('createdAt >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('createdAt <= ?');
    params.push(filters.endDate);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const countResult = await db.get(
    `SELECT COUNT(*) AS total FROM audit_logs ${where}`, params
  );
  const total = countResult.total;

  const rows = await db.all(
    `SELECT * FROM audit_logs ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { log, listAuditLogs };
