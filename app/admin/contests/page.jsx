'use client';
import { useState, useEffect } from 'react';
import { Plus, Clock, FileQuestion, Calendar as CalendarIcon } from 'lucide-react';

export default function ContestsPage() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        questionCount: 5
    });

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const res = await fetch('/api/admin/contests');
            const data = await res.json();
            if (data.success) {
                setContests(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch contests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/contests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setFormData({ title: '', description: '', startTime: '', endTime: '', questionCount: 5 });
                fetchContests();
            } else {
                alert(data.message || 'Error creating contest');
            }
        } catch (error) {
            console.error('Error creating contest', error);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'scheduled': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'ongoing': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'completed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Contest Management</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" /> Create Contest
                </button>
            </div>

            {loading ? (
                <p className="text-gray-400">Loading contests...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => (
                        <div key={contest._id} className="relative group bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            {/* Hover Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">{contest.title}</h3>
                                    <span className={`px-2.5 py-1 text-xs rounded-full uppercase font-bold border shadow-sm ${getStatusColor(contest.status)}`}>
                                        {contest.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px] group-hover:text-gray-300 transition-colors">{contest.description || 'No description provided.'}</p>
                                
                                <div className="space-y-3 text-sm text-gray-500 border-t border-white/5 pt-4 group-hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3 group-hover:text-gray-400 transition-colors">
                                        <CalendarIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group-hover:text-gray-400 transition-colors">
                                        <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                                        <span>{new Date(contest.startTime).toLocaleTimeString()} - {new Date(contest.endTime).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group-hover:text-gray-400 transition-colors">
                                        <FileQuestion className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                        <span>{contest.questionCount} Questions</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {contests.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-500 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            No contests scheduled yet.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-white">Create New Contest</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Weekly Code Sprint #5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Contest details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Number of Questions</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    value={formData.questionCount}
                                    onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
                                >
                                    Create Contest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
