'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { getStats } = require('../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard statistics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get aggregate dashboard statistics (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 byStatus:
 *                   type: object
 *                 byScheme:
 *                   type: array
 *                 byDistrict:
 *                   type: array
 *                 recentActivity:
 *                   type: array
 *       403:
 *         description: Forbidden
 */
router.get('/stats', verifyToken, requireRole('Admin'), getStats);

module.exports = router;
