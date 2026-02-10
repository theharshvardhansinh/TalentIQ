import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckCircle2,
  Code2,
  Cpu,
  Globe2,
  Sparkles,
  Terminal,
  Trophy,
  Users2,
  Target,
  Zap,
  Timer,
  Medal,
  Filter,
  Layers,
  Mail,
  MapPin
} from 'lucide-react';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  const sessionUser = session?.user;

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#E2E8F0] relative overflow-x-hidden selection:bg-[#3B82F6]/20 selection:text-[#3B82F6]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navbar */}
      <nav className="fixed w-full z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#3B82F6]/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#22D3EE] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#3B82F6] transition-colors">
                Talent IQ
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-semibold">
                Department Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {sessionUser ? (
              <Link href="/dashboard" className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-[#3B82F6] text-white font-semibold text-sm shadow-xl shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40 transition-all inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Dashboard
                  <ArrowRightIcon className="w-4 h-4" />
                </span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all mr-2 inline-block">
                  Sign In
                </Link>
                <Link href="/signup" className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-[#3B82F6] text-white font-semibold text-sm shadow-xl shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40 transition-all inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    Join Contest
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-48 lg:pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 text-[#3B82F6] text-sm font-medium animate-fade-in-up hover:border-[#3B82F6]/40 transition-colors cursor-default">
                <Trophy className="w-4 h-4 fill-current" />
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] bg-clip-text text-transparent">
                  Official Department Platform
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
                Dominate The <br />
                <span className="text-gradient-primary relative inline-block">
                  Coding Contest
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-[#3B82F6] opacity-30"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-[#94A3B8] leading-relaxed max-w-xl">
                Sharpen your problem-solving skills, prepare for campus placements, and compete with your batchmates in weekly department challenges.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={sessionUser ? "/dashboard" : "/login"} className="px-8 py-4 rounded-full text-white shadow-lg shadow-[#3B82F6]/25 hover:shadow-[#3B82F6]/40 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:scale-105 transition-all duration-200 font-bold flex items-center inline-flex">
                  Start Competing
                  <Terminal className="w-5 h-5 ml-2" />
                </Link>

                <button className="px-8 py-4 rounded-full border border-[#3B82F6]/20 hover:bg-[#3B82F6]/5 hover:border-[#3B82F6]/40 text-white group font-medium flex items-center transition-all bg-transparent">
                  <span className="mr-2 bg-[#3B82F6]/10 p-1 rounded-full group-hover:bg-[#3B82F6]/20 transition-colors">
                    <Globe2 className="w-4 h-4" />
                  </span>
                  Dept. Rankings
                </button>
              </div>

              <div className="pt-8 flex items-center gap-8 text-[#94A3B8]/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <span className="text-sm">Weekly Rounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <span className="text-sm">Internal Mock Tests</span>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative lg:h-[600px] flex items-center justify-center animate-float">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B82F6]/15 rounded-full blur-[100px] animate-pulse-glow"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#22D3EE]/10 rounded-full blur-[80px]"></div>

              <div className="relative w-full max-w-md aspect-square rounded-3xl border border-[#3B82F6]/10 bg-[#0A0E1A]/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-10 border-b border-white/10 bg-[#111827] flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F43F5E]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#10B981]/80"></div>
                    <div className="ml-4 text-xs text-white/30 font-mono">lab_test_practice.cpp</div>
                  </div>
                  <div className="flex-1 p-6 font-mono text-sm relative bg-[#111827]/50">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0E1A]/50 z-10"></div>
                    <div className="text-[#F43F5E]">
                      <span className="text-white/50">// Practice for upcoming Internal Lab Test</span><br />
                      <span className="text-[#3B82F6]">#include</span> &lt;bits/stdc++.h&gt;<br />
                      <span className="text-[#3B82F6]">using namespace</span> std;<br /><br />
                      <span className="text-[#22D3EE]">int</span> main() {"{"}
                    </div>
                    <div className="pl-4 text-white/80">
                      <span className="text-[#22D3EE]">ios::sync_with_stdio</span>(0);<br />
                      <span className="text-[#22D3EE]">cin.tie</span>(0);<br /><br />
                      <span className="text-[#3B82F6]">int</span> n;<br />
                      cin &gt;&gt; n;<br />
                      <span className="text-white/50">// Greedy Approach O(n log n)</span><br />
                      <span className="text-[#22D3EE]">solve</span>(n);
                    </div>
                    <div className="pl-4 mt-2 border-l-2 border-[#3B82F6]/50 pl-2 text-white/90 animate-pulse">
                      cout &lt;&lt; ans &lt;&lt; endl;
                    </div>
                    <div className="text-[#F43F5E]">{"}"}</div>

                    <div className="absolute bottom-8 right-8 glass-card p-4 rounded-xl flex items-center gap-3 animate-bounce shadow-xl z-20">
                      <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center border border-[#10B981]/30">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Test Case #10</div>
                        <div className="text-sm font-bold text-white">Accepted (0.005s)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] rounded-2xl blur-md opacity-50 rotate-12 group-hover:rotate-45 transition-transform duration-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pt-12 pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-white">
              Everything you need to <br />
              <span className="text-gradient-primary">Win</span>
            </h2>
            <p className="text-[#94A3B8] text-lg">
              From first-year basics to final-year interview prep, find the right challenges to level up your skills step-by-step.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Department Rankings", desc: "Compete against peers in your year and track your standing on the college leaderboard.", icon: Trophy, gradient: "from-[#22D3EE] to-[#06B6D4]" },
              { title: "Real-time Editor", desc: "Advanced IDE with intelligent completion and instant test-case validation.", icon: Code2, gradient: "from-[#3B82F6] to-[#2563EB]" },
              { title: "Performance Stats", desc: "Detailed analysis of your speed, accuracy, and weak topics after every contest.", icon: Globe2, gradient: "from-[#F59E0B] to-[#D97706]" },
              { title: "Topic-wise Filtering", desc: "Practice specific areas like Arrays, Linked Lists, or Dynamic Programming based on your syllabus.", icon: Filter, gradient: "from-[#10B981] to-[#059669]" },
              { title: "Year-Specific Problem Sets", desc: "Access tailored question banks curated specifically for 1st, 2nd, and 3rd-year student difficulty levels.", icon: Layers, gradient: "from-[#F43F5E] to-[#E11D48]" },
              { title: "Cheat Detection", desc: "State-of-the-art plagiarism check ensures a fair playing field for everyone.", icon: CheckCircle2, gradient: "from-[#3B82F6] to-[#22D3EE]" },
            ].map((feature, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#94A3B8] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 border-t border-[#3B82F6]/5 bg-[#111827]/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-[#3B82F6]/5 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">Email Us</h3>
                <a href="mailto:techtriquetra@gmail.com" className="text-[#94A3B8] hover:text-[#3B82F6] transition-colors">techtriquetra@gmail.com</a>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-4 hover:bg-[#22D3EE]/5 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">Visit Lab</h3>
                <p className="text-[#94A3B8]">F-Block, Computer Dept.<br />BVM Engineering College</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3B82F6]/10 bg-[#0A0E1A] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Talent IQ</span>
              </div>
              <p className="text-[#94A3B8]/70 text-sm leading-relaxed mb-6">
                The official coding platform for the Computer Engineering Department, designed to foster technical growth and coding culture on campus.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Contests", "Problem Set", "Rankings", "Learn"] },
              { title: "Community", links: ["Blog", "Student Forum", "Notice Board", "Events"] },
              { title: "Legal", links: ["Privacy", "Terms", "Lab Guidelines", "Rules"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-white mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-[#94A3B8]/60 hover:text-[#3B82F6] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#3B82F6]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#94A3B8]/50">© 2026 Talent IQ. BVM Engineering College. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[#94A3B8]/50 hover:text-[#3B82F6] transition-colors">Twitter</a>
              <a href="#" className="text-[#94A3B8]/50 hover:text-[#3B82F6] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
