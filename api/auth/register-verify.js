import { findUserByEmail, createUser, addLoginLog } from '../_data/users.js';
import { createToken } from '../_utils/auth.js';
import { verifyOtpToken } from '../_utils/otp.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { otp, otpToken } = req.body || {};
  if (!otp || !otpToken) return res.status(400).json({ error: 'OTP code and verification token are required' });

  // Verify the OTP signature and matches
  const payload = verifyOtpToken(otpToken, otp);
  if (!payload) {
    return res.status(400).json({ error: 'Kode OTP tidak valid atau sudah kedaluwarsa (berlaku 10 menit)' });
  }

  const { name, email, password } = payload;

  // Double check if already registered in the database
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email sudah terdaftar di sistem' });
  }

  // Create the persistent user record
  const user = await createUser(name, email, password);

  // Add registration to the logs
  const userAgent = req.headers['user-agent'] || '';
  await addLoginLog(email, 'REGISTER', userAgent);

  // Create authentication token
  const token = createToken(user);

  res.status(201).json({ 
    token, 
    user: { id: user.id, name: user.name, email: user.email, role: user.role } 
  });
}
