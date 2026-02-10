'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            router.push('/login?registered=true');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0E1A] p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#22D3EE]/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-[#3B82F6]/10 rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-[#94A3B8]">Join the coding community</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-lg text-[#F43F5E] text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">College Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="23cp045@bvmengineering.ac.in"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" required />
                        <p className="mt-1 text-xs text-[#475569]">Format: 2-digit Year + 2-letter Branch + 3-digit Roll No @bvmengineering.ac.in</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 px-4 mt-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-[#3B82F6]/20 transition-all duration-200 flex items-center justify-center">
                        {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating account...</>) : ('Sign Up')}
                    </button>
                </form>

                <p className="mt-8 text-center text-[#94A3B8]/60 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
