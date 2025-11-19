// src/pages/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, Trash2, CalendarPlus, Calendar, HardDrive, Repeat } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ScheduleForm from './ScheduleForm.jsx';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fungsi untuk mengambil data awal (Aset dan Jadwal)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [scheduleResponse, assetResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/schedules`),
          axios.get(`${API_BASE_URL}/assets`)
        ]);
        
        setSchedules(scheduleResponse.data);
        setAssets(assetResponse.data);
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

    fetchData();
  }, []); 

  // Callback Create
  const handleScheduleCreated = (newSchedule) => {
    setSchedules([newSchedule, ...schedules]);
    setIsCreateModalOpen(false); // Tutup modal
  };
  
  // Delete
  const handleDeleteSchedule = async (scheduleId, taskName) => {
    if (!window.confirm(`Hapus jadwal rutin "${taskName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`);
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    } catch (err) {
      console.error("Gagal menghapus jadwal:", err);
      alert("Gagal menghapus jadwal.");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Penjadwalan Perawatan</h1>
            <p className="text-slate-500 mt-1">Atur jadwal preventive maintenance untuk aset Anda.</p>
        </div>
        <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
        >
            <CalendarPlus size={18} className="mr-2" /> Buat Jadwal Baru
        </button>
      </div>

      {/* Tabel Daftar Jadwal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <LoadingState />}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                     Tugas & Deskripsi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><HardDrive size={14}/> Mesin (Aset)</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Repeat size={14}/> Frekuensi</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Calendar size={14}/> Jadwal Berikutnya</div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Opsi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <FileWarning size={32} className="text-slate-400" />
                        </div>
                        <p className="font-medium">Belum ada jadwal perawatan.</p>
                        <p className="text-sm">Buat jadwal baru untuk memulai preventive maintenance.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {schedules.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    
                    {/* Tugas */}
                    <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{s.task_name}</div>
                        {/* (Opsional: Tampilkan deskripsi pendek jika ada) */}
                    </td>
                    
                    {/* Nama Aset */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {s.asset_name}
                    </td>
                    
                    {/* Frekuensi */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {s.frequency} ({s.frequency_days} hari)
                        </span>
                    </td>
                    
                    {/* Jadwal Berikutnya */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatDate(s.next_due_date)}
                    </td>

                    {/* Opsi Hapus */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDeleteSchedule(s.id, s.task_name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus Jadwal"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREATE */}
      {isCreateModalOpen && (
        <Modal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            title="Buat Jadwal Baru"
        >
            <ScheduleForm 
                assets={assets} 
                onScheduleCreated={handleScheduleCreated} 
            />
        </Modal>
      )}

    </div>
  );
}