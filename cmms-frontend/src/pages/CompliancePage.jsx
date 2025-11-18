// src/pages/CompliancePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, CheckCircle } from 'lucide-react'; // Menghapus Shield dan Clock
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ComplianceForm from './ComplianceForm.jsx'; // Impor form

const API_BASE_URL = 'http://localhost:5000/api';
const LOGS_API = `${API_BASE_URL}/compliance/logs`;
const ASSETS_API = `${API_BASE_URL}/assets`;

export default function CompliancePage() {
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data awal (Aset dan Log)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [logResponse, assetResponse] = await Promise.all([
          axios.get(LOGS_API),
          axios.get(ASSETS_API)
        ]);
        
        setLogs(logResponse.data);
        setAssets(assetResponse.data);
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

    fetchData();
  }, []);

  // Fungsi ini dipanggil oleh ComplianceForm
  const handleLogCreated = (newLog) => {
    setLogs([newLog, ...logs]);
  };
  
  // Fungsi kecil untuk format tanggal
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    // Hanya tanggal (YYYY-MM-DD)
    return new Date(isoString).toISOString().split('T')[0]; 
  };
  
  // Fungsi untuk style status
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
      case 'compliant':
        return { text: 'Compliant', class: 'bg-green-100 text-green-800' };
      case 'overdue':
        return { text: 'Overdue', class: 'bg-red-100 text-red-800' };
      default:
        return { text: status, class: 'bg-gray-100 text-gray-800' };
    }
  };

  if (error) {
    return (
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Pelacakan Kepatuhan</h1>
          <ErrorState message={error} />
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Pelacakan Kepatuhan</h1>
      
      {/* Render Form */}
      <ComplianceForm 
        assets={assets} 
        onLogCreated={handleLogCreated} 
      />

      {/* Tabel Daftar Log */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Daftar Log Kepatuhan</h2>
        
        {loading && <LoadingState />}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Regulasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mesin (Aset)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jatuh Tempo Berikutnya</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileWarning size={40} className="text-slate-400" />
                        <span>Belum ada log kepatuhan yang dicatat.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {logs.map(log => {
                    const statusInfo = getStatusInfo(log.status);
                    return (
                        <tr key={log.id} className="hover:bg-slate-50">
                            
                            {/* Regulasi */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.regulation_name}</td>
                            
                            {/* Nama Aset */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.asset_name}</td>
                            
                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            
                            {/* Jatuh Tempo Berikutnya */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(log.next_check_due)}</td>
                            
                            {/* Tindakan (Nanti bisa ditambah tombol update status) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button title="Tandai Selesai" className="text-blue-500 hover:text-blue-700">
                                    <CheckCircle size={18} />
                                </button>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}