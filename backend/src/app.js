'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const app = express();

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mpsedc-scheme-tracker.vercel.app',
    'https://mpsedc-scheme-tracker-cg97bm74e-prathmick-3792s-projects.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

// ── Swagger UI ───────────────────────────────────────────────────────────────
const swaggerSpec = require('../swagger/swaggerConfig');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Route stubs ──────────────────────────────────────────────────────────────
// Each route file will be created in later tasks (3.4, 4.3, 5.7, 6.2, 7.2).
// Requiring them here keeps the mount order stable once they exist.
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/schemes',      require('./routes/schemes'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/audit-logs',   require('./routes/auditLogs'));

// ── Global error handler ─────────────────────────────────────────────────────
// Must be defined after all routes (4 arguments = Express error middleware).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
