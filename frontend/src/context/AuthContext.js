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
        useEffect(() => {
          // Check if user explicitly logged out (logout clears localStorage)
          const isLoggedOut = localStorage.getItem('isLoggedOut') === 'true';
    
          if (isLoggedOut) {
            // Stay logged out
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
