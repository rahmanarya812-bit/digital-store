import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else {
      console.log(filePath);
    }
  }
};

walk('src');
