import fs from 'fs';
import path from 'path';

const getDbPath = () => path.join(process.cwd(), 'api', '_data', 'products.json');

// Global memory cache to support read-only filesystems (like Vercel)
let memoryProducts = null;

export const getProducts = () => {
  if (memoryProducts) {
    return memoryProducts;
  }

  try {
    const filePath = getDbPath();
    let list = [];
    if (!fs.existsSync(filePath)) {
      const jsPath = path.join(process.cwd(), 'api', '_data', 'products.js');
      if (fs.existsSync(jsPath)) {
        const content = fs.readFileSync(jsPath, 'utf8');
        const startIdx = content.indexOf('[');
        const endIdx = content.lastIndexOf(']') + 1;
        if (startIdx !== -1 && endIdx !== -1) {
          const jsonText = content.substring(startIdx, endIdx);
          list = JSON.parse(jsonText);
        }
      }
    } else {
      list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    memoryProducts = list;
    return list;
  } catch (err) {
    console.error('DB Read Error:', err);
    return [];
  }
};

export const saveProducts = (products) => {
  memoryProducts = products;
  
  try {
    const filePath = getDbPath();
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
    
    // Sync to JS file as well for git tracking
    const jsPath = path.join(process.cwd(), 'api', '_data', 'products.js');
    const jsContent = `export const products = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(jsPath, jsContent, 'utf8');
  } catch (err) {
    console.warn('DB Write Warning:', err.message);
  }
};
