const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

content = content.replace(/bg-red-600 text-slate-900 dark:text-white/g, 'bg-red-600 text-white');
content = content.replace(/bg-amber-600 text-slate-900 dark:text-white/g, 'bg-amber-600 text-white');
content = content.replace(/bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white/g, 'bg-red-600 hover:bg-red-500 text-white');
content = content.replace(/bg-amber-600 hover:bg-amber-500 text-slate-900 dark:text-white/g, 'bg-amber-600 hover:bg-amber-500 text-white');

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
