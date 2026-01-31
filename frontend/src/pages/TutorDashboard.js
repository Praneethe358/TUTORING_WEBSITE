import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const StatCard = ({ label, value, icon, theme }) => (
  <div
    className={`p-4 sm:p-5 rounded-xl border shadow-sm transition hover:shadow-md ${
      theme === "dark"
        ? "bg-slate-800 border-slate-700 text-slate-50"
        : "bg-white border-slate-200 text-slate-900"
    }`}
  >
    <div className="text-xl sm:text-2xl mb-2">{icon}</div>
    <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>{label}</p>
    <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const BookingRow = ({ booking, theme }) => {
  const date = new Date(booking.date);
  return (
    <div
      className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b last:border-b-0 ${
        theme === "dark" ? "border-slate-800" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${
            theme === "dark" ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700"
          }`}
        >
          👤
        </div>
        <div>
          <p className="font-semibold">{booking.student?.name || "Unknown Student"}</p>
          <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            {booking.course?.subject || "No subject"}
          </p>
        </div>
      </div>
      <div className={`text-sm text-right ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}>
        <p>{date.toLocaleString()}</p>
        <p className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
          {booking.course?.durationMinutes || 60} mins
        </p>
      </div>
    </div>
  );
};

const TutorDashboard = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/tutor/bookings");
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { upcoming, pending, completed, studentCount } = useMemo(() => {
    const up = bookings.filter((b) => new Date(b.date) > new Date());
    const pend = bookings.filter((b) => b.status === "pending");
    const comp = bookings.filter((b) => b.status === "completed");
    const students = new Set(bookings.map((b) => b.student?._id).filter(Boolean)).size;
    return { upcoming: up, pending: pend, completed: comp, studentCount: students };
  }, [bookings]);

  return (
    <div className={`${theme === "dark" ? "bg-slate-900 text-slate-50" : "bg-slate-50 text-slate-900"} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-[1px] shadow-xl">
          <div className={`${theme === "dark" ? "bg-slate-900" : "bg-slate-50"} rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <div>
              <p className={`${theme === "dark" ? "text-slate-300" : "text-slate-600"} text-sm`}>Welcome back</p>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Tutor Dashboard</h1>
              <p className={`${theme === "dark" ? "text-slate-200" : "text-slate-700"} mt-2 text-sm sm:text-base`}>
                {user?.name} • {user?.email}
              </p>
              <p className={`${theme === "dark" ? "text-slate-300" : "text-slate-600"} text-xs mt-1`}>
                Status: {user?.isActive ? "Approved" : "Pending approval"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full sm:w-auto">
              <Link
                to="/tutor/availability"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white text-slate-900 font-medium shadow hover:-translate-y-0.5 transition min-h-[44px] text-center"
              >
                Availability
              </Link>
              <Link
                to="/tutor/courses"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition min-h-[44px] text-center"
              >
                Courses
              </Link>
              <button
                onClick={logout}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-400 transition min-h-[44px]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Upcoming" value={upcoming.length} icon="📅" theme={theme} />
          <StatCard label="Pending" value={pending.length} icon="⏳" theme={theme} />
          <StatCard label="Completed" value={completed.length} icon="✅" theme={theme} />
          <StatCard label="Total Students" value={studentCount || 0} icon="👥" theme={theme} />
        </div>

        {/* Upcoming classes */}
        <div
          className={`rounded-2xl border shadow-lg overflow-hidden ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b ${
              theme === "dark" ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Upcoming Classes</h2>
              <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} text-sm`}>
                Your next sessions at a glance
              </p>
            </div>
            <Link
              to="/tutor/classes"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading classes...</div>
          ) : upcoming.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No upcoming bookings yet.</div>
          ) : (
            <div>
              {upcoming.slice(0, 5).map((b) => (
                <BookingRow key={b._id} booking={b} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
