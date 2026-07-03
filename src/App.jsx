import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
// Import Navbar
import Navbar from './components/layout/Navbar';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import ProtectedRoutes from './routes/ProtectedRoutes';
import EditEvent from './pages/EditEvent';
import EventParticipants from './pages/EventParticipants.jsx';
import AdminDashboard from './pages/AdminDashboard';
import Reports from './pages/Report';
import SuperAdminUsers from './pages/SuperAdminUsers';

function App() {
  return (
    <Router>
      {/* The Navbar is placed here so it renders on every single route. 
      */}
      <Navbar />
      
      {/* Adding a slight padding so page content isn't hidden behind the navbar */}
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/" element={<Navigate to="/events" replace />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/events/:id/participants" element={<EventParticipants />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin/users" element={<SuperAdminUsers />} />
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<div style={{ padding: '2rem' }}><h2>404 - Page Not Found</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;