const mysql = require('mysql2/promise');

async function connect() {
  try {
    // Try connecting with different auth plugins
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
      authPlugins: {
        mysql_native_password: () => () => '',
        mysql_clear_password: () => () => '',
      }
    });
    
    console.log('Connected!');
    const [rows] = await conn.query('SELECT VERSION()');
    console.log('MySQL Version:', rows);
    
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

connect();
