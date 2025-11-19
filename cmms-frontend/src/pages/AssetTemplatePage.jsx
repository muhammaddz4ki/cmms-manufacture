// src/pages/AssetTemplatePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// PERBAIKAN: Hapus 'Edit' dan 'PackagePlus' yang tidak terpakai
import { FileWarning, Plus, Loader2, Trash2, ListPlus } from 'lucide-react';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = 'http://localhost:5000/api';
const TEMPLATES_API = `${API_BASE_URL}/templates`;
const INVENTORY_API = `${API_BASE_URL}/inventory/components`;

// --- Komponen Form (digunakan untuk Create Template) ---
function TemplateForm({ onSave, onClose, allComponents }) {
    const [name, setName] = useState('');
    const [selectedComponentIds, setSelectedComponentIds] = useState(new Set());
    
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handler untuk checkbox
    const handleComponentChange = (componentId) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const payload = { 
            name, 
            component_ids: Array.from(selectedComponentIds) 
        };
        
        try {
            const response = await axios.post(TEMPLATES_API, payload);
            onSave(response.data); // Panggil callback (onTemplateCreated)
            onClose(); // Tutup modal
        } catch (err) {
            setError(err.response?.data?.error || "Gagal menyimpan template.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            
            {/* Nama Template */}
            <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-slate-700 mb-1">Nama Tipe Aset (Template) *</label>
                <input type="text" id="templateName" value={name} onChange={e => setName(e.target.value)} required placeholder="Contoh: Wheel Balancing Machine" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
            </div>

            {/* Pilihan Komponen */}
            <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Komponen Standar (BOM) *</label>
                {allComponents.length === 0 ? (
                    <p className="text-sm text-slate-500">Data komponen di gudang kosong. Silakan isi data di halaman Gudang.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
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
            
            <div className="text-right pt-4">
                <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-slate-700">Batal</button>
                <button type="submit" disabled={isSubmitting || allComponents.length === 0} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Simpan Template
                </button>
            </div>
        </form>
    );
}

// --- Halaman Utama Template ---
export default function AssetTemplatePage() {
    const [templates, setTemplates] = useState([]);
    const [allComponents, setAllComponents] = useState([]); // Master list komponen
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk Modal Create
    const [isModalOpen, setIsModalOpen] = useState(false);

    // PERBAIKAN 2: Pindahkan 'fetchData' ke dalam 'useEffect'
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Ambil data template dan data komponen gudang secara bersamaan
                const [templateRes, componentRes] = await Promise.all([
                    axios.get(TEMPLATES_API),
                    axios.get(INVENTORY_API)
                ]);
                setTemplates(templateRes.data);
                setAllComponents(componentRes.data);
            } catch (err) {
                setError("Gagal memuat data. Pastikan server berjalan.");
                console.error(err);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Handler Create
    const handleTemplateCreated = (newTemplate) => {
        setTemplates([newTemplate, ...templates]);
        setIsModalOpen(false);
    };

    // Handler Delete
    const handleDeleteTemplate = async (templateId, templateName) => {
        if (!window.confirm(`Yakin hapus template "${templateName}"?`)) return;

        try {
            await axios.delete(`${TEMPLATES_API}/${templateId}`);
            setTemplates(templates.filter(t => t.id !== templateId));
        } catch (err) {
            alert("Gagal menghapus template.");
            console.error(err);
        }
    };

    if (error) {
        return <ErrorState message={error} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Tipe Aset (Template)</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={loading || allComponents.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    <ListPlus size={18} className="mr-2" /> Buat Template Baru
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Daftar Template Aset (Resep BOM)</h2>
                
                {loading && <LoadingState />}
                
                {!loading && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Template</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Komponen</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Opsi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {templates.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileWarning size={40} className="text-slate-400" />
                                                <span>Belum ada template yang dibuat.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {templates.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.component_ids.length} Komponen</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                            <button 
                                                onClick={() => handleDeleteTemplate(item.id, item.name)}
                                                className="text-red-500 hover:text-red-700" 
                                                title="Hapus Template">
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
            
            {/* Modal untuk Create */}
            {isModalOpen && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title="Buat Template Aset Baru"
                >
                    <TemplateForm
                        allComponents={allComponents}
                        onSave={handleTemplateCreated}
                        onClose={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}