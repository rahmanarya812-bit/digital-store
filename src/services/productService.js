import { api } from './api';

export const productService = {
  getAll: (params = {}) => api.get('/products', params),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (data) => api.put('/products', data),
  delete: (id) => api.delete(`/products?id=${id}`)
};
