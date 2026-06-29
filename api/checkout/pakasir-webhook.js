import { getOrdersInMem } from '../orders/index.js';
import { getProducts, saveProducts } from '../_utils/db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id, status } = req.body || {};
  if (!order_id || !status) {
    return res.status(400).json({ error: 'Invalid notification payload' });
  }

  if (status === 'completed') {
    const orders = getOrdersInMem();
    // Parse order ID from Pakasir which may contain INV- prefixes
    const parsedId = Number(String(order_id).replace(/\D/g, ''));
    const order = orders.find(o => o.id === parsedId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only process if currently pending to avoid double processing
    if (order.status === 'pending') {
      order.status = 'completed';
      order.date = new Date().toISOString();

      const products = getProducts();

      // Decrement stock & extract accounts for each item in the order
      for (const item of order.items) {
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
      console.log(`[Webhook] Order #${parsedId} successfully marked as completed. Accounts delivered.`);
    }

    return res.status(200).json({ success: true, message: 'Order processed successfully' });
  }

  return res.status(200).json({ success: true, message: 'Notification received but ignored (status not completed)' });
}
