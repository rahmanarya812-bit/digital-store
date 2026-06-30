import { create } from 'zustand';
import { authService } from '../services/authService';

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    return { token, user, isLoggedIn: !!token && !!user };
  } catch { return { token: null, user: null, isLoggedIn: false }; }
};

const initial = getStoredAuth();

export const useAuthStore = create((set, get) => ({
  user: initial.user,
  token: initial.token,
  isLoggedIn: initial.isLoggedIn,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoggedIn: true, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  sendOtp: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.sendOtp(name, email, password);
      set({ loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  verifyOtp: async (otp, otpToken) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.verifyOtp(otp, otpToken);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoggedIn: true, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  sendProfileOtp: async (newPassword) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.sendProfileOtp(newPassword);
      set({ loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.updateProfile(profileData);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  googleLogin: async (name, email) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.googleLogin(name, email);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoggedIn: true, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.forgotPassword(email);
      set({ loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  resetPassword: async (token, key, newPassword) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.resetPassword(token, key, newPassword);
      set({ loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isLoggedIn: false, error: null });
  },

  clearError: () => set({ error: null }),

  isAdmin: () => {
    return get().user?.role === 'admin';
  },
}));
