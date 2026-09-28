const fs = require('fs');
let content = fs.readFileSync('planner.js', 'utf8');

content = content.replace(/onclick="([^"]*)\\'\$\{item\.id \|\| indexOriginal\}\\'([^"]*)"/g, (match, p1, p2) => {
  return `onclick="${p1}'\${item.id || indexOriginal}'${p2}"`;
});

fs.writeFileSync('planner.js', content, 'utf8');
