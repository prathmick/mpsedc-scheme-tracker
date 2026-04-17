'use strict';

const { db } = require('../config/db');
const { hashPassword, comparePassword, signToken } = require('../services/authService');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { username, email, password, role } = req.body;

    // Check for duplicate email
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password_hash = await hashPassword(password);

    const result = await db.prepare(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(username, email, password_hash, role);

    const newUserId = result.lastInsertRowid;

    req.auditPayload = {
      action: 'REGISTER',
      resourceType: 'user',
      resourceId: newUserId,
      details: { username, email, role },
    };

    return res.status(201).json({
      message: 'User registered successfully.',
      user: { id: newUserId, username, email, role },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await db.get(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    req.auditPayload = {
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email, role: user.role },
    };

    const { password_hash: _omit, ...userWithoutHash } = user;

    return res.status(200).json({ token, user: userWithoutHash });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
