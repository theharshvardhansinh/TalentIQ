
'use client';
import { useState, useEffect, use } from 'react';
import { Loader2, ArrowLeft, Trophy, Medal, Eye, Code2, X, Clock } from 'lucide-react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

export default function LeaderboardPage({ params: paramsPromise, showBackButton = true, backDestination }) {
    const params = use(paramsPromise);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [contestStatus, setContestStatus] = useState('Upcoming'); // Live, Ended

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null); // The user whose code we are viewing
    const [activeSolution, setActiveSolution] = useState(null); // The specific problem solution currently displayed

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`/api/contest/${params.contestId}/leaderboard`);
            const data = await res.json();
            if (data.success) {
                setLeaderboard(data.data);
                setContestStatus(data.status);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCode = (entry) => {
        if (contestStatus !== 'Ended') {
            alert("Code is only visible after the contest ends!");
            return;
        }
        setSelectedUser(entry);
        if (entry.solutions && entry.solutions.length > 0) {
            setActiveSolution(entry.solutions[0]); // Default to first
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-slate-500 font-mono">#{rank}</span>;
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        if (date.getTime() === 0) return "-";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const maskEmail = (email) => {
        if (!email) return "User";
        const [name, domain] = email.split('@');
        return `${name.substring(0, 3)}***@${domain}`;
    };

    const backLink = backDestination || `/contest/${params.contestId}`;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <Link href={backLink} className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </Link>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
                            </h1>
                            <p className="text-slate-400 text-sm">Real-time ranking</p>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${contestStatus === 'Live' ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' :
                        contestStatus === 'Ended' ? 'bg-slate-700/50 border-slate-600 text-slate-300' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        }`}>
                        {contestStatus}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-20">Rank</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Finish Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" /> Loading rankings...
                                            </div>
                                        </td>
                                    </tr>
                                ) : leaderboard.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                            No submissions yet. Be the first!
                                        </td>
                                    </tr>
                                ) : (
                                    leaderboard.map((entry, idx) => {
                                        // API returns flat: { _id, name, email, score, solvedCount, lastSolvedAt }
                                        // Normalise so both shapes work
                                        const displayName  = entry.name  ?? entry.user?.name  ?? 'Unknown';
                                        const displayEmail = entry.email ?? entry.user?.email ?? '';
                                        const displayId    = entry._id   ?? entry.user?._id   ?? idx;
                                        const rank         = entry.rank  ?? (idx + 1);
                                        const finishTime   = entry.finishTime ?? entry.lastSolvedAt ?? null;
                                        const solvedCount  = entry.score ?? entry.solvedCount ?? 0;

                                        return (
                                        <tr key={displayId} className={`hover:bg-white/5 transition-colors ${rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5">
                                                    {getRankIcon(rank)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{displayName}</div>
                                                <div className="text-xs text-slate-500 font-mono">{maskEmail(displayEmail)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold">
                                                    {solvedCount} <span className="text-emerald-500/50 text-xs font-normal">Solved</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums text-slate-300">
                                                <div className="flex items-center justify-end gap-2 text-sm">
                                                    <Clock className="w-3 h-3 text-slate-500" />
                                                    {formatTime(finishTime)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewCode(entry)}
                                                    disabled={contestStatus !== 'Ended'}
                                                    title={contestStatus !== 'Ended' ? "Available after contest ends" : "View Code"}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Code2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Code Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#161616] border border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="shrink-0 h-16 border-b border-white/10 bg-white/5 flex items-center justify-between px-6">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Code2 className="w-5 h-5 text-indigo-400" />
                                    {(selectedUser.name ?? selectedUser.user?.name ?? 'Unknown')}'s Solutions
                                </h2>
                                <p className="text-xs text-slate-500">{maskEmail(selectedUser.email ?? selectedUser.user?.email)} • Rank #{selectedUser.rank ?? '?'}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Problem List Sidebar */}
                            <div className="w-64 border-r border-white/10 bg-[#0f0f0f] overflow-y-auto p-2">
                                <h3 className="text-xs font-bold text-slate-500 uppercase px-3 py-2 mb-2">Solved Problems</h3>
                                <div className="space-y-1">
                                    {selectedUser.solutions.map((sol, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveSolution(sol)}
                                            className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${activeSolution === sol ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                }`}
                                        >
                                            <span className="truncate">{sol.problemSlug}</span>
                                            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded opacity-60 font-mono">
                                                {sol.language}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Code Viewer */}
                            <div className="flex-1 bg-[#1e1e1e] flex flex-col">
                                {activeSolution ? (
                                    <>
                                        <div className="h-10 border-b border-white/10 bg-white/5 px-4 flex items-center justify-between">
                                            <span className="text-xs font-mono text-slate-400">
                                                Submitted: {new Date(activeSolution.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <Editor
                                                height="100%"
                                                theme="vs-dark"
                                                language={activeSolution.language}
                                                value={activeSolution.code || "// Code not available"}
                                                options={{
                                                    readOnly: true,
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    padding: { top: 16 }
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-600">
                                        Select a problem to view code
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
