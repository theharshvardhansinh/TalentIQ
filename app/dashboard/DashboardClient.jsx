'use client';
import { useEffect, useState, useCallback } from 'react';
import { Award, Calendar, Clock, Loader2, Users, Trophy, Plus, FileQuestion, SearchIcon, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import CreateContestForm from '@/app/components/CreateContestForm';
import AddProblemForm from '@/app/components/AddProblemForm';
import ContestLeaderboard from '@/app/components/ContestLeaderboard';

export default function DashboardClient({ initialRole, userId }) {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showProblemForm, setShowProblemForm] = useState(null);
    const [showLeaderboard, setShowLeaderboard] = useState(null);
    const isVolunteer = initialRole === 'volunteer' || initialRole === 'admin';

    const fetchContests = useCallback(async () => {
        try {
            const res = await fetch('/api/contest/list');
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setContests(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch contests', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchContests(); }, [fetchContests]);

    const now = new Date();
    const liveContests = contests.filter(c => new Date(c.startTime) <= now && new Date(c.endTime) > now);
    const upcomingContests = contests.filter(c => new Date(c.startTime) > now);
    const pastContests = contests.filter(c => new Date(c.endTime) <= now);

    const getDisplayContests = () => {
        if (activeTab === 'live') return liveContests;
        if (activeTab === 'upcoming') return upcomingContests;
        return pastContests;
    };

    const handleRegister = async (contestId) => {
        try {
            const res = await fetch('/api/contest/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contestId })
            });
            const data = await res.json();
            if (data.success) {
                fetchContests();
            } else {
                alert(data.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    if (showLeaderboard) {
        return <ContestLeaderboard contest={showLeaderboard} onBack={() => setShowLeaderboard(null)} />;
    }

    const ContestCard = ({ contest, status }) => {
        const isRegistered = contest.registeredUsers?.includes(userId);
        const isLive = status === 'live';
        const isUpcoming = status === 'upcoming';
        const isPast = status === 'past';

        return (
            <div className={`relative group bg-[#111827] border border-[#3B82F6]/8 rounded-2xl p-6 transition-all hover:border-[#3B82F6]/20 hover:-translate-y-1 hover:shadow-xl ${isLive ? 'shadow-[#22D3EE]/10 border-[#22D3EE]/20' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#3B82F6] transition-colors">{contest.title}</h3>
                    <div className="flex gap-2">
                        {isLive && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 rounded-full text-xs font-bold animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-[#22D3EE]"></span>
                                LIVE
                            </span>
                        )}
                        {isUpcoming && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-full text-xs font-bold">
                                <Clock className="w-3 h-3" />
                                UPCOMING
                            </span>
                        )}
                    </div>
                </div>
                {contest.description && <p className="text-[#94A3B8] text-sm mb-4 line-clamp-2">{contest.description}</p>}
                <div className="flex flex-col gap-3 text-xs text-[#94A3B8]/60 mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Start: {new Date(contest.startTime).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        End: {new Date(contest.endTime).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        {contest.registeredUsers?.length || 0} registered
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {!isVolunteer && isUpcoming && !isRegistered && (
                        <button onClick={() => handleRegister(contest._id)} className="flex-1 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#3B82F6]/20 text-sm">Register</button>
                    )}
                    {!isVolunteer && isUpcoming && isRegistered && (
                        <span className="flex-1 py-2.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-bold rounded-xl text-center text-sm">✓ Registered</span>
                    )}
                    {isLive && isRegistered && (
                        <Link href={`/contest/${contest._id}`} className="flex-1">
                            <button className="w-full py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] hover:shadow-lg hover:shadow-[#3B82F6]/30 font-bold rounded-xl text-white text-sm flex items-center justify-center gap-2 transition-all">
                                <ExternalLink className="w-4 h-4" /> Enter Contest
                            </button>
                        </Link>
                    )}
                    {isLive && !isRegistered && !isVolunteer && (
                        <span className="text-xs text-[#F43F5E] font-medium">Not registered for this contest</span>
                    )}
                    {isPast && (
                        <button onClick={() => setShowLeaderboard(contest)} className="flex-1 py-2.5 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                            <Trophy className="w-4 h-4" /> Leaderboard
                        </button>
                    )}

                    {isVolunteer && (
                        <>
                            <Link href={`/contest/${contest._id}`} className="flex-1">
                                <button className="w-full py-2.5 bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#3B82F6]/10 font-medium rounded-xl transition-all text-sm border border-[#3B82F6]/10">View</button>
                            </Link>
                            <button onClick={() => setShowProblemForm(showProblemForm === contest._id ? null : contest._id)} className="py-2.5 px-3 bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#22D3EE]/10 rounded-xl border border-[#3B82F6]/10 transition-all">
                                <FileQuestion className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
                {isVolunteer && showProblemForm === contest._id && (
                    <AddProblemForm contestId={contest._id} onSuccess={fetchContests} />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex border-b border-[#3B82F6]/10 overflow-x-auto no-scrollbar">
                    {['live', 'upcoming', 'past'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-white' : 'text-[#94A3B8]/30 hover:text-[#94A3B8]/60'}`}>
                            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#3B82F6] to-[#22D3EE]"></span>}
                            <span className="flex items-center gap-2">
                                {tab}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#1E293B] text-[#475569]'}`}>
                                    {tab === 'live' ? liveContests.length : tab === 'upcoming' ? upcomingContests.length : pastContests.length}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
                {isVolunteer && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#3B82F6]/20 text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Contest
                    </button>
                )}
            </div>

            {showCreateForm && (
                <div className="bg-[#111827] p-8 rounded-2xl border border-[#3B82F6]/10 relative">
                    <button onClick={() => setShowCreateForm(false)} className="absolute top-4 right-4 text-[#94A3B8] hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <CreateContestForm onSuccess={() => { setShowCreateForm(false); fetchContests(); }} />
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                    <span className="text-[#94A3B8] text-sm">Loading contests...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getDisplayContests().map((contest) => (
                        <ContestCard key={contest._id} contest={contest} status={activeTab} />
                    ))}
                    {getDisplayContests().length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                            <SearchIcon className="w-12 h-12 text-[#1E293B]" />
                            <p className="text-[#475569] text-center">No {activeTab} contests found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
