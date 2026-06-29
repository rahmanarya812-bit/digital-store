import { getAuthUser } from '../_utils/auth.js';
import { getProducts, saveProducts, getSettings } from '../_utils/db.js';

export const orders = [
  { id: 1, userId: 2, items: [{ productId: 1, name: 'ProSuite Design Studio', price: 299000, quantity: 1, deliveredAccounts: ['ACTV-123456789-LICS'] }], total: 299000, status: 'completed', date: '2026-06-20T10:30:00Z' },
  { id: 2, userId: 2, items: [{ productId: 4, name: 'Web Dev Mastery Course', price: 399000, quantity: 1, deliveredAccounts: ['ACTV-987654321-LICS'] }, { productId: 6, name: 'IconCraft Premium Pack', price: 79000, quantity: 1, deliveredAccounts: ['ACTV-111222333-LICS'] }], total: 478000, status: 'completed', date: '2026-06-22T14:15:00Z' },
];
let nextOrderId = 3;

export const getOrdersInMem = () => orders;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const products = getProducts();

  if (req.method === 'GET') {
    const { id } = req.query || {};
    if (id) {
      const order = orders.find(o => o.id === Number(id));
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.status(200).json({ order });
    }
    const userOrders = user.role === 'admin' ? orders : orders.filter(o => o.userId === user.id);
    return res.status(200).json({ orders: userOrders });
  }

  if (req.method === 'POST') {
    const { items, total, paymentMethod } = req.body || {};
    if (!items || !items.length) return res.status(400).json({ error: 'Order items required' });

    const orderId = nextOrderId++;
    const settings = await getSettings();

    // 1. If QRIS dynamic checkout:
    if (paymentMethod === 'qris') {
      let paymentUrl = '';
      if (settings.pakasirProject && settings.pakasirApiKey) {
        try {
          const response = await fetch(`https://app.pakasir.com/api/transactioncreate/qris`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project: settings.pakasirProject,
              order_id: String(orderId),
              amount: Number(total),
              api_key: settings.pakasirApiKey
            })
          });
          const data = await response.json();
          if (data && data.payment && data.payment.payment_url) {
            paymentUrl = data.payment.payment_url;
          } else {
            paymentUrl = `https://app.pakasir.com/pay/${settings.pakasirProject}/${total}?order_id=${orderId}`;
          }
        } catch (err) {
          console.error('Pakasir API error:', err);
          paymentUrl = `/checkout-simulation?order_id=${orderId}&amount=${total}`;
        }
      } else {
        // Fallback simulation
        paymentUrl = `/checkout-simulation?order_id=${orderId}&amount=${total}`;
      }

      // Save order as pending (do not decrement stock yet)
      const order = { 
        id: orderId, 
        userId: user.id, 
        items: items.map(item => ({ ...item, deliveredAccounts: [] })), 
        total: total || 0, 
        status: 'pending', 
        date: new Date().toISOString(),
        paymentMethod: 'qris'
      };
      orders.push(order);
      return res.status(201).json({ order, paymentUrl });
    }

    // 2. Manual Payment methods (ewallet, bank transfer, etc.) - immediate completed as before
    for (const item of items) {
      const dbProduct = products.find(p => p.id === Number(item.productId));
      if (dbProduct) {
        dbProduct.downloads = (dbProduct.downloads || 0) + (item.quantity || 1);
        
        const accounts = dbProduct.accountsStock 
          ? dbProduct.accountsStock.split('\n').map(a => a.trim()).filter(Boolean) 
          : [];
          
        if (accounts.length > 0) {
          const qty = item.quantity || 1;
          const delivered = accounts.slice(0, qty);
          const remaining = accounts.slice(qty);
          
          dbProduct.accountsStock = remaining.join('\n');
          dbProduct.stock = remaining.length;
          item.deliveredAccounts = delivered;
        } else {
          if (dbProduct.stock !== undefined && dbProduct.stock !== null) {
            dbProduct.stock = Math.max(0, dbProduct.stock - (item.quantity || 1));
          }
          item.deliveredAccounts = Array.from({ length: item.quantity || 1 }, () => 
            `ACTV-${Math.floor(Math.random() * 1e9)}-LICS`
          );
        }
      } else {
        item.deliveredAccounts = [`ACTV-${Math.floor(Math.random() * 1e9)}-LICS`];
      }
    }
    saveProducts(products);

    const order = { id: orderId, userId: user.id, items, total: total || 0, status: 'completed', date: new Date().toISOString() };
    orders.push(order);
    return res.status(201).json({ order });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
