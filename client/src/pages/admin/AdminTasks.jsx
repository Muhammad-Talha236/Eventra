import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const priorityColor = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusColor = {
  pending: 'bg-orange-100 text-orange-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);

  const fetchAll = async () => {
    try {
      const [tasksRes, usersRes, eventsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users', { params: { role: '' } }),
        api.get('/events'),
      ]);
      setTasks(tasksRes.data.tasks);
      setVolunteers(usersRes.data.users.filter(u =>
        ['volunteer', 'co_head', 'main_head', 'staff'].includes(u.role)
      ));
      setEvents(eventsRes.data.events);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted!');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      toast.success('Status updated!');
      fetchAll();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Tasks</h2>
          <p className="text-gray-500 mt-1">Assign and manage volunteer tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
          + Assign Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['pending', 'in_progress', 'completed'].map(s => (
          <div key={s} className={`rounded-xl p-4 ${statusColor[s]} bg-opacity-50`}>
            <p className="text-sm font-medium capitalize">{s.replace('_', ' ')}</p>
            <p className="text-2xl font-bold mt-1">
              {tasks.filter(t => t.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-400 text-lg">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id}
              className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-500 text-sm mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👤 {task.assignedTo?.name}</span>
                    <span>📅 Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    {task.event && <span>🎟️ {task.event?.title}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer ${statusColor[task.status]}`}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-red-400 hover:text-red-600 text-sm">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateTaskModal
          volunteers={volunteers}
          events={events}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAll(); }}
        />
      )}
    </AdminLayout>
  );
}

function CreateTaskModal({ volunteers, events, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '',
    deadline: '', priority: 'medium', event: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', form);
      toast.success('Task assigned!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Assign Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required placeholder="Setup registration desk"
              className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} placeholder="Task details..."
              className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required className={inputClass}>
              <option value="">Select member...</option>
              {volunteers.map(v => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Event (Optional)</label>
            <select
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              className={inputClass}>
              <option value="">No event</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Assigning...' : 'Assign Task'}
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