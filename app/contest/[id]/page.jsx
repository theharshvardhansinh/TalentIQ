
'use client';
import { useState, useEffect, use } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, ArrowRight, ArrowLeft, Trophy, Calendar, Quote, Star, CheckSquare, Zap } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import ContestTimer from '@/app/components/ContestTimer';

export default function ContestDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('loading');

    const QUOTES = [
        "Practice is the price of mastery.",
        "Code is like humor. When you have to explain it, it's bad.",
        "First, solve the problem. Then, write the code.",
        "Simplicity is the soul of efficiency.",
        "Make it work, make it right, make it fast."
    ];
    const [randomQuote, setRandomQuote] = useState(QUOTES[0]);

    useEffect(() => {
        setRandomQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        fetchContestDetails();
    }, [params.id]);

    useEffect(() => {
        if (!contest) return;
        // Derive status from contest timing
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);
        if (contest.isEnded || now >= end) setStatus('past');
        else if (now >= start) setStatus('live');
        else setStatus('upcoming');

        // Re-check every second so status transitions automatically
        const timer = setInterval(() => {
            const n = new Date();
            const s = new Date(contest.startTime);
            const e = new Date(contest.endTime);
            if (contest.isEnded || n >= e) setStatus('past');
            else if (n >= s) setStatus('live');
            else setStatus('upcoming');
        }, 1000);
        return () => clearInterval(timer);
    }, [contest]);



    const fetchContestDetails = async () => {
        try {
            const res = await fetch(`/api/contest/${params.id}/view`);
            const data = await res.json();
            if (data.success) {
                setContest(data.data);
                if (data.data.isEnded) {
                    setStatus('past');
                }
            }
        } catch (error) {
            console.error("Failed to fetch contest", error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
            case 'medium': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
            case 'hard': return 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/20';
            default: return 'text-[#94A3B8]/40 bg-[#1E293B]';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Contest Not Found</h1>
                    <Link href="/dashboard" className="text-[#3B82F6] hover:text-[#60A5FA]">Return to Dashboard</Link>
                </div>
            </div>
        );
    }



    // --- State 1: Upcoming (Secure Lobby) ---
    if (status === 'upcoming') {
        return (
            <div className="min-h-screen bg-[#0A0E1A] text-white flex flex-col items-center justify-center relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3B82F6]/6 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent" />

                <div className="relative z-10 text-center max-w-3xl mx-auto px-6 space-y-10">
                    {/* Badge */}
                    <div>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] rounded-full text-xs font-bold tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" /> Registered &bull; Waiting to Start
                        </span>
                    </div>

                    {/* Title */}
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-[#94A3B8] tracking-tight leading-none">
                            {contest.title}
                        </h1>
                        {contest.description && (
                            <p className="text-lg text-[#94A3B8]">{contest.description}</p>
                        )}
                    </div>

                    {/* Big Timer */}
                    <div className="bg-[#0d1117] border border-[#3B82F6]/10 rounded-2xl p-8 backdrop-blur-sm">
                        <ContestTimer
                            startTime={contest.startTime}
                            endTime={contest.endTime}
                            variant="fullscreen"
                        />
                        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-[#94A3B8]/50">
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(contest.startTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(contest.startTime).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                        </div>
                    </div>

                    {/* Lock message */}
                    <div className="bg-[#F59E0B]/8 border border-[#F59E0B]/20 p-4 rounded-xl flex items-start gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-[#F59E0B] font-bold text-sm">Problems are Locked</h3>
                            <p className="text-[#F59E0B]/60 text-sm mt-1">
                                The challenge list will unlock automatically when the countdown hits zero. Stay on this page — it will refresh live.
                            </p>
                        </div>
                    </div>

                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // --- State 2: Past Contest → redirect to dashboard ---
    if (status === 'past') {
        if (typeof window !== 'undefined') {
            window.location.replace('/dashboard');
        }
        return (
            <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
            </div>
        );
    }

    // --- State 3: Live Contest (Lobby) ---
    return (
        <div className="min-h-screen bg-[#0A0E1A] text-white selection:bg-[#3B82F6]/30">
            {/* Header */}
            <div className="border-b border-[#3B82F6]/10 bg-[#111827]/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                        </span>
                        <h1 className="text-lg font-bold text-white truncate">{contest.title}</h1>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <ContestTimer
                            endTime={contest.endTime}
                            startTime={contest.startTime}
                            variant="header"
                            onEnd={() => setStatus('past')}
                        />
                        <Link href="/dashboard">
                            <button className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
                                Exit Contest
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Problem List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold">Problems</h2>
                            <span className="text-[#94A3B8]/60 text-sm">{contest.problems.length} Challenges</span>
                        </div>

                        <div className="space-y-3">
                            {contest.problems.map((problem, index) => (
                                <div
                                    key={problem._id}
                                    className="group flex flex-col md:flex-row md:items-center justify-between bg-[#111827] border border-[#3B82F6]/8 p-5 rounded-xl hover:bg-[#1E293B] hover:border-[#3B82F6]/20 transition-all"
                                >
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        <div className="mt-1">
                                            {problem.userStatus === 'solved' && <CheckCircle2 className="w-6 h-6 text-[#10B981]" />}
                                            {problem.userStatus === 'attempted' && <div className="w-5 h-5 rounded-full border-2 border-[#F59E0B] bg-[#F59E0B]/20" />}
                                            {problem.userStatus === 'unsolved' && <Circle className="w-5 h-5 text-[#475569]" />}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-[#3B82F6] transition-colors">
                                                {index + 1}. {problem.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                                <span className="text-[#475569] font-mono">Score: 100</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/dashboard/student/contest/${contest._id}/problem/${problem.slug}`}>
                                        <button className="w-full md:w-auto px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-all shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-2 group-hover:translate-x-1">
                                            Solve Challenge <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                            {contest.problems.length === 0 && (
                                <div className="text-center py-20 bg-[#111827] rounded-xl border border-[#3B82F6]/10 border-dashed text-[#475569]">
                                    No problems added to this contest yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* ── Live Timer Card ── */}
                        <ContestTimer
                            endTime={contest.endTime}
                            startTime={contest.startTime}
                            variant="sidebar"
                            onEnd={() => setStatus('past')}
                        />

                        {/* ── Your Performance ── */}
                        <div className="bg-[#0d1117] border border-[#3B82F6]/10 rounded-xl p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                                <Trophy className="w-4 h-4 text-[#F59E0B]" /> Your Progress
                            </h3>
                            <div className="flex justify-between text-sm text-[#94A3B8]/60 mb-2">
                                <span>Solved</span>
                                <span className="font-bold text-white">{contest.userScore} <span className="text-[#475569] font-normal">/ {contest.totalProblems}</span></span>
                            </div>
                            <div className="w-full h-2 bg-[#0A0E1A] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#22D3EE] to-[#3B82F6] transition-all duration-1000 rounded-full"
                                    style={{ width: `${(contest.userScore / (contest.totalProblems || 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* ── Instructions ── */}
                        <div className="bg-[#0d1117] border border-[#3B82F6]/10 rounded-xl p-5">
                            <h4 className="font-bold text-[#3B82F6] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" /> Contest Rules
                            </h4>
                            <ul className="text-xs text-[#94A3B8] space-y-2">
                                {['Read problem statements carefully.', 'Input/Output formats must be exact.', 'Submit as many times as you like.', 'Plagiarism will lead to disqualification.'].map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-[#3B82F6] mt-0.5 font-bold">{i + 1}.</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>


                    </div>
                </div>
            </main>
        </div>
    );
}
