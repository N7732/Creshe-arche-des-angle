const fs = require('fs');
const { glob } = require('tinyglobby');

async function run() {
  const files = await glob('src/**/*.{js,jsx}', { cwd: __dirname });
  let count = 0;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('http://localhost:5000')) {
      content = content.replace(/http:\/\/localhost:5000/g, 'https://backend-creshe.onrender.com');
      fs.writeFileSync(file, content);
      count++;
    }
  }
  console.log('Updated ' + count + ' files');
}
run();
