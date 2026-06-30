import nodemailer from 'nodemailer';
import { getSettings } from '../_utils/db.js';
import { createOtpToken, verifyOtpToken } from '../_utils/otp.js';
import { findUserByEmail, updateUser } from '../_data/users.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, token, newPassword } = req.body || {};

  if (action === 'forgot') {
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan. Silakan daftar akun terlebih dahulu.' });
    }

    const resetTokenPayload = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const otpToken = createOtpToken(user.email, user.name, null, resetTokenPayload);

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
          auth: { user: settings.smtpUser, pass: settings.smtpPass },
          tls: { rejectUnauthorized: false }
        });

        const resetLink = `https://${req.headers.host || 'digital-store.com'}/reset-password?token=${encodeURIComponent(otpToken)}&key=${resetTokenPayload}`;

        await transporter.sendMail({
          from: `"${settings.smtpSender || settings.receiptName}" <${settings.smtpUser}>`,
          to: user.email,
          subject: `Reset Kata Sandi`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #ed8936; text-align: center; margin-bottom: 20px;">Lupa Kata Sandi</h2>
              <p style="color: #2d3748; font-size: 1rem; line-height: 1.6;">Halo, <strong>${user.name}</strong>!</p>
              <p style="color: #4a5568; font-size: 0.95rem; line-height: 1.6;">Seseorang telah meminta untuk mereset kata sandi akun Anda. Klik tombol di bawah ini untuk mengatur ulang kata sandi Anda:</p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" style="background: #ed8936; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Kata Sandi</a>
              </div>
              
              <p style="font-size: 0.85rem; color: #718096; text-align: center; margin-top: 20px;">Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini.</p>
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

    return res.status(200).json({
      success: true,
      simulated: !isSmtpConfigured,
      // Pass token down so sandbox UI can simulate clicking it
      simulatedToken: isSmtpConfigured ? null : otpToken,
      simulatedKey: isSmtpConfigured ? null : resetTokenPayload,
      emailError: isSmtpConfigured && !emailSent ? `Gagal mengirim email: ${emailError}` : null
    });
  }
  
  if (action === 'reset') {
    const { key } = req.body || {};
    if (!token || !key || !newPassword) return res.status(400).json({ error: 'Token, key, and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const payload = verifyOtpToken(token, key);
    if (!payload) return res.status(400).json({ error: 'Link reset kata sandi tidak valid atau sudah usang.' });

    const updatedUser = await updateUser(payload.email, { password: newPassword });
    if (!updatedUser) return res.status(500).json({ error: 'Gagal memperbarui sandi.' });

    return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
