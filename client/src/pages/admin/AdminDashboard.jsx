import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color}`}>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/events');
        const upcoming = data.events.filter(e => e.status === 'upcoming').length;
        setStats(prev => ({
          ...prev,
          totalEvents: data.count,
          upcomingEvents: upcoming,
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome to Eventra Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Events" value={stats.totalEvents} color="border-blue-500" />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} color="border-green-500" />
        <StatCard label="Total Users" value={stats.totalUsers} color="border-purple-500" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/events/create"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Create Event
          </a>
          <a href="/admin/users"
            className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
            Manage Users
          </a>
          <a href="/admin/announcements"
            className="bg-yellow-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition">
            📢 Announcement
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}