import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Check if user explicitly logged out
    const isLoggedOut = localStorage.getItem('isLoggedOut') === 'true';

    if (isLoggedOut) {
      localStorage.removeItem('isLoggedOut');
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    // Try student first, then tutor
    const load = async () => {
      try {
        const res = await api.get('/student/profile');
        setUser(res.data.student);
        setRole('student');
      } catch (_e) {
        try {
          const res2 = await api.get('/tutor/profile');
          setUser(res2.data.tutor);
          setRole('tutor');
        } catch (_e2) {
          setUser(null);
          setRole(null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async (email, password) => {
    await api.post('/student/login', { email, password });
    const profile = await api.get('/student/profile');
    setUser(profile.data.student);
    setRole('student');
  };

  const tutorLogin = async (email, password) => {
    await api.post('/tutor/login', { email, password });
    const profile = await api.get('/tutor/profile');
    setUser(profile.data.tutor);
    setRole('tutor');
  };

  const logout = async () => {
    try {
      // Set logout flag FIRST to prevent auto-login
      localStorage.setItem('isLoggedOut', 'true');

      // Clear auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('redirectAfterLogin');
      setUser(null);
      setRole(null);

      // Then call logout endpoint to clear server-side session
      if (role === 'tutor') {
        await api.post('/tutor/logout');
      } else {
        await api.post('/student/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect home regardless of error
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, role, login, tutorLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
