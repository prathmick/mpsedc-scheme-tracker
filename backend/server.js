'use strict';

require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const { runMigrations } = require('./src/config/migrate');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await testConnection();
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    process.exit(1);
  }
})();

