export const users = [
  { id: 1, name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: 'admin', avatar: null },
  { id: 2, name: 'John Customer', email: 'user@store.com', password: 'user123', role: 'customer', avatar: null },
];

let nextUserId = 3;

export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function createUser(name, email, password) {
  const user = { id: nextUserId++, name, email, password, role: 'customer', avatar: null };
  users.push(user);
  return user;
}
