// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarLink from './SidebarLink.jsx'; 
import {
  LayoutDashboard,
  HardDrive,
  ClipboardList,
  Menu,
  X,
  CalendarClock,
  History,
  ClipboardCheck,
  ShieldCheck,
  Users,
  LogOut,
  Warehouse,
  ClipboardCopy // <-- IKON BARU
} from 'lucide-react';
import { useAuth } from '../context/useAuth.js'; 

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, checkRole } = useAuth(); 

  // --- Daftar Navigasi Berdasarkan Peran ---
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['any'] },
    { to: "/assets", icon: HardDrive, label: "Daftar Aset", roles: ['admin', 'manager'] }, 
    { to: "/work-orders", icon: ClipboardList, label: "Work Order", roles: ['any'] },
    { to: "/schedules", icon: CalendarClock, label: "Penjadwalan", roles: ['admin', 'manager'] },
    { to: "/inventory", icon: Warehouse, label: "Gudang (Inventaris)", roles: ['admin', 'manager'] },
    // --- TAMBAHKAN LINK INI ---
    { to: "/templates", icon: ClipboardCopy, label: "Template Aset", roles: ['admin'] },
    { to: "/history", icon: History, label: "Riwayat Perawatan", roles: ['any'] },
    { to: "/reports", icon: ClipboardCheck, label: "Laporan", roles: ['admin', 'manager'] },
    { to: "/compliance", icon: ShieldCheck, label: "Pelacakan Kepatuhan", roles: ['admin', 'manager'] },
    { to: "/users", icon: Users, label: "Manajemen Pengguna", roles: ['admin'] },
  ];
  // ----------------------------------------


  return (
    <div className="flex min-h-screen items-stretch bg-slate-100"> 
      {/* Sidebar untuk Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 shadow-md">
          <h1 className="text-2xl font-bold text-blue-600">CMMS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            checkRole(item.roles) && (
              <SidebarLink key={item.to} to={item.to} icon={<item.icon size={20} />}>
                {item.label}
              </SidebarLink>
            )
          ))}
        </nav>
      </aside>

      {/* Sidebar untuk Mobile (Popup) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <aside className="flex flex-col w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between h-16 p-4 shadow-md">
              <h1 className="text-2xl font-bold text-blue-600">CMMS</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-600">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                checkRole(item.roles) && (
                  <SidebarLink key={item.to} to={item.to} icon={<item.icon size={20} />}>
                    {item.label}
                  </SidebarLink>
                )
              ))}
            </nav>
          </aside>
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="flex-1 bg-black opacity-50"
          ></div>
        </div>
      )}

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        {/* Header (Top Bar) */}
        <header className="flex items-center justify-between h-16 bg-white shadow-md p-4">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-slate-600 md:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right hidden sm:block">
              <span className="font-semibold text-slate-800">{user?.name}</span>
              <span className="text-sm text-blue-600 block">{user?.role.toUpperCase()}</span>
            </div>
            <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                title="Logout"
            >
                <LogOut size={18} />
            </button>
          </div>
        </header>
        
        {/* Isi Halaman */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}