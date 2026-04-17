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

// Single shared database connection
const sqlite = new sqlite3.Database(dbPath);
sqlite.run('PRAGMA foreign_keys = ON');
sqlite.run('PRAGMA journal_mode = WAL');

// Promisified helpers
const db = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  exec(sql) {
    return new Promise((resolve, reject) => {
      sqlite.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  // Compatibility shim: db.prepare(sql).run(...args) / .get(...args) / .all(...args)
  prepare(sql) {
    return {
      run: (...args) => db.run(sql, args),
      get: (...args) => db.get(sql, args),
      all: (...args) => db.all(sql, args),
    };
  },
};

async function testConnection() {
  await db.get('SELECT 1');
  console.log(`[DB] Connected to SQLite at ${dbPath}`);
}

module.exports = { db, testConnection };
