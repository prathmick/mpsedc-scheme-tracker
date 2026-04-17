'use strict';

const { body, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const validateCreateApplication = [
  body('citizenName').notEmpty().withMessage('Citizen name is required'),
  body('citizenAadhaar')
    .notEmpty().withMessage('Citizen Aadhaar is required')
    .matches(/^\d{12}$/).withMessage('Aadhaar must be exactly 12 digits'),
  body('schemeId').isInt({ min: 1 }).withMessage('A valid scheme ID is required'),
  body('district').notEmpty().withMessage('District is required'),
  handleValidationErrors,
];

const validateUpdateApplication = [
  body('citizenName').optional().notEmpty().withMessage('Citizen name cannot be empty'),
  body('citizenAadhaar').optional().matches(/^\d{12}$/).withMessage('Aadhaar must be exactly 12 digits'),
  body('schemeId').optional().isInt({ min: 1 }).withMessage('A valid scheme ID is required'),
  body('district').optional().notEmpty().withMessage('District cannot be empty'),
  handleValidationErrors,
];

const validateStatusTransition = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Draft', 'Review', 'Approved']).withMessage('Status must be Draft, Review, or Approved'),
  handleValidationErrors,
];

module.exports = { validateCreateApplication, validateUpdateApplication, validateStatusTransition };
