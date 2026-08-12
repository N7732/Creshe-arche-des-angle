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
      
      // We want to replace hardcoded strings with the env variable.
      // But we have to be careful with template literals vs normal strings.
      
      let updated = false;
      
      // 1. Replace 'https://backend-creshe.onrender.com/api...' with `${import.meta.env.VITE_API_URL}/api...`
      if (content.includes("'https://backend-creshe.onrender.com")) {
        content = content.replace(/'https:\/\/backend-creshe\.onrender\.com([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
        updated = true;
      }
      
      // 2. Replace `https://backend-creshe.onrender.com/api/${id}` with `${import.meta.env.VITE_API_URL}/api/${id}`
      if (content.includes("`https://backend-creshe.onrender.com")) {
        content = content.replace(/`https:\/\/backend-creshe\.onrender\.com([^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
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
