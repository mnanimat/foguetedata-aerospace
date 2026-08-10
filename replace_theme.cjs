const fs = require('fs');
let content = fs.readFileSync('src/components/User3DModelStudio.tsx', 'utf8');

// Colors
content = content.replace(/bg-\[#111827\]/g, 'bg-white dark:bg-[#111827]');
content = content.replace(/bg-black/g, 'bg-white dark:bg-black');
content = content.replace(/bg-\[#05070A\]/g, 'bg-slate-50 dark:bg-[#05070A]');
content = content.replace(/bg-slate-950/g, 'bg-slate-100 dark:bg-slate-950');
content = content.replace(/bg-slate-900/g, 'bg-slate-100 dark:bg-slate-900');
content = content.replace(/bg-slate-800/g, 'bg-slate-200 dark:bg-slate-800');
content = content.replace(/border-slate-800/g, 'border-slate-300 dark:border-slate-800');
content = content.replace(/border-slate-700/g, 'border-slate-300 dark:border-slate-700');

// Text
content = content.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
content = content.replace(/text-slate-200/g, 'text-slate-800 dark:text-slate-200');
content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');

// Hovers
content = content.replace(/hover:bg-slate-700/g, 'hover:bg-slate-300 dark:hover:bg-slate-700');
content = content.replace(/hover:text-white/g, 'hover:text-slate-900 dark:hover:text-white');
content = content.replace(/hover:border-slate-700/g, 'hover:border-slate-400 dark:hover:border-slate-700');

fs.writeFileSync('src/components/User3DModelStudio.tsx', content);
