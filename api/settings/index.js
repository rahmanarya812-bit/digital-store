import { getAuthUser } from '../_utils/auth.js';
import { getSettings, saveSettings } from '../_utils/db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const settings = getSettings();
    return res.status(200).json({ settings });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { receiptName, receiptTagline, receiptPhone } = req.body || {};
    const settings = getSettings();
    
    if (receiptName !== undefined) settings.receiptName = receiptName;
    if (receiptTagline !== undefined) settings.receiptTagline = receiptTagline;
    if (receiptPhone !== undefined) settings.receiptPhone = receiptPhone;

    saveSettings(settings);
    return res.status(200).json({ settings });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
