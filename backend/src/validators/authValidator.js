'use strict';

const { body, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const validateRegister = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Admin', 'User']).withMessage('Role must be Admin or User'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin };
