import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.event);

        // Check already registered
        const myRegs = await api.get('/registrations/my');
        const isReg = myRegs.data.registrations.some(r => r.event._id === id);
        setRegistered(isReg);
      } catch {
        toast.error('Event not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post('/registrations', { eventId: id });
      toast.success('Registered successfully! 🎉');
      setRegistered(true);
      setEvent(prev => ({ ...prev, registeredCount: prev.registeredCount + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🎓 Eventra</h1>
        <button onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-600 hover:underline">
          ← Back to Events
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-400 px-8 py-10">
            <span className="text-blue-100 text-sm capitalize bg-blue-600 px-3 py-1 rounded-full">
              {event.category}
            </span>
            <h1 className="text-3xl font-bold text-white mt-3">{event.title}</h1>
          </div>

          <div className="p-8">
            <p className="text-gray-600 mb-8 leading-relaxed">{event.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(event.date).toLocaleDateString('en-PK', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Time</p>
                <p className="font-semibold text-gray-800">{event.startTime} — {event.endTime}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Venue</p>
                <p className="font-semibold text-gray-800">📍 {event.venue}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Capacity</p>
                <p className="font-semibold text-gray-800">
                  👥 {event.registeredCount}/{event.capacity}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl mb-6">
              <div>
                <p className="text-sm text-gray-500">Registration Fee</p>
                <p className="text-2xl font-bold text-blue-700">
                  {event.isFree ? 'FREE' : `PKR ${event.fee}`}
                </p>
              </div>
              {!event.isFree && (
                <p className="text-xs text-gray-400 max-w-xs text-right">
                  Payment screenshot required after registration
                </p>
              )}
            </div>

            {/* Register Button */}
            {registered ? (
              <div className="w-full bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl text-center font-medium">
                ✅ Already Registered! Check My Tickets
              </div>
            ) : isFull ? (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 py-3 rounded-xl text-center font-medium">
                ❌ Event is Full
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {registering ? 'Registering...' : '🎟️ Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}