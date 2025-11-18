// src/pages/ScheduleForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CalendarPlus, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
// PERBAIKAN 1: Hapus ASSETS_API karena tidak terpakai di file ini
const SCHEDULES_API = `${API_BASE_URL}/schedules`;

export default function ScheduleForm({ assets, onScheduleCreated }) {
  // State untuk input form
  const [assetId, setAssetId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [component, setComponent] = useState(''); // Gunakan string nama komponen
  const [frequencyDays, setFrequencyDays] = useState(30);
  const [description, setDescription] = useState('');
  
  // State untuk UI
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIKA DINAMIS
  const availableComponents = useMemo(() => {
    if (assetId) {
      const selectedAsset = assets.find(a => a.id === assetId);
      // 'components' adalah array objek {id, name, stock_quantity}
      return selectedAsset?.components || []; 
    }
    return []; 
  }, [assetId, assets]);
  
  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComponent(''); 
  }, [assetId]);

  // Fungsi reset form
  const resetForm = () => {
    setAssetId('');
    setTaskName('');
    setComponent(''); 
    setFrequencyDays(30);
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tentukan Nama Tugas Akhir
    const finalTaskName = taskName || (component ? `Perawatan: ${component}` : '');
    
    if (!assetId || !frequencyDays) {
      setError("Mesin dan Frekuensi wajib diisi.");
      return;
    }
    if (frequencyDays <= 0) {
      setError("Frekuensi (hari) harus lebih dari 0.");
      return;
    }
    if (!finalTaskName) { 
      setError("Nama Tugas wajib diisi (isi manual atau pilih komponen).");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    const scheduleData = {
      asset_id: assetId,
      task_name: finalTaskName, 
      component: component, // Kirim nama komponen (string)
      frequency_days: Number(frequencyDays),
      frequency: `Setiap ${frequencyDays} hari`,
      description_template: description,
    };

    try {
      const response = await axios.post(SCHEDULES_API, scheduleData);
      
      onScheduleCreated(response.data); 
      setSuccess(`Jadwal "${response.data.task_name}" berhasil dibuat.`);
      resetForm();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Gagal membuat jadwal. Cek koneksi server.");
      }
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Buat Jadwal Baru</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Kolom 1: Pilih Mesin (Aset) */}
          <div>
            <label htmlFor="assetSelect" className="block text-sm font-medium text-slate-700 mb-1">
              Pilih Mesin (Aset) <span className="text-red-500">*</span>
            </label>
            <select
              id="assetSelect"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Pilih Mesin --</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} (ID: {asset.machine_id})
                </option>
              ))}
            </select>
          </div>

          {/* Kolom 2: Pilih Komponen */}
          <div>
            <label htmlFor="componentSelect" className="block text-sm font-medium text-slate-700 mb-1">
              Komponen yang Dirawat
            </label>
            <select
              id="componentSelect"
              value={component}
              onChange={e => setComponent(e.target.value)}
              disabled={!assetId} 
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">-- Pilih Komponen (Opsional) --</option>
              {availableComponents.map(comp => (
                <option key={comp.id} value={comp.name}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kolom 3: Nama Tugas */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Tugas
              {!component && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="text"
              id="taskName"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder={component ? "Otomatis dari Komponen" : "Contoh: Pengecekan Rutin"}
              disabled={!!component}
              required={!component}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50"
            />
          </div>

          {/* Kolom 4: Frekuensi (hari) */}
          <div>
            <label htmlFor="frequencyDays" className="block text-sm font-medium text-slate-700 mb-1">
              Frekuensi (dalam Hari) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="frequencyDays"
              value={frequencyDays}
              onChange={e => setFrequencyDays(e.target.value)}
              min="1"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Baris 2: Deskripsi */}
        <div>
          <label htmlFor="schedDescription" className="block text-sm font-medium text-slate-700 mb-1">
            Deskripsi / Template Tugas (Opsional)
          </label>
          <textarea
            id="schedDescription"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Tuliskan instruksi singkat untuk Work Order yang akan dibuat..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Tombol Submit */}
        <div className="text-right">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </form>
    </div>
  );
}