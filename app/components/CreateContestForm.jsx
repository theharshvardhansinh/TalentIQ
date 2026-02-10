'use client';
import { useState } from 'react';
import { Loader2, Calendar, Layout, Users, FileQuestion, Clock, Check } from 'lucide-react';

export default function CreateContestForm({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        questionCount: 5,
        yearLevel: ['All']
    });

    const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'All'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearToggle = (year) => {
        setFormData(prev => {
            const current = [...prev.yearLevel];
            
            if (year === 'All') {
                return { ...prev, yearLevel: ['All'] };
            }

            // If selecting a specific year, first remove 'All' if it exists
            let newYears = current.filter(y => y !== 'All');

            if (newYears.includes(year)) {
                newYears = newYears.filter(y => y !== year);
            } else {
                newYears.push(year);
            }

            // If no years left, default back to 'All'
            if (newYears.length === 0) return { ...prev, yearLevel: ['All'] };

            return { ...prev, yearLevel: newYears };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/contest/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                if (onSuccess) onSuccess(data.data);
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    questionCount: 5,
                    yearLevel: ['All']
                });
            } else {
                alert(data.error || 'Failed to create contest');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Create New Contest</h2>
                <p className="text-slate-400 text-sm">Fill in the details to schedule a new coding challenge.</p>
            </div>

            <div className="space-y-6">
                {/* Title Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Contest Title</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Layout className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-white/20 transition-all outline-none"
                            placeholder="e.g. Weekly Contest #5"
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-white/20 transition-all outline-none h-32 resize-none"
                        placeholder="Provide brief details about the contest rules and topics..."
                    />
                </div>

                {/* Time Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-white/20 transition-all outline-none [color-scheme:dark]"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-white/20 transition-all outline-none [color-scheme:dark]"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
                        <div className="flex flex-wrap gap-2">
                            {yearOptions.map(year => {
                                const isSelected = formData.yearLevel.includes(year);
                                return (
                                    <button
                                        type="button"
                                        key={year}
                                        onClick={() => handleYearToggle(year)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                                : 'bg-black/50 text-slate-400 border-white/10 hover:bg-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        {year}
                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Total Questions</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileQuestion className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="number"
                                name="questionCount"
                                value={formData.questionCount}
                                onChange={handleChange}
                                min="1"
                                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-white/20 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Create Contest
                            <ArrowUpRightIcon className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

function ArrowUpRightIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
        </svg>
    )
}
