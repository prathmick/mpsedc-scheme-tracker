'use strict';

const router = require('express').Router();
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { register, login } = require('../controllers/authController');
const auditLogger = require('../middleware/auditLogger');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and login
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: officer1
 *               email:
 *                 type: string
 *                 format: email
 *                 example: officer@mp.gov.in
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: Secret123!
 *               role:
 *                 type: string
 *                 enum: [Admin, User]
 *                 example: User
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/register', auditLogger, validateRegister, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: officer@mp.gov.in
 *               password:
 *                 type: string
 *                 example: Secret123!
 *     responses:
 *       200:
 *         description: Login successful, JWT returned
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', auditLogger, validateLogin, login);

module.exports = router;
