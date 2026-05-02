import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/user/UserDashboard';
import EventDetail from './pages/user/EventDetail';
import MyTickets from './pages/user/MyTickets';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import CreateEvent from './pages/admin/CreateEvent';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminIncidents from './pages/admin/AdminIncidents';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import ScanTicket from './pages/user/ScanTicket';
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <p className="text-6xl mb-4">⛔</p>
      <h2 className="text-2xl font-bold text-red-500">Unauthorized Access</h2>
      <a href="/login" className="mt-4 inline-block text-blue-600 hover:underline">Go to Login</a>
    </div>
  </div>
);

const allRoles = ['user', 'admin', 'staff', 'main_head', 'co_head', 'volunteer'];

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={allRoles}><UserDashboard /></ProtectedRoute>
        } />
        <Route path="/events/:id" element={
          <ProtectedRoute roles={allRoles}><EventDetail /></ProtectedRoute>
        } />
        <Route path="/my-tickets" element={
          <ProtectedRoute roles={allRoles}><MyTickets /></ProtectedRoute>
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
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/tasks" element={
          <ProtectedRoute roles={['admin', 'staff', 'main_head']}><AdminTasks /></ProtectedRoute>
        } />
        <Route path="/admin/incidents" element={
          <ProtectedRoute roles={['admin', 'staff']}><AdminIncidents /></ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute roles={['admin']}><AdminAnnouncements /></ProtectedRoute>
        } />

        {/* Volunteer Routes */}
        <Route path="/volunteer/dashboard" element={
          <ProtectedRoute roles={['volunteer', 'co_head', 'main_head', 'staff']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />
         <Route path="/admin/scan" element={
  <ProtectedRoute roles={['admin', 'staff', 'volunteer']}>
    <ScanTicket />
  </ProtectedRoute>
} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
