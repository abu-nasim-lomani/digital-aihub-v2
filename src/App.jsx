import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceAgent from './components/VoiceAgent';

// Pages
import SinglePage from './pages/SinglePage';
import InitiativeDetail from './pages/InitiativeDetail';
import ProjectDetail from './pages/ProjectDetail';
import EventDetail from './pages/EventDetail';

// Admin Pages
import Login from './pages/admin/Login';
import Signup from './pages/admin/Signup';
import Dashboard from './pages/admin/Dashboard';
import ManageProjectsAndSupport from './pages/admin/ManageProjectsAndSupport';
import ManageInitiatives from './pages/admin/ManageInitiatives';
import ManageLearning from './pages/admin/ManageLearning';
import ManageEvents from './pages/admin/ManageEvents';
import ManageStandards from './pages/admin/ManageStandards';
import ManageTeam from './pages/admin/ManageTeam';

// User Pages
import UserDashboard from './pages/user/UserDashboard';

import AdminLayout from './layouts/AdminLayout';
// Separate layout component to use useLocation
const AppLayout = () => {
  const location = useLocation();
  // Hide Navbar/Footer on admin pages (dashboard etc), but show on Login (/admin)
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin';

  return (
    <div className="min-h-screen flex flex-col m-0 p-0">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes - Single Page */}
          <Route path="/" element={<SinglePage />} />
          {/* Detail pages still open in new tabs */}
          <Route path="/initiatives/:id" element={<InitiativeDetail />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Admin Login */}
          <Route path="/admin" element={<Login />} />

          {/* User Dashboard */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes with Persistent Sidebar Layout */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageProjectsAndSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/initiatives"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageInitiatives />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/learning"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/standards"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageStandards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/team"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageTeam />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <VoiceAgent />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
