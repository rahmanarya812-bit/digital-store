export function createToken(user) {
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded.id && decoded.email && decoded.role) return decoded;
    return null;
  } catch { return null; }
}

export function getAuthUser(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}
