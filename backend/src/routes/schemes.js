'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const auditLogger = require('../middleware/auditLogger');
const { getAll, create, update, remove } = require('../controllers/schemeController');

/**
 * @swagger
 * tags:
 *   name: Schemes
 *   description: Government scheme management
 */

/**
 * @swagger
 * /schemes:
 *   get:
 *     summary: Get all schemes
 *     tags: [Schemes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of schemes
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getAll);

/**
 * @swagger
 * /schemes:
 *   post:
 *     summary: Create a new scheme (Admin only)
 *     tags: [Schemes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scheme created
 *       403:
 *         description: Forbidden
 */
router.post('/', verifyToken, requireRole('Admin'), auditLogger, create);

/**
 * @swagger
 * /schemes/{id}:
 *   put:
 *     summary: Update a scheme (Admin only)
 *     tags: [Schemes]
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
 *         description: Scheme updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Scheme not found
 */
router.put('/:id', verifyToken, requireRole('Admin'), auditLogger, update);

/**
 * @swagger
 * /schemes/{id}:
 *   delete:
 *     summary: Delete a scheme (Admin only)
 *     tags: [Schemes]
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
 *         description: Scheme deleted
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Cannot delete scheme with existing applications
 */
router.delete('/:id', verifyToken, requireRole('Admin'), auditLogger, remove);

module.exports = router;
