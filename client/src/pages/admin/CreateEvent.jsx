import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'seminar',
    venue: '', date: '', startTime: '', endTime: '',
    capacity: '', fee: 0, status: 'upcoming',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/events', { ...form, fee: Number(form.fee), capacity: Number(form.capacity) });
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Create Event</h2>
        <p className="text-gray-500 mt-1">Fill in the details below</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input name="title" value={form.title} onChange={handleChange}
              required placeholder="Annual Tech Fest" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              required rows={3} placeholder="Event description..."
              className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="tech">Tech</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input name="venue" value={form.venue} onChange={handleChange}
              required placeholder="Main Auditorium" className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
                required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
                required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                required placeholder="200" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee (PKR) — 0 for free</label>
              <input type="number" name="fee" value={form.fee} onChange={handleChange}
                placeholder="0" className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button type="button" onClick={() => navigate('/admin/events')}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}