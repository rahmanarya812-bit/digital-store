import { getAuthUser } from '../_utils/auth.js';
import { getSettings, saveSettings } from '../_utils/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const settings = await getSettings();
    return res.status(200).json({ settings });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { 
      receiptName, receiptTagline, receiptPhone, 
      pakasirProject, pakasirApiKey,
      smtpHost, smtpPort, smtpUser, smtpPass, smtpSender
    } = req.body || {};
    
    const settings = await getSettings();
    
    if (receiptName !== undefined) settings.receiptName = receiptName;
    if (receiptTagline !== undefined) settings.receiptTagline = receiptTagline;
    if (receiptPhone !== undefined) settings.receiptPhone = receiptPhone;
    if (pakasirProject !== undefined) settings.pakasirProject = pakasirProject;
    if (pakasirApiKey !== undefined) settings.pakasirApiKey = pakasirApiKey;
    if (smtpHost !== undefined) settings.smtpHost = smtpHost;
    if (smtpPort !== undefined) settings.smtpPort = smtpPort;
    if (smtpUser !== undefined) settings.smtpUser = smtpUser;
    if (smtpPass !== undefined) settings.smtpPass = smtpPass;
    if (smtpSender !== undefined) settings.smtpSender = smtpSender;

    await saveSettings(settings);
    return res.status(200).json({ settings });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
