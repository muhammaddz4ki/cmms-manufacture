// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ErrorState from '../components/ErrorState.jsx';
import { Loader2, AlertTriangle, CheckCircle, Package, Activity, Wrench } from 'lucide-react';
import StatusChart from '../components/StatusChart.jsx';
import AssetWOChart from '../components/AssetWOChart.jsx';

const API_BASE_URL = 'http://localhost:5000/api';
const COMPLIANCE_STATS_API = `${API_BASE_URL}/compliance/stats`;

// --- KOMPONEN STAT CARD (DIPERBAIKI) ---
// Kita ubah 'icon: IconComponent' menjadi 'icon: Icon' agar lebih ringkas
const StatCard = ({ title, value, icon: Icon, color, isLoading }) => (
  <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
    
    {/* Decorative Background Blob */}
    <div 
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150"
        style={{ backgroundColor: color }}
    />

    <div className="flex items-center justify-between mb-4 relative z-10">
        <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}15`, color: color }} 
        >
            {/* Render komponen ikon di sini */}
            <Icon size={24} />
        </div>
    </div>

    <div className="relative z-10">
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        ) : (
            <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
        )}
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_assets: 0,
    open_work_orders: 0,
    down_assets: 0,
    completed_work_orders: 0, 
    in_progress_work_orders: 0,
    overdue_compliance: 0,
    pending_compliance: 0,
    wo_asset_report: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, allWosResponse, historyResponse, complianceResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/dashboard/stats`),
            axios.get(`${API_BASE_URL}/workorders`),
            axios.get(`${API_BASE_URL}/workorders/history`),
            axios.get(COMPLIANCE_STATS_API), 
        ]);
        
        const open = statsResponse.data.open_work_orders;
        const completed = historyResponse.data.length;
        const totalActive = allWosResponse.data.length;
        const inProgress = totalActive - open; 
        
        const allWOs = [...allWosResponse.data, ...historyResponse.data];
        const assetMap = {};

        allWOs.forEach(wo => {
            const assetId = wo.asset_id;
            if (!assetId) return; 

            if (!assetMap[assetId]) {
                assetMap[assetId] = { 
                    asset_name: wo.asset_name, 
                    open: 0, 
                    completed: 0, 
                    in_progress: 0 
                };
            }
            
            if (wo.status === 'open') assetMap[assetId].open += 1;
            else if (wo.status === 'in_progress') assetMap[assetId].in_progress += 1;
            else if (wo.status === 'completed') assetMap[assetId].completed += 1;
        });
        const woAssetReport = Object.values(assetMap);

        setStats({
          total_assets: statsResponse.data.total_assets,
          down_assets: statsResponse.data.down_assets,
          open_work_orders: open,
          in_progress_work_orders: inProgress > 0 ? inProgress : 0,
          completed_work_orders: completed,
          overdue_compliance: complianceResponse.data.overdue_count,
          pending_compliance: complianceResponse.data.pending_count,
          wo_asset_report: woAssetReport,
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
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Ringkasan</h1>
            <p className="text-slate-500 mt-1">Selamat datang kembali! Berikut adalah tinjauan operasional Anda hari ini.</p>
        </div>
      </div>
      
      {/* 1. KOTAK STATISTIK UTAMA (ROW 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Aset" 
          value={stats.total_assets} 
          icon={Package}
          color="#2563EB" // Blue
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO Aktif (Open)" 
          value={stats.open_work_orders} 
          icon={AlertTriangle}
          color="#DC2626" // Red
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO In Progress" 
          value={stats.in_progress_work_orders} 
          icon={Wrench}
          color="#D97706" // Amber
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO Selesai" 
          value={stats.completed_work_orders} 
          icon={CheckCircle}
          color="#059669" // Green
          isLoading={loading} 
        />
      </div>
      
      {/* 2. ANALITIK DETAIL (ROW 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          
          {/* CHART WO STATUS */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Distribusi Status Work Order</h2>
              </div>
              {loading ? (
                   <div className="h-72 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                   </div>
              ) : (
                  <div className="h-72 flex items-center justify-center">
                     <StatusChart 
                          open={stats.open_work_orders}
                          inProgress={stats.in_progress_work_orders}
                          completed={stats.completed_work_orders}
                      />
                  </div>
              )}
          </div>

          {/* ISU KRITIS */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-red-500"/>
                Perhatian Diperlukan
              </h2>
              
              <div className="space-y-4 flex-1">
                  
                  {/* Aset Down */}
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">Aset Down</p>
                              <p className="text-xs text-red-600/80">Mesin berhenti beroperasi</p>
                          </div>
                          <span className="text-3xl font-extrabold text-red-600">{stats.down_assets}</span>
                      </div>
                  </div>

                  {/* Compliance Overdue */}
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Kepatuhan Overdue</p>
                              <p className="text-xs text-yellow-600/80">Jadwal kalibrasi terlewat</p>
                          </div>
                          <span className="text-3xl font-extrabold text-yellow-600">{stats.overdue_compliance}</span>
                      </div>
                  </div>
                  
                  {/* Summary Text */}
                  <div className="mt-auto pt-4 text-center text-xs text-slate-400">
                    Data diperbarui secara real-time dari server.
                  </div>
              </div>
          </div>
      </div>

      {/* 3. CHART KINERJA PER ASET (ROW 3) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Analisis Kinerja per Aset</h2>
          {loading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
              </div>
          ) : (
              <div className="h-80">
                  <AssetWOChart 
                      reportData={stats.wo_asset_report.map(r => ({
                        asset_name: r.asset_name, 
                        open: r.open + r.in_progress, 
                        completed: r.completed
                      }))}
                  />
              </div>
          )}
      </div>
    </div>
  );
}