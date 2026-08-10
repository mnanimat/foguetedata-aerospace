const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/dark:bg-\[#0B0F19\]/g, 'dark:bg-black');
    newContent = newContent.replace(/bg-\[#0B0F19\]/g, 'bg-black');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
    }
});
