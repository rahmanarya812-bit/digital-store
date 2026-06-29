import { findUserByEmail, addLoginLog } from '../_data/users.js';
import { createToken } from '../_utils/auth.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = findUserByEmail(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });

  // Write log to database
  const userAgent = req.headers['user-agent'] || '';
  addLoginLog(email, 'LOGIN', userAgent);

  const token = createToken(user);
  res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
