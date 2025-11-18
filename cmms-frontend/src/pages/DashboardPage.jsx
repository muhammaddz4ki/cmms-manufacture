// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { Loader2, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import StatusChart from '../components/StatusChart.jsx';
import AssetWOChart from '../components/AssetWOChart.jsx'; // <-- IMPOR CHART BARU

const API_BASE_URL = 'http://localhost:5000/api';
const COMPLIANCE_STATS_API = `${API_BASE_URL}/compliance/stats`;

// Helper komponen untuk kotak statistik (Tetap di luar agar statis)
const StatCard = ({ title, value, colorClass, isLoading }) => (
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
  const [stats, setStats] = useState({
    total_assets: 0,
    open_work_orders: 0,
    down_assets: 0,
    completed_work_orders: 0, 
    in_progress_work_orders: 0,
    overdue_compliance: 0,
    pending_compliance: 0,
    wo_asset_report: [], // <-- DATA BARU UNTUK CHART
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data dari 4 endpoint saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ambil data dari 4 API sekaligus menggunakan Promise.all
        const [statsResponse, allWosResponse, historyResponse, complianceResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/dashboard/stats`),
            axios.get(`${API_BASE_URL}/workorders`), // Aktif (Open + In Progress)
            axios.get(`${API_BASE_URL}/workorders/history`), // Selesai
            axios.get(COMPLIANCE_STATS_API), 
        ]);
        
        const open = statsResponse.data.open_work_orders;
        const completed = historyResponse.data.length;
        const totalActive = allWosResponse.data.length;
        const inProgress = totalActive - open; 
        
        // --- LOGIKA PERHITUNGAN LAPORAN ASSET (FRONTEND) ---
        // Kita gabungkan data WO aktif dan WO history untuk mendapatkan total WO per asset
        const allWOs = [...allWosResponse.data, ...historyResponse.data];
        const assetMap = {};

        // Inisialisasi dan hitung status per aset
        allWOs.forEach(wo => {
            const assetId = wo.asset_id;
            if (!assetId) return; // Skip corrupted WO

            if (!assetMap[assetId]) {
                assetMap[assetId] = { 
                    asset_name: wo.asset_name, 
                    open: 0, 
                    completed: 0, 
                    in_progress: 0 
                };
            }
            
            if (wo.status === 'open') {
                assetMap[assetId].open += 1;
            } else if (wo.status === 'in_progress') {
                assetMap[assetId].in_progress += 1;
            } else if (wo.status === 'completed') {
                assetMap[assetId].completed += 1;
            }
        });
        const woAssetReport = Object.values(assetMap);
        // ----------------------------------------------------

        setStats({
          total_assets: statsResponse.data.total_assets,
          down_assets: statsResponse.data.down_assets,
          open_work_orders: open,
          in_progress_work_orders: inProgress > 0 ? inProgress : 0,
          completed_work_orders: completed,
          overdue_compliance: complianceResponse.data.overdue_count,
          pending_compliance: complianceResponse.data.pending_count,
          wo_asset_report: woAssetReport, // <-- Simpan data laporan
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Aset" 
          value={stats.total_assets} 
          colorClass="text-blue-600"
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO Aktif (Open)" 
          value={stats.open_work_orders} 
          colorClass="text-red-600"
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO In Progress" 
          value={stats.in_progress_work_orders} 
          colorClass="text-amber-500"
          isLoading={loading} 
        />
        
        <StatCard 
          title="WO Selesai (Total)" 
          value={stats.completed_work_orders} 
          colorClass="text-green-600"
          isLoading={loading} 
        />
      </div>
      
      {/* 2. ANALITIK DETAIL (ROW 2: CHART & ISU KRITIS) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* KOLOM 1 & 2: CHART WO STATUS (WO STATUS & WO per ASSET) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CHART STATUS WO (Doughnut) */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold border-b pb-2">Status WO Breakdown</h2>
                  {loading ? <LoadingState /> : (
                      <StatusChart 
                          open={stats.open_work_orders}
                          inProgress={stats.in_progress_work_orders}
                          completed={stats.completed_work_orders}
                      />
                  )}
              </div>

              {/* CHART WO PER ASSET (Bar Chart) */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold border-b pb-2">Kinerja WO per Aset</h2>
                  {loading ? <LoadingState /> : (
                      <AssetWOChart 
                          reportData={stats.wo_asset_report.map(r => ({
                            asset_name: r.asset_name, 
                            open: r.open + r.in_progress, // Gabungkan open dan in_progress untuk visual
                            completed: r.completed
                          }))}
                      />
                  )}
              </div>
          </div>


          {/* KOLOM 3: ISU KRITIS & COMPLIANCE */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} /> ISU KRITIS & KEPATUHAN
              </h2>
              
              <div className="space-y-4">
                  
                  {/* Aset Kritis (Down) */}
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                          <Package size={24} className="text-red-500" />
                          <div>
                              <p className="font-medium text-red-700">Aset Status Down</p>
                              <p className="text-xs text-slate-500">Membutuhkan Work Order segera.</p>
                          </div>
                      </div>
                      <p className="text-3xl font-bold text-red-600">{loading ? '...' : stats.down_assets}</p>
                  </div>

                  {/* Kepatuhan Overdue (REAL-TIME) */}
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                          <AlertTriangle size={24} className="text-yellow-600" />
                          <div>
                              <p className="font-medium text-yellow-700">Kepatuhan Overdue</p>
                              <p className="text-xs text-slate-500">{loading ? '...' : `${stats.pending_compliance} Item Pending`}</p>
                          </div>
                      </div>
                      <p className="text-3xl font-bold text-yellow-600">{loading ? '...' : stats.overdue_compliance}</p> 
                  </div>
                  
                  {/* Total Inventaris (KPI Tambahan) */}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                          <Package size={24} className="text-blue-600" />
                          <div>
                              <p className="font-medium text-blue-700">Total WO Aktif</p>
                              <p className="text-xs text-slate-500">Open + In Progress</p>
                          </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{loading ? '...' : stats.open_work_orders + stats.in_progress_work_orders}</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}