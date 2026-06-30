import { getAuthUser, createToken } from '../_utils/auth.js';
import { updateUser } from '../_data/users.js';
import { verifyOtpToken } from '../_utils/otp.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const { name, phone, otpToken, otp } = req.body || {};

  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  // If changing password, verify OTP
  if (otpToken && otp) {
    const payload = verifyOtpToken(otpToken, otp);
    if (!payload) {
      return res.status(400).json({ error: 'Kode OTP tidak valid atau sudah kedaluwarsa' });
    }
    
    // Validate that the token belongs to this user
    if (payload.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({ error: 'Token OTP tidak valid untuk pengguna ini' });
    }
    
    // Payload contains the new password
    if (payload.password) {
      updates.password = payload.password;
    }
  }

  // Update user in DB
  const updatedUser = await updateUser(user.email, updates);
  if (!updatedUser) {
    return res.status(500).json({ error: 'Gagal memperbarui profil pengguna' });
  }

  // Generate new auth token because payload might have changed (e.g. name)
  const newToken = createToken({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone
  });

  return res.status(200).json({
    success: true,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar
    },
    token: newToken
  });
}
