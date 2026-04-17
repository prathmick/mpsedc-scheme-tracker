'use strict';

const auditService = require('../services/auditService');

/**
 * Audit logger middleware.
 * Listens to the response 'finish' event and writes req.auditPayload
 * to audit_logs via auditService.log() when the response status < 400.
 * Fire-and-forget — does not block the response.
 */
const auditLogger = (req, res, next) => {
  res.on('finish', () => {
    if (req.auditPayload && res.statusCode < 400) {
      (async () => {
        try {
          await auditService.log({
            userId: req.user?.id,
            userEmail: req.user?.email,
            role: req.user?.role,
            ...req.auditPayload,
            ipAddress: req.ip,
          });
        } catch (err) {
          // Non-blocking: log error but do not propagate
          console.error('[auditLogger] Failed to write audit log:', err.message);
        }
      })();
    }
  });
  next();
};

module.exports = auditLogger;
