
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, Loader2, X, Edit3 } from 'lucide-react';
import AddProblemForm from '@/app/components/AddProblemForm';

export default function EditContestPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const router = useRouter();

    // Core State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contest, setContest] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
    });

    // Problem Management State
    const [selectedProblems, setSelectedProblems] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingProblemId, setEditingProblemId] = useState(null);
    const [editingProblemData, setEditingProblemData] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(false);

    // Fetch Contest Details on Load and Refresh
    const fetchContest = async () => {
        try {
            const res = await fetch(`/api/contest/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setContest(data.data);

                const formatForInput = (iso) => {
                    if (!iso) return '';
                    return new Date(iso).toISOString().slice(0, 16);
                };

                setFormData({
                    title: data.data.title,
                    description: data.data.description,
                    startTime: formatForInput(data.data.startTime),
                    endTime: formatForInput(data.data.endTime),
                });

                setSelectedProblems(data.data.problems || []);
            }
        } catch (error) {
            console.error("Failed to load contest", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContest();
    }, [params.id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRemoveProblem = (problemId) => {
        if (!confirm("Are you sure you want to remove this problem from the list? (It will not be deleted from the database)")) return;
        setSelectedProblems(prev => prev.filter(p => p._id !== problemId));
    };

    const handleSaveContest = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                problems: selectedProblems.map(p => p._id)
            };

            const res = await fetch(`/api/contest/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert("Contest updated successfully!");
                router.push('/dashboard/volunteer');
            } else {
                alert(data.error || "Failed to update");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving contest");
        } finally {
            setSaving(false);
        }
    };

    // --- Problem Modal Handlers ---

    const openAddProblemModal = () => {
        setModalMode('add');
        setEditingProblemId(null);
        setEditingProblemData(null);
        setIsModalOpen(true);
    };

    const openEditProblemModal = async (problemId) => {
        setModalMode('edit');
        setEditingProblemId(problemId);
        setIsModalOpen(true);
        setLoadingProblem(true);

        try {
            const res = await fetch(`/api/problem/manage/${problemId}`);
            const data = await res.json();
            if (data.success) {
                setEditingProblemData(data.data);
            } else {
                alert("Failed to load problem details");
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error fetching problem", error);
            alert("Error loading problem");
            setIsModalOpen(false);
        } finally {
            setLoadingProblem(false);
        }
    };

    const handleProblemSaved = () => {
        setIsModalOpen(false);
        fetchContest(); // Refresh list to see new/updated problem
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    }

    if (!contest) return <div className="text-white p-10">Contest not found</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/volunteer" className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Edit Contest</h1>
                            <p className="text-slate-400 text-sm">Update details and manage problems</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/volunteer">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium rounded-lg transition-colors border border-white/10 text-sm">
                                Cancel
                            </button>
                        </Link>
                        <button
                            onClick={handleSaveContest}
                            disabled={saving}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Contest Details Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full" /> Basic Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Contest Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                        placeholder="e.g. Weekly Code Sprint #42"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                                        placeholder="Describe the contest..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                                        <input
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Problem Management */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full" /> Problems
                                </h2>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">{selectedProblems.length} Selected</span>
                            </div>

                            {/* Problem List */}
                            <div className="flex-1 space-y-3 mb-6 max-h-[500px] overflow-y-auto">
                                {selectedProblems.length > 0 ? (
                                    selectedProblems.map((problem, idx) => (
                                        <div key={problem._id} className="group bg-[#111] border border-white/10 rounded-lg p-3 flex items-center justify-between hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-3 w-full overflow-hidden">
                                                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="truncate flex-1">
                                                    <div className="text-sm font-medium text-slate-300 truncate" title={problem.title}>{problem.title || `Problem ${problem.slug || 'Unknown'}`}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase">{problem.difficulty}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditProblemModal(problem._id)}
                                                    className="text-slate-500 hover:text-indigo-400 p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                    title="Edit Problem"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveProblem(problem._id)}
                                                    className="text-slate-600 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                                    title="Remove from List"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 text-sm border border-white/5 border-dashed rounded-lg">
                                        No problems added yet.
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={openAddProblemModal}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-indigo-400 font-medium rounded-xl border border-indigo-500/20 border-dashed hover:border-indigo-500/40 transition-all flex items-center justify-center gap-2 text-sm group"
                            >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add Problem
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Add/Edit Problem Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#161616] border border-white/10 w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                            <h3 className="font-bold text-lg text-white">
                                {modalMode === 'add' ? 'Create New Problem' : 'Edit Problem'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
                            {loadingProblem ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                // Use the modified AddProblemForm
                                // If mode is 'edit', we pass problemId and initialData
                                <AddProblemForm
                                    contestId={params.id}
                                    onSuccess={handleProblemSaved}
                                    problemId={modalMode === 'edit' ? editingProblemId : null}
                                    initialData={modalMode === 'edit' ? editingProblemData : null}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
