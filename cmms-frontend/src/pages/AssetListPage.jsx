// src/pages/AssetListPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, PackagePlus, HardDrive, MapPin, Activity, Settings } from 'lucide-react';
import AssetForm from './AssetForm.jsx'; 
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = 'http://localhost:5000/api';
const ASSETS_API = `${API_BASE_URL}/assets`;

export default function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setError("Gagal mengambil data dari server. Pastikan server Flask berjalan.");
      } else {
        setError(`Error: ${err.message}`);
      }
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssets();
  }, []); 

  const handleAssetCreated = () => {
    fetchAssets(); // Refresh data
    setIsModalOpen(false); // Tutup modal
  };

  const getStatusClass = (status) => {
    return status === 'running' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  };

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div>
      {/* Header & Action */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Manajemen Aset</h1>
            <p className="text-slate-500 mt-1">Kelola daftar mesin dan spesifikasi komponennya.</p>
        </div>
        <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
        >
            <PackagePlus size={18} className="mr-2" /> Tambah Aset Baru
        </button>
      </div>
      
      {/* Tabel Daftar Aset */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <LoadingState />}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2"><HardDrive size={14}/> Nama Mesin</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Mesin</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2"><MapPin size={14}/> Lokasi</div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2"><Activity size={14}/> Status</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">
                    <div className="flex items-center gap-2"><Settings size={14}/> Komponen (BOM)</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {assets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <FileWarning size={32} className="text-slate-400" />
                        </div>
                        <p className="font-medium">Belum ada data aset.</p>
                        <p className="text-sm">Silakan tambahkan aset baru untuk memulai.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">{asset.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                            {asset.machine_id}
                        </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {asset.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusClass(asset.status)}`}>
                        {asset.status.toUpperCase()}
                      </span>
                    </td>
                    
                    {/* Tampilan Komponen sebagai Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {asset.components.length > 0 ? (
                          asset.components.map((comp, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {comp.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tidak ada komponen terdaftar</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Aset */}
      {isModalOpen && (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Tambah Aset Baru"
        >
            <AssetForm onAssetCreated={handleAssetCreated} />
        </Modal>
      )}
    </div>
  );
}