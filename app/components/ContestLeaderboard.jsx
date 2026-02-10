'use client';
import { useState, useEffect } from 'react';
import { Trophy, Loader2, ArrowLeft, Search } from 'lucide-react';

export default function ContestLeaderboard({ contest, onBack }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredData = leaderboard.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button
                onClick={onBack}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Contests
            </button>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Contest Results</h1>
                        <p className="text-slate-400">
                            Leaderboard for <span className="text-indigo-400 font-semibold">{contest.title}</span>
                        </p>
                    </div>
                    
                    <div className="relative group w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search student..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold w-24">Rank</th>
                                <th className="p-5 font-semibold">Student</th>
                                <th className="p-5 font-semibold text-right">Unique Problems Solved</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.map((student, index) => (
                                <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                            index === 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            index === 1 ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' :
                                            index === 2 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                            'bg-white/5 text-gray-400'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                {student.name}
                                            </span>
                                            <span className="text-xs text-gray-500">{student.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-sm">
                                            <Trophy className="w-3 h-3" />
                                            {student.solvedCount}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-12 text-center text-gray-500">
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
