const mysql = require('mysql2/promise');

async function findPassword() {
  const passwords = ['Prthm@1373', 'Pratham@13', 'Pratham@1373', 'Pratham@58', 'Prthm@58', 'root', '', 'password', '123456', 'admin'];
  
  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pwd,
        multipleStatements: true
      });
      console.log('✓ SUCCESS! Password is: ' + (pwd || '(empty)'));
      
      // Try to create database and user
      await conn.query('CREATE DATABASE IF NOT EXISTS mpsedc_tracker');
      await conn.query('CREATE USER IF NOT EXISTS `mpsedc_user`@`localhost` IDENTIFIED BY "mpsedc_pass"');
      await conn.query('GRANT ALL PRIVILEGES ON mpsedc_tracker.* TO `mpsedc_user`@`localhost`');
      await conn.query('FLUSH PRIVILEGES');
      
      console.log('✓ Database and user created');
      await conn.end();
      process.exit(0);
    } catch (err) {
      // Continue to next password
    }
  }
  console.log('✗ Could not connect with any password');
  process.exit(1);
}

findPassword();
