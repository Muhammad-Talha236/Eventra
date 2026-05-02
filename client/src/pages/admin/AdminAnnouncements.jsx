import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const typeColor = {
  general: 'bg-blue-100 text-blue-700',
  event: 'bg-purple-100 text-purple-700',
  emergency: 'bg-red-100 text-red-700',
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data.announcements);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Deleted!');
      fetchAnnouncements();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Announcements</h2>
          <p className="text-gray-500 mt-1">Broadcast messages to users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
          + New Announcement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-lg">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id}
              className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">{ann.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${typeColor[ann.type]}`}>
                      {ann.type}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                      → {ann.targetRole}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{ann.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>👤 {ann.createdBy?.name}</span>
                    <span>🕐 {new Date(ann.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(ann._id)}
                  className="text-red-400 hover:text-red-600 ml-4">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateAnnouncementModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAnnouncements(); }}
        />
      )}
    </AdminLayout>
  );
}

function CreateAnnouncementModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', message: '', type: 'general', targetRole: 'all'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement sent!');
      onSuccess();
    } catch {
      toast.error('Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">New Announcement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required placeholder="Announcement title"
              className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required rows={4} placeholder="Write your announcement..."
              className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}>
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className={inputClass}>
                <option value="all">Everyone</option>
                <option value="user">Users</option>
                <option value="volunteer">Volunteers</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Sending...' : '📢 Send Announcement'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}