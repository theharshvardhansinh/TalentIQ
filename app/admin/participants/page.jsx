'use client';
import { useState, useEffect } from 'react';
import { Trophy, Search } from 'lucide-react';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const res = await fetch('/api/admin/participants');
            const data = await res.json();
            if (data.success) {
                setParticipants(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch participants', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Participants & Performance</h1>
                <div className="relative group">
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-72 text-white placeholder-gray-600 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <p className="text-gray-400">Loading participants...</p>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold">Rank</th>
                                <th className="p-5 font-semibold">Student Name</th>
                                <th className="p-5 font-semibold">Email</th>
                                <th className="p-5 font-semibold text-center">Problems Solved</th>
                                <th className="p-5 font-semibold text-center">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredParticipants.map((participant, index) => (
                                <tr key={participant._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-5 font-medium text-indigo-400">#{index + 1}</td>
                                    <td className="p-5 font-medium text-white">{participant.name}</td>
                                    <td className="p-5 text-gray-400">{participant.email}</td>
                                    <td className="p-5 text-center font-bold text-white text-lg">{participant.solvedCount}</td>
                                    <td className="p-5 text-center">
                                        {participant.solvedCount > 0 ? (
                                            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">Active</span>
                                        ) : (
                                            <span className="px-3 py-1 text-xs rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 font-semibold uppercase">No Data</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredParticipants.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">No participants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
