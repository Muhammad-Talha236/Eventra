import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted!');
      fetchEvents();
    } catch {
      toast.error('Delete failed');
    }
  };

  const statusColor = {
    upcoming: 'bg-green-100 text-green-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Events</h2>
          <p className="text-gray-500 mt-1">Manage all university events</p>
        </div>
        <Link to="/admin/events/create"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
          + Create Event
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-lg">No events yet</p>
          <Link to="/admin/events/create"
            className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg">
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Event</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Venue</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{event.category}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.venue}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[event.status]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link to={`/admin/events/edit/${event._id}`}
                        className="text-blue-600 hover:underline text-sm">Edit</Link>
                      <button onClick={() => handleDelete(event._id)}
                        className="text-red-500 hover:underline text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}