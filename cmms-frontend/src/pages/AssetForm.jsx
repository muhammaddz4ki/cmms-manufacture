// src/pages/AssetForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Loader2 } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx'; 

const API_BASE_URL = 'http://localhost:5000/api';
const INVENTORY_API = `${API_BASE_URL}/inventory/components`;
const ASSETS_API = `${API_BASE_URL}/assets`;
const TEMPLATES_API = `${API_BASE_URL}/templates`;

export default function AssetForm({ onAssetCreated }) {
  // State untuk form input dasar
  const [name, setName] = useState("");
  const [machineId, setMachineId] = useState("");
  const [location, setLocation] = useState("");
  
  // State untuk komponen & template
  const [allComponents, setAllComponents] = useState([]); 
  const [allTemplates, setAllTemplates] = useState([]); 
  const [selectedTemplateId, setSelectedTemplateId] = useState(""); 
  const [selectedComponentIds, setSelectedComponentIds] = useState(new Set()); 
  
  const [loading, setLoading] = useState(true); 

  // State untuk UI
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil SEMUA data awal (Komponen & Template)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [compRes, templateRes] = await Promise.all([
          axios.get(INVENTORY_API),
          axios.get(TEMPLATES_API)
        ]);
        setAllComponents(compRes.data);
        setAllTemplates(templateRes.data);
      } catch (err) {
        console.error("Gagal mengambil data awal", err);
        setError("Gagal memuat data komponen/template dari server.");
      }
      setLoading(false);
    };
    fetchInitialData();
  }, []); // Hanya jalan sekali

  // --- LOGIKA BARU: Efek saat Template diubah ---
  useEffect(() => {
    // PERBAIKAN: Nonaktifkan peringatan ESLint untuk blok ini

    if (selectedTemplateId === "") {
      // Jika "Pilih Manual"
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedComponentIds(new Set()); // Kosongkan centang
    } else {
      // Jika Template dipilih
      const template = allTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Set centang berdasarkan 'component_ids' dari resep
        setSelectedComponentIds(new Set(template.component_ids));
      }
    }
  }, [selectedTemplateId, allTemplates]); // Dependensi ini sudah benar
  // ------------------------------------------

  // Handler untuk checkbox (masih memperbolehkan perubahan manual)
  const handleComponentChange = (componentId) => {
    // Otomatis set ke mode manual jika user mengubah centang
    setSelectedTemplateId(""); 
    
    setSelectedComponentIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(componentId)) {
        newIds.delete(componentId);
      } else {
        newIds.add(componentId);
      }
      return newIds;
    });
  };

  const resetForm = () => {
    setName("");
    setMachineId("");
    setLocation("");
    setSelectedTemplateId("");
    setSelectedComponentIds(new Set());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const assetData = {
      name: name,
      machine_id: machineId,
      location: location,
      component_ids: Array.from(selectedComponentIds) 
    };

    try {
      const response = await axios.post(ASSETS_API, assetData);
      onAssetCreated(response.data); 
      setSuccess(`Aset "${response.data.name}" berhasil disimpan.`);
      resetForm();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Gagal menyimpan aset. Cek koneksi server.");
      }
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Tambah Aset Baru</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Input Aset Dasar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="assetName" className="block text-sm font-medium text-slate-700 mb-1">Nama Mesin *</label>
            <input 
              type="text" 
              id="assetName"
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Contoh: Press Stamping 400 Ton"
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="machineId" className="block text-sm font-medium text-slate-700 mb-1">ID Mesin (Unik) *</label>
            <input 
              type="text" 
              id="machineId"
              value={machineId} 
              onChange={e => setMachineId(e.target.value)} 
              placeholder="Contoh: PST-001"
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
            <input 
              type="text" 
              id="location"
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="Contoh: Area Stamping"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        
        {/* --- DROPDOWN TEMPLATE BARU --- */}
        <div className="border-t pt-4">
          <label htmlFor="templateSelect" className="block text-sm font-medium text-slate-700 mb-1">
            Pilih Tipe Aset (Template)
          </label>
          <select
            id="templateSelect"
            value={selectedTemplateId}
            onChange={e => setSelectedTemplateId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          >
            <option value="">-- Pilih Manual --</option>
            {allTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.component_ids.length} komponen)
              </option>
            ))}
          </select>
        </div>

        {/* Pilihan Komponen (Bill of Materials) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Komponen untuk Aset Ini *</label>
          {loading ? (
            <LoadingState />
          ) : allComponents.length === 0 ? (
            <p className="text-sm text-slate-500">Data komponen di gudang kosong. Silakan isi data di halaman Gudang.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {allComponents.map(comp => (
                <label key={comp.id} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedComponentIds.has(comp.id)}
                    onChange={() => handleComponentChange(comp.id)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                  />
                  <span className="text-sm text-slate-700">{comp.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-right pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Menyimpan...' : 'Simpan Aset'}
          </button>
        </div>
      </form>
    </div>
  );
}