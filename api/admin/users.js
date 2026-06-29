import { getUsers, getLoginLogs } from '../_data/users.js';
import { getAuthUser } from '../_utils/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Authenticate user
  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
  }

  // Get data
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
