const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('supabaseClient')) {
    let newContent = content.split('\n').filter(line => !line.includes('supabaseClient')).join('\n');
    if (content !== newContent) {
      fs.writeFileSync(f, newContent);
      console.log('Fixed', f);
    }
  }
});
console.log('Done!');
