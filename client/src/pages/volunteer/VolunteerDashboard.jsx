import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

export default function VolunteerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks/my');
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      toast.success('Task updated!');
      fetchTasks();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🎓 Eventra</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            👋 {user?.name}
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Tasks</h2>
          <p className="text-gray-500 mt-1">View and update your assigned tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-orange-600 font-medium">Pending</p>
            <p className="text-3xl font-bold text-orange-700 mt-1">{pending}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">In Progress</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{completed}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-400 text-lg">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-2xl shadow-sm p-6">
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
                      <span>📅 Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      {task.event && <span>🎟️ {task.event?.title}</span>}
                      <span>👤 By: {task.assignedBy?.name}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer ${statusColor[task.status]}`}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}