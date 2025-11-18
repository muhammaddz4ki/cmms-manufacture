import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileWarning, Plus, Loader2, UserPlus, Mail, User, Trash2, Edit } from 'lucide-react'; 
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Modal from '../components/Modal.jsx'; 

const API_BASE_URL = 'http://localhost:5000/api';
const USERS_API = `${API_BASE_URL}/users`;
const ROLES = ['admin', 'manager', 'technician'];

// --- Komponen Form Pengguna Baru/Edit ---
function UserForm({ onUserCreated, initialData, onUserUpdated, onClose }) {
    const isEditMode = !!initialData;

    // State diinisialisasi dari initialData atau kosong
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [password, setPassword] = useState(''); 
    const [role, setRole] = useState(initialData?.role || ROLES[2]); 
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole(ROLES[2]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        const isPasswordRequired = !isEditMode; 
        if (isPasswordRequired && !password) {
            setError("Password wajib diisi untuk pengguna baru.");
            setIsSubmitting(false);
            return;
        }
        
        // Payload hanya berisi field yang bisa di-update/create
        let userData = { name, email, role };
        if (password) userData.password = password; // Tambahkan password jika diisi

        try {
            let response;
            if (isEditMode) {
                // PATCH (Update Role/Name/Password)
                response = await axios.patch(`${USERS_API}/${initialData.id}`, userData);
                onUserUpdated(response.data); // Update state di parent
                onClose(); // Tutup modal
            } else {
                // POST (Create New User)
                response = await axios.post(USERS_API, userData);
                onUserCreated(response.data);
                setSuccess(`Pengguna "${response.data.name}" berhasil dibuat dengan role: ${response.data.role}.`);
                resetForm();
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError(`Gagal ${isEditMode ? 'mengupdate' : 'membuat'} pengguna. Cek koneksi server.`);
            }
            console.error(err);
        }
        setIsSubmitting(false);
    };

    return (
        <div className={isEditMode ? '' : 'bg-white p-6 rounded-lg shadow-md mb-8'}>
            {!isEditMode && (
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                    <UserPlus size={24} /> Tambah Pengguna Baru
                </h2>
            )}
            
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Nama */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Contoh: Budi Santoso"/>
                    </div>
                    
                    {/* Email - Disabled saat Edit */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required={!isEditMode} disabled={isEditMode} className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100" placeholder="budi@cmms.com"/>
                    </div>

                    {/* Role */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Role/Peran</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            {ROLES.map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Password - Hanya saat Create / Opsional saat Edit */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Password {isEditMode ? '(Opsional, Ganti)' : '*'}
                        </label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required={!isEditMode} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder={isEditMode ? 'Biarkan kosong jika tidak ingin ganti' : 'Password wajib'}/>
                    </div>
                </div>

                <div className="text-right pt-2">
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                    </button>
                </div>
            </form>
        </div>
    );
}


// --- Halaman Utama UserPage ---
export default function UserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk Edit
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(USERS_API);
                setUsers(response.data);
            } catch (err) {
                if (err.request) {
                    setError("Gagal memuat data pengguna. Pastikan server Flask berjalan.");
                } else {
                    setError(`Error: ${err.message}`);
                }
                console.error(err);
            }
            setLoading(false);
        };

        fetchUsers();
    }, []); // Dependency array kosong: dijalankan sekali saat komponen mounting

    const handleUserCreated = (newUser) => {
        // Tambahkan pengguna baru di awal array
        setUsers([newUser, ...users]); 
    };

    // Callback setelah PATCH berhasil
    const handleUserUpdated = (updatedUser) => {
        // Ganti objek pengguna lama dengan objek yang baru
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setIsEditing(false); // Tutup modal setelah update
        setCurrentUser(null);
    };
    
    // Fungsi Edit
    const handleEditUser = (user) => {
        setCurrentUser(user);
        setIsEditing(true);
    };

    // Fungsi Delete
    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Yakin hapus pengguna "${userName}"?`)) return;

        try {
            await axios.delete(`${USERS_API}/${userId}`);
            // Hapus pengguna dari state
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert(`Gagal menghapus ${userName}. Cek konsol.`);
            console.error(err);
        }
    };


    const getRoleClass = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 font-bold';
            case 'manager':
                return 'bg-blue-100 text-blue-800';
            case 'technician':
            default: // Default ke technician jika tidak ada role atau role tidak dikenal
                return 'bg-green-100 text-green-800';
        }
    };

    if (error) {
        return <ErrorState message={error} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Manajemen Pengguna</h1>
            
            {/* Form Create */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <UserForm onUserCreated={handleUserCreated} />
            </div>
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Daftar Pengguna Saat Ini</h2>
                
                {loading && <LoadingState />}
                
                {!loading && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    {/* Header sudah benar dengan 4 kolom */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Peran (Role)</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Opsi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileWarning size={40} className="text-slate-400" />
                                                <span>Belum ada pengguna terdaftar.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        
                                        {/* PERBAIKAN LAYOUT BODY: Kolom Nama */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                <User size={16} className="text-slate-400" />
                                                {user.name}
                                            </div>
                                        </td>
                                        
                                        {/* PERBAIKAN LAYOUT BODY: Kolom Email */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <Mail size={16} className="text-slate-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        
                                        {/* Kolom Role */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        
                                        {/* Kolom Opsi */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                            {/* Tombol Edit Role */}
                                            <button 
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="Edit Role & Reset Password"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* Tombol Hapus */}
                                            <button 
                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Hapus Pengguna"
                                            >
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

            {/* MODAL EDIT ROLE */}
            {isEditing && (
                <Modal 
                    isOpen={isEditing} 
                    onClose={() => setIsEditing(false)} 
                    title={`Edit Pengguna: ${currentUser?.name}`}
                >
                    <UserForm
                        initialData={currentUser}
                        onUserUpdated={handleUserUpdated}
                        onClose={() => setIsEditing(false)}
                    />
                </Modal>
            )}
        </div>
    );
}