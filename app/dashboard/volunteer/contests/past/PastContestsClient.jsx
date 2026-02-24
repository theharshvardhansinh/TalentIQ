'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart2, Search } from 'lucide-react';
import { useState } from 'react';
import FormattedDate from '@/app/components/FormattedDate';

export default function PastContestsClient({ pastContests }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContests = pastContests.filter(contest =>
        contest.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-white p-6">
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/volunteer" className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Past Events
                        </h1>
                        <p className="text-slate-400 text-sm">Review past contests and leaderboards</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-[#475569]" />
                        <input
                            type="text"
                            placeholder="Search past events by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-[#3B82F6]/10 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] text-sm"
                        />
                    </div>
                    <p className="text-sm text-[#475569] shrink-0">
                        {filteredContests.length} of {pastContests.length} events
                    </p>
                </div>

                {/* Grid */}
                {filteredContests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContests.map(contest => (
                            <div key={contest._id} className="bg-[#111827] border border-[#3B82F6]/5 rounded-xl p-5 hover:bg-[#1E293B] transition-colors relative group">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors line-clamp-1">{contest.title}</h4>
                                    <span className="text-xs text-[#475569] bg-[#1E293B] px-2 py-1 rounded">Finished</span>
                                </div>
                                <div className="space-y-2 text-sm text-[#94A3B8]/60 mb-6">
                                    <div className="flex justify-between">
                                        <span>Start Time:</span>
                                        <span className="text-[#E2E8F0]/70"><FormattedDate date={contest.startTime} format="time" /></span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>End Time:</span>
                                        <span className="text-[#E2E8F0]/70"><FormattedDate date={contest.endTime} format="time" /></span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={`/dashboard/volunteer/contest/${contest._id}/results`} className="w-full">
                                        <button className="w-full py-2 border border-[#3B82F6]/10 hover:border-[#3B82F6]/20 text-[#94A3B8]/60 hover:text-[#94A3B8] hover:bg-[#3B82F6]/5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                                            <BarChart2 className="w-4 h-4" /> View Leaderboard
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-[#111827]/50 rounded-2xl border border-[#3B82F6]/5 border-dashed">
                        <p className="text-[#475569]">No past events match your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
