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
      
      let updated = false;
      
      // Replace dynamic template literals back to hardcoded production string
      if (content.includes("${import.meta.env.VITE_API_URL || 'http://localhost:5000'}")) {
        content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:5000'\}/g, 'https://creshe-arche-des-angle-2.onrender.com');
        updated = true;
      }
      
      // Also catch any raw localhost:5000 just in case
      if (content.includes("http://localhost:5000")) {
        content = content.replace(/http:\/\/localhost:5000/g, 'https://creshe-arche-des-angle-2.onrender.com');
        updated = true;
      }
      
      if (content.includes("https://backend-creshe.onrender.com")) {
        content = content.replace(/https:\/\/backend-creshe\.onrender\.com/g, 'https://creshe-arche-des-angle-2.onrender.com');
        updated = true;
      }

      if (updated) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

findAndReplace(path.join(__dirname, 'creshe', 'src'));
