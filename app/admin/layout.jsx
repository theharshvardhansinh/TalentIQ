'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Trophy, LogOut, Sparkles } from 'lucide-react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Volunteers', href: '/admin/volunteers', icon: Users },
        { name: 'Contests', href: '/admin/contests', icon: Calendar },
        { name: 'Participants', href: '/admin/participants', icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="flex relative z-10 min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 fixed h-full border-r border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="p-6 border-b border-white/10 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">CodeArena</span>
                    </div>
                    
                    <nav className="mt-6 px-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                                        isActive 
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="absolute bottom-0 w-64 p-6 border-t border-white/10">
                        <button className="flex items-center text-gray-400 hover:text-red-400 transition-colors w-full px-4 py-2 rounded-xl hover:bg-red-500/10 group">
                            <LogOut className="w-5 h-5 mr-3 group-hover:text-red-400" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64">
                    <header className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-20 px-8 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                            {navigation.find((item) => item.href === pathname)?.name || 'Admin'}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 border border-white/10">
                                A
                            </div>
                        </div>
                    </header>
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
