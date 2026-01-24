import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="flex bg-slate-900 text-white min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Students" value={stats.totalStudents} color="bg-blue-600" />
            <StatCard title="Total Tutors" value={stats.totalTutors} color="bg-green-600" />
            <StatCard title="Pending Tutors" value={stats.pendingTutors} color="bg-yellow-600" />
            <StatCard title="Total Bookings" value={stats.totalBookings} color="bg-purple-600" />
            <StatCard title="Active Courses" value={stats.activeCourses} color="bg-pink-600" />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`${color} rounded-lg p-6 shadow-lg`}>
    <p className="text-sm opacity-80">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
