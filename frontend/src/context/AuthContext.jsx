import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setToken(storedToken);
      } catch (err) {
        console.error('Falha ao recuperar usuario:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = async ({ email, senha }) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token: accessToken, usuario } = response.data;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setUser(usuario);
      return usuario;
    } catch (err) {
      const message = err.response?.data?.erro || err.message || 'Falha ao efetuar login.';
      setError(message);
      throw new Error(message);
    }
  };

  const value = useMemo(() => ({ user, token, login, logout, loading, error }), [user, token, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
