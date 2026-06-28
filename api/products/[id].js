import { getProducts } from '../_utils/db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const products = getProducts();
  const { id } = req.query || {};
  const product = products.find(p => p.id === Number(id) || p.slug === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  res.status(200).json({ product, related });
}
