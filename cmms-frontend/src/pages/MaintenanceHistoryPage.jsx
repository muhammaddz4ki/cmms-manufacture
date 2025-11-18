// src/pages/MaintenanceHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MaintenanceHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data Work Order yang sudah Selesai (Completed)
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Panggil API baru kita: /api/workorders/history
        const response = await axios.get(`${API_BASE_URL}/workorders/history`);
        setHistory(response.data);
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

    fetchHistory();
  }, []);

  // Fungsi kecil untuk format tanggal
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Riwayat Perawatan (Completed)</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Log Pekerjaan Selesai</h2>
        
        {loading && <LoadingState />}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul WO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mesin (Aset)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Komponen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Selesai Pada</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {history.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileWarning size={40} className="text-slate-400" />
                        <span>Belum ada Work Order yang berstatus 'completed'.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {history.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50">
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{wo.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.asset_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.component || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(wo.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">{formatDate(wo.completed_at)}</td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}