import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import NotificationBell from '../../components/NotificationBell';
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showIncident, setShowIncident] = useState(false);

  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    type: 'security',
    priority: 'medium',
    event: '',
  });

  // Fetch volunteer tasks
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

  // Fetch events for incident reporting
  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.events);
    } catch {
      toast.error('Failed to load events');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, []);

  // Update task status
  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });

      toast.success('Task updated!');
      fetchTasks();
    } catch {
      toast.error('Failed to update');
    }
  };

  // Submit incident
  const handleIncidentSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/incidents', incidentForm);

      toast.success('Incident reported successfully!');

      setShowIncident(false);

      setIncidentForm({
        title: '',
        description: '',
        type: 'security',
        priority: 'medium',
        event: '',
      });
    } catch {
      toast.error('Failed to report incident');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Stats
  const pending = tasks.filter(
    (task) => task.status === 'pending'
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === 'in_progress'
  ).length;

  const completed = tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold text-blue-700">
          🎓 Eventra
        </h1>

        <div className="flex items-center gap-4">

          <NotificationBell />

          <button
            onClick={() => setShowIncident(true)}
            className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
          >
            🚨 Report Incident
          </button>

          <span className="text-sm text-gray-600">
            👋 {user?.name}

            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </span>

          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            My Tasks
          </h2>

          <p className="text-gray-500 mt-1">
            View and update your assigned tasks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-orange-600 font-medium">
              Pending
            </p>

            <p className="text-3xl font-bold text-orange-700 mt-1">
              {pending}
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">
              In Progress
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-1">
              {inProgress}
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm text-green-600 font-medium">
              Completed
            </p>

            <p className="text-3xl font-bold text-green-700 mt-1">
              {completed}
            </p>
          </div>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-400 text-lg">
              No tasks assigned yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex justify-between items-start">

                  <div className="flex-1">

                    <div className="flex items-center gap-3 mb-2">

                      <h3 className="font-bold text-gray-800 text-lg">
                        {task.title}
                      </h3>

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-500 text-sm mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">

                      <span>
                        📅 Due:{' '}
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>

                      {task.event && (
                        <span>
                          🎟️ {task.event?.title}
                        </span>
                      )}

                      <span>
                        👤 By: {task.assignedBy?.name}
                      </span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="ml-4">

                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusUpdate(
                          task._id,
                          e.target.value
                        )
                      }
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium border-0 cursor-pointer ${statusColor[task.status]}`}
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="completed">
                        Completed
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Modal */}
      {showIncident && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <h2 className="text-2xl font-bold mb-4">
              Report Incident
            </h2>

            <form
              onSubmit={handleIncidentSubmit}
              className="space-y-4"
            >

              {/* Title */}
              <input
                type="text"
                placeholder="Incident title"
                value={incidentForm.title}
                onChange={(e) =>
                  setIncidentForm({
                    ...incidentForm,
                    title: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
                required
              />

              {/* Description */}
              <textarea
                placeholder="Description"
                value={incidentForm.description}
                onChange={(e) =>
                  setIncidentForm({
                    ...incidentForm,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2 h-24"
                required
              />

              {/* Type */}
              <select
                value={incidentForm.type}
                onChange={(e) =>
                  setIncidentForm({
                    ...incidentForm,
                    type: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="security">
                  Security
                </option>

                <option value="medical">
                  Medical
                </option>

                <option value="technical">
                  Technical
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              {/* Priority */}
              <select
                value={incidentForm.priority}
                onChange={(e) =>
                  setIncidentForm({
                    ...incidentForm,
                    priority: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>

              {/* Event */}
              <select
                value={incidentForm.event}
                onChange={(e) =>
                  setIncidentForm({
                    ...incidentForm,
                    event: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
                required
              >
                <option value="">
                  Select Event
                </option>

                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                  </option>
                ))}
              </select>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowIncident(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}