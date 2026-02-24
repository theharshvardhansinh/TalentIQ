'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Activity, Calendar as CalendarIcon, Users, Edit3, MonitorPlay, BarChart2, Plus, ArrowRight, Clock, LogOut } from 'lucide-react';
import LogoutButton from '@/app/components/LogoutButton';
import CreateContestForm from '@/app/components/CreateContestForm';
import FormattedDate from '@/app/components/FormattedDate';

export default function VolunteerDashboardClient({ session, liveContests, upcomingContests, pastContests, activeCount, upcomingCount, totalParticipants }) {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleContestCreated = (newContest) => {
        setShowCreateModal(false);
        router.refresh(); // Refresh server data
    };

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-white selection:bg-[#3B82F6]/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#22D3EE]/5 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-[#3B82F6]/5 bg-[#0A0E1A]/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Talent IQ</h1>
                            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">Organizer Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-sm font-medium transition-all group"
                        >
                            <Plus className="w-4 h-4 text-[#3B82F6] group-hover:scale-110 transition-transform" />
                            <span className="text-[#94A3B8] group-hover:text-white">Host New Contest</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <span className="block text-sm font-medium text-white">{session.user.name}</span>
                                <span className="block text-xs text-[#94A3B8]/60 uppercase">{session.user.role}</span>
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Contest Control Center</h2>
                        <p className="text-[#94A3B8]">Monitor active events, manage registrations, and review past performance.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3B82F6] text-white font-bold rounded-xl"
                    >
                        <Plus className="w-5 h-5" /> Host New Contest
                    </button>
                </div>

                {/* Organizer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Active Contests */}
                    <div className="bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#111827]/80 transition-colors relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-24 h-24 text-[#22D3EE]" />
                        </div>
                        <div>
                            <p className="text-[#94A3B8] font-medium mb-1">Active Now</p>
                            <h3 className="text-4xl font-bold text-white">{activeCount}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[#22D3EE] text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3EE]"></span>
                            </span>
                            Live Contests
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#111827]/80 transition-colors relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CalendarIcon className="w-24 h-24 text-[#3B82F6]" />
                        </div>
                        <div>
                            <p className="text-[#94A3B8] font-medium mb-1">Scheduled</p>
                            <h3 className="text-4xl font-bold text-white">{upcomingCount}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[#3B82F6] text-sm font-medium">
                            <Clock className="w-4 h-4" /> Upcoming Events
                        </div>
                    </div>

                    {/* Total Participants */}
                    <div className="bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#111827]/80 transition-colors relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24 text-[#F59E0B]" />
                        </div>
                        <div>
                            <p className="text-[#94A3B8] font-medium mb-1">Total Registrations</p>
                            <h3 className="text-4xl font-bold text-white">{totalParticipants}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[#F59E0B] text-sm font-medium">
                            <Users className="w-4 h-4" /> Across all contests
                        </div>
                    </div>
                </div>

                {/* Management Tabs / Lists */}
                <div className="space-y-12">

                    {/* Live Section */}
                    {/* Live Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-[#22D3EE] rounded-full" />
                            <h3 className="text-xl font-bold text-white">Live Operations</h3>
                            {activeCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#22D3EE]/15 text-[#22D3EE] text-xs font-bold rounded-full border border-[#22D3EE]/20">
                                    ACTION REQUIRED
                                </span>
                            )}
                        </div>
                        {activeCount > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {liveContests.map(contest => (
                                    <div key={contest._id} className="bg-[#111827] border border-[#22D3EE]/20 rounded-2xl p-6 shadow-lg shadow-[#22D3EE]/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22D3EE]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white">{contest.title}</h4>
                                                    <p className="text-sm text-[#94A3B8]">Ends at <FormattedDate date={contest.endTime} format="time" /></p>
                                                </div>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-3 py-1 rounded-full animate-pulse">
                                                    ● LIVE
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-[#94A3B8] mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-[#475569]" />
                                                    {contest.registeredUsers?.length || 0} Registered
                                                </div>
                                                <div className="flex items-center gap-2 text-[#22D3EE]">
                                                    <Activity className="w-4 h-4" />
                                                    System: Stable
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Link href={`/dashboard/volunteer/contest/${contest._id}/monitor`} className="flex-1">
                                                    <button className="w-full py-2.5 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#0A0E1A] font-bold rounded-xl transition-all shadow-lg shadow-[#22D3EE]/20 flex items-center justify-center gap-2">
                                                        <MonitorPlay className="w-4 h-4" /> Live Monitor
                                                    </button>
                                                </Link>
                                                <Link href={`/dashboard/volunteer/contest/${contest._id}/edit`}>
                                                    <button className="p-2.5 bg-[#1E293B] hover:bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/10 text-[#94A3B8] hover:text-white transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-[#111827]/50 rounded-2xl border border-[#3B82F6]/5 border-dashed">
                                <p className="text-[#475569]">No live contests at the moment.</p>
                            </div>
                        )}
                    </section>

                    {/* Upcoming Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-[#3B82F6] rounded-full" />
                            <h3 className="text-xl font-bold text-white">Upcoming Contests</h3>
                        </div>

                        {upcomingContests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingContests.map(contest => (
                                    <div key={contest._id} className="bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6 hover:border-[#3B82F6]/20 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-white group-hover:text-[#3B82F6] transition-colors">{contest.title}</h4>
                                            <span className="text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-1 rounded">
                                                <FormattedDate date={contest.startTime} />
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-[#94A3B8]/60 mb-6">
                                            <div className="flex justify-between">
                                                <span>Start Time:</span>
                                                <span className="text-[#E2E8F0]/70"><FormattedDate date={contest.startTime} format="time" /></span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Duration:</span>
                                                <span className="text-[#E2E8F0]/70">
                                                    {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))} Hours
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Registered:</span>
                                                <span className="text-white font-mono">{contest.registeredUsers?.length || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="flex-1 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] font-semibold rounded-lg border border-[#3B82F6]/20 transition-all flex items-center justify-center gap-2 text-sm">
                                                <Users className="w-4 h-4" /> Manage
                                            </button>
                                            <Link href={`/dashboard/volunteer/contest/${contest._id}/edit`} className="flex-1">
                                                <button className="w-full py-2 bg-[#1E293B] hover:bg-[#3B82F6]/10 text-[#94A3B8] hover:text-white font-medium rounded-lg border border-[#3B82F6]/10 transition-all flex items-center justify-center gap-2 text-sm">
                                                    <Edit3 className="w-4 h-4" /> Edit
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[#111827] rounded-2xl border border-[#3B82F6]/10 border-dashed">
                                <p className="text-[#475569]">No upcoming contests scheduled.</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="text-[#3B82F6] hover:text-[#60A5FA] text-sm mt-2 inline-block font-medium"
                                >
                                    Host New Contest &rarr;
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Past Section */}
                    {/* Past Section */}
                    <section className="opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1 bg-[#1E293B] rounded-full" />
                                <h3 className="text-xl font-bold text-[#94A3B8]">Past Events</h3>
                            </div>
                            <Link href="/dashboard/volunteer/contests/past" className="text-sm text-primary hover:text-primary-focus transition-colors">
                                View All &rarr;
                            </Link>
                        </div>

                        {pastContests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastContests.slice(0, 3).map(contest => (
                                    <div key={contest._id} className="bg-[#111827] border border-[#3B82F6]/5 rounded-xl p-5 hover:bg-[#1E293B] transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-[#94A3B8]">{contest.title}</h4>
                                            <span className="text-xs text-[#475569] bg-[#1E293B] px-2 py-1 rounded">Finished</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <Link href={`/dashboard/volunteer/contest/${contest._id}/results`} className="w-full">
                                                <button className="w-full py-2 border border-[#3B82F6]/10 hover:border-[#3B82F6]/20 text-[#94A3B8]/60 hover:text-[#94A3B8] text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                                                    <BarChart2 className="w-4 h-4" /> View Leaderboard
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-[#111827]/50 rounded-2xl border border-[#3B82F6]/5 border-dashed">
                                <p className="text-[#475569]">No past events.</p>
                            </div>
                        )}
                    </section>

                </div>
            </main>

            {/* Modal for Creating Contest */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-2 flex justify-end">
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">✕</button>
                        </div>
                        <div className="px-6 pb-6">
                            <CreateContestForm onSuccess={handleContestCreated} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
