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
                <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/20 to-[#22D3EE]/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl" />
                <div className="relative p-6 rounded-2xl bg-[#111827] border border-[#3B82F6]/10 overflow-hidden backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#94A3B8] mb-1">Total Problems Solved</p>
                            <h3 className="text-3xl font-bold text-white mb-2">{solvedCount}</h3>
                            <div className="flex items-center gap-2 text-sm text-[#10B981]">
                                <Zap className="w-4 h-4" />
                                <span>Keep up the streak!</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-[#3B82F6]" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
