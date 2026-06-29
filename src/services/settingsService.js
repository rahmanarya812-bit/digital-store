import { api } from './api';

export const settingsService = {
  get: () => api.get('/settings'),
  update: (settings) => api.post('/settings', settings),
};
