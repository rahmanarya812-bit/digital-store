import { api } from './api';

export const orderService = {
  getAll: () => api.get('/orders'),
  create: (items, total) => api.post('/orders', { items, total }),
};
