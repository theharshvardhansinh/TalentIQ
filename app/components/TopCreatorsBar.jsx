import React from 'react';
import { Heart, Code2 } from 'lucide-react';

export default function TopCreatorsBar() {
  return (
    <div className="w-full bg-[#0A0E1A]/90 backdrop-blur-xl border-y border-white/10 py-2.5 px-4 flex items-center justify-center relative overflow-hidden group">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-indigo-600/10 opacity-70 blur-md pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
        {/* Left Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-wider uppercase shadow-inner">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          <span>by</span>
        </div>

        {/* Creator Names with Glass Capsules */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-extrabold tracking-wide">
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 hover:from-cyan-300 hover:to-blue-400 transition-all hover:scale-105 cursor-default shadow-sm">
            Dharmik Kumbhani
          </span>
          <span className="text-cyan-500 font-bold">•</span>
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 hover:from-cyan-300 hover:to-blue-400 transition-all hover:scale-105 cursor-default shadow-sm">
            Harshvardhansinh Parmar
          </span>
          <span className="text-cyan-500 font-bold">•</span>
          <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 hover:from-cyan-300 hover:to-blue-400 transition-all hover:scale-105 cursor-default shadow-sm">
            Vrund Patel
          </span>
        </div>
      </div>
    </div>
  );
}
