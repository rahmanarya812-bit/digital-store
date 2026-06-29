import crypto from 'crypto';

const SECRET_KEY = 'arya-store-otp-secret-key-12345';

export function createOtpToken(email, name, password, otp) {
  const payload = { email, name, password, otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 minutes expiry
  const serialized = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(serialized).digest('hex');
  return Buffer.from(JSON.stringify({ data: payload, signature })).toString('base64');
}

export function verifyOtpToken(token, enteredOtp) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { data, signature } = decoded;
    
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(JSON.stringify(data)).digest('hex');
    if (signature !== expectedSignature) return null;
    
    if (Date.now() > data.expiresAt) return null;
    
    if (String(data.otp).trim() !== String(enteredOtp).trim()) return null;
    
    return data;
  } catch (err) {
    return null;
  }
}
