const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'client', 'src', 'components');

const regexes = [
  {
    find: /text-white(?!(\/| dark:|\w|-))/g,
    replace: 'text-slate-900 dark:text-white'
  },
  {
    find: /bg-white\/\[0\.02\]/g,
    replace: 'bg-slate-900/[0.02] dark:bg-white/[0.02]'
  },
  {
    find: /bg-white\/5(?!0)/g,
    replace: 'bg-slate-900/5 dark:bg-white/5'
  },
  {
    find: /bg-white\/10/g,
    replace: 'bg-slate-900/10 dark:bg-white/10'
  },
  {
    find: /border-white\/(\[.*?\]|\d+)/g,
    replace: (match, p1) => `border-slate-900/${p1} dark:border-white/${p1}`
  },
  {
    find: /text-white\/(\d+)/g,
    replace: (match, p1) => `text-slate-800 dark:text-white/${p1}`
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
      
      // Some strings may have already been replaced partially (like text-slate-900 dark:text-white).
      // We don't want to replace text-white again if it's already dark:text-white.
      // The regex uses a negative lookbehind/lookahead if we can, but let's just make sure we don't duplicate.
      
      for (const rule of regexes) {
        content = content.replace(rule.find, rule.replace);
      }
      
      // Fix potential duplications (if it was already replaced)
      content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-white/g, 'text-slate-900 dark:text-white');
      content = content.replace(/dark:text-slate-900 dark:text-white/g, 'dark:text-white');
      content = content.replace(/text-slate-800 dark:text-slate-800 dark:text-white/g, 'text-slate-800 dark:text-white');
      content = content.replace(/dark:text-slate-800 dark:text-white/g, 'dark:text-white');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(componentsDir);
console.log('Done replacing colors for light mode.');
