// src/pages/WorkOrderPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// PERBAIKAN: Hapus 'RefreshCw' dari impor
import { FileWarning, Play, Check, Trash2, Edit } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import WorkOrderForm from './WorkOrderForm.jsx';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

export default function WorkOrderPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk form Edit
  const [isEditing, setIsEditing] = useState(false); 
  const [currentWo, setCurrentWo] = useState(null); 

  // Fungsi untuk mengambil data awal (Aset dan Work Order)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [woResponse, assetResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/workorders`),
          axios.get(`${API_BASE_URL}/assets`)
        ]);
        
        setWorkOrders(woResponse.data);
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
  }, []);

  // Callback dari WorkOrderForm (Mode Create)
  const handleWorkOrderCreated = (newWorkOrder) => {
    setWorkOrders([newWorkOrder, ...workOrders]);
    // Refresh data aset jika stok berkurang (opsional, tapi bagus)
    axios.get(`${API_BASE_URL}/assets`).then(res => setAssets(res.data));
  };
  
  // Callback dari WorkOrderForm (Mode Edit)
  const handleWorkOrderUpdated = (updatedWo) => {
    setWorkOrders(workOrders.map(wo => 
        wo.id === updatedWo.id ? updatedWo : wo
    ));
    handleCloseModal();
  };
  
  const handleCloseModal = () => {
      setIsEditing(false);
      setCurrentWo(null);
  }
  
  // --- FUNGSI HAPUS (DELETE) ---
  const handleDeleteWorkOrder = async (wo_id, title) => {
      if (!window.confirm(`Apakah Anda yakin ingin menghapus Work Order: "${title}"? Tindakan ini tidak bisa dibatalkan.`)) {
          return;
      }

      try {
          await axios.delete(`${API_BASE_URL}/workorders/${wo_id}`);
          setWorkOrders(workOrders.filter(wo => wo.id !== wo_id));
      } catch (err) {
          console.error("Gagal menghapus WO:", err);
          alert("Gagal menghapus Work Order. Cek konsol untuk info.");
      }
  };

  // --- FUNGSI UPDATE STATUS (PATCH) ---
  const handleUpdateStatus = async (wo_id, newStatus) => {
    const originalWorkOrders = [...workOrders];
    
    // Optimistic Update
    const updatedWorkOrders = workOrders.map(wo =>
      wo.id === wo_id ? { ...wo, status: newStatus } : wo
    );
    setWorkOrders(updatedWorkOrders);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/workorders/${wo_id}`, 
        { status: newStatus }
      );
      
      // Update state dengan data pasti dari server (terutama jika 'completed_at' diisi)
      // Jika status 'completed', WO akan hilang dari daftar ini saat refresh berikutnya
      // Jadi kita biarkan dia hilang saat refresh, atau kita filter manual
      if (newStatus === 'completed') {
        setWorkOrders(workOrders.filter(wo => wo.id !== wo_id));
        // Refresh data Aset (untuk update stok di dropdown)
        axios.get(`${API_BASE_URL}/assets`).then(res => setAssets(res.data));
      } else {
         setWorkOrders(workOrders.map(wo =>
            wo.id === wo_id ? response.data : wo
         ));
      }

    } catch (err) {
      console.error("Gagal update status:", err);
      setWorkOrders(originalWorkOrders);
      alert("Gagal mengupdate status WO. Cek konsol untuk info.");
    }
  };

  // --- FUNGSI EDIT DETAIL ---
  const handleEditWorkOrder = (wo) => {
    setCurrentWo(wo); 
    setIsEditing(true);
  };

  // Fungsi format tanggal
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fungsi style status
  const getStatusClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      // 'completed' tidak akan muncul di sini lagi
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Manajemen Work Order</h1>
      
      {/* Tampilkan Form Buat WO Baru */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Buat Work Order Baru</h2>
        <WorkOrderForm 
            assets={assets} 
            onWorkOrderCreated={handleWorkOrderCreated} 
        />
      </div>

      {/* Tabel Daftar Work Order */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-semibold mb-4">Daftar Work Order</h2>
        
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Komponen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mesin (Aset)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dibuat Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tindakan</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Opsi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {workOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileWarning size={40} className="text-slate-400" />
                        <span>Belum ada Work Order aktif.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {workOrders.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50">
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(wo.status)}`}>
                        {wo.status}
                      </span>
                    </td>
                    
                    {/* Judul */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{wo.title}</td>
                    
                    {/* Komponen */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.component_name || '-'}</td>
                    
                    {/* Nama Aset */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.asset_name}</td>
                    
                    {/* Tipe */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.type}</td>
                    
                    {/* Tanggal Dibuat */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(wo.created_at)}</td>

                    {/* Tiga Tindakan Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {wo.status === 'open' && (
                        <button
                          onClick={() => handleUpdateStatus(wo.id, 'in_progress')}
                          title="Mulai Kerjakan"
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Play size={18} />
                        </button>
                      )}
                      {wo.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(wo.id, 'completed')}
                          title="Selesaikan Work Order"
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {/* Tombol RefreshCw dihapus dari sini */}
                    </td>
                    
                    {/* Opsi Edit/Hapus */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                        <button
                            onClick={() => handleEditWorkOrder(wo)}
                            title="Edit Detail WO"
                            className="text-blue-500 hover:text-blue-700"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => handleDeleteWorkOrder(wo.id, wo.title)}
                            title="Hapus Work Order"
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
      
      {/* MODAL EDIT */}
      <Modal 
          isOpen={isEditing} 
          onClose={handleCloseModal} 
          title={`Edit Work Order: ${currentWo?.title}`}
      >
          {currentWo && (
              <WorkOrderForm
                  assets={assets}
                  initialData={currentWo} 
                  onWOUpdated={handleWorkOrderUpdated} 
                  onClose={handleCloseModal} 
              />
          )}
      </Modal>
    </div>
  );
}