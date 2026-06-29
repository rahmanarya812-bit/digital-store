import fs from 'fs';
import path from 'path';
import { kvCall } from '../_utils/kv.js';

const defaultUsers = [
  { id: 1, name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: 'admin', avatar: null },
  { id: 2, name: 'John Customer', email: 'user@store.com', password: 'user123', role: 'customer', avatar: null },
];

let memoryUsers = null;
let memoryLogs = null;

const getUsersDbPath = () => path.join(process.cwd(), 'api', '_data', 'users.json');
const getLogsDbPath = () => path.join(process.cwd(), 'api', '_data', 'login_logs.json');

export async function getUsers() {
  if (process.env.KV_REST_API_URL) {
    const kvData = await kvCall('GET', ['store:users']);
    if (kvData) {
      try {
        const parsed = JSON.parse(kvData);
        memoryUsers = parsed;
        return parsed;
      } catch (err) {
        console.error('KV Users Parse Error:', err);
      }
    }
  }

  if (memoryUsers) return memoryUsers;
  
  try {
    const filePath = getUsersDbPath();
    if (!fs.existsSync(filePath)) {
      memoryUsers = [...defaultUsers];
      return memoryUsers;
    }
    const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    memoryUsers = list;
    return list;
  } catch (err) {
    console.error('Users DB read error:', err);
    return [...defaultUsers];
  }
}

export async function findUserByEmail(email) {
  const list = await getUsers();
  return list.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(name, email, password) {
  const list = await getUsers();
  const nextId = list.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const newUser = { id: nextId, name, email, password, role: 'customer', avatar: null };
  list.push(newUser);
  
  memoryUsers = list;

  if (process.env.KV_REST_API_URL) {
    await kvCall('SET', ['store:users', JSON.stringify(list)]);
  }
  
  try {
    const filePath = getUsersDbPath();
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Users DB write error:', err.message);
  }
  
  return newUser;
}

export async function getLoginLogs() {
  if (process.env.KV_REST_API_URL) {
    const kvData = await kvCall('GET', ['store:logs']);
    if (kvData) {
      try {
        const parsed = JSON.parse(kvData);
        memoryLogs = parsed;
        return parsed;
      } catch (err) {
        console.error('KV Logs Parse Error:', err);
      }
    }
  }

  if (memoryLogs) return memoryLogs;
  
  try {
    const filePath = getLogsDbPath();
    if (!fs.existsSync(filePath)) {
      memoryLogs = [];
      return [];
    }
    const logs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    memoryLogs = logs;
    return logs;
  } catch (err) {
    console.error('Logs DB read error:', err);
    return [];
  }
}

export async function addLoginLog(email, action, userAgent = '') {
  const logs = await getLoginLogs();
  const newLog = {
    timestamp: new Date().toISOString(),
    email,
    action, // 'LOGIN' or 'REGISTER'
    userAgent
  };
  
  logs.unshift(newLog); // Put newest logs first
  const cappedLogs = logs.slice(0, 200);
  memoryLogs = cappedLogs;

  if (process.env.KV_REST_API_URL) {
    await kvCall('SET', ['store:logs', JSON.stringify(cappedLogs)]);
  }
  
  try {
    const filePath = getLogsDbPath();
    fs.writeFileSync(filePath, JSON.stringify(cappedLogs, null, 2), 'utf8');
  } catch (err) {
    console.warn('Logs DB write error:', err.message);
  }
  
  return newLog;
}
