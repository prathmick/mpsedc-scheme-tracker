'use strict';

const { db } = require('./db');

async function runMigrations() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User' CHECK(role IN ('Admin', 'User')),
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      department TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizenName TEXT NOT NULL,
      citizenAadhaar TEXT NOT NULL,
      schemeId INTEGER NOT NULL,
      district TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Review', 'Approved')),
      createdBy INTEGER NOT NULL,
      transitionedAt DATETIME,
      transitionedBy INTEGER,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schemeId) REFERENCES schemes(id),
      FOREIGN KEY (createdBy) REFERENCES users(id),
      FOREIGN KEY (transitionedBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS application_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicationId INTEGER NOT NULL,
      fromStatus TEXT NOT NULL CHECK(fromStatus IN ('Draft', 'Review', 'Approved')),
      toStatus TEXT NOT NULL CHECK(toStatus IN ('Draft', 'Review', 'Approved')),
      transitionedBy INTEGER NOT NULL,
      transitionedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (transitionedBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      userEmail TEXT,
      role TEXT,
      action TEXT NOT NULL,
      resourceType TEXT,
      resourceId TEXT,
      details TEXT,
      ipAddress TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Seed schemes if empty
  const row = await db.get('SELECT COUNT(*) AS count FROM schemes');
  if (row.count === 0) {
    const schemes = [
      ['PM Kisan', 'Income support for farmers', 'Agriculture'],
      ['Ladli Behna', 'Financial assistance for women', 'Women & Child Development'],
      ['Ayushman Bharat', 'Health insurance for poor families', 'Health'],
      ['PM Awas Yojana', 'Housing for all scheme', 'Housing'],
      ['Sambal Yojana', 'Unorganised worker welfare', 'Labour'],
    ];
    for (const [name, description, department] of schemes) {
      await db.run(
        'INSERT INTO schemes (name, description, department) VALUES (?, ?, ?)',
        [name, description, department]
      );
    }
    console.log('[DB] Seeded 5 schemes');
  }

  console.log('[DB] Migrations completed successfully');
}

module.exports = { runMigrations };
