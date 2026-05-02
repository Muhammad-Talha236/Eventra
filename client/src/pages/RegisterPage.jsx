import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', userType: 'student',
    studentId: '', department: '', organization: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'user',
        ...(form.userType === 'student' && {
          studentInfo: { studentId: form.studentId, department: form.department }
        }),
        ...(form.userType === 'outsider' && {
          outsiderInfo: { organization: form.organization }
        }),
      };

      await register(payload);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">🎓 Eventra</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name" value={form.name} onChange={handleChange}
            required placeholder="Full Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email" type="email" value={form.email} onChange={handleChange}
            required placeholder="Email Address"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password" type="password" value={form.password} onChange={handleChange}
            required placeholder="Password (min 6 chars)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* User Type */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="userType" value="student"
                checked={form.userType === 'student'} onChange={handleChange} />
              <span className="text-sm">Student</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="userType" value="outsider"
                checked={form.userType === 'outsider'} onChange={handleChange} />
              <span className="text-sm">Outsider</span>
            </label>
          </div>

          {form.userType === 'student' && (
            <>
              <input
                name="studentId" value={form.studentId} onChange={handleChange}
                placeholder="Student ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="department" value={form.department} onChange={handleChange}
                placeholder="Department"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {form.userType === 'outsider' && (
            <input
              name="organization" value={form.organization} onChange={handleChange}
              placeholder="Organization Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}