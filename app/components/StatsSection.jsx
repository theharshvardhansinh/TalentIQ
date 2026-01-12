'use client';

import { Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsSection({ solvedCount }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="col-span-1 md:col-span-2 relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl" />
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Total Problems Solved</p>
                            <h3 className="text-3xl font-bold text-white mb-2">{solvedCount}</h3>
                            <div className="flex items-center gap-2 text-sm text-emerald-400">
                                <Zap className="w-4 h-4" />
                                <span>Keep up the streak!</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-violet-400" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
