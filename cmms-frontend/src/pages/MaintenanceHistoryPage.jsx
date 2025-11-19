// src/pages/MaintenanceHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, History, CalendarCheck, Wrench, HardDrive } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MaintenanceHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/workorders/history`);
        setHistory(response.data);
      } catch (err) {
        if (err.response) {
          setError(`Gagal mengambil data: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setError("Gagal memuat data. Pastikan server Flask berjalan.");
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error(err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Riwayat Perawatan</h1>
            <p className="text-slate-500 mt-1">Arsip semua Work Order yang telah diselesaikan.</p>
        </div>
      </div>
      
      {/* Tabel Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <LoadingState />}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                     <div className="flex items-center gap-1"><History size={14}/> Judul WO</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><HardDrive size={14}/> Aset & Komponen</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Wrench size={14}/> Tipe</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><CalendarCheck size={14}/> Selesai</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <FileWarning size={32} className="text-slate-400" />
                        </div>
                        <p className="font-medium">Belum ada riwayat perawatan.</p>
                        <p className="text-sm">Work Order yang selesai akan muncul di sini.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {history.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{wo.title}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">{wo.asset_name}</div>
                        {wo.component_name && (
                            <div className="text-xs text-slate-500 mt-0.5">Komponen: {wo.component_name}</div>
                        )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${
                            wo.type === 'preventive' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                            {wo.type === 'preventive' ? 'Preventive' : 'Corrective'}
                        </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(wo.created_at)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                        {formatDate(wo.completed_at)}
                    </td>
                  
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