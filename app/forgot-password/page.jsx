'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';

function ForgotPasswordInner() {
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';

    // If email is pre-filled, start at step 1b (confirm email screen), else step 1a (email input)
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState(emailFromUrl);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const safeJson = async (res) => {
        try { return await res.json(); } catch { return {}; }
    };

    const sendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
            setSuccess(`Code sent to ${email}`);
            setOtpSent(true);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
            setSuccess('OTP Verified!');
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) { setError("Passwords don't match"); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
            setSuccess('Password reset! Redirecting...');
            setTimeout(() => window.location.href = '/login', 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalSteps = 3;

    return (
        <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-[#3B82F6]/10 rounded-2xl shadow-2xl p-8 relative z-10">
            <Link href="/login" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-8 text-sm group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
            </Link>

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-[#3B82F6]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {step === 1 && 'Reset Password'}
                    {step === 2 && 'Enter OTP'}
                    {step === 3 && 'New Password'}
                </h1>
                <p className="text-[#94A3B8] text-sm">
                    {step === 1 && (emailFromUrl
                        ? <span>Send a verification code to<br /><span className="text-[#3B82F6] font-medium">{email}</span></span>
                        : "Enter your email and we'll send a verification code."
                    )}
                    {step === 2 && <span>Check your inbox for the 6-digit code<br /><span className="text-[#3B82F6] font-medium">{email}</span></span>}
                    {step === 3 && 'Choose a strong new password.'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
                {[1,2,3].map(s => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`} />
                ))}
            </div>

            {error && <div className="mb-6 p-4 bg-[#F43F5E]/10 border border-[#F43F5E]/20 rounded-lg text-[#F43F5E] text-sm text-center">{error}</div>}
            {success && <div className="mb-6 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg text-[#10B981] text-sm text-center flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

            {/* Step 1 */}
            {step === 1 && (
                <div className="space-y-6">
                    {!emailFromUrl && (
                        <div>
                            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" />
                        </div>
                    )}
                    <button onClick={sendOtp} disabled={loading || !email}
                        className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-[#3B82F6]/20 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Verification Code</>}
                    </button>
                </div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Verification Code</label>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456" maxLength="6" autoFocus
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] text-center text-2xl tracking-[0.5em] font-mono transition-all" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-[#3B82F6]/20 transition-all flex items-center justify-center">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
                    </button>
                    <button type="button" onClick={sendOtp} disabled={loading}
                        className="w-full py-2 text-sm text-[#94A3B8] hover:text-white transition-colors">
                        Resend code
                    </button>
                </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-2">Confirm New Password</label>
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all" required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-[#3B82F6]/20 transition-all flex items-center justify-center">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0E1A] p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#22D3EE]/8 rounded-full blur-[100px] pointer-events-none" />
            <Suspense fallback={
                <div className="flex items-center gap-3 text-[#94A3B8]">
                    <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading…</span>
                </div>
            }>
                <ForgotPasswordInner />
            </Suspense>
        </div>
    );
}
