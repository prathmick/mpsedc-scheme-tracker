const mysql = require('mysql2/promise');

async function checkMySQL() {
  // Try common default setups
  const attempts = [
    { user: 'root', password: '', desc: 'root with no password' },
    { user: 'root', password: 'root', desc: 'root with password "root"' },
    { user: 'mysql', password: 'mysql', desc: 'mysql user' },
    { user: 'admin', password: 'admin', desc: 'admin user' },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`\nTrying: ${attempt.desc}`);
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: attempt.user,
        password: attempt.password,
        port: 3306,
      });
      
      console.log(`✓ Connected as ${attempt.user}`);
      
      // Get version
      const [version] = await conn.query('SELECT VERSION() as version');
      console.log('MySQL Version:', version[0].version);
      
      // List databases
      const [dbs] = await conn.query('SHOW DATABASES');
      console.log('Databases:', dbs.map(d => d.Database).join(', '));
      
      // List users
      try {
        const [users] = await conn.query('SELECT User, Host FROM mysql.user');
        console.log('Users:', users.map(u => `${u.User}@${u.Host}`).join(', '));
      } catch (err) {
        console.log('Could not list users');
      }
      
      await conn.end();
      process.exit(0);
    } catch (err) {
      console.log(`✗ Failed: ${err.message}`);
    }
  }
  
  console.log('\n✗ Could not connect with any attempt');
  process.exit(1);
}

checkMySQL();
