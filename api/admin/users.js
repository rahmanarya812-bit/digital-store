import { getUsers, getLoginLogs } from '../_data/users.js';
import { getAuthUser } from '../_utils/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  // Authenticate user
  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
  }

  if (req.method === 'DELETE') {
    try {
      // For Vercel Serverless, req.body might be a string if not parsed properly
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id } = body || {};
      
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Optional: Prevent deleting self
      if (String(authUser.id) === String(id)) {
        return res.status(403).json({ error: 'Cannot delete yourself' });
      }
      
      const { deleteUser } = await import('../_data/users.js');
      await deleteUser(id);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ error: err.message || 'Failed to delete user' });
    }
  }

  // Get data (GET method)
  const usersListRaw = await getUsers();
  const users = usersListRaw.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  const logs = await getLoginLogs();

  res.status(200).json({ users, logs });
}
