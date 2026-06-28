import { getAuthUser } from '../_utils/auth.js';
import { getProducts } from '../_utils/db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  const products = getProducts();
  const totalProducts = products.length;
  const totalDownloads = products.reduce((sum, p) => sum + p.downloads, 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * Math.floor(p.downloads * 0.3)), 0);
  const categoryStats = {};
  products.forEach(p => { categoryStats[p.category] = (categoryStats[p.category] || 0) + 1; });

  const monthlySales = [
    { month: 'Jan', revenue: 12500000, orders: 42 },
    { month: 'Feb', revenue: 15800000, orders: 53 },
    { month: 'Mar', revenue: 13200000, orders: 44 },
    { month: 'Apr', revenue: 18900000, orders: 63 },
    { month: 'May', revenue: 22100000, orders: 74 },
    { month: 'Jun', revenue: 19700000, orders: 66 },
  ];

  const recentOrders = [
    { id: 1042, customer: 'Budi Santoso', product: 'ProSuite Design Studio', amount: 299000, status: 'completed', date: '2026-06-26' },
    { id: 1041, customer: 'Siti Rahayu', product: 'Web Dev Mastery Course', amount: 399000, status: 'completed', date: '2026-06-25' },
    { id: 1040, customer: 'Ahmad Fauzi', product: 'NeonDash UI Kit', amount: 199000, status: 'pending', date: '2026-06-25' },
    { id: 1039, customer: 'Dewi Lestari', product: 'Python AI & ML Course', amount: 499000, status: 'completed', date: '2026-06-24' },
    { id: 1038, customer: 'Rizky Pratama', product: 'IconCraft Premium Pack', amount: 79000, status: 'completed', date: '2026-06-24' },
  ];

  res.status(200).json({
    totalProducts,
    totalDownloads,
    totalRevenue,
    totalOrders: 342,
    categoryStats,
    monthlySales,
    recentOrders,
    topProducts: [...products].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      downloads: p.downloads,
      revenue: p.price * Math.floor(p.downloads * 0.3)
    }))
  });
}
