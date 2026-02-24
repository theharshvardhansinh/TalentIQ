'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Trophy, LogOut, Sparkles, Menu, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Volunteers', href: '/admin/volunteers', icon: Users },
        { name: 'Contests', href: '/admin/contests', icon: Calendar },
        { name: 'Participants', href: '/admin/participants', icon: Trophy },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-white selection:bg-[#3B82F6]/30 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#3B82F6]/8 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#22D3EE]/5 blur-[120px]" />
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full bg-[#3B82F6]/3 blur-[80px]" />
            </div>

            <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-50" />

            <div className="flex relative z-10 min-h-screen">
                {/* Sidebar */}
                <aside className="w-72 fixed h-full border-r border-[#3B82F6]/5 bg-[#0A0E1A]/40 backdrop-blur-xl hidden md:flex flex-col">
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20 ring-1 ring-white/10">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-[#94A3B8] bg-clip-text text-transparent">Talent IQ</h1>
                                <p className="text-xs text-[#94A3B8]/60 font-medium">Administration</p>
                            </div>
                        </div>
                    </div>
                    
                    <nav className="mt-8 px-4 space-y-2 flex-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                                        isActive 
                                        ? 'bg-[#3B82F6]/10 text-[#3B82F6]' 
                                        : 'text-[#94A3B8]/60 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`w-5 h-5 mr-3 z-10 transition-colors ${isActive ? 'text-[#3B82F6]' : 'group-hover:text-[#3B82F6]'}`} />
                                    <span className="font-medium text-sm z-10">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-6 border-t border-[#3B82F6]/5">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center text-[#94A3B8]/60 hover:text-[#F43F5E] transition-colors w-full px-4 py-3 rounded-xl hover:bg-[#F43F5E]/5 group border border-transparent hover:border-[#F43F5E]/10"
                        >
                            <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
