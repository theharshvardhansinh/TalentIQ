'use client';
import { useEffect, useState } from 'react';
import { Users, Calendar, Trophy, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        volunteers: 0,
        contests: 0,
        participants: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats from APIs
        const fetchStats = async () => {
            try {
                const [volRes, conRes, partRes] = await Promise.all([
                    fetch('/api/admin/volunteers'),
                    fetch('/api/admin/contests'),
                    fetch('/api/admin/participants') // Reuse participants listing for count
                ]);
                
                const volData = await volRes.json();
                const conData = await conRes.json();
                const partData = await partRes.json();

                setStats({
                    volunteers: volData.count || 0,
                    contests: conData.count || 0,
                    participants: partData.count || 0,
                });
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Volunteers', value: stats.volunteers, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { title: 'Active Contests', value: stats.contests, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { title: 'Participants', value: stats.participants, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'System Status', value: 'Active', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    ];

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div key={index} className="relative group bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.bg === 'bg-indigo-500/10' ? 'from-indigo-500/20' : card.bg.replace('/10', '/20').replace('bg-', 'from-')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10 flex items-center">
                        <div className={`p-4 rounded-xl ${card.bg} mr-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                            <card.icon className={`w-8 h-8 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider group-hover:text-gray-300 transition-colors">{card.title}</p>
                            <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">{card.value}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
