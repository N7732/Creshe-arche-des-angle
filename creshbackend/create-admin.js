require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db/database');

async function createSuperAdmin() {
  const username = 'oliviernshimyumuremyi4@gmail.com';
  const password = 'ArcD777$90OlibGfVd';
  const role = 'superadmin';

  try {
    // Optionally remove the old placeholder admin if it exists
    await db.query("DELETE FROM users WHERE username = 'superadmin'");

    const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      console.log('User already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );

    console.log(`Successfully created superadmin account:`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create superadmin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
