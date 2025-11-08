import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import ContactPage from './pages/public/ContactPage';
import NewLoginPage from './pages/auth/NewLoginPage';
import WorkerRegistrationPage from './pages/auth/WorkerRegistrationPage';
import ClientRegistrationPage from './pages/auth/ClientRegistrationPage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobsPage from './pages/jobs/JobsPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthInit } from './hooks/useAuthInit';
import { Header } from './components/layout/Header';
import { useAuthStore } from './stores/authStore';

function App() {
  useAuthInit();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const getDashboard = () => {
    if (user?.role === 'worker') return <WorkerDashboard />;
    if (user?.role === 'company') return <ClientDashboard />;
    if (user?.role === 'admin') return <AdminDashboard />;
    return <MainLayout />;
  };

  return (
    <BrowserRouter>
      {!isAuthenticated && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<NewLoginPage />} />
        <Route path="/register/worker" element={<WorkerRegistrationPage />} />
        <Route path="/register/client" element={<ClientRegistrationPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {getDashboard()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<JobsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
