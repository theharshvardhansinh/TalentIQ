'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        try {
            const res = await fetch('/api/admin/volunteers');
            const data = await res.json();
            if (data.success) {
                setVolunteers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch volunteers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/volunteers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setFormData({ name: '', email: '', password: '' });
                fetchVolunteers();
            } else {
                alert(data.message || 'Error adding volunteer');
            }
        } catch (error) {
            console.error('Error adding volunteer', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Volunteer Management</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Volunteer
                </button>
            </div>

            {loading ? (
                <p className="text-gray-400">Loading volunteers...</p>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-5 font-semibold">Name</th>
                                <th className="p-5 font-semibold">Email</th>
                                <th className="p-5 font-semibold">Role</th>
                                <th className="p-5 font-semibold">Joined At</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {volunteers.map((vol) => (
                                <tr key={vol._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-5 font-medium text-white">{vol.name}</td>
                                    <td className="p-5 text-gray-400">{vol.email}</td>
                                    <td className="p-5"><span className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-semibold">{vol.role}</span></td>
                                    <td className="p-5 text-gray-500">{new Date(vol.createdAt).toLocaleDateString()}</td>
                                    <td className="p-5 text-right">
                                        <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {volunteers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">No volunteers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-white">Add New Volunteer</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input 
                                    type="password" 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••"
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
                                    Add Volunteer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
