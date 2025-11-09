import { create } from 'zustand';
import { authAPI } from '../lib/api';
import type { User } from '../types';

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'worker' | 'company';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  setUser: (user) => set({ user: user ? { ...user } : null, isAuthenticated: !!user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    set({ token, isAuthenticated: !!token });
  },
  
  login: async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('access_token', response.access_token);
    set({ 
      user: response.user, 
      token: response.access_token, 
      isAuthenticated: true 
    });
  },
  
  register: async (data: RegisterData) => {
    const response = await authAPI.register(data);
    localStorage.setItem('access_token', response.access_token);
    set({ 
      user: response.user, 
      token: response.access_token, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
