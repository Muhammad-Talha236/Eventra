import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './pages/user/UserDashboard';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import CreateEvent from './pages/admin/CreateEvent';

import EventDetail from './pages/user/EventDetail';
import MyTickets from './pages/user/MyTickets';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <p className="text-6xl mb-4">⛔</p>
      <h2 className="text-2xl font-bold text-red-500">Unauthorized Access</h2>
      <a href="/login" className="mt-4 inline-block text-blue-600 hover:underline">Go to Login</a>
    </div>
  </div>
);

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

// Routes mein add karo:
<Route path="/dashboard" element={
  <ProtectedRoute roles={['user', 'admin', 'staff', 'main_head', 'co_head', 'volunteer']}>
    <UserDashboard />
  </ProtectedRoute>
} />
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute roles={['admin', 'staff']}><AdminEvents /></ProtectedRoute>
        } />
        <Route path="/admin/events/create" element={
          <ProtectedRoute roles={['admin', 'staff']}><CreateEvent /></ProtectedRoute>
        } />
        <Route path="/events/:id" element={
  <ProtectedRoute roles={['user', 'admin', 'staff', 'main_head', 'co_head', 'volunteer']}>
    <EventDetail />
  </ProtectedRoute>
} />
<Route path="/my-tickets" element={
  <ProtectedRoute roles={['user', 'admin', 'staff', 'main_head', 'co_head', 'volunteer']}>
    <MyTickets />
  </ProtectedRoute>
} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}