import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColor = {
  free: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function MyTickets() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/registrations/my');
        setRegistrations(data.registrations);
      } catch {
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await api.delete(`/registrations/${id}`);
      toast.success('Registration cancelled');
      setRegistrations(prev => prev.filter(r => r._id !== id));
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🎓 Eventra</h1>
        <button onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-600 hover:underline">
          ← Back to Events
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">🎟️ My Tickets</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-400 text-lg">No registrations yet</p>
            <button onClick={() => navigate('/dashboard')}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm">
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div key={reg._id}
                className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{reg.event?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      📍 {reg.event?.venue} &nbsp;|&nbsp;
                      📅 {new Date(reg.event?.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      🎫 {reg.ticketId}
                    </p>
                    {reg.attended && (
                      <span className="mt-2 inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                        ✅ Attended
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColor[reg.paymentStatus]}`}>
                      {reg.paymentStatus}
                    </span>

                    {/* QR Code Button */}
                    {reg.qrCode && (
                      <button
                        onClick={() => setSelectedTicket(reg)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                        📱 Show QR
                      </button>
                    )}

                    <button
                      onClick={() => handleCancel(reg._id)}
                      className="text-xs text-red-500 hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && (
        <QRModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

function QRModal({ ticket, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{ticket.event?.title}</h3>
        <p className="text-sm text-gray-500 mb-6">
          📍 {ticket.event?.venue} &nbsp;|&nbsp;
          📅 {new Date(ticket.event?.date).toLocaleDateString()}
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <img
            src={ticket.qrCode}
            alt="QR Code"
            className="w-48 h-48 rounded-xl border-2 border-gray-100"
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 mb-1">Ticket ID</p>
          <p className="font-mono font-bold text-gray-800 text-lg">{ticket.ticketId}</p>
        </div>

        {ticket.attended ? (
          <div className="bg-green-50 border border-green-200 text-green-700 py-2 rounded-xl text-sm font-medium mb-4">
            ✅ Attendance Marked
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 py-2 rounded-xl text-sm font-medium mb-4">
            ⏳ Not yet attended
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition">
          Close
        </button>
      </div>
    </div>
  );
}