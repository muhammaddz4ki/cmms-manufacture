// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// PERBAIKAN: Impor useAuth dari file hook yang benar
import { useAuth } from '../context/useAuth.js'; 
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'; // Menu dihapus

// Komponen helper sederhana untuk tampilan logo
function AppLogo() {
    return (
        <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-4xl font-extrabold text-blue-600">CMMS</h1>
            <p className="text-slate-500 text-sm mt-1">Maintenance Management System</p>
        </div>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();
    // Menggunakan state lokal untuk menampilkan error yang berasal dari context setelah login dipanggil
    const [loginError, setLoginError] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);

        // Panggil fungsi login dari AuthContext
        const success = await login(email, password);

        // Catatan: Setelah pemanggilan 'await login', 'error' di context mungkin sudah terisi.
        // Kita perlu mengecek ulang 'success' dan menggunakan 'error' yang *mungkin* sudah di-set oleh context.
        if (success) {
            // Jika berhasil, arahkan ke Dashboard
            navigate('/', { replace: true });
        } else {
            // Jika gagal, tampilkan error yang didapat dari Context
            // Walaupun state 'error' di context akan terupdate, kita perlu memastikan
            // kita menangkap nilai error yang relevan. Di sini, kita asumsikan 
            // nilai 'error' dari context sudah sesuai (walau penanganan ini bisa disempurnakan
            // jika 'login' function mengembalikan error secara eksplisit).
            // Untuk sementara, kita pakai 'error' dari context:
            setLoginError(error || "Gagal masuk. Cek email dan password Anda.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                
                <AppLogo />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tampilkan error jika ada (baik dari context atau lokal) */}
                    {loginError && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {loginError}
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@cmms.com"
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="********"
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Tombol Login */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition duration-150"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                            <LogIn className="h-5 w-5 mr-2" />
                        )}
                        {isLoading ? 'Verifikasi...' : 'LOGIN'}
                    </button>
                </form>

                {/* Link Registrasi */}
                <p className="text-center text-sm text-slate-600 mt-4">
                    Belum punya akun? <Link to="/register" className="text-green-600 font-semibold hover:text-green-700">Daftar Akun Baru</Link>
                </p>
            </div>
        </div>
    );
}