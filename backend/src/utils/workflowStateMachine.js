'use strict';

// Valid transitions per status and role
const TRANSITIONS = {
  Draft:    { User: ['Review'],              Admin: ['Review'] },
  Review:   { User: [],                      Admin: ['Approved', 'Draft'] },
  Approved: { User: [],                      Admin: [] },
};

/**
 * Check if a status transition is valid for the given role.
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @param {string} role
 * @returns {boolean}
 */
function isValidTransition(currentStatus, targetStatus, role) {
  const allowed = TRANSITIONS[currentStatus]?.[role] ?? [];
  return allowed.includes(targetStatus);
}

/**
 * Get all allowed target statuses for the given current status and role.
 * @param {string} currentStatus
 * @param {string} role
 * @returns {string[]}
 */
function getAllowedTransitions(currentStatus, role) {
  return TRANSITIONS[currentStatus]?.[role] ?? [];
}

module.exports = { isValidTransition, getAllowedTransitions, TRANSITIONS };
