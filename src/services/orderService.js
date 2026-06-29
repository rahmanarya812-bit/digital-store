import { api } from './api';

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders?id=${id}`),
  create: (items, total, paymentMethod = 'ewallet') => api.post('/orders', { items, total, paymentMethod }),
};
