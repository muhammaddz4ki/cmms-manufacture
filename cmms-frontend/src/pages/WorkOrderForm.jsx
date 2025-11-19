// src/pages/WorkOrderForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Loader2, Save, FileText, Settings } from 'lucide-react'; 

const API_BASE_URL = 'http://localhost:5000/api';

export default function WorkOrderForm({ assets, onWorkOrderCreated, initialData, onWOUpdated, onClose }) {
  const isEditMode = !!initialData;
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assetId, setAssetId] = useState(initialData?.asset_id || ''); 
  const [componentId, setComponentId] = useState(initialData?.component_id || '');
  const [type, setType] = useState(initialData?.type || 'corrective');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableComponents = useMemo(() => {
    if (assetId) {
      const selectedAsset = assets.find(a => a.id === assetId);
      return selectedAsset?.components || []; 
    }
    return []; 
  }, [assetId, assets]);

  useEffect(() => {
    if (!isEditMode) {
     
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComponentId('');
    }
  }, [assetId, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalTitle = title;
    if (type === 'corrective' && componentId && !title) {
        const selectedComp = availableComponents.find(c => c.id === componentId);
        finalTitle = `Perbaikan: ${selectedComp?.name || 'Komponen'}`;
    }

    if (!assetId || !type) {
      setError("Mesin dan Tipe WO wajib diisi.");
      return;
    }
    if (!finalTitle) {
        setError("Judul WO wajib diisi (atau pilih komponen).");
        return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const payload = {
      title: finalTitle,
      description: description,
      asset_id: assetId,
      component_id: componentId || null, 
      type: type,
      priority: priority,
    };

    try {
      let response;
      if (isEditMode) {
        response = await axios.patch(`${API_BASE_URL}/workorders/${initialData.id}`, payload);
        onWOUpdated(response.data); 
        onClose(); 
      } else {
        response = await axios.post(`${API_BASE_URL}/workorders`, payload);
        onWorkOrderCreated(response.data); 
        setSuccess(`Work Order berhasil dibuat.`);
        // Reset form manual (karena kita tidak menutup modal di sini untuk create)
        setTitle(''); setDescription(''); setAssetId(''); setComponentId(''); setType('corrective'); setPriority('medium');
      }
    } catch (err) {
      setError(err.response?.data?.error || `Gagal ${isEditMode ? 'mengupdate' : 'membuat'} WO.`);
    }
    setIsSubmitting(false);
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        {success && !isEditMode && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Mesin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Mesin (Aset) *</label>
            <div className="relative">
                <select
                value={assetId}
                onChange={e => setAssetId(e.target.value)} 
                required
                disabled={isEditMode} 
                className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-shadow"
                >
                <option value="">-- Pilih Mesin --</option>
                {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name} (ID: {asset.machine_id})</option>
                ))}
                </select>
            </div>
          </div>

          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Pekerjaan *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="corrective">Corrective (Perbaikan)</option>
              <option value="preventive">Preventive (Pencegahan)</option>
            </select>
          </div>
          
          {/* Komponen */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Komponen Terkait</label>
            <div className="relative">
                <Settings size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                <select
                value={componentId}
                onChange={e => setComponentId(e.target.value)}
                disabled={!assetId || type !== 'corrective'} 
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 transition-shadow"
                >
                <option value="">-- Opsional --</option>
                {availableComponents.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name} (Stok: {comp.stock_quantity})</option>
                ))}
                </select>
            </div>
          </div>

           {/* Prioritas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="low">Low (Rendah)</option>
              <option value="medium">Medium (Sedang)</option>
              <option value="high">High (Tinggi - Mendesak)</option>
            </select>
          </div>
        </div>

        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Judul Work Order *</label>
          <div className="relative">
             <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
             <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={type === 'corrective' && componentId ? "Otomatis: Perbaikan [Komponen]" : "Contoh: Pengecekan Rutin"}
                required={type === 'preventive' || (type === 'corrective' && !componentId)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
             />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Detail (Opsional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Jelaskan masalah, suara aneh, atau instruksi khusus..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
          ></textarea>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {isEditMode && (
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                  Batal
              </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-md text-white ${
                isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5`}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditMode ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Memproses...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Work Order'}
          </button>
        </div>
      </form>
  );
}