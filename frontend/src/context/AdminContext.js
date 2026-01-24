import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/profile');
        setAdmin(res.data.admin);
      } catch (_e) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const adminLogin = async (email, password) => {
    await api.post('/admin/login', { email, password });
    const res = await api.get('/admin/profile');
    setAdmin(res.data.admin);
  };

  const logout = async () => {
    await api.post('/admin/logout');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, setAdmin, loading, adminLogin, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
