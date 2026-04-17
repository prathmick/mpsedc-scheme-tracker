const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    // Try to connect as root with different passwords
    const passwords = ['Prthm@1373', 'Pratham@13', 'Pratham@1373', 'Pratham@58', 'Prthm@58', 'root', ''];
    
    let connection = null;
    let successPassword = null;

    for (const pwd of passwords) {
      try {
        console.log(`Attempting connection with password: ${pwd || '(empty)'}`);
        connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: pwd,
        });
        successPassword = pwd;
        console.log(`✓ Connected successfully with password: ${pwd || '(empty)'}`);
        break;
      } catch (err) {
        console.log(`✗ Failed with password: ${pwd || '(empty)'}`);
        continue;
      }
    }

    if (!connection) {
      throw new Error('Could not connect to MySQL with any password');
    }

    // Read and execute migration script
    const migrationPath = path.join(__dirname, 'migrations', '001_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
        } catch (err) {
          console.error(`✗ Error executing statement: ${err.message}`);
        }
      }
    }

    console.log('\n✓ Database setup completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Database setup failed:', err.message);
    process.exit(1);
  }
}

setupDatabase();
