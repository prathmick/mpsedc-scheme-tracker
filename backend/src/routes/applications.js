'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const auditLogger = require('../middleware/auditLogger');
const { validateCreateApplication, validateUpdateApplication, validateStatusTransition } = require('../validators/applicationValidator');
const { list, getById, create, update, remove, transitionStatus, exportCsv } = require('../controllers/applicationController');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Scheme application management
 */

/**
 * @swagger
 * /applications/export:
 *   get:
 *     summary: Export all applications as CSV (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         description: Forbidden
 */
// IMPORTANT: /export must be registered BEFORE /:id to avoid route shadowing
router.get('/export', verifyToken, requireRole('Admin'), exportCsv);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: List applications (paginated, filtered)
 *     tags: [Applications]
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
 *         name: schemeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Review, Approved]
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paginated list of applications
 */
router.get('/', verifyToken, list);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [citizenName, citizenAadhaar, schemeId, district]
 *             properties:
 *               citizenName:
 *                 type: string
 *               citizenAadhaar:
 *                 type: string
 *                 pattern: '^\d{12}$'
 *               schemeId:
 *                 type: integer
 *               district:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created
 *       400:
 *         description: Validation error
 */
router.post('/', verifyToken, auditLogger, validateCreateApplication, create);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a single application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Not found
 */
router.get('/:id', verifyToken, getById);

/**
 * @swagger
 * /applications/{id}:
 *   put:
 *     summary: Update an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application updated
 *       422:
 *         description: Cannot modify approved application
 */
router.put('/:id', verifyToken, auditLogger, validateUpdateApplication, update);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Delete an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Application deleted
 *       422:
 *         description: Only Draft applications can be deleted
 */
router.delete('/:id', verifyToken, auditLogger, remove);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Transition application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Draft, Review, Approved]
 *     responses:
 *       200:
 *         description: Status updated
 *       422:
 *         description: Invalid transition
 */
router.patch('/:id/status', verifyToken, auditLogger, validateStatusTransition, transitionStatus);

module.exports = router;
