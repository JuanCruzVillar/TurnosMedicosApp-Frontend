import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/HomePage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function RoleProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  return <Navigate to="/" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/specialties" element={<Layout><SpecialtiesPage /></Layout>} />
          <Route path="/professionals" element={<Layout><ProfessionalsPage /></Layout>} />

          {/* Protected routes */}
          <Route
            path="/professional/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Professional']}>
                  <Layout>
                    <ProfessionalDashboard />
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['Patient']}>
                  <Layout>
                    <PatientDashboard />
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;