import fs from 'fs';
import path from 'path';

// Read products.json
const jsonPath = path.join(process.cwd(), 'api', '_data', 'products.json');
const jsPath = path.join(process.cwd(), 'api', '_data', 'products.js');

if (fs.existsSync(jsonPath)) {
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  products.forEach(p => {
    delete p.version;
  });
  
  // Write back to JSON
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
  
  // Write back to JS
  const jsContent = `export const products = ${JSON.stringify(products, null, 2)};\n`;
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  
  console.log('Successfully removed version field from database files!');
} else {
  console.log('products.json not found!');
}
