const mysql = require('mysql2/promise');

async function findPassword() {
  // Try different connection approaches
  const configs = [
    { host: 'localhost', user: 'root', password: '', socketPath: '/var/run/mysqld/mysqld.sock' },
    { host: '127.0.0.1', user: 'root', password: '' },
    { host: 'localhost', user: 'root', password: '', port: 3306 },
    { host: 'localhost', user: 'root', password: 'Prthm@1373', port: 3306 },
    { host: 'localhost', user: 'root', password: 'Pratham@1373', port: 3306 },
  ];
  
  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`Attempt ${i + 1}:`, JSON.stringify(configs[i]));
      const conn = await mysql.createConnection(configs[i]);
      console.log('✓ SUCCESS! Config:', JSON.stringify(configs[i]));
      
      // Get current user
      const [rows] = await conn.query('SELECT USER()');
      console.log('Current user:', rows);
      
      // Try to create database and user
      try {
        await conn.query('CREATE DATABASE IF NOT EXISTS mpsedc_tracker');
        console.log('✓ Database created');
      } catch (err) {
        console.log('Database creation error:', err.message);
      }
      
      try {
        await conn.query('CREATE USER IF NOT EXISTS `mpsedc_user`@`localhost` IDENTIFIED BY "mpsedc_pass"');
        console.log('✓ User created');
      } catch (err) {
        console.log('User creation error:', err.message);
      }
      
      try {
        await conn.query('GRANT ALL PRIVILEGES ON mpsedc_tracker.* TO `mpsedc_user`@`localhost`');
        console.log('✓ Privileges granted');
      } catch (err) {
        console.log('Grant error:', err.message);
      }
      
      try {
        await conn.query('FLUSH PRIVILEGES');
        console.log('✓ Privileges flushed');
      } catch (err) {
        console.log('Flush error:', err.message);
      }
      
      await conn.end();
      process.exit(0);
    } catch (err) {
      console.log('✗ Failed:', err.message);
    }
  }
  console.log('✗ Could not connect with any config');
  process.exit(1);
}

findPassword();
