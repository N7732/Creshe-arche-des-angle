const fs = require('fs');
const path = require('path');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('https://backend-creshe.onrender.com')) {
        content = content.replace(/https:\/\/backend-creshe\.onrender\.com/g, 'http://localhost:5000');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

findAndReplace(path.join(__dirname, 'creshe', 'src'));
