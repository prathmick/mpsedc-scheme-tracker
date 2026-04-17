'use strict';

const dashboardService = require('../services/dashboardService');

async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getStats();
    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
