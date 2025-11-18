// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, Loader2, User, Shield } from 'lucide-react';

const API_REGISTER_URL = 'http://localhost:5000/api/auth/register';
const ROLES = ['manager', 'technician']; // Admin hanya bisa dibuat otomatis

function AppLogo() {
    return (
        <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-4xl font-extrabold text-blue-600">CMMS</h1>
            <p className="text-slate-500 text-sm mt-1">Buat Akun Baru</p>
        </div>
    );
}

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES[1]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [regError, setRegError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegError(null);
        setIsSubmitting(true);

        try {
            // Kita tidak perlu menggunakan useAuth untuk registrasi, cukup axios
            const response = await axios.post(API_REGISTER_URL, { name, email, password, role });
            
            // Registrasi berhasil, arahkan ke Login atau langsung masuk
            alert(`Registrasi berhasil! Role Anda: ${response.data.role.toUpperCase()}. Silakan Login.`);
            navigate('/login', { replace: true });
        } catch (err) {
            setRegError(err.response?.data?.error || "Pendaftaran gagal. Cek koneksi server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                
                <AppLogo />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {regError && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {regError}
                        </div>
                    )}
                    
                    {/* Nama */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Budi Santoso" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@cmms.com" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimal 6 karakter" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Role/Peran</label>
                        <div className="relative">
                            <Shield size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg appearance-none">
                                {ROLES.map(r => (
                                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tombol Registrasi */}
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition duration-150">
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                            <UserPlus className="h-5 w-5 mr-2" />
                        )}
                        {isSubmitting ? 'Mendaftar...' : 'DAFTAR'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-4">
                    Sudah punya akun? <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Login di sini</Link>
                </p>
            </div>
        </div>
    );
}