'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { listLogs } = require('../controllers/auditLogController');

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Audit log access (Admin only)
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get paginated audit logs (Admin only)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Paginated audit log entries
 *       403:
 *         description: Forbidden
 */
router.get('/', verifyToken, requireRole('Admin'), listLogs);

module.exports = router;
