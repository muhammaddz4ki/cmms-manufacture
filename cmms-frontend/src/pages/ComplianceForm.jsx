// src/pages/ComplianceForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const LOGS_API = `${API_BASE_URL}/compliance/logs`;

export default function ComplianceForm({ assets, onLogCreated }) {
  // State untuk input form
  const [assetId, setAssetId] = useState('');
  const [regulationName, setRegulationName] = useState('');
  const [nextCheckDue, setNextCheckDue] = useState('');
  const [status, setStatus] = useState('pending');
  
  // State untuk UI
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi reset form
  const resetForm = () => {
    setAssetId('');
    setRegulationName('');
    setNextCheckDue('');
    setStatus('pending');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!assetId || !regulationName || !nextCheckDue) {
      setError("Mesin, Nama Regulasi, dan Tanggal Jatuh Tempo wajib diisi.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const logData = {
      asset_id: assetId,
      regulation_name: regulationName,
      next_check_due: nextCheckDue, // Dikirim sebagai string YYYY-MM-DD
      status: status,
    };

    try {
      const response = await axios.post(LOGS_API, logData);
      
      onLogCreated(response.data); 
      setSuccess(`Log kepatuhan "${response.data.regulation_name}" berhasil dicatat.`);
      resetForm();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Gagal mencatat log. Cek koneksi server.");
      }
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Catat Log Kepatuhan Baru</h2>

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

          {/* Kolom 2: Nama Regulasi/Standar */}
          <div>
            <label htmlFor="regulationName" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Regulasi/Standar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="regulationName"
              value={regulationName}
              onChange={e => setRegulationName(e.target.value)}
              placeholder="Contoh: Kalibrasi ISO 9001"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Kolom 3: Tanggal Jatuh Tempo Berikutnya */}
          <div>
            <label htmlFor="nextCheckDue" className="block text-sm font-medium text-slate-700 mb-1">
              Jatuh Tempo Berikutnya <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="nextCheckDue"
              value={nextCheckDue}
              onChange={e => setNextCheckDue(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Kolom 4: Status Kepatuhan */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Status Kepatuhan
            </label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending (Menunggu)</option>
              <option value="compliant">Compliant (Sesuai)</option>
              <option value="overdue">Overdue (Terlambat)</option>
            </select>
          </div>
        </div>

        {/* Tombol Submit */}
        <div className="text-right pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Mencatat...' : 'Simpan Log Kepatuhan'}
          </button>
        </div>
      </form>
    </div>
  );
}