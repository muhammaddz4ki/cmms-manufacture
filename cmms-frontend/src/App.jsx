// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import InventoryPage from './pages/InventoryPage.jsx';
// --- TAMBAHKAN IMPOR INI ---
import AssetTemplatePage from './pages/AssetTemplatePage.jsx';

// Komponen Proteksi Rute
const ProtectedRoute = ({ children, roles }) => {
    const { user, checkRole } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (roles && !checkRole(roles)) {
        return <Navigate to="/" replace />; 
    }

    return children;
};


export default function App() {
  const { user } = useAuth(); 
  
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      
      {/* Rute Utama (Dilindungi) */}
      <Route path="/" element={<ProtectedRoute roles={['any']}><Layout /></ProtectedRoute>}>
        
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetListPage />} /> 
        <Route path="work-orders" element={<WorkOrderPage />} />
        <Route path="schedules" element={<SchedulePage />} />
        <Route path="history" element={<MaintenanceHistoryPage />} />
        
        {/* Rute Admin/Manager */}
        <Route path="reports" element={<ProtectedRoute roles={['admin', 'manager']}><ReportPage /></ProtectedRoute>} />
        <Route path="compliance" element={<ProtectedRoute roles={['admin', 'manager']}><CompliancePage /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute roles={['admin', 'manager']}><InventoryPage /></ProtectedRoute>} />
        
        {/* --- TAMBAHKAN RUTE INI (Hanya Admin) --- */}
        <Route path="templates" element={<ProtectedRoute roles={['admin']}><AssetTemplatePage /></ProtectedRoute>} />
        
        {/* Rute Admin */}
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserPage /></ProtectedRoute>} />
      </Route>
      
      {/* Rute Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}