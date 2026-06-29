import { api } from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsersAndLogs: () => api.get('/admin/users'),
};
