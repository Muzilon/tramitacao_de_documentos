const fs = require('fs');
let content = fs.readFileSync('planner.js', 'utf8');

content = content.replace(/onclick="([^"]*)\$\{indexOriginal\}([^"]*)"/g, (match, p1, p2) => {
  // If it's already got quotes around it, we don't add more. But currently they don't have quotes.
  // We'll just replace \$\{indexOriginal\} with '${item.id || indexOriginal}' globally inside the onclick string.
  let replaced = match.replace(/\$\{indexOriginal\}/g, "\\'${item.id || indexOriginal}\\'");
  return replaced;
});

// Since the node string replace with escaped single quotes becomes \' , let's do it right.
fs.writeFileSync('planner.js', content, 'utf8');
