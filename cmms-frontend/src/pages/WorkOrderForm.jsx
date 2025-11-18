// src/pages/WorkOrderForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Loader2, Save } from 'lucide-react'; // Impor ikon Save

const API_BASE_URL = 'http://localhost:5000/api';

// PERUBAHAN UTAMA: Menerima initialData dan onWOUpdated
export default function WorkOrderForm({ assets, onWorkOrderCreated, initialData, onWOUpdated, onClose }) {
  // Tentukan apakah mode Edit atau Create
  const isEditMode = !!initialData;
  
  // State diinisialisasi berdasarkan initialData atau nilai default
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assetId, setAssetId] = useState(initialData?.asset_id || ''); 
  const [component, setComponent] = useState(initialData?.component || ''); 
  const [type, setType] = useState(initialData?.type || 'corrective');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  
  // State untuk UI
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIKA DROPDOWN DINAMIS (Tidak ada perubahan di sini)
  const availableComponents = useMemo(() => {
    if (assetId) {
      const selectedAsset = assets.find(a => a.id === assetId);
      return selectedAsset?.components || [];
    }
    return []; 
  }, [assetId, assets]);
  
  // Efek samping: Reset pilihan komponen jika mesin berubah (hanya berlaku di mode Create)
  useEffect(() => {
    if (!isEditMode) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setComponent('');
    }
  }, [assetId, isEditMode]);

  // Fungsi reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssetId('');
    setComponent(''); 
    setType('corrective');
    setPriority('medium');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi dasar
    if (!assetId || !type) {
      setError("Mesin dan Tipe WO wajib diisi.");
      return;
    }
    if (type === 'corrective' && !component && !title) {
        setError("Untuk tipe Corrective, pilih Komponen atau isi Judul WO.");
        return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const finalTitle = type === 'corrective' && component ? `Perbaikan: ${component}` : title;

    if (!finalTitle) {
         setError("Judul WO wajib diisi (atau pilih komponen).");
         setIsSubmitting(false);
         return;
    }

    // Data yang dikirimkan (Hanya kirim field yang diizinkan untuk di-patch/post)
    const payload = {
      title: finalTitle,
      description: description,
      asset_id: assetId,
      component: component, 
      type: type,
      priority: priority,
    };

    try {
      let response;
      if (isEditMode) {
        // Mode EDIT: Gunakan PATCH
        response = await axios.patch(`${API_BASE_URL}/workorders/${initialData.id}`, payload);
        onWOUpdated(response.data); // Panggil handler update
        setSuccess(`Work Order "${response.data.title}" berhasil diupdate.`);
        onClose(); // Tutup modal setelah update
      } else {
        // Mode CREATE: Gunakan POST
        response = await axios.post(`${API_BASE_URL}/workorders`, payload);
        onWorkOrderCreated(response.data); 
        setSuccess(`Work Order "${response.data.title}" berhasil dibuat.`);
        resetForm(); // Reset hanya di mode Create
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(`Gagal ${isEditMode ? 'mengupdate' : 'membuat'} WO. Cek koneksi server.`);
      }
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    // Header form disesuaikan dengan mode
    <div className={`bg-white ${isEditMode ? '' : 'p-6 rounded-lg shadow-md mb-8'}`}>
      {!isEditMode && (
          <h2 className="text-2xl font-semibold mb-4">Buat Work Order Baru</h2>
      )}

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Kolom 1: Pilih Mesin (Aset) - Disabled saat Edit */}
          <div>
            <label htmlFor="assetSelect" className="block text-sm font-medium text-slate-700 mb-1">
              Pilih Mesin (Aset) <span className="text-red-500">*</span>
            </label>
            <select
              id="assetSelect"
              value={assetId}
              onChange={e => setAssetId(e.target.value)} 
              required
              disabled={isEditMode} // TIDAK BISA MENGUBAH ASET DI MODE EDIT
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="">-- Pilih Mesin --</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} (ID: {asset.machine_id})
                </option>
              ))}
            </select>
          </div>

          {/* Kolom 2: Tipe WO */}
          <div>
            <label htmlFor="woType" className="block text-sm font-medium text-slate-700 mb-1">
              Tipe <span className="text-red-500">*</span>
            </label>
            <select
              id="woType"
              value={type}
              onChange={e => setType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="corrective">Corrective (Perbaikan)</option>
              <option value="preventive">Preventive (Pencegahan)</option>
            </select>
          </div>
          
          {/* Kolom 3: Pilih Komponen */}
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
              {availableComponents.map(compName => (
                <option key={compName} value={compName}>
                  {compName}
                </option>
              ))}
            </select>
          </div>

           {/* Kolom 4: Prioritas */}
          <div>
            <label htmlFor="prioritySelect" className="block text-sm font-medium text-slate-700 mb-1">
              Prioritas
            </label>
            <select
              id="prioritySelect"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Baris 2: Judul WO */}
        <div className="mt-4">
          <label htmlFor="woTitle" className="block text-sm font-medium text-slate-700 mb-1">
            Judul Work Order
            {type === 'corrective' && !component && (
              <span className="text-red-500"> *</span>
            )}
          </label>
          <input
            type="text"
            id="woTitle"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Perbaikan sensor vibrasi"
            required={type !== 'corrective' || !component}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Baris 3: Deskripsi */}
        <div>
          <label htmlFor="woDescription" className="block text-sm font-medium text-slate-700 mb-1">
            Deskripsi (Opsional)
          </label>
          <textarea
            id="woDescription"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Jelaskan masalah atau tugas secara singkat..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Tombol Submit */}
        <div className="text-right pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditMode ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Work Order'}
          </button>
        </div>
      </form>
    </div>
  );
}