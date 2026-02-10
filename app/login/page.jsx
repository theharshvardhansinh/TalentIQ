'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            const role = data.role || formData.role;

            if (role === 'admin') {
                router.push('/admin');
            } else if (role === 'volunteer') {
                router.push('/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0E1A] p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#22D3EE]/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-[#3B82F6]/10 rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-[#94A3B8]">Sign in to continue to CodeArena</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-lg text-[#F43F5E] text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Select Role</label>
                        <div className="relative">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white appearance-none transition-all cursor-pointer"
                            >
                                <option value="student">Student</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]/40">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">College Email or Username</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email or 'admin'"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-[#94A3B8]">Password</label>
                            <Link href="/forgot-password" className="text-sm text-[#3B82F6] hover:text-[#60A5FA] transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-[#3B82F6]/20 transition-all duration-200 flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-[#94A3B8]/60 text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}
