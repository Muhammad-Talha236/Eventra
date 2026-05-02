import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ScanTicket() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        try {
          const parsed = JSON.parse(decodedText);
          await lookupTicket(parsed.ticketId);
        } catch {
          await lookupTicket(decodedText);
        }
      },
      (error) => console.warn('QR scan error:', error)
    );

    scannerRef.current = scanner;
    return () => scanner.clear().catch(() => {});
  }, []);

  const lookupTicket = async (ticketId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/registrations/scan/${ticketId}`);
      setResult(data.registration);
    } catch {
      toast.error('Invalid or not found ticket!');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    await lookupTicket(manualId.trim().toUpperCase());
  };

  const handleAttendance = async () => {
    try {
      await api.put(`/registrations/${result._id}/attend`);
      toast.success('Attendance marked! ✅');
      setResult(prev => ({ ...prev, attended: true }));
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const statusColor = {
    free: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">🔍 Scan Ticket</h2>
        <p className="text-gray-500 mt-1">Scan QR code or enter ticket ID manually</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-700 mb-4">📷 QR Scanner</h3>
          <div id="qr-reader" className="rounded-xl overflow-hidden"></div>

          {/* Manual Input */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">Or enter ticket ID manually:</p>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="TKT-XXXXXXXX"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? '...' : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-700 mb-4">🎫 Ticket Details</h3>

          {!result ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📷</p>
              <p className="text-gray-400">Scan a QR code to see ticket details</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Banner */}
              {result.attended ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-bold text-lg">✅ Already Attended</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-blue-700 font-bold text-lg">🎟️ Valid Ticket</p>
                </div>
              )}

              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-gray-800">{result.user?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-800">{result.user?.email}</span>
                </div>
                {result.user?.studentInfo?.studentId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Student ID</span>
                    <span className="font-medium text-gray-800">{result.user.studentInfo.studentId}</span>
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Event</span>
                  <span className="font-medium text-gray-800">{result.event?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ticket ID</span>
                  <span className="font-mono font-bold text-gray-800">{result.ticketId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[result.paymentStatus]}`}>
                    {result.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Mark Attendance Button */}
              {!result.attended ? (
                <button
                  onClick={handleAttendance}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                  ✅ Mark Attendance
                </button>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl text-center font-medium">
                  Already marked attended
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}