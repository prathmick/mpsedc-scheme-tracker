'use strict';

const { db } = require('../config/db');

async function getStats() {
  // Total count
  const countResult = await db.get('SELECT COUNT(*) AS total FROM applications');
  const total = countResult.total;

  // By status
  const statusRows = await db.all(
    `SELECT status, COUNT(*) AS count FROM applications GROUP BY status`
  );
  const byStatus = { Draft: 0, Review: 0, Approved: 0 };
  for (const row of statusRows) {
    byStatus[row.status] = row.count;
  }

  // By scheme
  const byScheme = await db.all(
    `SELECT s.name AS schemeName, COUNT(a.id) AS count
     FROM applications a
     JOIN schemes s ON a.schemeId = s.id
     GROUP BY a.schemeId, s.name
     ORDER BY count DESC`
  );

  // By district
  const byDistrict = await db.all(
    `SELECT district, COUNT(*) AS count FROM applications GROUP BY district ORDER BY count DESC`
  );

  // Recent activity (10 most recently updated)
  const recentActivity = await db.all(
    `SELECT a.id, a.citizenName, s.name AS schemeName, a.status, a.updatedAt
     FROM applications a
     JOIN schemes s ON a.schemeId = s.id
     ORDER BY a.updatedAt DESC
     LIMIT 10`
  );

  return {
    total,
    byStatus,
    byScheme,
    byDistrict,
    recentActivity,
  };
}

module.exports = { getStats };
