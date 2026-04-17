'use strict';

const auditService = require('../services/auditService');

async function listLogs(req, res, next) {
  try {
    const { userId, action, resourceType, startDate, endDate, page, limit } = req.query;
    const result = await auditService.listAuditLogs(
      { userId, action, resourceType, startDate, endDate },
      { page, limit }
    );
    return res.status(200).json({
      data: result.data,
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listLogs };
