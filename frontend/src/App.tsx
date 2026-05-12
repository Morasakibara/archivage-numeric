import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DossiersListPage from './pages/dossiers/DossiersListPage';
import DossierDetailPage from './pages/dossiers/DossierDetailPage';
import AppShell from './components/layout/AppShell';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dossiers" element={<DossiersListPage />} />
          <Route path="dossiers/:id" element={<DossierDetailPage />} />
          {/* Les autres routes seront ajoutées plus tard */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
