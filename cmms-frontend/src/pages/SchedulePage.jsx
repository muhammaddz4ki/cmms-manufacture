// src/pages/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// PERUBAHAN 1: Impor kembali Trash2
import { FileWarning, Trash2 } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ScheduleForm from './ScheduleForm.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setError("Gagal memuat data. Pastikan server Flask (port 5000) berjalan.");
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, []); // [] = Jalankan sekali saat halaman dibuka

  // Fungsi ini dipanggil oleh ScheduleForm
  const handleScheduleCreated = (newSchedule) => {
    setSchedules([newSchedule, ...schedules]);
  };
  
  // --- PERUBAHAN 2: Buat fungsi Hapus ---
  const handleDeleteSchedule = async (scheduleId, taskName) => {
    // Tampilkan konfirmasi sebelum menghapus
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jadwal "${taskName}"?`)) {
      return; // Batal jika pengguna menekan 'Cancel'
    }

    try {
      // 1. Kirim permintaan DELETE ke backend
      await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`);
      
      // 2. Jika berhasil, update state React (filter/hapus jadwal dari array)
      setSchedules(schedules.filter(s => s.id !== scheduleId));

    } catch (err) {
      console.error("Gagal menghapus jadwal:", err);
      alert("Gagal menghapus jadwal. Cek konsol untuk info.");
    }
  };
  // ------------------------------------

  // Fungsi kecil untuk format tanggal (hanya tanggal, tanpa waktu)
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC' // Pastikan konsisten
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Penjadwalan Perawatan</h1>
      
      {/* Render Form */}
      <ScheduleForm 
        assets={assets} 
        onScheduleCreated={handleScheduleCreated} 
      />

      {/* Tabel Daftar Jadwal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Daftar Jadwal Perawatan</h2>
        
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mesin (Aset)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frekuensi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jadwal Berikutnya</th>
                  {/* PERUBAHAN 3: Aktifkan (un-comment) kolom Tindakan */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {schedules.length === 0 && (
                  <tr>
                    {/* PERUBAHAN 4: Ubah colSpan jadi 5 */}
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileWarning size={40} className="text-slate-400" />
                        <span>Belum ada jadwal perawatan.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {schedules.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    
                    {/* Tugas */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.task_name}</td>
                    
                    {/* Nama Aset */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{s.asset_name}</td>
                    
                    {/* Frekuensi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{s.frequency} ({s.frequency_days} hari)</td>
                    
                    {/* Jadwal Berikutnya */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(s.next_due_date)}</td>

                    {/* PERUBAHAN 5: Aktifkan (un-comment) tombol Hapus */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteSchedule(s.id, s.task_name)}
                        title="Hapus Jadwal"
                        className="text-red-500 hover:text-red-700"
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
    </div>
  );
}