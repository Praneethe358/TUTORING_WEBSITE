import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
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
      if (role === 'tutor') {
        await api.post('/tutor/logout');
      } else {
        await api.post('/student/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setRole(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, role, login, tutorLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
