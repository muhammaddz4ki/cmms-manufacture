// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// PERBAIKAN: Impor useAuth dari file hook yang benar
import { useAuth } from './context/useAuth.js'; 

// Impor halaman
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AssetListPage from './pages/AssetListPage.jsx';
import WorkOrderPage from './pages/WorkOrderPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import MaintenanceHistoryPage from './pages/MaintenanceHistoryPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import CompliancePage from './pages/CompliancePage.jsx';
import UserPage from './pages/UserPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// --- KOMPONEN PROTEKSI RUTE BARU ---
const ProtectedRoute = ({ children, roles }) => {
    const { user, checkRole } = useAuth();
    
    if (!user) {
        // Jika user belum login, arahkan ke halaman login
        return <Navigate to="/login" replace />;
    }
    
    // Cek apakah peran user saat ini diizinkan untuk rute ini
    if (roles && !checkRole(roles)) {
        // Jika peran tidak diizinkan, arahkan ke Dashboard
        return <Navigate to="/" replace />; 
    }

    return children;
};
// ------------------------------------


export default function App() {
  const { user } = useAuth(); 
  
  return (
    <Routes>
      {/* Rute Publik: Login dan Registrasi */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      
      {/* Rute Utama (Memerlukan Proteksi) */}
      <Route path="/" element={<ProtectedRoute roles={['any']}><Layout /></ProtectedRoute>}>
        
        {/* Rute Dasar (Akses untuk SEMUA role yang login) */}
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetListPage />} /> 
        <Route path="work-orders" element={<WorkOrderPage />} />
        <Route path="schedules" element={<SchedulePage />} />
        <Route path="history" element={<MaintenanceHistoryPage />} />
        
        {/* Rute yang Terbatas Aksesnya */}
        <Route path="reports" element={<ProtectedRoute roles={['admin', 'manager']}><ReportPage /></ProtectedRoute>} />
        <Route path="compliance" element={<ProtectedRoute roles={['admin', 'manager']}><CompliancePage /></ProtectedRoute>} />
        {/* Halaman User Management hanya untuk Admin */}
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserPage /></ProtectedRoute>} />
      </Route>
      
      {/* Rute Catch-all (Opsional) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}