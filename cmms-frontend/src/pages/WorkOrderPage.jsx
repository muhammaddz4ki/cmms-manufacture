// src/pages/WorkOrderPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, Play, Check, Trash2, Edit, Plus, Calendar, Wrench, HardDrive } from 'lucide-react';
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
  
  // State untuk Modal Create & Edit
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentWo, setCurrentWo] = useState(null); 

  // Fungsi Fetch Data
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
        setError("Gagal memuat data. Pastikan server Flask berjalan.");
      } else {
        setError(`Error: ${err.message}`);
      }
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Callback Create
  const handleWorkOrderCreated = (newWorkOrder) => {
    setWorkOrders([newWorkOrder, ...workOrders]);
    axios.get(`${API_BASE_URL}/assets`).then(res => setAssets(res.data));
    setIsCreateModalOpen(false);
  };
  
  // Callback Edit
  const handleWorkOrderUpdated = (updatedWo) => {
    setWorkOrders(workOrders.map(wo => 
        wo.id === updatedWo.id ? updatedWo : wo
    ));
    setIsEditModalOpen(false);
    setCurrentWo(null);
  };
  
  const handleCloseEditModal = () => {
      setIsEditModalOpen(false);
      setCurrentWo(null);
  }
  
  // Delete
  const handleDeleteWorkOrder = async (wo_id, title) => {
      if (!window.confirm(`Hapus Work Order: "${title}"?`)) return;

      try {
          await axios.delete(`${API_BASE_URL}/workorders/${wo_id}`);
          setWorkOrders(workOrders.filter(wo => wo.id !== wo_id));
      } catch (err) {
          // PERBAIKAN: Gunakan variabel 'err' untuk logging
          console.error("Gagal menghapus WO:", err);
          alert("Gagal menghapus Work Order.");
      }
  };

  // Update Status
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
      
      if (newStatus === 'completed') {
        setWorkOrders(workOrders.filter(wo => wo.id !== wo_id));
        axios.get(`${API_BASE_URL}/assets`).then(res => setAssets(res.data));
      } else {
         setWorkOrders(workOrders.map(wo =>
            wo.id === wo_id ? response.data : wo
         ));
      }
    } catch (err) {
      console.error("Gagal update status:", err);
      setWorkOrders(originalWorkOrders);
      alert("Gagal mengupdate status WO.");
    }
  };

  // Open Edit Modal
  const handleEditWorkOrder = (wo) => {
    setCurrentWo(wo); 
    setIsEditModalOpen(true);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };
  
  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-red-100 text-red-700 border-red-200',
      in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-green-100 text-green-700 border-green-200'
    };
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Selesai'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
            {labels[status] || status}
        </span>
    );
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Work Order</h1>
            <p className="text-slate-500 mt-1">Kelola tugas pemeliharaan dan perbaikan mesin.</p>
        </div>
        <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
        >
            <Plus size={18} className="mr-2" /> Buat WO Baru
        </button>
      </div>
      
      {/* Tabel Work Order */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <LoadingState />}
        
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Judul & Deskripsi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><HardDrive size={14}/> Aset</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                     <div className="flex items-center gap-1"><Wrench size={14}/> Tipe</div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Calendar size={14}/> Dibuat</div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi Cepat</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Opsi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {workOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <FileWarning size={32} className="text-slate-400" />
                        </div>
                        <p className="font-medium">Belum ada Work Order aktif.</p>
                        <p className="text-sm">Buat WO baru untuk memulai pekerjaan.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {workOrders.map(wo => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition-colors group">
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(wo.status)}
                    </td>
                    
                    <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{wo.title}</div>
                        {wo.component_name && (
                            <div className="text-xs text-slate-500 mt-0.5">Komponen: <span className="font-medium text-slate-700">{wo.component_name}</span></div>
                        )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {wo.asset_name}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${
                            wo.type === 'preventive' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                            {wo.type === 'preventive' ? 'Preventive' : 'Corrective'}
                        </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(wo.created_at)}
                    </td>

                    {/* Aksi Cepat (Status Update) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {wo.status === 'open' && (
                        <button
                          onClick={() => handleUpdateStatus(wo.id, 'in_progress')}
                          className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded hover:bg-amber-200 transition"
                        >
                          <Play size={14} className="mr-1" /> Mulai
                        </button>
                      )}
                      {wo.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(wo.id, 'completed')}
                          className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded hover:bg-green-200 transition"
                        >
                          <Check size={14} className="mr-1" /> Selesai
                        </button>
                      )}
                    </td>
                    
                    {/* Opsi Edit/Hapus */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEditWorkOrder(wo)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDeleteWorkOrder(wo.id, wo.title)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Hapus"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* MODAL CREATE */}
      {isCreateModalOpen && (
        <Modal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            title="Buat Work Order Baru"
        >
            <WorkOrderForm 
                assets={assets} 
                onWorkOrderCreated={handleWorkOrderCreated} 
                onClose={() => setIsCreateModalOpen(false)}
            />
        </Modal>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && currentWo && (
        <Modal 
            isOpen={isEditModalOpen} 
            onClose={handleCloseEditModal} 
            title={`Edit Work Order: ${currentWo.title}`}
        >
            <WorkOrderForm
                assets={assets}
                initialData={currentWo} 
                onWOUpdated={handleWorkOrderUpdated} 
                onClose={handleCloseEditModal} 
            />
        </Modal>
      )}
    </div>
  );
}