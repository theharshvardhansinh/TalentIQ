import Link from 'next/link';
import { Sparkles, ArrowRightIcon } from 'lucide-react';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { redirect } from 'next/navigation';
import Hero from './components/home/Hero';
import Footer from './components/home/Footer';
import TopCreatorsBar from './components/TopCreatorsBar';

export const metadata = {
  title: 'Talent IQ - Computer Department Contest Platform',
  description: 'Official coding platform for BVM Engineering College Computer Department. Participate in weekly contests, track your rankings, and improve your skills.',
};

export default async function Home() {
  const session = await getSession();
  const sessionUser = session?.user;

  // Prevent student from browsing the home page if they are in an active contest
  if (sessionUser && sessionUser.role === 'student') {
      await dbConnect();
      const activeContest = await Contest.findOne({
          registeredUsers: sessionUser.id || sessionUser._id,
          exitedUsers: { $ne: sessionUser.id || sessionUser._id },
          startTime: { $lte: new Date() },
          endTime: { $gt: new Date() }
      });

      if (activeContest) {
          redirect(`/contest/${activeContest._id}`);
      }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-primary transition-colors">
                Talent IQ
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                Department Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {sessionUser ? (
              <Link href="/dashboard" className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-primary text-white font-semibold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Dashboard
                  <ArrowRightIcon className="w-4 h-4" />
                </span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2.5 rounded-full text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all mr-2 inline-block">
                  Sign In
                </Link>
                <Link href="/signup" className="relative group px-6 py-2.5 rounded-full overflow-hidden bg-primary text-white font-semibold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    Join Contest
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
        <TopCreatorsBar />
      </nav>

      <Hero sessionUser={sessionUser} />
      <Footer />
    </div>
  );
}
