import fs from 'fs';
import path from 'path';

const defaultUsers = [
  { id: 1, name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: 'admin', avatar: null },
  { id: 2, name: 'John Customer', email: 'user@store.com', password: 'user123', role: 'customer', avatar: null },
];

let memoryUsers = null;
let memoryLogs = null;

const getUsersDbPath = () => path.join(process.cwd(), 'api', '_data', 'users.json');
const getLogsDbPath = () => path.join(process.cwd(), 'api', '_data', 'login_logs.json');

export function getUsers() {
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

export function findUserByEmail(email) {
  const list = getUsers();
  return list.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(name, email, password) {
  const list = getUsers();
  const nextId = list.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const newUser = { id: nextId, name, email, password, role: 'customer', avatar: null };
  list.push(newUser);
  
  memoryUsers = list;
  
  try {
    const filePath = getUsersDbPath();
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Users DB write error:', err.message);
  }
  
  return newUser;
}

export function getLoginLogs() {
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

export function addLoginLog(email, action, userAgent = '') {
  const logs = getLoginLogs();
  const newLog = {
    timestamp: new Date().toISOString(),
    email,
    action, // 'LOGIN' or 'REGISTER'
    userAgent
  };
  
  logs.unshift(newLog); // Put newest logs first
  // Cap at 200 logs to prevent file bloat
  const cappedLogs = logs.slice(0, 200);
  memoryLogs = cappedLogs;
  
  try {
    const filePath = getLogsDbPath();
    fs.writeFileSync(filePath, JSON.stringify(cappedLogs, null, 2), 'utf8');
  } catch (err) {
    console.warn('Logs DB write error:', err.message);
  }
  
  return newLog;
}
