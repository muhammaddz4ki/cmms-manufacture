// src/components/SidebarLink.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SidebarLink({ to, icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center space-x-3 p-3 rounded-lg text-sm font-medium
        transition-colors duration-200
        ${isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-slate-600 hover:bg-slate-200'
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}