'use client';
import { useState, useEffect } from 'react';
import { Trophy, Search, Key, X, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordSuccess('');
        setIsModalOpen(true);
    };

    const closePasswordModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        if (newPassword.length < 4) {
            setPasswordError("Password must be at least 4 characters");
            return;
        }
        
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser._id, newPassword })
            });

            const data = await res.json();
            
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to change password');
            }

            setPasswordSuccess('Password successfully changed!');
            setTimeout(() => {
                closePasswordModal();
            }, 2000);
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setPasswordLoading(false);
        }
    };

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
                                <th className="p-5 font-semibold text-center">Unique Problems Solved</th>
                                <th className="p-5 font-semibold text-center">Performance</th>
                                <th className="p-5 font-semibold text-center">Actions</th>
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
                                    <td className="p-5 text-center">
                                        <button onClick={() => openPasswordModal(participant)} className="px-3 py-1.5 text-xs rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/20 font-semibold transition-colors flex items-center justify-center gap-1 mx-auto">
                                            <Key className="w-3.5 h-3.5" />
                                            Change Password
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredParticipants.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500">No participants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#111827] border border-[#3B82F6]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button onClick={closePasswordModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h2 className="text-xl font-bold text-white mb-2">Change Password</h2>
                        <p className="text-sm text-gray-400 mb-6">Changing password for <span className="text-[#3B82F6] font-medium">{selectedUser.name}</span></p>

                        {passwordError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{passwordError}</div>}
                        {passwordSuccess && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">{passwordSuccess}</div>}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={passwordLoading}
                                className="w-full py-2.5 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center mt-2"
                            >
                                {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
