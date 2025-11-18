// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// PERBAIKAN 1: Impor 'Save' untuk tombol Edit
import { FileWarning, Plus, Loader2, Edit, Trash2, PackagePlus, Save } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = 'http://localhost:5000/api/inventory';
const COMPONENTS_API = `${API_BASE_URL}/components`;

// --- Komponen Form (digunakan untuk Create dan Edit) ---
function InventoryForm({ onSave, initialData, onClose }) {
    const isEditMode = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [partNumber, setPartNumber] = useState(initialData?.part_number || '');
    const [stock, setStock] = useState(initialData?.stock_quantity || 0);
    const [location, setLocation] = useState(initialData?.location || 'Gudang Utama');
    
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // PERBAIKAN 2: 'part_number' diubah menjadi 'partNumber' (camelCase)
        const payload = { 
            name, 
            part_number: partNumber, 
            stock_quantity: parseInt(stock, 10), 
            location 
        };
        
        try {
            let response;
            if (isEditMode) {
                // PATCH (Update)
                response = await axios.patch(`${COMPONENTS_API}/${initialData.id}`, payload);
            } else {
                // POST (Create)
                response = await axios.post(COMPONENTS_API, payload);
            }
            onSave(response.data); // Panggil callback
            onClose(); // Tutup modal/form
        } catch (err) {
            setError(err.response?.data?.error || "Gagal menyimpan komponen.");
            console.error(err); // <-- Menambahkan log error
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="compName" className="block text-sm font-medium text-slate-700 mb-1">Nama Komponen *</label>
                    <input type="text" id="compName" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="compPartNum" className="block text-sm font-medium text-slate-700 mb-1">Part Number</label>
                    <input type="text" id="compPartNum" value={partNumber} onChange={e => setPartNumber(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="compStock" className="block text-sm font-medium text-slate-700 mb-1">Kuantitas Stok *</label>
                    <input type="number" id="compStock" value={stock} onChange={e => setStock(e.target.value)} min="0" required className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                <div>
                    <label htmlFor="compLocation" className="block text-sm font-medium text-slate-700 mb-1">Lokasi di Gudang</label>
                    <input type="text" id="compLocation" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
            </div>
            <div className="text-right pt-2">
                <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-slate-700">Batal</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    {/* PERBAIKAN 3: Menambahkan ikon 'Save' dan 'Plus' */}
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEditMode ? (
                        <Save className="mr-2 h-4 w-4" /> 
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Komponen')}
                </button>
            </div>
        </form>
    );
}

// --- Halaman Utama Inventaris ---
export default function InventoryPage() {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk Modal Create/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);

    // PERBAIKAN 4: Pindahkan 'fetchComponents' ke dalam 'useEffect'
    useEffect(() => {
        const fetchComponents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(COMPONENTS_API);
                setComponents(response.data);
            } catch (err) {
                setError("Gagal memuat data inventaris.");
                console.error("Fetch components error:", err); // PERBAIKAN 5: Gunakan 'err'
            }
            setLoading(false);
        };

        fetchComponents();
    }, []);

    // Handler Create (setelah form disubmit)
    const handleComponentCreated = (newComponent) => {
        setComponents([newComponent, ...components]);
        setIsModalOpen(false);
    };

    // Handler Update (setelah form disubmit)
    const handleComponentUpdated = (updatedComponent) => {
        setComponents(components.map(c => c.id === updatedComponent.id ? updatedComponent : c));
        setIsModalOpen(false);
        setEditingComponent(null);
    };

    // Handler Delete
    const handleDeleteComponent = async (componentId, componentName) => {
        if (!window.confirm(`Yakin hapus komponen "${componentName}" dari gudang?`)) return;

        try {
            await axios.delete(`${COMPONENTS_API}/${componentId}`);
            setComponents(components.filter(c => c.id !== componentId));
        } catch (err) {
            alert("Gagal menghapus komponen.");
            console.error("Delete component error:", err); // PERBAIKAN 6: Gunakan 'err'
        }
    };
    
    const openCreateModal = () => {
        setEditingComponent(null);
        setIsModalOpen(true);
    };

    const openEditModal = (component) => {
        setEditingComponent(component);
        setIsModalOpen(true);
    };

    if (error) {
        return <ErrorState message={error} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Gudang (Inventaris Komponen)</h1>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    <PackagePlus size={18} className="mr-2" /> Tambah Komponen Baru
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Daftar Komponen di Gudang</h2>
                
                {loading && <LoadingState />}
                
                {!loading && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Komponen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Part Number</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Stok</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi Gudang</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Opsi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {components.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileWarning size={40} className="text-slate-400" />
                                                <span>Belum ada komponen di gudang.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {components.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowPrap text-sm font-medium text-slate-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.part_number || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">{item.stock_quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                            <button 
                                                onClick={() => openEditModal(item)}
                                                className="text-blue-500 hover:text-blue-700" 
                                                title="Edit Komponen">
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteComponent(item.id, item.name)}
                                                className="text-red-500 hover:text-red-700" 
                                                title="Hapus Komponen">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Modal untuk Create/Edit */}
            {isModalOpen && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title={editingComponent ? "Edit Komponen" : "Tambah Komponen Baru"}
                >
                    <InventoryForm
                        initialData={editingComponent}
                        onSave={editingComponent ? handleComponentUpdated : handleComponentCreated}
                        onClose={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}