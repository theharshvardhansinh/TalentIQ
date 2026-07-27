import Link from 'next/link';
import {
  Trophy,
  Terminal,
  Globe2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Hero({ sessionUser }) {
  return (
    <section className="relative pt-44 pb-12 lg:pt-52 lg:pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium animate-fade-in-up hover:border-primary/40 transition-colors cursor-default">
                <Trophy className="w-4 h-4 fill-current" />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Official Department Platform
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
                Dominate The <br />
                <span className="text-gradient-primary relative inline-block">
                  Coding Contest
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-30"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                Sharpen your problem-solving skills, prepare for campus placements, and compete with your batchmates in weekly department challenges.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={sessionUser ? "/dashboard" : "/login"} className="px-8 py-4 rounded-full text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all duration-200 font-bold flex items-center inline-flex">
                  Start Competing
                  <Terminal className="w-5 h-5 ml-2" />
                </Link>

                <button className="px-8 py-4 rounded-full border border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-white group font-medium flex items-center transition-all bg-transparent">
                  <span className="mr-2 bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Globe2 className="w-4 h-4" />
                  </span>
                  Dept. Rankings
                </button>
              </div>

              <div className="pt-8 flex items-center gap-8 text-slate-400/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Weekly Rounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Internal Mock Tests</span>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative lg:h-[600px] flex items-center justify-center animate-float">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse-glow"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]"></div>

              <div className="relative w-full max-w-md aspect-square rounded-3xl border border-primary/10 bg-[#0A0E1A]/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-10 border-b border-white/10 bg-[#111827] flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <div className="ml-4 text-xs text-white/30 font-mono">lab_test_practice.cpp</div>
                  </div>
                  <div className="flex-1 p-6 font-mono text-sm relative bg-[#111827]/50">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0E1A]/50 z-10"></div>
                    <div className="text-rose-500">
                      <span className="text-white/50">// Practice for upcoming Internal Lab Test</span><br />
                      <span className="text-primary">#include</span> &lt;bits/stdc++.h&gt;<br />
                      <span className="text-primary">using namespace</span> std;<br /><br />
                      <span className="text-secondary">int</span> main() {"{"}
                    </div>
                    <div className="pl-4 text-white/80">
                      <span className="text-secondary">ios::sync_with_stdio</span>(0);<br />
                      <span className="text-secondary">cin.tie</span>(0);<br /><br />
                      <span className="text-primary">int</span> n;<br />
                      cin &gt;&gt; n;<br />
                      <span className="text-white/50">// Greedy Approach O(n log n)</span><br />
                      <span className="text-secondary">solve</span>(n);
                    </div>
                    <div className="pl-4 mt-2 border-l-2 border-primary/50 pl-2 text-white/90 animate-pulse">
                      cout &lt;&lt; ans &lt;&lt; endl;
                    </div>
                    <div className="text-rose-500">{"}"}</div>

                    <div className="absolute bottom-8 right-8 glass-card p-4 rounded-xl flex items-center gap-3 animate-bounce shadow-xl z-20">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Test Case #10</div>
                        <div className="text-sm font-bold text-white">Accepted (0.005s)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-md opacity-50 rotate-12 group-hover:rotate-45 transition-transform duration-700"></div>
            </div>
          </div>
        </div>
      </section>
  );
}
