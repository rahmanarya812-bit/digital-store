import { api } from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  sendOtp: (name, email, password) => api.post('/auth/register-send-otp', { name, email, password }),
  verifyOtp: (otp, otpToken) => api.post('/auth/register-verify', { otp, otpToken }),
  sendProfileOtp: (newPassword) => api.post('/auth/profile', { newPassword }),
  updateProfile: (data) => api.put('/auth/profile', data),
  googleLogin: (name, email) => api.post('/auth/login', { action: 'google', name, email }),
  forgotPassword: (email) => api.post('/auth/recovery', { action: 'forgot', email }),
  resetPassword: (token, key, newPassword) => api.post('/auth/recovery', { action: 'reset', token, key, newPassword }),
};
