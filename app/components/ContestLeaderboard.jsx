'use client';
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import {
    Trophy, Loader2, ArrowLeft, Search, Mail, CheckCircle2,
    AlertCircle, Users, BookOpen, BarChart2, Star, Download,
    ChevronDown, ChevronUp, CheckCheck, X as XIcon
} from 'lucide-react';

export default function ContestLeaderboard({ contest, onBack }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingCerts, setSendingCerts] = useState(false);
    const [certResult, setCertResult] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortField, setSortField] = useState('rank');
    const [sortDir, setSortDir] = useState('asc');

    useEffect(() => {
        if (!contest) return;
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`/api/admin/contests/${contest._id}/leaderboard`);
                const data = await res.json();
                if (data.success) {
                    setLeaderboard(data.data);
                    setMeta(data.meta);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [contest]);

    // Sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    // Filter + Sort
    const processedData = useMemo(() => {
        let data = leaderboard
            .filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

        data = [...data].sort((a, b) => {
            let aVal, bVal;
            switch (sortField) {
                case 'name': aVal = a.name; bVal = b.name; break;
                case 'solved': aVal = a.solvedCount; bVal = b.solvedCount; break;
                case 'score': aVal = a.score; bVal = b.score; break;
                case 'attempts': aVal = a.totalAttempts; bVal = b.totalAttempts; break;
                default: aVal = b.solvedCount; bVal = a.solvedCount; // rank = default server order
            }
            if (typeof aVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return data;
    }, [leaderboard, searchTerm, sortField, sortDir]);

    const handleSendCertificates = async () => {
        if (!confirm('Send certificates to the top 3 winners via email?')) return;
        setSendingCerts(true);
        setCertResult(null);
        try {
            const res = await fetch(`/api/admin/contests/${contest._id}/send-certificates`, { method: 'POST' });
            const data = await res.json();
            setCertResult(data);
        } catch {
            setCertResult({ success: false, message: 'Failed to send certificates' });
        } finally {
            setSendingCerts(false);
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        if (!meta) return;
        const problemHeaders = (meta.problems || []).map(p => `"${p.title}"`).join(',');
        const rows = [
            ['Rank', 'Name', 'Email', 'Score (%)', 'Problems Solved', 'Total Attempts', ...(meta.problems || []).map(p => p.title)],
        ];
        processedData.forEach((s, i) => {
            const probCols = (meta.problems || []).map(p =>
                s.solvedSlugs.includes(p.slug) ? 'Solved' : 'Not Solved'
            );
            rows.push([i + 1, s.name, s.email, s.score, s.solvedCount, s.totalAttempts, ...probCols]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        const a = document.createElement('a');
        a.href = uri;
        a.download = `${contest.title?.replace(/\s+/g, '_')}_results.csv`;
        a.click();
    };

    const SortIcon = ({ field }) => (
        sortField === field
            ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
            : <ChevronDown className="w-3 h-3 opacity-30" />
    );

    const rankStyle = (i) => {
        if (i === 0) return { ring: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30', emoji: '🥇' };
        if (i === 1) return { ring: 'bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/30', emoji: '🥈' };
        if (i === 2) return { ring: 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/30', emoji: '🥉' };
        return { ring: 'bg-[#1E293B] text-[#475569] border border-white/5', emoji: null };
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            {/* ── Back ── */}
            <button
                onClick={onBack}
                className="flex items-center text-[#94A3B8] hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Contests
            </button>

            {/* ── Header Card ── */}
            <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-2xl p-7">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                                Contest Finished
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mt-2">{contest.title}</h1>
                        <p className="text-[#94A3B8] text-sm mt-1">
                            {new Date(contest.startTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            {' → '}
                            {new Date(contest.endTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleExportCSV}
                            disabled={loading || leaderboard.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-white font-medium rounded-xl transition-all text-sm border border-white/10 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button
                            onClick={handleSendCertificates}
                            disabled={sendingCerts || leaderboard.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0E1A] font-bold rounded-xl transition-all shadow-lg shadow-[#F59E0B]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {sendingCerts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                            {sendingCerts ? 'Sending...' : 'Send Certificates (Top 3)'}
                        </button>
                    </div>
                </div>

                {/* ── Summary Stats ── */}
                {meta && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Users, label: 'Total Students', value: meta.totalStudents, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10 border-[#3B82F6]/15' },
                            { icon: BookOpen, label: 'Total Problems', value: meta.totalProblems, color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/10 border-[#22D3EE]/15' },
                            { icon: BarChart2, label: 'Avg Score', value: `${meta.avgScore}%`, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/15' },
                            { icon: Trophy, label: 'Top Solver', value: leaderboard[0]?.name?.split(' ')[0] || '—', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/15' },
                        ].map((stat, i) => (
                            <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${stat.bg}`}>
                                <div className={`p-2 rounded-lg bg-white/5`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-[#475569] font-medium">{stat.label}</p>
                                    <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Certificate Result Feedback */}
            {certResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${certResult.success ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-[#F43F5E]/10 border-[#F43F5E]/20'}`}>
                    {certResult.success
                        ? <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 text-[#F43F5E] flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                        <p className={`font-semibold text-sm ${certResult.success ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>{certResult.message}</p>
                        {certResult.data?.map((r, i) => (
                            <p key={i} className="text-xs text-[#94A3B8] mt-1">
                                {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉'} {r.name} ({r.email}) —{' '}
                                <span className={r.status === 'sent' ? 'text-[#10B981]' : 'text-[#F43F5E]'}>
                                    {r.status === 'sent' ? 'Sent ✓' : 'Failed ✗'}
                                </span>
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Problem Key (chips) ── */}
            {meta && meta.problems?.length > 0 && (
                <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-xl p-4">
                    <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Contest Problems</p>
                    <div className="flex flex-wrap gap-2">
                        {meta.problems.map((p, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1E293B] border border-white/5 rounded-full text-xs text-[#94A3B8]">
                                <span className="w-4 h-4 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold text-[9px]">{i + 1}</span>
                                {p.title}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Search ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#475569]" />
                    <input
                        type="text"
                        placeholder="Search student by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-[#3B82F6]/10 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] text-sm"
                    />
                </div>
                <p className="text-sm text-[#475569] shrink-0">
                    {processedData.length} of {leaderboard.length} students
                </p>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                </div>
            ) : (
                <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-[#0d1117] border-b border-[#3B82F6]/10 text-[#475569] uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-4 font-semibold w-16">Rank</th>
                                    <th
                                        className="p-4 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">Student <SortIcon field="name" /></div>
                                    </th>
                                    <th
                                        className="p-4 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('solved')}
                                    >
                                        <div className="flex items-center gap-1">Problems Solved <SortIcon field="solved" /></div>
                                    </th>
                                    <th className="p-4 font-semibold">Questions Solved</th>
                                    <th
                                        className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('score')}
                                    >
                                        <div className="flex items-center justify-end gap-1">Score <SortIcon field="score" /></div>
                                    </th>
                                    <th
                                        className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('attempts')}
                                    >
                                        <div className="flex items-center justify-end gap-1">Attempts <SortIcon field="attempts" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3B82F6]/5">
                                {processedData.map((student, index) => {
                                    const { ring, emoji } = rankStyle(index);
                                    const isExpanded = expandedRow === student._id;
                                    const hasActivity = student.totalAttempts > 0;
                                    return (
                                        <Fragment key={student._id}>
                                            <tr
                                                className={`group transition-colors cursor-pointer ${isExpanded ? 'bg-[#1a2332]' : 'hover:bg-[#1E293B]'}`}
                                                onClick={() => setExpandedRow(isExpanded ? null : student._id)}
                                            >
                                                {/* Rank */}
                                                <td className="p-4">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${ring}`}>
                                                        {emoji || index + 1}
                                                    </div>
                                                </td>

                                                {/* Student */}
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-white group-hover:text-[#3B82F6] transition-colors">
                                                            {student.name}
                                                        </span>
                                                        <span className="text-xs text-[#475569]">{student.email}</span>
                                                    </div>
                                                </td>

                                                {/* Solved count */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm border ${student.solvedCount === 0
                                                            ? 'bg-[#1E293B] text-[#475569] border-white/5'
                                                            : student.solvedCount === meta?.totalProblems
                                                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                                : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'
                                                            }`}>
                                                            <Trophy className="w-3 h-3" />
                                                            {student.solvedCount}
                                                            {meta?.totalProblems > 0 && (
                                                                <span className="opacity-50 font-normal">/ {meta.totalProblems}</span>
                                                            )}
                                                        </div>
                                                        {student.solvedCount === meta?.totalProblems && meta?.totalProblems > 0 && (
                                                            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
                                                                <CheckCheck className="w-3 h-3" /> All
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Question pills */}
                                                <td className="p-4">
                                                    {meta?.problems?.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {meta.problems.map((prob, pi) => {
                                                                const solved = student.solvedSlugs.includes(prob.slug);
                                                                return (
                                                                    <span
                                                                        key={pi}
                                                                        title={prob.title}
                                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${solved
                                                                            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                                            : 'bg-[#1E293B] text-[#475569] border-white/5'
                                                                            }`}
                                                                    >
                                                                        {solved
                                                                            ? <CheckCircle2 className="w-3 h-3" />
                                                                            : <XIcon className="w-3 h-3" />
                                                                        }
                                                                        Q{pi + 1}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        student.solvedSlugs.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {student.solvedSlugs.map((slug, si) => (
                                                                    <span key={si} className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded text-[11px] font-mono">
                                                                        {slug}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-[#475569]">None</span>
                                                        )
                                                    )}
                                                </td>

                                                {/* Score */}
                                                <td className="p-4 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-lg font-black ${student.score >= 80 ? 'text-[#10B981]' :
                                                            student.score >= 50 ? 'text-[#3B82F6]' :
                                                                student.score > 0 ? 'text-[#F59E0B]' : 'text-[#475569]'
                                                            }`}>{student.score}%</span>
                                                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${student.score >= 80 ? 'bg-[#10B981]' :
                                                                    student.score >= 50 ? 'bg-[#3B82F6]' :
                                                                        student.score > 0 ? 'bg-[#F59E0B]' : 'bg-[#1E293B]'
                                                                    }`}
                                                                style={{ width: `${student.score}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Attempts */}
                                                <td className="p-4 text-right">
                                                    <span className={`text-sm font-mono ${hasActivity ? 'text-white' : 'text-[#475569]'}`}>
                                                        {student.totalAttempts}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Expanded detail row */}
                                            {isExpanded && (
                                                <tr key={`${student._id}-expanded`} className="bg-[#0d1117]">
                                                    <td colSpan="6" className="px-6 py-4">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Student Details</p>
                                                                <p className="text-white font-semibold">{student.name}</p>
                                                                <p className="text-xs text-[#475569]">{student.email}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Performance</p>
                                                                <p className="text-white font-bold">{student.solvedCount} / {meta?.totalProblems} solved</p>
                                                                <p className="text-xs text-[#475569]">{student.totalAttempts} total submissions</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Score</p>
                                                                <p className={`text-2xl font-black ${student.score >= 80 ? 'text-[#10B981]' : student.score >= 50 ? 'text-[#3B82F6]' : student.score > 0 ? 'text-[#F59E0B]' : 'text-[#475569]'}`}>
                                                                    {student.score}%
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Last Accepted</p>
                                                                <p className="text-white text-sm">
                                                                    {student.lastSolvedAt
                                                                        ? new Date(student.lastSolvedAt).toLocaleString()
                                                                        : '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}

                                {processedData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-[#475569]">
                                            {leaderboard.length === 0
                                                ? 'No students registered for this contest.'
                                                : 'No students match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
