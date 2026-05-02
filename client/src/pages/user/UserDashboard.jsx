import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data.events);
      } catch {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const categoryColor = {
    seminar: 'bg-blue-100 text-blue-700',
    workshop: 'bg-purple-100 text-purple-700',
    sports: 'bg-green-100 text-green-700',
    cultural: 'bg-pink-100 text-pink-700',
    tech: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🎓 Eventra</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user?.name}</span>
          <button onClick={handleLogout}
            className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
          <p className="text-gray-500 mt-1">Browse and register for events</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No events available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-3"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${categoryColor[event.category]}`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>📍 {event.venue}</p>
                    <p>⏰ {event.startTime} — {event.endTime}</p>
                    <p>👥 {event.registeredCount}/{event.capacity} registered</p>
                    <p className="font-medium text-blue-600">
                      {event.isFree ? '🆓 Free' : `💰 PKR ${event.fee}`}
                    </p>
                  </div>

                  <Link to={`/events/${event._id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}