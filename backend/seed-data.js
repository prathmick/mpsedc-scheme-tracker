'use strict';

require('dotenv').config();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, process.env.DB_NAME || 'mpsedc_tracker.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }

  try {
    await seedData();
    console.log('✓ Data seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err.message);
    process.exit(1);
  }
});

async function seedData() {
  return new Promise((resolve, reject) => {
    // First, create test users
    const adminPassword = bcrypt.hashSync('Admin@123', 10);
    const userPassword = bcrypt.hashSync('User@123', 10);

    const users = [
      { username: 'admin', email: 'admin@example.com', password_hash: adminPassword, role: 'Admin' },
      { username: 'officer1', email: 'officer1@example.com', password_hash: userPassword, role: 'User' },
      { username: 'officer2', email: 'officer2@example.com', password_hash: userPassword, role: 'User' },
    ];

    let userCount = 0;
    const insertUserStmt = db.prepare(
      'INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
    );

    for (const user of users) {
      insertUserStmt.run([user.username, user.email, user.password_hash, user.role], (err) => {
        if (err) {
          reject(err);
          return;
        }
        userCount++;
        if (userCount === users.length) {
          insertUserStmt.finalize();
          seedApplications();
        }
      });
    }

    function seedApplications() {
      const districts = [
        'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
        'Sagar', 'Ratlam', 'Khandwa', 'Burhanpur', 'Dewas'
      ];

      const firstNames = [
        'Rajesh', 'Priya', 'Amit', 'Neha', 'Vikram',
        'Anjali', 'Suresh', 'Divya', 'Arjun', 'Pooja',
        'Manoj', 'Sneha', 'Rohit', 'Kavya', 'Sanjay',
        'Isha', 'Nikhil', 'Ananya', 'Arun', 'Shreya'
      ];

      const lastNames = [
        'Singh', 'Sharma', 'Patel', 'Kumar', 'Verma',
        'Gupta', 'Yadav', 'Mishra', 'Joshi', 'Nair'
      ];

      const statuses = ['Draft', 'Review', 'Approved'];
      const schemeIds = [1, 2, 3, 4, 5];

      let appCount = 0;
      const insertAppStmt = db.prepare(
        `INSERT INTO applications 
         (citizenName, citizenAadhaar, schemeId, district, status, createdBy, transitionedAt, transitionedBy, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      for (let i = 0; i < 100; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const citizenName = `${firstName} ${lastName}`;
        const citizenAadhaar = String(Math.floor(Math.random() * 900000000000) + 100000000000);
        const schemeId = schemeIds[Math.floor(Math.random() * schemeIds.length)];
        const district = districts[Math.floor(Math.random() * districts.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const createdBy = Math.floor(Math.random() * 2) + 2; // User 2 or 3
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        const updatedAt = new Date(Date.now() - Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000).toISOString();
        const transitionedAt = status !== 'Draft' ? updatedAt : null;
        const transitionedBy = status !== 'Draft' ? 1 : null; // Admin

        insertAppStmt.run(
          [citizenName, citizenAadhaar, schemeId, district, status, createdBy, transitionedAt, transitionedBy, createdAt, updatedAt],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            appCount++;
            if (appCount === 100) {
              insertAppStmt.finalize();
              console.log('✓ Inserted 100 applications');
              db.close();
              resolve();
            }
          }
        );
      }
    }
  });
}
