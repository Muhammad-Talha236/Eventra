import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const typeColor = {
  security: 'bg-red-100 text-red-700',
  crowd: 'bg-orange-100 text-orange-700',
  medical: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

const priorityColor = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColor = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get('/incidents');
      setIncidents(data.incidents);
    } catch {
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/incidents/${id}/status`, { status });
      toast.success('Status updated!');
      fetchIncidents();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this incident?')) return;
    try {
      await api.delete(`/incidents/${id}`);
      toast.success('Incident deleted!');
      fetchIncidents();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const open = incidents.filter(i => i.status === 'open').length;
  const critical = incidents.filter(i => i.priority === 'critical').length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Incidents</h2>
        <p className="text-gray-500 mt-1">Monitor and resolve reported incidents</p>
      </div>

      {/* Alert Banner */}
      {critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold text-red-700">{critical} Critical Incident{critical > 1 ? 's' : ''} Require Immediate Attention!</p>
            <p className="text-sm text-red-500">Please review and resolve these immediately.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Open</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{open}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">
            {incidents.filter(i => i.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Resolved</p>
          <p className="text-3xl font-bold text-green-700 mt-1">
            {incidents.filter(i => i.status === 'resolved').length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-400 text-lg">No incidents reported</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident._id}
              className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${
                incident.priority === 'critical' ? 'border-red-500' :
                incident.priority === 'high' ? 'border-orange-500' :
                incident.priority === 'medium' ? 'border-yellow-500' : 'border-gray-300'
              }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-lg">{incident.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColor[incident.type]}`}>
                      {incident.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[incident.priority]}`}>
                      {incident.priority}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{incident.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>👤 {incident.reportedBy?.name}</span>
                    {incident.event && <span>🎟️ {incident.event?.title}</span>}
                    <span>🕐 {new Date(incident.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <select
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident._id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer ${statusColor[incident.status]}`}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDelete(incident._id)}
                    className="text-red-400 hover:text-red-600">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}