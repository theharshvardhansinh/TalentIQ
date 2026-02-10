'use client';
import { useState, useEffect } from 'react';
import { Trophy, Loader2, ArrowLeft, Search, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContestLeaderboard({ contest, onBack }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingCerts, setSendingCerts] = useState(false);
    const [certResult, setCertResult] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`/api/admin/contests/${contest._id}/leaderboard`);
                const data = await res.json();
                if (data.success) {
                    setLeaderboard(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        if (contest) {
            fetchLeaderboard();
        }
    }, [contest]);

    const handleSendCertificates = async () => {
        if (!confirm('Send certificates to the top 3 winners via email?')) return;
        
        setSendingCerts(true);
        setCertResult(null);
        try {
            const res = await fetch(`/api/admin/contests/${contest._id}/send-certificates`, {
                method: 'POST',
            });
            const data = await res.json();
            setCertResult(data);
        } catch (error) {
            setCertResult({ success: false, message: 'Failed to send certificates' });
        } finally {
            setSendingCerts(false);
        }
    };

    const filteredData = leaderboard.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
                onClick={onBack}
                className="flex items-center text-[#94A3B8] hover:text-white mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Contests
            </button>

            <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-2xl p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Contest Results</h1>
                        <p className="text-[#94A3B8]">
                            Leaderboard for <span className="text-[#3B82F6] font-semibold">{contest.title}</span>
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Send Certificates Button */}
                        <button
                            onClick={handleSendCertificates}
                            disabled={sendingCerts || leaderboard.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0E1A] font-bold rounded-xl transition-all shadow-lg shadow-[#F59E0B]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {sendingCerts ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Send Certificates (Top 3)
                                </>
                            )}
                        </button>

                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-[#475569] group-focus-within:text-[#3B82F6] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search student..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Certificate Result Feedback */}
                {certResult && (
                    <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
                        certResult.success 
                            ? 'bg-[#10B981]/10 border-[#10B981]/20' 
                            : 'bg-[#F43F5E]/10 border-[#F43F5E]/20'
                    }`}>
                        {certResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-[#F43F5E] flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className={`font-semibold text-sm ${certResult.success ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                                {certResult.message}
                            </p>
                            {certResult.data && (
                                <div className="mt-2 space-y-1">
                                    {certResult.data.map((r, i) => (
                                        <p key={i} className="text-xs text-[#94A3B8]">
                                            {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉'} {r.name} ({r.email}) — 
                                            <span className={r.status === 'sent' ? 'text-[#10B981]' : 'text-[#F43F5E]'}>
                                                {' '}{r.status === 'sent' ? 'Sent ✓' : 'Failed ✗'}
                                            </span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                </div>
            ) : (
                <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-[#1E293B] border-b border-[#3B82F6]/10 text-[#94A3B8]/60 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold w-24">Rank</th>
                                <th className="p-5 font-semibold">Student</th>
                                <th className="p-5 font-semibold text-right">Unique Problems Solved</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3B82F6]/5">
                            {filteredData.map((student, index) => (
                                <tr key={student._id} className="hover:bg-[#1E293B] transition-colors group">
                                    <td className="p-5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                            index === 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' :
                                            index === 1 ? 'bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/20' :
                                            index === 2 ? 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/20' :
                                            'bg-[#1E293B] text-[#475569]'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white group-hover:text-[#3B82F6] transition-colors">
                                                {student.name}
                                            </span>
                                            <span className="text-xs text-[#475569]">{student.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-full font-bold text-sm">
                                            <Trophy className="w-3 h-3" />
                                            {student.solvedCount}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-12 text-center text-[#475569]">
                                        No participants found for this contest.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
