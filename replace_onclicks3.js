const fs = require('fs');
let content = fs.readFileSync('planner.js', 'utf8');

content = content.replace(/\\'\$\{item\.id \|\| indexOriginal\}\\'/g, "'${item.id || indexOriginal}'");

fs.writeFileSync('planner.js', content, 'utf8');
