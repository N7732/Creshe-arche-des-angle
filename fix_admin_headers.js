const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'creshe', 'src', 'Components', 'Admin');

function fixHeaders() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.jsx')) {
      const fullPath = path.join(dir, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix h1 headers
      content = content.replace(/<h1 className="([^"]*)text-slate-800([^"]*)"(.*?)>/g, '<h1 className="$1text-slate-100$2"$3>');
      
      // Fix subtitle p tags that might have text-slate-500 or text-slate-600
      // We look for patterns right under h1 usually inside the same div.
      // But a simpler way: just replace <p className="text-slate-500 with <p className="text-slate-400 if it's right after h1... 
      // Actually, let's just manually replace text-slate-500 and text-slate-600 with text-slate-400 on the p tags that are page subtitles.
      // Usually they are: <p className="text-slate-500 mt-2 text-sm"> or similar.
      // A safer regex: find <div>\s*<h1...\s*<p className="([^"]*)text-slate-500([^"]*)"
      
      content = content.replace(/(<h1[^>]*>.*?<\/h1>\s*<p className="[^"]*)text-slate-500([^"]*")/gs, '$1text-slate-300$2');

      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${file}`);
    }
  }
}

fixHeaders();
