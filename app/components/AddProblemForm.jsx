
'use client';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Code2, Save } from 'lucide-react';

export default function AddProblemForm({ contestId, onSuccess, initialData = null, problemId = null }) {
    const isEditMode = !!problemId;
    const [loading, setLoading] = useState(false);
    const [testCases, setTestCases] = useState([{ input: '', output: '', isPublic: false }]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        constraints: '',
        tags: '',
        inputFormat: '',
        outputFormat: ''
    });

    // Initialize with data if in edit mode
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                difficulty: initialData.difficulty || 'Medium',
                constraints: initialData.constraints || '',
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
                inputFormat: initialData.inputFormat || '',
                outputFormat: initialData.outputFormat || ''
            });
            if (initialData.testCases && initialData.testCases.length > 0) {
                setTestCases(initialData.testCases);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newCases = [...testCases];
        newCases[index][field] = value;
        setTestCases(newCases);
    };

    const addTestCase = () => {
        if (testCases.length < 5) {
            setTestCases([...testCases, { input: '', output: '', isPublic: false }]);
        }
    };

    const removeTestCase = (index) => {
        if (testCases.length > 1) {
            setTestCases(testCases.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare payload
        const payload = {
            contestId, // Only used for POST (Add)
            ...formData,
            testCases: testCases.filter(tc => tc.input.trim() && tc.output.trim()), // Filter empty
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            const url = isEditMode ? `/api/problem/manage/${problemId}` : '/api/problem/add';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                if (onSuccess) onSuccess();
                alert(isEditMode ? 'Problem updated successfully!' : 'Problem added successfully!');

                if (!isEditMode) {
                    // Reset only if adding new
                    setFormData({
                        title: '',
                        description: '',
                        difficulty: 'Medium',
                        constraints: '',
                        tags: '',
                        inputFormat: '',
                        outputFormat: ''
                    });
                    setTestCases([{ input: '', output: '', isPublic: false }]);
                }
            } else {
                alert(data.error || 'Failed to save problem');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-white/10 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                {isEditMode ? 'Edit Problem' : 'Add Problem to Contest'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Problem Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 font-mono text-sm"
                        placeholder="Problem statement..."
                        required
                    />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Difficulty</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="Arrays, DP, Graph"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Constraints</label>
                    <textarea
                        name="constraints"
                        value={formData.constraints}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 font-mono text-sm"
                        placeholder="1 <= N <= 10^5"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Input Format</label>
                    <textarea
                        name="inputFormat"
                        value={formData.inputFormat}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 font-mono text-sm"
                        placeholder="The first line contains..."
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Output Format</label>
                    <textarea
                        name="outputFormat"
                        value={formData.outputFormat}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 font-mono text-sm"
                        placeholder="Print the answer..."
                    />
                </div>

            </div>

            <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-200">Test Cases</h4>
                    <button
                        type="button"
                        onClick={addTestCase}
                        disabled={testCases.length >= 10}
                        className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded hover:bg-indigo-500/20 disabled:opacity-50"
                    >
                        + Add Case ({testCases.length}/10)
                    </button>
                </div>

                <div className="space-y-4">
                    {testCases.map((tc, index) => (
                        <div key={index} className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-lg relative group">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Input</label>
                                <textarea
                                    value={tc.input}
                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white h-16"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1 block">Expected Output</label>
                                <textarea
                                    value={tc.output}
                                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white h-16"
                                    required
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`public-${index}`}
                                        checked={tc.isPublic || false}
                                        onChange={(e) => handleTestCaseChange(index, 'isPublic', e.target.checked)}
                                        className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`public-${index}`} className="text-xs text-slate-400 select-none cursor-pointer">Mark as Public Example</label>
                                </div>
                            </div>
                            {testCases.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTestCase(index)}
                                    className="absolute -top-2 -right-2 bg-red-500/20 text-red-400 p-1 rounded-full hover:bg-red-500/40"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 shadow-lg ${isEditMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'}`}
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                    <span className="flex items-center gap-2">
                        {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isEditMode ? 'Update Problem' : 'Add Problem'}
                    </span>
                )}
            </button>
        </form>
    );
}
