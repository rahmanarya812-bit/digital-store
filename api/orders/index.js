import { getAuthUser } from '../_utils/auth.js';
import { products } from '../_data/products.js';
import fs from 'fs';
import path from 'path';

const saveProducts = () => {
  try {
    const filePath = path.join(process.cwd(), 'api', '_data', 'products.js');
    const content = `export const products = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.warn('Persistence warning:', err.message);
  }
};

const orders = [
  { id: 1, userId: 2, items: [{ productId: 1, name: 'ProSuite Design Studio', price: 299000, quantity: 1 }], total: 299000, status: 'completed', date: '2026-06-20T10:30:00Z' },
  { id: 2, userId: 2, items: [{ productId: 4, name: 'Web Dev Mastery Course', price: 399000, quantity: 1 }, { productId: 6, name: 'IconCraft Premium Pack', price: 79000, quantity: 1 }], total: 478000, status: 'completed', date: '2026-06-22T14:15:00Z' },
];
let nextOrderId = 3;

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  if (req.method === 'GET') {
    const userOrders = user.role === 'admin' ? orders : orders.filter(o => o.userId === user.id);
    return res.status(200).json({ orders: userOrders });
  }

  if (req.method === 'POST') {
    const { items, total } = req.body || {};
    if (!items || !items.length) return res.status(400).json({ error: 'Order items required' });

    // Decrement stock & increment downloads for each item
    for (const item of items) {
      const dbProduct = products.find(p => p.id === Number(item.productId));
      if (dbProduct) {
        if (dbProduct.stock !== undefined && dbProduct.stock !== null) {
          dbProduct.stock = Math.max(0, dbProduct.stock - (item.quantity || 1));
        }
        dbProduct.downloads = (dbProduct.downloads || 0) + (item.quantity || 1);
      }
    }
    saveProducts();

    const order = { id: nextOrderId++, userId: user.id, items, total: total || 0, status: 'completed', date: new Date().toISOString() };
    orders.push(order);
    return res.status(201).json({ order });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
