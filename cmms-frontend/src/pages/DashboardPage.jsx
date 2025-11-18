// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ErrorState from '../components/ErrorState.jsx';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import StatusChart from '../components/StatusChart.jsx'; // <-- PASTIKAN JALUR INI BENAR (../components/)

const API_BASE_URL = 'http://localhost:5000/api';

// Helper komponen untuk kotak statistik
const StatCard = ({ title, value, colorClass, isLoading }) => (
// ... (StatCard definition tetap di luar) ...
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {isLoading ? (
      <Loader2 className={`h-10 w-10 animate-spin ${colorClass}`} />
    ) : (
      <p className={`text-4xl font-bold ${colorClass}`}>{value}</p>
    )}
  </div>
);

export default function DashboardPage() {
  // ... (State dan useEffect sama seperti sebelumnya) ...
  const [stats, setStats] = useState({
    total_assets: 0,
    open_work_orders: 0,
    down_assets: 0,
    completed_work_orders: 0, 
    in_progress_work_orders: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`);
        const allWosResponse = await axios.get(`${API_BASE_URL}/workorders`);
        const historyResponse = await axios.get(`${API_BASE_URL}/workorders/history`);
        
        const open = statsResponse.data.open_work_orders;
        const completed = historyResponse.data.length;
        
        // Asumsi sederhana: in progress = total WO aktif - WO open
        const inProgress = allWosResponse.data.length - open; 

        setStats({
          total_assets: statsResponse.data.total_assets,
          down_assets: statsResponse.data.down_assets,
          open_work_orders: open,
          in_progress_work_orders: inProgress > 0 ? inProgress : 0,
          completed_work_orders: completed,
        });
      } catch (err) {
        if (err.response) {
          setError(`Gagal mengambil data: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setError("Gagal memuat data. Pastikan server Flask (port 5000) berjalan.");
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error(err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []); 

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard Analitik</h1>
      
      {/* 1. KOTAK STATISTIK UTAMA (ROW 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Aset" 
          value={stats.total_assets} 
          colorClass="text-blue-600"
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO Aktif (Open)" 
          value={stats.open_work_orders} 
          colorClass="text-amber-500"
          isLoading={loading} 
        />
        
        <StatCard 
          title="Aset (Down)" 
          value={stats.down_assets} 
          colorClass="text-red-600"
          isLoading={loading} 
        />
      </div>
      
      {/* 2. ANALITIK DETAIL (ROW 2: CHART & ISU KRITIS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM 1: CHART STATUS WO */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Status Work Order</h2>
              {loading ? (
                  // Tampilkan LoadingState saat data sedang diambil
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                  </div>
              ) : (
                  <StatusChart 
                      open={stats.open_work_orders}
                      inProgress={stats.in_progress_work_orders}
                      completed={stats.completed_work_orders}
                  />
              )}
          </div>

          {/* KOLOM 2: ISU KRITIS & COMPLIANCE */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-red-600">Isu Kritis</h2>
              <div className="space-y-4">
                  
                  {/* Aset Kritis (Down) */}
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle size={24} className="text-red-500" />
                      <div>
                          <p className="font-medium text-red-700">Aset Kritis (Down)</p>
                          <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats.down_assets}</p>
                      </div>
                  </div>

                  {/* Kepatuhan Overdue (Simulasi) */}
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle size={24} className="text-yellow-600" />
                      <div>
                          <p className="font-medium text-yellow-700">Kepatuhan Overdue</p>
                          <p className="text-2xl font-bold text-yellow-600">3</p> 
                      </div>
                  </div>
                  
                  {/* Status Baik */}
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle size={24} className="text-green-600" />
                      <div>
                          <p className="font-medium text-green-700">Total WO Selesai</p>
                          <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.completed_work_orders}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}