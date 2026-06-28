import fs from 'fs';
import path from 'path';

// Load the current database helper
import { getProducts, saveProducts } from '../api/_utils/db.js';

const products = getProducts();
console.log('Original count:', products.length);

// Keep only the 6 products in the user's screenshot
const idsToKeep = [2, 12, 5, 14, 6, 8];
const filtered = products.filter(p => idsToKeep.includes(p.id));

console.log('Filtered count:', filtered.length);
console.log('Filtered names:', filtered.map(p => p.name));

// Save to disk (which updates both products.json and products.js)
saveProducts(filtered);
console.log('Database cleaned successfully!');
