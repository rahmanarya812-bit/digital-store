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

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoggedIn: true, loading: false });
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
