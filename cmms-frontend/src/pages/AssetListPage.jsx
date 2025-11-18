// src/pages/AssetListPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning } from 'lucide-react';
import AssetForm from './AssetForm.jsx'; // Form yang sudah diupdate
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const API_BASE_URL = 'http://localhost:5000/api';
const ASSETS_API = `${API_BASE_URL}/assets`;

export default function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PERBAIKAN 1: Pindahkan 'fetchAssets' ke dalam 'useEffect'
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ASSETS_API);
        setAssets(response.data);
      } catch (err) {
        if (err.response) {
          setError(`Gagal mengambil data: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setError("Gagal mengambil data dari server. Pastikan server Flask (port 5000) berjalan.");
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error(err);
      }
      setLoading(false);
    };

    fetchAssets();
  }, []); // Hanya jalan sekali

  // Callback dari form
  // PERBAIKAN 2: Hapus parameter 'newAsset' yang tidak terpakai
  const handleAssetCreated = () => {
    // Kita panggil fetchAssets lagi agar daftar aset ter-refresh
    // Ini lebih mudah daripada menggabungkan data secara manual
    
    // (Panggil fungsi fetch yang didefinisikan di scope atas jika diperlukan,
    // tapi karena 'useEffect' hanya jalan sekali, kita perlu fungsi fetch baru
    // atau state management)
    
    // SOLUSI SEMENTARA: Reload halaman untuk refresh data
    window.location.reload(); 
    
    // TODO: Ganti ini dengan state management (seperti Zustand/Redux) 
    // atau panggil fetchAssets dari dalam 'useEffect'
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Manajemen Aset</h1>
      
      <AssetForm onAssetCreated={handleAssetCreated} />
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Daftar Mesin Saat Ini</h2>
        
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Mesin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Mesin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Komponen (Bill of Materials)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {assets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileWarning size={40} className="text-slate-400" />
                        <span>Belum ada data aset. Silakan tambahkan aset baru.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{asset.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.machine_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        asset.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    
                    {/* Tampilan Komponen (Format Baru) */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {asset.components.length > 0 ? (
                        asset.components.map(comp => comp.name).join(', ')
                      ) : (
                        '-'
                      )}
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