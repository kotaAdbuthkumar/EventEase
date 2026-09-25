import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('eventease_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user on boot
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('eventease_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('eventease_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('eventease_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('eventease_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const demoLogin = async (role = 'ATTENDEE') => {
    const res = await api.post('/auth/demo-login', { role });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('eventease_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('eventease_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
    isOrganizer: user?.role === 'ORGANIZER' || user?.role === 'ADMIN',
    isAttendee: user?.role === 'ATTENDEE',
    login,
    register,
    demoLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
