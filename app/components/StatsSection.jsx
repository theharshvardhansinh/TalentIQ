'use client';

import { Trophy, Target, BarChart3, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const statCards = [
    {
        key: 'solved',
        label: 'Problems Solved',
        icon: Trophy,
        color: '#3B82F6',
        gradientFrom: '#3B82F6',
        gradientTo: '#22D3EE',
        getValue: (stats) => stats.solvedCount,
        getSub: (stats) => stats.solvedCount > 0 ? 'Great progress!' : 'Start solving!',
    },
    {
        key: 'contests',
        label: 'Contests Joined',
        icon: Target,
        color: '#8B5CF6',
        gradientFrom: '#8B5CF6',
        gradientTo: '#A78BFA',
        getValue: (stats) => stats.contestsParticipated,
        getSub: (stats) => stats.contestsParticipated > 0 ? 'Active participant' : 'Join a contest!',
    },
    {
        key: 'rate',
        label: 'Acceptance Rate',
        icon: BarChart3,
        color: '#10B981',
        gradientFrom: '#10B981',
        gradientTo: '#34D399',
        getValue: (stats) => `${stats.acceptanceRate}%`,
        getSub: (stats) => {
            const rate = stats.acceptanceRate;
            if (rate >= 80) return 'Excellent accuracy';
            if (rate >= 50) return 'Good accuracy';
            if (rate > 0) return 'Keep improving';
            return 'No submissions yet';
        },
    },
    {
        key: 'submissions',
        label: 'Total Submissions',
        icon: Send,
        color: '#F59E0B',
        gradientFrom: '#F59E0B',
        gradientTo: '#FBBF24',
        getValue: (stats) => stats.totalSubmissions,
        getSub: (stats) => stats.totalSubmissions > 0 ? 'Keep it up!' : 'Make your first!',
    },
];

export default function StatsSection({ solvedCount, contestsParticipated, acceptanceRate, totalSubmissions }) {
    const stats = { solvedCount, contestsParticipated, acceptanceRate, totalSubmissions };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: index * 0.1 }}
                        className="relative group"
                    >
                        <div
                            className="absolute inset-0 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-0 group-hover:opacity-100"
                            style={{ background: `linear-gradient(135deg, ${card.gradientFrom}20, ${card.gradientTo}20)` }}
                        />
                        <div className="relative p-5 rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden backdrop-blur-sm transition-all duration-300 group-hover:border-[color:var(--accent)] h-full"
                            style={{ '--accent': `${card.color}40` }}
                        >
                            {/* Subtle top accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                                style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
                            />
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-[#94A3B8] mb-1.5 uppercase tracking-wider">{card.label}</p>
                                    <h3 className="text-2xl font-bold text-white mb-1.5">{card.getValue(stats)}</h3>
                                    <p className="text-xs font-medium" style={{ color: card.color }}>{card.getSub(stats)}</p>
                                </div>
                                <div className="w-24 h-24 rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                    style={{ background: `${card.color}15` }}
                                >
                                    <Icon className="w-12 h-12" style={{ color: card.color }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
