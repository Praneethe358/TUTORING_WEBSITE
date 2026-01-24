import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * TUTOR CLASS STATISTICS PAGE
 * 
 * View teaching summary and class history
 * - Total classes taught
 * - Monthly breakdown
 * - Class history
 */
const TutorEarnings = () => {
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      // Fetch completed bookings
      const res = await api.get('/tutor/bookings');
      const bookings = res.data.bookings || [];
      const completed = bookings.filter(b => b.status === 'completed');
      
      const total = completed.length;
      const now = new Date();
      const thisMonthBookings = completed.filter(b => {
        const date = new Date(b.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
      const thisMonth = thisMonthBookings.length;

      setEarnings({
        total,
        thisMonth,
        lastMonth: Math.floor(total * 0.2), // Placeholder
        pending: 0
      });

      setTransactions(completed.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Class Statistics</h1>
        <p className="text-slate-400 mt-1">View your teaching history</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <EarningsCard
          title="Total Classes"
          value={earnings.total}
          icon="📚"
          color="bg-green-600"
        />
        <EarningsCard
          title="This Month"
          value={earnings.thisMonth}
          icon="📈"
          color="bg-blue-600"
        />
        <EarningsCard
          title="Last Month"
          value={earnings.lastMonth}
          icon="📊"
          color="bg-purple-600"
        />
        <EarningsCard
          title="Pending"
          value={earnings.pending}
          icon="⏳"
          color="bg-orange-600"
        />
      </div>



      {/* Class History */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Class History</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-400">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-slate-400">No transactions yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Course</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transactions.map(transaction => (
                <tr key={transaction._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {transaction.student?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {transaction.course?.subject}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    {transaction.course?.durationMinutes || 0} mins
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

const EarningsCard = ({ title, value, icon, color }) => (  // Renamed from EarningsCard but kept for compatibility
  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

export default TutorEarnings;
