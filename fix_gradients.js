const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'client', 'src', 'components');

const regexes = [
  {
    find: /from-white\/(\[.*?\]|\d+)/g,
    replace: (match, p1) => `from-slate-900/${p1} dark:from-white/${p1}`
  },
  {
    find: /via-white\/(\[.*?\]|\d+)/g,
    replace: (match, p1) => `via-slate-900/${p1} dark:via-white/${p1}`
  },
  {
    find: /to-white\/(\[.*?\]|\d+)/g,
    replace: (match, p1) => `to-slate-900/${p1} dark:to-white/${p1}`
  },
  {
    find: /text-white\/(\[.*?\]|\d+)/g,
    replace: (match, p1) => `text-slate-900/${p1} dark:text-white/${p1}`
  }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const rule of regexes) {
        content = content.replace(rule.find, rule.replace);
      }
      
      // Cleanup any duplicate dark class if text-white/ was already replaced
      content = content.replace(/text-slate-800 dark:text-slate-900\/(\d+) dark:text-white\/(\d+)/g, 'text-slate-900/$1 dark:text-white/$2');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(componentsDir);
console.log('Done replacing gradients for light mode.');
