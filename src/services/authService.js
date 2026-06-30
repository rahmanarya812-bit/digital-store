import { api } from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  sendOtp: (name, email, password) => api.post('/auth/register-send-otp', { name, email, password }),
  verifyOtp: (otp, otpToken) => api.post('/auth/register-verify', { otp, otpToken }),
  sendProfileOtp: (newPassword) => api.post('/auth/profile-otp', { newPassword }),
  updateProfile: (data) => api.post('/auth/update-profile', data),
};
