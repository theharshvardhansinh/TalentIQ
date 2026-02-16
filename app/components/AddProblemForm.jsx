
'use client';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Code2, Save, Sparkles, Camera, Eye, Edit2 } from 'lucide-react';

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
        outputFormat: '',
        starterCode: {
            cpp: '',
            java: '',
            python: '',
            javascript: ''
        }
    });
    const [activeTab, setActiveTab] = useState('cpp');
    const [aiPrompt, setAiPrompt] = useState('');
    const [platform, setPlatform] = useState('custom');
    const [leetcodeTitle, setLeetcodeTitle] = useState('');
    const [cfContestId, setCfContestId] = useState('');
    const [cfIndex, setCfIndex] = useState('');
    const [codechefUrl, setCodechefUrl] = useState(''); // New state for CodeChef URL

    const [generating, setGenerating] = useState(false);
    const [botLoading, setBotLoading] = useState(false);
    const [descTab, setDescTab] = useState('write'); // 'write' | 'preview'

    const handleBotImport = async () => {
        let problemUrl = '';
        let problemIdentifier = '';

        if (platform === 'codeforces') {
            if (!cfContestId.trim() || !cfIndex.trim()) {
                alert("Please enter Contest ID and Index");
                return;
            }
            problemUrl = `https://codeforces.com/problemset/problem/${cfContestId}/${cfIndex}`;
            problemIdentifier = `Problem ${cfContestId}${cfIndex}`;


        } else if (platform === 'leetcode') {
            if (!leetcodeTitle.trim()) {
                alert("Please enter LeetCode Title or URL");
                return;
            }
            const inputVal = leetcodeTitle.trim();
            if (inputVal.startsWith('http')) {
                problemUrl = inputVal;
                // Try to extract slug
                const match = problemUrl.match(/problems\/([^/]+)/);
                const slug = match ? match[1] : 'Unknown';
                problemIdentifier = `LeetCode ${slug}`;
            } else {
                // Formatting "Two Sum" -> "two-sum"
                let cleanedTitle = inputVal.replace(/^\d+\.\s*/, '');
                const slug = cleanedTitle.toLowerCase().replace(/\s+/g, '-');
                problemUrl = `https://leetcode.com/problems/${slug}/`;
                problemIdentifier = `LeetCode ${cleanedTitle}`;
                // LeetCode URLs usually end with slash
            }
        } else {
            return;
        }

        setBotLoading(true);
        try {
            // Call the local bot server (make sure server.js is running on port 5000)
            const res = await fetch('/api/bot/screenshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: problemUrl, platform })
            });

            const data = await res.json();

            if (data.success) {
                // Determine if title is already set, if not try to build one
                const currentTitle = formData.title || problemIdentifier;

                // Append the image to the description
                const imageMarkdown = `![Problem Screenshot](${data.imageUrl})`;
                const newDescription = formData.description
                    ? `${formData.description}\n\n${imageMarkdown}`
                    : imageMarkdown;

                // 2. Call Gemini to analyze the image and generate test cases
                let extractedData = {};
                try {
                    const aiPayload = { imageUrl: data.imageUrl, platform };
                    const aiRes = await fetch('/api/generate-problem', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(aiPayload)
                    });
                    const aiData = await aiRes.json();
                    if (aiData.success && aiData.problem) {
                        extractedData = aiData.problem;
                    }
                } catch (e) {
                    console.error("AI Analysis failed:", e);
                }

                setFormData(prev => ({
                    ...prev,
                    title: extractedData.title || currentTitle,
                    description: newDescription,
                    difficulty: extractedData.difficulty || 'Medium',
                    constraints: extractedData.constraints || '',
                    tags: Array.isArray(extractedData.tags) ? extractedData.tags.join(', ') : '',
                    inputFormat: extractedData.inputFormat || '',
                    outputFormat: extractedData.outputFormat || '',
                    starterCode: extractedData.starterCode || { cpp: '', java: '', python: '', javascript: '' }
                }));

                if (extractedData.testCases) {
                    setTestCases(extractedData.testCases);
                }

                setDescTab('preview'); // Switch to preview to show the image immediately
                alert("Screenshot captured and analyzed by AI!");
            } else {
                alert(data.error || "Failed to capture screenshot.");
            }
        } catch (error) {
            console.error("Bot Error:", error);
            alert("Failed to connect to bot API.");
        } finally {
            setBotLoading(false);
        }
    };

    const handleScrape = async () => {
        if (!codechefUrl.trim()) {
            alert("Please enter a CodeChef URL");
            return;
        }

        setBotLoading(true);
        try {
            const res = await fetch('/api/bot/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: codechefUrl, platform: 'codechef', useAI: true })
            });

            const data = await res.json();

            if (data.success && data.problem) {
                const { problem } = data;
                setFormData(prev => ({
                    ...prev,
                    title: problem.title || '',
                    description: problem.description || '', // This might be HTML/text mix
                    difficulty: problem.difficulty || 'Medium', // specific difficulty scraping is hard, default to Medium
                    constraints: problem.constraints || '',
                    tags: problem.tags ? (Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags) : 'CodeChef',
                    inputFormat: problem.inputFormat || '',
                    outputFormat: problem.outputFormat || '',
                    starterCode: { cpp: '', java: '', python: '', javascript: '' }
                }));

                // Heuristic for difficulty if available in tags
                // (skipped for now as it's complex)

                if (problem.testCases && problem.testCases.length > 0) {
                    // Map to form format
                    setTestCases(problem.testCases.map(tc => ({
                        input: tc.input || '',
                        output: tc.output || '',
                        isPublic: true
                    })));
                }

                alert("Problem scraped successfully! Please review the details.");
            } else {
                alert(data.error || "Failed to scrape problem.");
            }
        } catch (error) {
            console.error("Scrape Error:", error);
            alert("Failed to connect to scraping API.");
        } finally {
            setBotLoading(false);
        }
    };


    const generateWithAI = async () => {
        let payload = {};
        if (platform === 'custom') {
            if (!aiPrompt.trim()) return;
            payload = { prompt: aiPrompt, platform: 'custom' };
        } else if (platform === 'leetcode') {
            if (!leetcodeTitle.trim()) return;
            payload = { prompt: leetcodeTitle, platform: 'leetcode' };
        } else if (platform === 'codeforces') {
            if (!cfContestId.trim() || !cfIndex.trim()) return;
            payload = { contestId: cfContestId, index: cfIndex, platform: 'codeforces' };

        }

        setGenerating(true);
        try {
            const res = await fetch('/api/generate-problem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                const { problem } = data;
                setFormData({
                    title: problem.title || '',
                    description: problem.description || '',
                    difficulty: problem.difficulty || 'Medium',
                    constraints: problem.constraints || '',
                    tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : '',
                    inputFormat: problem.inputFormat || '',
                    outputFormat: problem.outputFormat || '',
                    starterCode: problem.starterCode || { cpp: '', java: '', python: '', javascript: '' }
                });
                if (problem.testCases) {
                    setTestCases(problem.testCases);
                }
            } else {
                alert(data.error || 'Failed to generate problem');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while generating the problem');
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                difficulty: initialData.difficulty || 'Medium',
                constraints: initialData.constraints || '',
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
                inputFormat: initialData.inputFormat || '',
                outputFormat: initialData.outputFormat || '',
                starterCode: initialData.starterCode || { cpp: '', java: '', python: '', javascript: '' }
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

        const payload = {
            contestId,
            ...formData,
            testCases: testCases.filter(tc => tc.input.trim() && tc.output.trim()),
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
                    setFormData({
                        title: '',
                        description: '',
                        difficulty: 'Medium',
                        constraints: '',
                        tags: '',
                        inputFormat: '',
                        outputFormat: '',
                        starterCode: { cpp: '', java: '', python: '', javascript: '' }
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

    // Simplified Markdown Image Renderer for Preview
    const renderDescriptionPreview = (text) => {
        if (!text) return <p className="text-slate-500 italic">No description provided.</p>;

        // Split by image markdown: ![alt](url)
        const parts = text.split(/(!\[.*?\]\(.*?\))/g);

        return parts.map((part, index) => {
            const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
            if (imageMatch) {
                return (
                    <div key={index} className="my-4 rounded-lg overflow-hidden border border-white/10">
                        <img
                            src={imageMatch[2]}
                            alt={imageMatch[1] || "Problem Image"}
                            className="w-full object-contain max-h-[500px] bg-black"
                        />
                    </div>
                );
            }
            // Render text paragraphs (very basic)
            return part.split('\n').map((line, i) => (
                <p key={`${index}-${i}`} className="text-slate-300 text-sm mb-2 min-h-[1em] whitespace-pre-wrap">{line}</p>
            ));
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#111827] border border-[#3B82F6]/10 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#3B82F6]" />
                {isEditMode ? 'Edit Problem' : 'Add Problem to Contest'}
            </h3>

            <div className="bg-[#1E293B]/50 p-4 rounded-lg border border-[#3B82F6]/20 mb-6">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                    AI Problem Generator
                </label>

                <div className="flex gap-4 mb-3">
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="px-4 py-2 bg-[#0A0E1A] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm min-w-[120px]"
                    >
                        <option value="custom">Custom</option>
                        <option value="leetcode">LeetCode</option>
                        <option value="codeforces">Codeforces</option>
                        <option value="codechef">CodeChef</option>

                    </select>

                    <div className="flex-1 flex gap-2">
                        {platform === 'custom' && (
                            <input
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g., Linear Search, Matrix Rotation"
                                className="flex-1 px-4 py-2 bg-[#0A0E1A] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                            />
                        )}

                        {platform === 'leetcode' && (
                            <input
                                type="text"
                                value={leetcodeTitle}
                                onChange={(e) => setLeetcodeTitle(e.target.value)}
                                placeholder="e.g. Two Sum, 1. Two Sum, or URL"
                                className="flex-1 px-4 py-2 bg-[#0A0E1A] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                            />
                        )}

                        {platform === 'codeforces' && (
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={cfContestId}
                                    onChange={(e) => setCfContestId(e.target.value)}
                                    placeholder="Contest ID (e.g. 1352)"
                                    className="flex-1 px-4 py-2 bg-[#0A0E1A] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    value={cfIndex}
                                    onChange={(e) => setCfIndex(e.target.value)}
                                    placeholder="Index (e.g. A, C)"
                                    className="w-24 px-4 py-2 bg-[#0A0E1A] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                                />
                            </div>
                        )}

                        {platform === 'codechef' && (
                            <input
                                type="text"
                                value={codechefUrl}
                                onChange={(e) => setCodechefUrl(e.target.value)}
                                placeholder="CodeChef Problem URL (e.g. https://www.codechef.com/problems/TEST)"
                                className="flex-1 px-4 py-2 bg-[#0A0E1A] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none text-sm"
                            />
                        )}



                        <button
                            type="button"
                            onClick={generateWithAI}
                            disabled={generating || (platform === 'custom' && !aiPrompt.trim()) || (platform === 'leetcode' && !leetcodeTitle.trim()) || (platform === 'codeforces' && (!cfContestId.trim() || !cfIndex.trim())) || (platform === 'codechef')}
                            className="px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                        >
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate (AI)
                        </button>

                        {(platform === 'codeforces' || platform === 'leetcode') && (
                            <button
                                type="button"
                                onClick={handleBotImport}
                                disabled={botLoading || (platform === 'codeforces' && (!cfContestId.trim() || !cfIndex.trim())) || (platform === 'leetcode' && !leetcodeTitle.trim())}
                                className="px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                            >
                                {botLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                Fetch Screenshot (Bot)
                            </button>
                        )}

                        {platform === 'codechef' && (
                            <button
                                type="button"
                                onClick={handleScrape}
                                disabled={botLoading || !codechefUrl.trim()}
                                className="px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                            >
                                {botLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                Fetch Data (Scrape)
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-[10px] text-[#64748B] mt-2">
                    {platform === 'custom' && "Enter a problem name or topic. AI will fill details."}
                    {platform === 'leetcode' && "Enter Title (e.g. 'Two Sum') or URL. 'Fetch Screenshot' captures the problem."}
                    {platform === 'leetcode' && "Enter Title (e.g. 'Two Sum') or URL. 'Fetch Screenshot' captures the problem."}
                    {platform === 'codeforces' && "Enter Codeforces Contest ID and Problem Index. Use 'Generate' for AI text, or 'Fetch Screenshot' for an image capture."}
                    {platform === 'codechef' && "Enter CodeChef Problem URL. The system will scrape the text content and fill the form."}

                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Problem Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-sm font-medium text-[#94A3B8]">Description</label>
                        <div className="flex bg-[#0F1420] rounded-lg p-1 gap-1 border border-[#3B82F6]/10">
                            <button
                                type="button"
                                onClick={() => setDescTab('write')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${descTab === 'write' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Edit2 className="w-3 h-3" /> Write
                            </button>
                            <button
                                type="button"
                                onClick={() => setDescTab('preview')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${descTab === 'preview' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Eye className="w-3 h-3" /> Preview
                            </button>
                        </div>
                    </div>

                    {descTab === 'write' ? (
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none h-64 font-mono text-sm resize-y"
                            placeholder="Problem statement (Markdown supported)..."
                            required
                        />
                    ) : (
                        <div className="w-full px-4 py-4 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg min-h-[16rem] h-auto overflow-y-auto max-h-[500px]">
                            {renderDescriptionPreview(formData.description)}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1">Difficulty</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none appearance-none"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="Arrays, DP, Graph"
                            className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Constraints</label>
                    <textarea
                        name="constraints"
                        value={formData.constraints}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none h-20 font-mono text-sm"
                        placeholder="1 <= N <= 10^5"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Input Format</label>
                    <textarea
                        name="inputFormat"
                        value={formData.inputFormat}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none h-20 font-mono text-sm"
                        placeholder="The first line contains..."
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1">Output Format</label>
                    <textarea
                        name="outputFormat"
                        value={formData.outputFormat}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#1E293B] border border-[#3B82F6]/10 rounded-lg text-white focus:ring-2 focus:ring-[#3B82F6] outline-none h-20 font-mono text-sm"
                        placeholder="Print the answer..."
                    />
                </div>

            </div>

            <div className="border-t border-[#3B82F6]/10 pt-6">
                <h4 className="font-semibold text-[#E2E8F0] mb-4">Starter Code Templates</h4>
                <div className="bg-[#1E293B] rounded-lg border border-[#3B82F6]/10 overflow-hidden mb-6">
                    <div className="flex border-b border-[#3B82F6]/10">
                        {['cpp', 'java', 'python', 'javascript'].map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setActiveTab(lang)}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === lang ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#94A3B8] hover:text-white'}`}
                            >
                                {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="p-0">
                        <textarea
                            value={formData.starterCode?.[activeTab] || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                starterCode: { ...formData.starterCode, [activeTab]: e.target.value }
                            })}
                            className="w-full h-48 bg-[#0A0E1A] p-4 text-white font-mono text-sm outline-none resize-none"
                            placeholder={`Enter ${activeTab} starter code here...`}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-[#E2E8F0]">Test Cases</h4>
                    <button
                        type="button"
                        onClick={addTestCase}
                        disabled={testCases.length >= 10}
                        className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] px-3 py-1 rounded hover:bg-[#3B82F6]/20 disabled:opacity-50"
                    >
                        + Add Case ({testCases.length}/10)
                    </button>
                </div>

                <div className="space-y-4">
                    {testCases.map((tc, index) => (
                        <div key={index} className="flex gap-4 items-start bg-[#0A0E1A]/50 p-4 rounded-lg relative group">
                            <div className="flex-1">
                                <label className="text-xs text-[#475569] mb-1 block">Input</label>
                                <textarea
                                    value={tc.input}
                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#3B82F6]/10 rounded px-2 py-1 text-sm font-mono text-white h-16"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-[#475569] mb-1 block">Expected Output</label>
                                <textarea
                                    value={tc.output}
                                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                    className="w-full bg-[#1E293B] border border-[#3B82F6]/10 rounded px-2 py-1 text-sm font-mono text-white h-16"
                                    required
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`public-${index}`}
                                        checked={tc.isPublic || false}
                                        onChange={(e) => handleTestCaseChange(index, 'isPublic', e.target.checked)}
                                        className="rounded bg-[#1E293B] border-[#3B82F6]/20 text-[#3B82F6] focus:ring-[#3B82F6]"
                                    />
                                    <label htmlFor={`public-${index}`} className="text-xs text-[#94A3B8] select-none cursor-pointer">Mark as Public Example</label>
                                </div>
                            </div>
                            {testCases.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTestCase(index)}
                                    className="absolute -top-2 -right-2 bg-[#F43F5E]/20 text-[#F43F5E] p-1 rounded-full hover:bg-[#F43F5E]/40"
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
                className={`w-full py-3 font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 shadow-lg ${isEditMode ? 'bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/25 text-white' : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-[#3B82F6]/25 text-white'}`}
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
