import fs from 'fs';
import path from 'path';

const searchDirs = [
  path.join(process.cwd()),
  'C:\\Users\\SEKWAN SUMENEP\\.gemini\\antigravity\\brain\\84b57834-b8d3-4f18-9d26-733d08ddc2b2'
];

const found = [];

const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          walk(filePath);
        }
      } else {
        if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
          found.push({ path: filePath, mtime: stat.mtime });
        }
      }
    } catch (e) {}
  }
};

searchDirs.forEach(walk);

found.sort((a, b) => b.mtime - a.mtime);

console.log('Latest 10 images:');
found.slice(0, 10).forEach(f => {
  console.log(`Path: ${f.path} | Date: ${f.mtime.toISOString()}`);
});
