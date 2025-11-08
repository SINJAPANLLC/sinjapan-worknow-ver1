import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/public/LandingPage';
import NewLoginPage from './pages/auth/NewLoginPage';
import WorkerRegistrationPage from './pages/auth/WorkerRegistrationPage';
import ClientRegistrationPage from './pages/auth/ClientRegistrationPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import JobsPage from './pages/jobs/JobsPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthInit } from './hooks/useAuthInit';
import { Header } from './components/layout/Header';
import { useAuthStore } from './stores/authStore';

function App() {
  useAuthInit();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      {!isAuthenticated && <Header />}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<NewLoginPage />} />
          <Route path="/register/worker" element={<WorkerRegistrationPage />} />
          <Route path="/register/client" element={<ClientRegistrationPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
          </Route>
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
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
