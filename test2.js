const bcrypt = require('bcryptjs');
const db = require('./creshbackend/db/database');
const password = 'ArcD777$90OlibGfVd';

async function test() {
  const result = await db.query('SELECT * FROM users WHERE username = $1', ['oliviernshimyumuremyi4@gmail.com']);
  const user = result.rows[0];
  console.log('User found:', user.username);
  console.log('Hash in DB:', user.password);
  
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Match?', isMatch);
}
test();
