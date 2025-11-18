// src/pages/AssetListPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning } from 'lucide-react';
import AssetForm from './AssetForm.jsx'; // Impor form
import LoadingState from '../components/LoadingState.jsx'; // Impor komponen
import ErrorState from '../components/ErrorState.jsx'; // Impor komponen

const API_BASE_URL = 'http://localhost:5000/api';

export default function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/assets`);
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
    
  }, []);

  const handleAssetCreated = (newAsset) => {
    setAssets([...assets, newAsset]);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Komponen (Contoh)</th>
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
                    <td className="px-6 py-4 text-sm text-slate-500">{asset.components.join(', ')}</td>
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