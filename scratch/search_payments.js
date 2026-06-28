import fs from 'fs';
import path from 'path';

const walk = (dir, callback) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walk(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  }
};

const searchTerms = ['bank', 'dana', 'rekening', 'gopay', 'payment'];
walk('.', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const term of searchTerms) {
      if (content.toLowerCase().includes(term)) {
        console.log(`Found "${term}" in: ${filePath}`);
      }
    }
  }
});
