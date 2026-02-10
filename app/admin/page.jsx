'use client';
import { useEffect, useState } from 'react';
import { Users, Calendar, Trophy, Activity, TrendingUp, Clock, Plus, ArrowUpRight, Search, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        volunteers: 0,
        contests: 0,
        participants: 0,
    });
    const [topSolvers, setTopSolvers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [volRes, conRes, partRes] = await Promise.all([
                    fetch('/api/admin/volunteers'),
                    fetch('/api/admin/contests'),
                    fetch('/api/admin/participants')
                ]);
                
                const volData = await volRes.json();
                const conData = await conRes.json();
                const partData = await partRes.json();

                setStats({
                    volunteers: volData.count || 0,
                    contests: conData.count || 0,
                    participants: partData.count || 0,
                });

                if (partData.success && Array.isArray(partData.data)) {
                    setTopSolvers(partData.data.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Volunteers', value: stats.volunteers, icon: Users, color: 'text-indigo-400', bg: 'from-indigo-500/20 to-indigo-500/5', trend: '+12%', trendUp: true },
        { title: 'Active Contests', value: stats.contests, icon: Calendar, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-500/5', trend: '+2', trendUp: true },
        { title: 'Total Participants', value: stats.participants, icon: Trophy, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', trend: '+24%', trendUp: true },
        { title: 'System Health', value: '98%', icon: Activity, color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5', trend: 'Stable', trendUp: true },
    ];

    const recentActivity = [
        { user: 'Sarah Connor', action: 'registered for', target: 'Hackathon 2024', time: '2 mins ago', icon: Users },
        { user: 'Admin', action: 'updated contest', target: 'Code Wars', time: '1 hour ago', icon: Calendar },
        { user: 'John Doe', action: 'joined as', target: 'Volunteer', time: '3 hours ago', icon: Plus },
        { user: 'System', action: 'automated backup', target: 'Success', time: '5 hours ago', icon: Activity },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-400 mt-2">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index} 
                        className="relative overflow-hidden bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/30 transition-all group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-white/5 ring-1 ring-white/10 ${card.color}`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/5 ${card.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                    {card.trend}
                                </div>
                            </div>
                            
                            <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
                            <p className="text-gray-400 text-sm font-medium mt-1">{card.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Performers Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">Top Solvers</h3>
                        <Trophy className="w-5 h-5 text-indigo-400" />
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                                <tr>
                                    <th className="pb-3 pl-2">Rank</th>
                                    <th className="pb-3">Student</th>
                                    <th className="pb-3 text-right">Problems Solved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topSolvers.map((student, index) => (
                                    <tr key={student._id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2 font-medium text-indigo-400">#{index + 1}</td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{student.name}</span>
                                                <span className="text-gray-500 text-xs">{student.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {student.solvedCount} Solved
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {topSolvers.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500">
                                            No data available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer hover:text-white" />
                    </div>

                    <div className="space-y-6">
                        {recentActivity.map((item, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all">
                                        <item.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
                                    </div>
                                    {index !== recentActivity.length - 1 && (
                                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-white/5 my-2" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300">
                                        <span className="font-semibold text-white hover:underline cursor-pointer">{item.user}</span> {item.action} <span className="text-indigo-400">{item.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                     <button className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/5">
                        View All Activity
                    </button>
                </motion.div>
            </div>

             {/* Quick Actions */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Create Contest', desc: 'Launch a new coding challenge', color: 'from-pink-500 to-rose-500' },
                    { title: 'Add Volunteer', desc: 'Onboard new team members', color: 'from-indigo-500 to-blue-500' },
                    { title: 'Export Data', desc: 'Download reports as CSV', color: 'from-emerald-500 to-teal-500' },
                ].map((action, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative group overflow-hidden rounded-2xl p-1"
                    >
                         <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                         <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-xl h-full flex items-center justify-between group-hover:border-white/20 transition-all">
                            <div className="text-left">
                                <h4 className="font-semibold text-white">{action.title}</h4>
                                <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ArrowUpRight className="w-4 h-4 text-white" />
                            </div>
                         </div>
                    </motion.button>
                ))}
             </div>
        </div>
    );
}
