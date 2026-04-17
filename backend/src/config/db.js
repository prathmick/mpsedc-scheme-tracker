'use strict';

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, process.env.DB_NAME || 'mpsedc_tracker.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Connection error:', err.message);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Wrapper to provide synchronous-like interface
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
          });
        });
      },
      get: (...params) => {
        return new Promise((resolve, reject) => {
          db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      },
      all: (...params) => {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      }
    };
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

function testConnection() {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('[DB] Connection failed:', err.message);
        reject(err);
      } else {
        console.log(`[DB] Connected to SQLite at ${dbPath}`);
        resolve();
      }
    });
  });
}

module.exports = { db: dbWrapper, testConnection };
