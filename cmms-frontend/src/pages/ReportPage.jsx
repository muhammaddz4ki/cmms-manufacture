// src/pages/ReportPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, FileText, FileDown, Table } from 'lucide-react'; 
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const API_BASE_URL = 'http://localhost:5000/api';
const REPORT_STATS_API = `${API_BASE_URL}/workorders/report/asset_stats`;
const EXPORT_CSV_API = `${API_BASE_URL}/workorders/report/export/csv`; 
const EXPORT_PDF_API = `${API_BASE_URL}/workorders/report/export/pdf`; // Rute Ekspor PDF

export default function ReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data laporan
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(REPORT_STATS_API);
        setReportData(response.data); 
      } catch (err) {
        if (err.response) {
          setError(`Gagal mengambil data laporan: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setError("Gagal memuat data. Pastikan server Flask (port 5000) berjalan.");
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error(err);
      }
      setLoading(false);
    };

    fetchReport();
  }, []);

  // --- LOGIKA EKSPOR ---
  const handleExport = (format) => {
    let url;
    if (format === 'CSV') {
        url = EXPORT_CSV_API;
    } else if (format === 'PDF') {
        url = EXPORT_PDF_API;
    } else {
        return;
    }

    // Gunakan window.open untuk memicu unduhan langsung dari browser
    window.open(url, '_blank');
  };
  // ---------------------

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Laporan Kinerja Work Order</h1>
      
      {/* Tombol Ekspor */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Table size={20} /> Statistik WO per Mesin
        </h2>
        <div className="space-x-2">
          {/* Tombol Export CSV */}
          <button
            onClick={() => handleExport('CSV')}
            disabled={loading || reportData.length === 0}
            className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FileDown size={16} className="mr-2" /> Export CSV
          </button>
          {/* Tombol Export PDF */}
          <button
            onClick={() => handleExport('PDF')}
            disabled={loading || reportData.length === 0}
            className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FileText size={16} className="mr-2" /> Export PDF
          </button>
        </div>
      </div>
      
      {/* Tabel Laporan */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Ringkasan WO per Aset</h2>
        
        {loading && <LoadingState />}
        
        {!loading && reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" id="report-table">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Mesin</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider">Open (Aktif)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-amber-500 uppercase tracking-wider">In Progress</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-green-700 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-900 uppercase tracking-wider">Total WO</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.map(item => (
                  <tr key={item.asset_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.asset_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-red-600">{item.open}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-amber-500">{item.in_progress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-green-700">{item.completed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center text-slate-900">{item.total_wo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         {!loading && reportData.length === 0 && (
             <div className="text-center py-10 text-slate-500">
                 <FileWarning size={40} className="text-slate-400 mx-auto" />
                 <p className="mt-2">Belum ada data Work Order untuk dianalisis.</p>
             </div>
        )}
      </div>
    </div>
  );
}