import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/auth/LoginPage';
import DossiersListPage from './pages/dossiers/DossiersListPage';
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
          <Route index element={<Navigate to="/dossiers" />} />
          <Route path="dossiers" element={<DossiersListPage />} />
          {/* Les autres routes seront ajoutées plus tard */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
