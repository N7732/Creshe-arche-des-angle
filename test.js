const email = 'oliviernshimyumuremyi4@gmail.com';
const password = 'ArcD777$90OlibGfVd';

async function test() {
  console.log('Testing parent login...');
  const res1 = await fetch('http://localhost:5000/api/parents/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log(res1.status, await res1.text());

  console.log('Testing admin login...');
  const res2 = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password })
  });
  console.log(res2.status, await res2.text());
}
test();
