
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import LogoutButton from '@/app/components/LogoutButton';
import { Zap, Activity, Calendar as CalendarIcon, Users, Edit3, MonitorPlay, BarChart2, Plus, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function VolunteerDashboard() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (session.user.role !== 'volunteer' && session.user.role !== 'admin') {
        redirect('/dashboard'); // Kick students back to main dashboard
    }

    await dbConnect();

    // Fetch Data
    const now = new Date();

    // Aggregation for stats (or simple finds)
    const liveContests = await Contest.find({ startTime: { $lte: now }, endTime: { $gt: now } }).sort({ endTime: 1 }).lean();
    const upcomingContests = await Contest.find({ startTime: { $gt: now } }).sort({ startTime: 1 }).lean();
    const pastContests = await Contest.find({ endTime: { $lte: now } }).sort({ endTime: -1 }).lean();

    // Stats
    const activeCount = liveContests.length;
    const upcomingCount = upcomingContests.length;
    // Total participants (sum of registeredUsers arrays)
    const allContests = [...liveContests, ...upcomingContests, ...pastContests];
    const totalParticipants = allContests.reduce((acc, curr) => acc + (curr.registeredUsers ? curr.registeredUsers.length : 0), 0);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight leading-none">CodeArena</h1>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Organizer Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/contest/create">
                            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all group">
                                <Plus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span className="text-slate-300 group-hover:text-white">Host New Contest</span>
                            </button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <span className="block text-sm font-medium text-white">{session.user.name}</span>
                                <span className="block text-xs text-slate-500 uppercase">{session.user.role}</span>
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
                        <p className="text-slate-400">Monitor active events, manage registrations, and review past performance.</p>
                    </div>
                    {/* Mobile Host Button */}
                    <Link href="/contest/create" className="md:hidden">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl">
                            <Plus className="w-5 h-5" /> Host New Contest
                        </button>
                    </Link>
                </div>

                {/* Organizer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Active Contests */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Active Now</p>
                            <h3 className="text-4xl font-bold text-white">{activeCount}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Contests
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CalendarIcon className="w-24 h-24 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Scheduled</p>
                            <h3 className="text-4xl font-bold text-white">{upcomingCount}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium">
                            <Clock className="w-4 h-4" /> Upcoming Events
                        </div>
                    </div>

                    {/* Total Participants */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Total Registrations</p>
                            <h3 className="text-4xl font-bold text-white">{totalParticipants}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium">
                            <Users className="w-4 h-4" /> Across all contests
                        </div>
                    </div>
                </div>

                {/* Management Tabs / Lists */}
                <div className="space-y-12">

                    {/* Live Section */}
                    {activeCount > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                                <h3 className="text-xl font-bold text-white">Live Operations</h3>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                                    ACTION REQUIRED
                                </span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {liveContests.map(contest => (
                                    <div key={contest._id} className="bg-[#0A0A0A] border border-emerald-500/30 rounded-2xl p-6 shadow-lg shadow-emerald-900/10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white">{contest.title}</h4>
                                                    <p className="text-sm text-slate-400">Ends at {new Date(contest.endTime).toLocaleTimeString()}</p>
                                                </div>
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-3 py-1 rounded-full animate-pulse">
                                                    ● LIVE
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-300 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-500" />
                                                    {contest.registeredUsers?.length || 0} Registered
                                                </div>
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <Activity className="w-4 h-4" />
                                                    System: Stable
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Link href={`/dashboard/volunteer/contest/${contest._id}/monitor`} className="flex-1">
                                                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                                        <MonitorPlay className="w-4 h-4" /> Live Monitor
                                                    </button>
                                                </Link>
                                                <Link href={`/dashboard/volunteer/contest/${contest._id}/edit`}>
                                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1 bg-blue-500 rounded-full" />
                            <h3 className="text-xl font-bold text-white">Upcoming Contests</h3>
                        </div>

                        {upcomingContests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingContests.map(contest => (
                                    <div key={contest._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{contest.title}</h4>
                                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                                                {new Date(contest.startTime).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-400 mb-6">
                                            <div className="flex justify-between">
                                                <span>Start Time:</span>
                                                <span className="text-slate-200">{new Date(contest.startTime).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Duration:</span>
                                                <span className="text-slate-200">
                                                    {Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))} Hours
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Registered:</span>
                                                <span className="text-white font-mono">{contest.registeredUsers?.length || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 font-semibold rounded-lg border border-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm">
                                                <Users className="w-4 h-4" /> Manage
                                            </button>
                                            <Link href={`/dashboard/volunteer/contest/${contest._id}/edit`} className="flex-1">
                                                <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 text-sm">
                                                    <Edit3 className="w-4 h-4" /> Edit
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <p className="text-slate-500">No upcoming contests scheduled.</p>
                                <Link href="/contest/create" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">Host New Contest &rarr;</Link>
                            </div>
                        )}
                    </section>

                    {/* Past Section */}
                    {pastContests.length > 0 && (
                        <section className="opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-slate-700 rounded-full" />
                                <h3 className="text-xl font-bold text-slate-300">Past Events</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastContests.slice(0, 3).map(contest => (
                                    <div key={contest._id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-300">{contest.title}</h4>
                                            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">Finished</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <Link href={`/dashboard/volunteer/contest/${contest._id}/results`} className="w-full">
                                                <button className="w-full py-2 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                                                    <BarChart2 className="w-4 h-4" /> View Results
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}
