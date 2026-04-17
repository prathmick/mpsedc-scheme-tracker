const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Create data directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mpsedc_tracker.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute migration
const migrationPath = path.join(__dirname, 'migrations', '001_init.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

try {
  db.exec(migrationSQL);
  console.log('✓ Database initialized successfully at:', dbPath);
  process.exit(0);
} catch (err) {
  console.error('✗ Database initialization failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
