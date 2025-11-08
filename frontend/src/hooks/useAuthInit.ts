import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export function useAuthInit() {
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        logout();
      }
    };

    fetchCurrentUser();
  }, [token, setUser, logout]);
}
