
'use client';
import { useState, useEffect, use } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2, Play, Send, ArrowLeft, Code2, AlertCircle, Terminal, X, CheckCircle2, XCircle, History, FileText, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProblemPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tabs & History
    const [leftPanelTab, setLeftPanelTab] = useState('description'); // 'description' | 'submissions'
    const [submissions, setSubmissions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Result Console State
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [activeCaseTab, setActiveCaseTab] = useState(0);

    // Modal for View Submission
    const [viewSubmission, setViewSubmission] = useState(null); // The submission object to view

    const CODE_KEY = `autosave_${params.contestId}_${params.slug}`;
    const LANG_KEY = `autosave_lang_${params.contestId}_${params.slug}`;

    const templates = {
        cpp: `// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}`,
        java: `// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}`,
        python: `# Write your Python code here\n\ndef solve():\n    # your code goes here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
        javascript: `// Write your JavaScript code here\n\nfunction solve() {\n    // your code goes here\n}\n\nsolve();`
    };

    // 1. Initial Load (One-time)
    useEffect(() => {
        const savedLang = localStorage.getItem(LANG_KEY);
        const savedCode = localStorage.getItem(CODE_KEY);

        if (savedLang) {
            setLanguage(savedLang);
            if (savedCode) {
                setCode(savedCode);
            } else {
                setCode(templates[savedLang] || "");
            }
        } else {
            setCode(templates['javascript']);
        }
        fetchProblem();
    }, []);

    // 2. Auto-Save Logic
    useEffect(() => {
        if (!loading && code) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem(CODE_KEY, code);
                localStorage.setItem(LANG_KEY, language);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [code, language, loading]);

    // Fetch submission history when tab changes
    useEffect(() => {
        if (leftPanelTab === 'submissions') {
            fetchHistory();
        }
    }, [leftPanelTab]);

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        const template = problem?.starterCode?.[newLang] || templates[newLang] || "";
        setCode(template);
    };

    const fetchProblem = async () => {
        try {
            const res = await fetch(`/api/problem/${params.slug}`);
            const data = await res.json();
            if (data.success) {
                setProblem(data.data);

                // If no user code is saved, populate with DB starter code
                const savedCode = localStorage.getItem(CODE_KEY);
                if (!savedCode) {
                    const currentLang = localStorage.getItem(LANG_KEY) || 'javascript';
                    const dbTemplate = data.data.starterCode?.[currentLang];
                    // Only override if we have a specific template from DB
                    if (dbTemplate) {
                        setCode(dbTemplate);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch problem', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/contest/submission/history?problemSlug=${params.slug}&contestId=${params.contestId}`);
            const data = await res.json();
            if (data.success) {
                setSubmissions(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setConsoleOpen(true);
        setSubmissionResult(null);
        setActiveCaseTab(0);

        try {
            const res = await fetch('/api/contest/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemSlug: params.slug,
                    code,
                    language,
                    contestId: params.contestId
                })
            });
            const data = await res.json();
            setSubmissionResult(data);

            // Refresh history if we are on that tab (allows user to see their new submission immediately)
            if (leftPanelTab === 'submissions') {
                fetchHistory(); // background fetch
            }

        } catch (error) {
            console.error(error);
            setSubmissionResult({
                status: 'Error',
                message: 'Failed to submit code. Please check your connection.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        setConsoleOpen(true);
        setSubmissionResult(null);
        setActiveCaseTab(0);

        try {
            const res = await fetch('/api/contest/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemSlug: params.slug,
                    code,
                    language
                })
            });
            const data = await res.json();
            setSubmissionResult(data);
        } catch (error) {
            console.error(error);
            setSubmissionResult({
                status: 'Error',
                message: 'Failed to run code. Please check your connection.'
            });
        } finally {
            setIsRunning(false);
        }
    };

    const restoreCode = (submissionCode, submissionLang) => {
        // Restore code and language
        setLanguage(submissionLang);
        setCode(submissionCode);
        setViewSubmission(null); // Close modal
        // Update local storage explicitly
        localStorage.setItem(CODE_KEY, submissionCode);
        localStorage.setItem(LANG_KEY, submissionLang);
    };

    // Helper for formatting relative time
    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
                <Link href={`/dashboard/student/contest/${params.contestId}`} className="text-indigo-400 hover:text-indigo-300">
                    Back to Contest
                </Link>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-black text-white overflow-hidden relative">
            {/* Header */}
            <header className="h-14 border-b border-white/10 bg-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href={`/contest/${params.contestId}`} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg truncate max-w-md">{problem.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-slate-800 text-sm border border-white/10 rounded px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                    </select>
                </div>
            </header>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel */}
                <div className="w-1/2 border-r border-white/10 flex flex-col overflow-hidden bg-[#0d0d0d]">
                    {/* Tab Header */}
                    <div className="flex border-b border-white/10 bg-white/5 shrink-0">
                        <button
                            onClick={() => setLeftPanelTab('description')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${leftPanelTab === 'description'
                                ? 'border-indigo-500 text-white'
                                : 'border-transparent text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <FileText className="w-4 h-4" /> Description
                        </button>
                        <button
                            onClick={() => setLeftPanelTab('submissions')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${leftPanelTab === 'submissions'
                                ? 'border-indigo-500 text-white'
                                : 'border-transparent text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <History className="w-4 h-4" /> Submissions
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                        {/* DESCRIPTION TAB */}
                        {leftPanelTab === 'description' && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-0.5 text-xs rounded font-bold border ${problem.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' :
                                            problem.difficulty === 'Medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                'text-rose-400 border-rose-400/20 bg-rose-400/10'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {problem.tags && problem.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="prose prose-invert prose-sm max-w-none space-y-6">
                                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
                                        {((text) => {
                                            if (!text) return null;
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
                                                return <span key={index}>{part}</span>;
                                            });
                                        })(problem.description)}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Code2 className="w-4 h-4 text-indigo-400" /> Examples
                                        </h3>
                                        {problem.examples && problem.examples.map((ex, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                                                    <div className="p-3">
                                                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Input</span>
                                                        <code className="text-sm font-mono text-slate-200 whitespace-pre-wrap">{ex.input}</code>
                                                    </div>
                                                    <div className="p-3">
                                                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Output</span>
                                                        <code className="text-sm font-mono text-slate-200 whitespace-pre-wrap">{ex.output}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {problem.constraints && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-indigo-400" /> Constraints
                                            </h3>
                                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">{problem.constraints}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* SUBMISSIONS TAB */}
                        {leftPanelTab === 'submissions' && (
                            <div className="space-y-4">
                                {loadingHistory ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">
                                        <p>No submissions yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {submissions.map((sub, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setViewSubmission(sub)}
                                                className="bg-white/5 hover:cursor-pointer hover:bg-white/10 border border-white/10 rounded-lg p-4 flex items-center justify-between transition-colors group"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className={`font-bold text-sm ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {sub.status}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {timeAgo(sub.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-slate-300">
                                                        {sub.language}
                                                    </span>
                                                    <Eye className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor + Result Console */}
                <div className="w-1/2 flex flex-col bg-[#1e1e1e] relative">
                    <div className={`flex-1 relative transition-all duration-300 ${consoleOpen ? 'h-[50%]' : 'h-full'}`}>
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16, bottom: 16 }
                            }}
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="h-14 border-t border-white/10 bg-[#1e1e1e] p-2 flex items-center justify-between px-4 shrink-0 z-20">
                        <button
                            onClick={() => setConsoleOpen(!consoleOpen)}
                            className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
                        >
                            <Terminal className="w-4 h-4" /> {consoleOpen ? 'Hide Console' : 'Show Console'}
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRun}
                                disabled={isRunning || isSubmitting}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isRunning ? <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                                Run
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-1.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Result Console */}
                    {consoleOpen && (
                        <div className="absolute bottom-14 w-full h-[50%] bg-[#1e1e1e] border-t border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300 z-10 shadow-2xl">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Results</span>
                                <button onClick={() => setConsoleOpen(false)}><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row h-full">
                                {isSubmitting || isRunning ? (
                                    <div className="w-full flex flex-col items-center justify-center p-10 text-slate-400 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                        <span className="animate-pulse">{isSubmitting ? 'Submitting Code...' : 'Running Tests...'}</span>
                                    </div>
                                ) : submissionResult ? (
                                    <>
                                        {/* Sidebar Tabs */}
                                        <div className="w-full md:w-48 bg-[#161616] border-r border-white/5 flex flex-col overflow-y-auto">
                                            <div className="p-3 border-b border-white/5">
                                                <div className={`text-lg font-bold flex items-center gap-2 ${submissionResult.status === 'Accepted' ? 'text-emerald-500' :
                                                    submissionResult.status === 'Runtime Error' ? 'text-red-500' : 'text-rose-500'
                                                    }`}>
                                                    {submissionResult.status === 'Accepted' && <CheckCircle2 className="w-5 h-5" />}
                                                    {submissionResult.status !== 'Accepted' && <XCircle className="w-5 h-5" />}
                                                    {submissionResult.status}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {submissionResult.passed} / {submissionResult.total} passed
                                                </p>
                                            </div>

                                            <div className="flex-1 p-2 space-y-2">
                                                {submissionResult.results?.map((res, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveCaseTab(idx)}
                                                        className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between group ${activeCaseTab === idx ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <span>Case {idx + 1}</span>
                                                        <div className={`w-2 h-2 rounded-full ${res.status === 'Passed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Detailed View */}
                                        <div className="flex-1 bg-[#1e1e1e] p-6 overflow-y-auto">
                                            {(submissionResult.message || submissionResult.stderr) ? (
                                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded text-red-200 font-mono text-sm whitespace-pre-wrap">
                                                    {submissionResult.message || submissionResult.stderr}
                                                </div>
                                            ) : submissionResult.results && submissionResult.results[activeCaseTab] ? (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold">Input</label>
                                                        <div className="mt-1 bg-white/5 border border-white/10 p-3 rounded font-mono text-sm text-slate-300 whitespace-pre-wrap">
                                                            {submissionResult.results[activeCaseTab].input}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold">Expected Output</label>
                                                        <div className="mt-1 bg-white/5 border border-white/10 p-3 rounded font-mono text-sm text-slate-300 whitespace-pre-wrap">
                                                            {submissionResult.results[activeCaseTab].expectedOutput}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 uppercase font-bold">Your Output</label>
                                                        <div className={`mt-1 border p-3 rounded font-mono text-sm whitespace-pre-wrap ${submissionResult.results[activeCaseTab].status === 'Passed'
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                                            : 'bg-red-500/10 border-red-500/20 text-red-300'
                                                            }`}>
                                                            {submissionResult.results[activeCaseTab].actualOutput}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-500 mt-10">Select a test case to view details</div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full flex items-center justify-center text-slate-600 text-sm">
                                        Click submit to see results.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* VIEW SUBMISSION MODAL */}
            {viewSubmission && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#161616] border border-white/10 w-full max-w-4xl h-[80vh] rounded-xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div>
                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                    <span className={`${viewSubmission.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {viewSubmission.status}
                                    </span>
                                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-400 font-mono">
                                        {viewSubmission.language}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Submitted {timeAgo(viewSubmission.createdAt)}</p>
                            </div>
                            <button onClick={() => setViewSubmission(null)}>
                                <X className="w-6 h-6 text-slate-500 hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Read Only Editor */}
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={viewSubmission.language}
                                value={viewSubmission.code}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setViewSubmission(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => restoreCode(viewSubmission.code, viewSubmission.language)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" /> Restore Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
