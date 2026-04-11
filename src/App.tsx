import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BuyerDetailPage } from './pages/BuyerDetailPage';
import { BuyersPage } from './pages/BuyersPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { LoginPage } from './pages/LoginPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TicketsPage } from './pages/TicketsPage';
import { UnitsPage } from './pages/UnitsPage';
import { UploadBuyersPage } from './pages/UploadBuyersPage';

export default function App() {
  return (
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
        <Route index element={<Navigate to="/buyers" replace />} />
        <Route path="buyers" element={<BuyersPage />} />
        <Route path="buyers/upload" element={<UploadBuyersPage />} />
        <Route path="buyers/:buyerId" element={<BuyerDetailPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="units" element={<UnitsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
