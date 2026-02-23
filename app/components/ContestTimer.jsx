'use client';
import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * ContestTimer Component
 *
 * Props:
 *   endTime    {string|Date} - Contest end time (ISO string or Date object)
 *   startTime  {string|Date} - Contest start time (for upcoming state)
 *   variant    {'sidebar'|'header'|'fullscreen'} - Display style
 *   onEnd      {function}  - Callback when timer hits 0
 */
export default function ContestTimer({ endTime, startTime, variant = 'sidebar', onEnd }) {
    const [timeData, setTimeData] = useState({ h: 0, m: 0, s: 0, total: 0 });
    const [phase, setPhase] = useState('live'); // 'upcoming' | 'live' | 'ended'
    const intervalRef = useRef(null);
    const onEndFired = useRef(false);

    const compute = () => {
        const now = Date.now();
        const end = new Date(endTime).getTime();
        const start = startTime ? new Date(startTime).getTime() : 0;

        if (now < start) {
            const dist = start - now;
            setPhase('upcoming');
            setTimeData(decompose(dist));
            return;
        }

        const dist = end - now;
        if (dist <= 0) {
            setPhase('ended');
            setTimeData({ h: 0, m: 0, s: 0, total: 0 });
            if (!onEndFired.current && onEnd) {
                onEndFired.current = true;
                onEnd();
            }
            return;
        }
        setPhase('live');
        setTimeData(decompose(dist));
    };

    const decompose = (ms) => {
        const total = Math.floor(ms / 1000);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return { h, m, s, total };
    };

    useEffect(() => {
        if (!endTime) return;
        compute();
        intervalRef.current = setInterval(compute, 1000);
        return () => clearInterval(intervalRef.current);
    }, [endTime, startTime]);

    const pad = (n) => String(n).padStart(2, '0');

    // Urgency thresholds
    const isUrgent = phase === 'live' && timeData.total <= 600; // ≤ 10 min
    const isCritical = phase === 'live' && timeData.total <= 120; // ≤ 2 min

    /* ── HEADER VARIANT (compact, shown in problem page top bar) ── */
    if (variant === 'header') {
        if (phase === 'ended') {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400 text-sm font-mono">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                    Ended
                </div>
            );
        }
        return (
            <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm transition-all
                    ${isCritical
                        ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse'
                        : isUrgent
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : 'bg-white/5 border border-white/10 text-white'
                    }`}
            >
                {isCritical
                    ? <AlertTriangle className="w-3.5 h-3.5" />
                    : <Clock className="w-3.5 h-3.5 opacity-70" />
                }
                <span className="tabular-nums">
                    {timeData.h > 0 && `${pad(timeData.h)}:`}{pad(timeData.m)}:{pad(timeData.s)}
                </span>
            </div>
        );
    }

    /* ── FULLSCREEN VARIANT (big centered, for lobby upcoming state) ── */
    if (variant === 'fullscreen') {
        const label = phase === 'upcoming' ? 'Starts In' : phase === 'ended' ? 'Contest Ended' : 'Time Remaining';
        return (
            <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-[0.25em] font-bold mb-3">{label}</p>
                <div className={`flex items-center justify-center gap-3 ${isCritical ? 'animate-pulse' : ''}`}>
                    {[
                        { val: timeData.h, label: 'HRS' },
                        { val: timeData.m, label: 'MIN' },
                        { val: timeData.s, label: 'SEC' },
                    ].map((unit, i) => (
                        <div key={i} className="flex items-center gap-3">
                            {i > 0 && (
                                <span className={`text-4xl font-bold mb-4 ${isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-slate-600'}`}>:</span>
                            )}
                            <div className={`flex flex-col items-center px-5 py-4 rounded-2xl border backdrop-blur-sm
                                ${isCritical
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : isUrgent
                                        ? 'bg-amber-500/10 border-amber-500/20'
                                        : 'bg-white/5 border-white/10'
                                }`}>
                                <span className={`text-5xl md:text-7xl font-mono font-black tabular-nums tracking-tight
                                    ${isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white'}`}>
                                    {pad(unit.val)}
                                </span>
                                <span className={`text-[10px] font-bold tracking-widest mt-2
                                    ${isCritical ? 'text-red-500/60' : isUrgent ? 'text-amber-500/60' : 'text-slate-600'}`}>
                                    {unit.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ── SIDEBAR VARIANT (card in the contest lobby sidebar) ── */
    return (
        <div className={`rounded-xl border overflow-hidden
            ${isCritical
                ? 'bg-red-500/10 border-red-500/30 animate-pulse'
                : isUrgent
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-[#0d1117] border-[#3B82F6]/15'
            }`}>
            {/* Top bar */}
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider
                ${isCritical
                    ? 'border-red-500/20 text-red-400'
                    : isUrgent
                        ? 'border-amber-500/15 text-amber-400'
                        : 'border-[#3B82F6]/10 text-[#3B82F6]'
                }`}>
                {isCritical ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {phase === 'ended' ? 'Contest Ended' : phase === 'upcoming' ? 'Starts In' : 'Time Remaining'}
            </div>

            {/* Digit blocks */}
            <div className="p-5">
                {phase === 'ended' ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Contest Finished</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        {[
                            { val: timeData.h, label: 'HRS' },
                            { val: timeData.m, label: 'MIN' },
                            { val: timeData.s, label: 'SEC' },
                        ].map((unit, i) => (
                            <div key={i} className="flex items-center gap-2">
                                {i > 0 && (
                                    <span className={`text-xl font-bold mb-3 ${isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-slate-600'}`}>:</span>
                                )}
                                <div className="flex flex-col items-center">
                                    <span className={`text-3xl font-mono font-black tabular-nums
                                        ${isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white'}`}>
                                        {pad(unit.val)}
                                    </span>
                                    <span className={`text-[9px] font-bold tracking-widest mt-0.5
                                        ${isCritical ? 'text-red-500/50' : isUrgent ? 'text-amber-500/50' : 'text-slate-600'}`}>
                                        {unit.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                {phase === 'live' && endTime && startTime && (
                    <div className="mt-4">
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000
                                    ${isCritical ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-[#3B82F6]'}`}
                                style={{
                                    width: `${Math.max(0, Math.min(100,
                                        (timeData.total / Math.floor((new Date(endTime) - new Date(startTime)) / 1000)) * 100
                                    ))}%`
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
