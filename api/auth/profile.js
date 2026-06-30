import nodemailer from 'nodemailer';
import { getAuthUser, createToken } from '../_utils/auth.js';
import { getSettings } from '../_utils/db.js';
import { createOtpToken, verifyOtpToken } from '../_utils/otp.js';
import { updateUser } from '../_data/users.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  // POST: Send OTP for password change
  if (req.method === 'POST') {
    const { newPassword } = req.body || {};
    if (!newPassword) return res.status(400).json({ error: 'New password is required for OTP' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const settings = await getSettings();
    const isSmtpConfigured = settings.smtpHost && settings.smtpUser && settings.smtpPass;

    let emailSent = false;
    let emailError = null;

    if (isSmtpConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort) || 587,
          secure: parseInt(settings.smtpPort) === 465,
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass,
          },
          tls: { rejectUnauthorized: false }
        });

        await transporter.sendMail({
          from: `"${settings.smtpSender || settings.receiptName}" <${settings.smtpUser}>`,
          to: user.email,
          subject: `Kode Verifikasi Keamanan - Ganti Password`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #e53e3e; text-align: center; margin-bottom: 20px;">Keamanan Akun: Ganti Password</h2>
              <p style="color: #2d3748; font-size: 1rem; line-height: 1.6;">Halo, <strong>${user.name}</strong>!</p>
              <p style="color: #4a5568; font-size: 0.95rem; line-height: 1.6;">Kami menerima permintaan untuk mengganti password akun Anda di <strong>${settings.receiptName}</strong>. Jika ini memang Anda, silakan masukkan kode verifikasi (OTP) berikut:</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <span style="font-size: 2.25rem; font-weight: 800; letter-spacing: 6px; color: #e53e3e; background: #fff5f5; padding: 12px 24px; border-radius: 8px; border: 2px dashed #feb2b2; display: inline-block;">
                  ${otp}
                </span>
              </div>
              
              <p style="font-size: 0.85rem; color: #718096; text-align: center; margin-top: 20px;">Kode OTP ini berlaku selama 10 menit. Jika Anda tidak merasa melakukan permintaan ganti password ini, abaikan email ini dan pastikan akun Anda aman.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
              <p style="font-size: 0.8rem; color: #a0aec0; text-align: center;">&copy; ${settings.receiptName}. All rights reserved.</p>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.error('SMTP Send Error:', err);
        emailError = err.message;
      }
    }

    const otpToken = createOtpToken(user.email, user.name, newPassword, otp);
    return res.status(200).json({
      success: true,
      otpToken,
      simulated: !isSmtpConfigured,
      simulatedOtp: isSmtpConfigured ? null : otp,
      emailError: isSmtpConfigured && !emailSent ? `Gagal mengirim email: ${emailError}` : null
    });
  }

  // PUT: Update profile (and password if OTP provided)
  if (req.method === 'PUT') {
    const { name, phone, otpToken, otp } = req.body || {};

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (otpToken && otp) {
      const payload = verifyOtpToken(otpToken, otp);
      if (!payload) return res.status(400).json({ error: 'Kode OTP tidak valid atau sudah kedaluwarsa' });
      if (payload.email.toLowerCase() !== user.email.toLowerCase()) return res.status(400).json({ error: 'Token OTP tidak valid untuk pengguna ini' });
      if (payload.password) updates.password = payload.password;
    }

    const updatedUser = await updateUser(user.email, updates);
    if (!updatedUser) return res.status(500).json({ error: 'Gagal memperbarui profil pengguna' });

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

  return res.status(405).json({ error: 'Method not allowed' });
}
