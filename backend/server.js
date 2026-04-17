'use strict';

require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const { runMigrations } = require('./src/config/migrate');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log('[Server] Starting...');
    console.log('[Server] NODE_ENV:', process.env.NODE_ENV);
    console.log('[Server] PORT:', PORT);
    console.log('[Server] DB_NAME:', process.env.DB_NAME);
    console.log('[Server] JWT_SECRET set:', !!process.env.JWT_SECRET);
    console.log('[Server] JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

    await testConnection();
    await runMigrations();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();

