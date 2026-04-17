'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 * @param {string} plain
 * @returns {Promise<string>}
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Sign a JWT for the given payload.
 * Uses JWT_SECRET and JWT_EXPIRES_IN from environment variables.
 * @param {object} payload
 * @returns {string}
 */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

module.exports = { hashPassword, comparePassword, signToken };
