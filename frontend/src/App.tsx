import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import WorkerJobsPage from './pages/worker/JobsPage';
import WorkerApplicationsPage from './pages/worker/ApplicationsPage';
import QRScanPage from './pages/worker/QRScanPage';
import WorkStyleGuidePage from './pages/shared/WorkStyleGuidePage';
import ReviewPage from './pages/shared/ReviewPage';
import { ReviewsListPage } from './pages/ReviewsListPage';
import ClientJobCreatePage from './pages/client/JobCreatePage';
import ClientJobsManagePage from './pages/client/JobsManagePage';
import ClientApplicationsManagePage from './pages/client/ApplicationsManagePage';
import ClientPaymentsPage from './pages/client/PaymentsPage';
import ClientWorkersPage from './pages/client/WorkersPage';
import QRCodeDisplayPage from './pages/client/QRCodeDisplayPage';
import { ProfilePage } from './pages/ProfilePage';
import PaymentsPage from './pages/PaymentsPage';
import ActivityPage from './pages/ActivityPage';
import { PenaltiesPage } from './pages/PenaltiesPage';
import { SupportPage } from './pages/SupportPage';
import AdminUsersManagePage from './pages/admin/UsersManagePage';
import AdminJobsManagePage from './pages/admin/JobsManagePage';
import AdminStatsPage from './pages/admin/StatsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import MessagesPage from './pages/shared/MessagesPage';
import ClientMessagesPage from './pages/client/MessagesPage';
import ClientDeliveryManagePage from './pages/client/DeliveryManagePage';
import SettingsPage from './pages/shared/SettingsPage';
import JobDetailPage from './pages/shared/JobDetailPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuthInit } from './hooks/useAuthInit';
import { Header } from './components/layout/Header';
import { useAuthStore } from './stores/authStore';

function AppContent() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const hideHeader = location.pathname === '/dashboard' && user?.role === 'worker';

  const getDashboard = () => {
    if (user?.role === 'worker') return <WorkerDashboard />;
    if (user?.role === 'company') return <ClientDashboard />;
    if (user?.role === 'admin') return <AdminDashboard />;
    return <MainLayout />;
  };

  return (
    <>
      {!hideHeader && <Header />}
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
              <WorkerJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <WorkerApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/work-style"
          element={
            <ProtectedRoute>
              <WorkStyleGuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-scan"
          element={
            <ProtectedRoute>
              <QRScanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-code/:assignmentId"
          element={
            <ProtectedRoute>
              <QRCodeDisplayPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <ReviewsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penalties"
          element={
            <ProtectedRoute>
              <PenaltiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute>
              <ClientJobCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/manage"
          element={
            <ProtectedRoute>
              <ClientJobsManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/applications/:jobId"
          element={
            <ProtectedRoute>
              <ClientApplicationsManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/payments"
          element={
            <ProtectedRoute>
              <ClientPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/workers"
          element={
            <ProtectedRoute>
              <ClientWorkersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/messages"
          element={
            <ProtectedRoute>
              <ClientMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deliveries"
          element={
            <ProtectedRoute>
              <ClientDeliveryManagePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute>
              <AdminJobsManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <ProtectedRoute>
              <AdminStatsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  useAuthInit();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
