'use client'
import React, { useState, useEffect, useMemo, Fragment } from 'react';
import {
    Trophy, Loader2, ArrowLeft, Search, Mail, CheckCircle2,
    AlertCircle, Users, BookOpen, BarChart2,
    ChevronDown, ChevronUp, CheckCheck, X as XIcon, Eye, Download, Trash2
} from 'lucide-react';

export default function ContestLeaderboard({ contest, onBack, isVolunteer }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingCerts, setSendingCerts] = useState(false);
    const [certResult, setCertResult] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortField, setSortField] = useState('rank');
    const [sortDir, setSortDir] = useState('asc');
    const [deletingStudentId, setDeletingStudentId] = useState(null);

    const fetchLeaderboard = async () => {
        if (!contest) return;
        try {
            const res = await fetch(isVolunteer ? `/api/admin/contests/${contest._id}/leaderboard` : `/api/contest/${contest._id}/leaderboard`);
            const data = await res.json();
            if (data.success) {
                setLeaderboard(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchLeaderboard();
    }, [contest]);

    const handleRemoveStudent = async (studentId, studentName) => {
        if (!confirm(`Are you sure you want to delete ${studentName} and ALL of their submitted code from this contest? This action is permanent and cannot be undone.`)) {
            return;
        }

        setDeletingStudentId(studentId);
        try {
            const res = await fetch(`/api/admin/contests/${contest._id}/remove-student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ studentId })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully removed ${studentName} and their submissions.`);
                setExpandedRow(null);
                await fetchLeaderboard();
            } else {
                alert(data.message || 'Failed to remove student');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            alert('An error occurred while trying to remove the student.');
        } finally {
            setDeletingStudentId(null);
        }
    };

    // Sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    // Filter + Sort
    const processedData = useMemo(() => {
        let data = leaderboard
            .filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

        data = [...data].sort((a, b) => {
            let aVal, bVal;
            switch (sortField) {
                case 'name': aVal = a.name; bVal = b.name; break;
                case 'solved': aVal = a.solvedCount; bVal = b.solvedCount; break;
                case 'score': aVal = a.score; bVal = b.score; break;
                case 'attempts': aVal = a.totalAttempts; bVal = b.totalAttempts; break;
                default: aVal = b.solvedCount; bVal = a.solvedCount; // rank = default server order
            }
            if (typeof aVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return data;
    }, [leaderboard, searchTerm, sortField, sortDir]);

    const [previewModalData, setPreviewModalData] = useState(null);


    // ── Certificate PNG generation helpers ──────────────────────────────────

    /** Builds inline-styled HTML for one official certificate (html2canvas-friendly). */
    /** Builds inline-styled HTML for one official certificate (html2canvas-friendly). */
    const buildCertificateHTML = (studentName, contestTitle, rank, date) => {
        const rankLabel = rank === 1 ? '1st Position' : rank === 2 ? '2nd Position' : rank === 3 ? '3rd Position' : `${rank}th Position`;
        const certType = rank <= 3 ? 'CERTIFICATE OF EXCELLENCE' : 'CERTIFICATE OF MERIT';

        const medalColor  = rank===1 ? '#D4AF37' : rank===2 ? '#A8A9AD' : rank===3 ? '#CD7F32' : '#3B82F6';
        const medalLight  = rank===1 ? '#FFF5C0' : rank===2 ? '#F5F5F5' : rank===3 ? '#F5C98A' : '#93C5FD';
        const medalDark   = rank===1 ? '#6B4C00' : rank===2 ? '#444'    : rank===3 ? '#4A2000' : '#1E3A8A';

        return `
        <div style="width:1123px; height:794px; background:#FDFCF7; font-family:'Georgia',serif; box-sizing:border-box; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:center; align-items:center; padding: 40px; color: #0d1b2e;">

          <!-- Background Patterns & Borders -->
          <!-- Outer navy border -->
          <div style="position:absolute; inset:0; border:20px solid #0d1b2e; pointer-events:none;"></div>
          
          <!-- Inner gold border -->
          <div style="position:absolute; inset:24px; border:3px solid #C5A059; pointer-events:none;"></div>
          
          <!-- Thin inner border -->
          <div style="position:absolute; inset:34px; border:1px solid rgba(197,160,89,0.5); pointer-events:none;"></div>

          <!-- Corner ornaments -->
          <svg style="position:absolute; top:24px; left:24px; width:60px; height:60px;" viewBox="0 0 60 60"><path d="M0 0 H60 V10 H10 V60 H0 Z" fill="#C5A059"/><rect x="16" y="16" width="20" height="4" fill="#C5A059"/><rect x="16" y="16" width="4" height="20" fill="#C5A059"/></svg>
          <svg style="position:absolute; top:24px; right:24px; width:60px; height:60px; transform:scaleX(-1);" viewBox="0 0 60 60"><path d="M0 0 H60 V10 H10 V60 H0 Z" fill="#C5A059"/><rect x="16" y="16" width="20" height="4" fill="#C5A059"/><rect x="16" y="16" width="4" height="20" fill="#C5A059"/></svg>
          <svg style="position:absolute; bottom:24px; left:24px; width:60px; height:60px; transform:scaleY(-1);" viewBox="0 0 60 60"><path d="M0 0 H60 V10 H10 V60 H0 Z" fill="#C5A059"/><rect x="16" y="16" width="20" height="4" fill="#C5A059"/><rect x="16" y="16" width="4" height="20" fill="#C5A059"/></svg>
          <svg style="position:absolute; bottom:24px; right:24px; width:60px; height:60px; transform:scale(-1);" viewBox="0 0 60 60"><path d="M0 0 H60 V10 H10 V60 H0 Z" fill="#C5A059"/><rect x="16" y="16" width="20" height="4" fill="#C5A059"/><rect x="16" y="16" width="4" height="20" fill="#C5A059"/></svg>

          <!-- Watermark Logo -->
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); opacity:0.04; pointer-events:none;">
            <svg width="480" height="480" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="34" rx="12" ry="24" stroke="#0d1b2e" stroke-width="8" fill="none"/>
              <ellipse cx="32" cy="66" rx="12" ry="24" stroke="#0d1b2e" stroke-width="8" fill="none" transform="rotate(60,32,66)"/>
              <ellipse cx="68" cy="66" rx="12" ry="24" stroke="#0d1b2e" stroke-width="8" fill="none" transform="rotate(-60,68,66)"/>
            </svg>
          </div>

          <!-- Header -->
          <div style="text-align:center; z-index:2; margin-top:20px;">
            <div style="display:inline-flex; align-items:center; justify-content:center; gap:20px; margin-bottom: 20px;">
              <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gL" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#9333EA"/>
                    <stop offset="100%" stop-color="#38BDF8"/>
                  </linearGradient>
                  <linearGradient id="gR" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8"/>
                    <stop offset="100%" stop-color="#9333EA"/>
                  </linearGradient>
                </defs>

                <!-- LEFT SHAPE -->
                <path d="M 42 20 C 5 20, 5 80, 42 80" fill="none" stroke="url(#gL)" stroke-width="16" stroke-linecap="round"/>
                <path d="M 42 20 L 22 28" fill="none" stroke="url(#gL)" stroke-width="8" stroke-linecap="round"/>
                <circle cx="20" cy="78" r="8" fill="url(#gL)"/>
                <circle cx="42" cy="20" r="5" fill="#FDFCF7"/>
                
                <!-- RIGHT SHAPE -->
                <path d="M 58 20 C 95 20, 95 80, 58 80" fill="none" stroke="url(#gR)" stroke-width="16" stroke-linecap="round"/>
                <path d="M 58 80 L 78 72" fill="none" stroke="url(#gR)" stroke-width="8" stroke-linecap="round"/>
                <circle cx="80" cy="22" r="8" fill="url(#gR)"/>
                <circle cx="58" cy="80" r="5" fill="#FDFCF7"/>
              </svg>
              <span style="font-family:'Segoe UI',Arial,sans-serif; font-size:56px; font-weight:900; letter-spacing:8px; text-transform:uppercase; color:#0f172a;">TALENT<span style="color:#C5A059;">IQ</span></span>
            </div>
          </div>

          <!-- Main Content -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; z-index: 2; padding-bottom: 60px;">
            
            <h1 style="font-family:'Segoe UI',Arial,sans-serif; font-size:16px; font-weight:700; color:#C5A059; letter-spacing:10px; text-transform:uppercase; margin:0 0 24px 0;">
              ${certType}
            </h1>
            
            <p style="font-size:18px; font-style:italic; color:#475569; margin:0 0 30px 0;">
              This certificate is proudly presented to
            </p>
            
            <!-- Recipient Name -->
            <div style="font-size:64px; font-weight:700; margin:0 0 20px 0; padding: 0 60px; border-bottom: 3px solid #C5A059; display:inline-block;">
              ${studentName}
            </div>
            
            <!-- Citation -->
            <p style="font-family:'Segoe UI',Arial,sans-serif; font-size:20px; color:#334155; max-width:850px; line-height:2.2; text-align:center; margin:36px 0 0 0;">
              for demonstrating <em style="font-style:italic; font-weight:600; color:#0d1b2e;">exceptional coding proficiency</em> and securing<br/>
              <span style="display:inline-block; margin:16px 0;">
                <span style="background:${rank===1?'rgba(212,175,55,0.15)':rank===2?'rgba(168,169,173,0.15)':rank===3?'rgba(205,127,50,0.15)':'rgba(59,130,246,0.1)'}; border:2px solid ${medalColor}; color:${medalDark}; font-weight:800; padding:8px 24px; border-radius:30px; font-size:20px; margin:0 6px;">${rankLabel}</span>
              </span><br/>
              in <strong style="color:#1E3A8A; font-weight:700;">&ldquo;${contestTitle}&rdquo;</strong> — organized on the <strong style="color:#92400E; font-weight:700;">TalentIQ Platform</strong>.
            </p>

          </div>

          <!-- Left: Gold Badge (Absolutely Positioned) -->
          <div style="position: absolute; bottom: 120px; left: 75px; z-index: 10;">
            <svg width="120" height="152" viewBox="0 0 150 190" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ribRedL" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#7F1D1D"/>
                  <stop offset="50%" stop-color="#DC2626"/>
                  <stop offset="100%" stop-color="#7F1D1D"/>
                </linearGradient>
                <linearGradient id="ribRedR" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#7F1D1D"/>
                  <stop offset="50%" stop-color="#DC2626"/>
                  <stop offset="100%" stop-color="#7F1D1D"/>
                </linearGradient>
                <radialGradient id="goldOuter" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stop-color="#FDE08B"/>
                  <stop offset="50%" stop-color="#D4AF37"/>
                  <stop offset="100%" stop-color="#997A00"/>
                </radialGradient>
                <radialGradient id="goldInner" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stop-color="#FFF5C0"/>
                  <stop offset="60%" stop-color="#D4AF37"/>
                  <stop offset="100%" stop-color="#B8860B"/>
                </radialGradient>
                <radialGradient id="goldDome" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stop-color="#FFF5C0"/>
                  <stop offset="30%" stop-color="#E5C158"/>
                  <stop offset="80%" stop-color="#B8860B"/>
                  <stop offset="100%" stop-color="#7A5C00"/>
                </radialGradient>
                
                <g id="scallop">
                  <circle cx="0" cy="-48" r="9" fill="url(#goldOuter)"/>
                </g>
                <g id="scallops4">
                  <use href="#scallop" />
                  <use href="#scallop" transform="rotate(22.5)" />
                  <use href="#scallop" transform="rotate(45)" />
                  <use href="#scallop" transform="rotate(67.5)" />
                </g>
                <g id="scallops16">
                  <use href="#scallops4" />
                  <use href="#scallops4" transform="rotate(90)" />
                  <use href="#scallops4" transform="rotate(180)" />
                  <use href="#scallops4" transform="rotate(270)" />
                </g>
              </defs>

              <!-- Left Ribbon -->
              <g transform="translate(15, 0)">
                <path d="M 40 80 L 10 185 L 45 160 L 75 185 L 55 80 Z" fill="url(#ribRedL)" stroke="#997A00" stroke-width="1"/>
                <path d="M 37 90 L 16 175 L 45 152 L 69 175 L 52 90" fill="none" stroke="#FDE08B" stroke-width="2"/>
              </g>

              <!-- Right Ribbon -->
              <g transform="translate(-15, 0)">
                <path d="M 110 80 L 140 185 L 105 160 L 75 185 L 95 80 Z" fill="url(#ribRedR)" stroke="#997A00" stroke-width="1"/>
                <path d="M 113 90 L 134 175 L 105 152 L 81 175 L 98 90" fill="none" stroke="#FDE08B" stroke-width="2"/>
              </g>

              <!-- Badge Core -->
              <g transform="translate(75, 75)">
                <!-- Drop shadow -->
                <circle cx="0" cy="5" r="50" fill="rgba(0,0,0,0.2)" filter="blur(4px)"/>
                
                <!-- Scalloped Edge -->
                <use href="#scallops16" />
                <circle cx="0" cy="0" r="48" fill="url(#goldOuter)" />
                
                <!-- Inner Ridge 1 -->
                <circle cx="0" cy="0" r="45" fill="none" stroke="#FDE08B" stroke-width="1.5" />
                <!-- Inner Ridge 2 (Dark inset) -->
                <circle cx="0" cy="0" r="38" fill="none" stroke="#997A00" stroke-width="2" />
                
                <!-- Main flat surface -->
                <circle cx="0" cy="0" r="37" fill="url(#goldInner)" />
                
                <!-- Center Dome -->
                <circle cx="0" cy="0" r="26" fill="url(#goldDome)" />
                <!-- Dome highlight border -->
                <circle cx="0" cy="0" r="26" fill="none" stroke="#FFF5C0" stroke-width="1" opacity="0.6" />
              </g>
            </svg>
          </div>

          <!-- Divider -->
          <div style="width: 85%; height:1px; background:linear-gradient(90deg,transparent,rgba(197,160,89,0.35),transparent); z-index:3; margin: 0 auto 16px auto;"></div>

          <!-- Full Width Horizontal Creators -->
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; z-index: 2; padding: 0 60px 16px 60px;">
              <span style="font-family:'Segoe UI',sans-serif; font-size:14px; font-weight:600; color:#64748B; letter-spacing:2.5px; text-transform:uppercase;">TalentIQ made by</span>
              <span style="font-family:Georgia,serif; font-weight:700; font-size:20px; color:#334155;">Dharmik Kumbhani</span>
              <span style="color:#C5A059; font-size:16px;">✦</span>
              <span style="font-family:Georgia,serif; font-weight:700; font-size:20px; color:#334155;">Vrund Patel</span>
              <span style="color:#C5A059; font-size:16px;">✦</span>
              <span style="font-family:Georgia,serif; font-weight:700; font-size:20px; color:#334155;">Harshvardhansinh Parmar</span>
          </div>

        </div>`;
    };

    /** Renders a certificate HTML string off-screen and returns a base64 PNG string. */
    const generateCertificatePNG = async (studentName, contestTitle, rank) => {
        const html2canvas = (await import('html2canvas')).default;
        const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
        wrapper.innerHTML = buildCertificateHTML(studentName, contestTitle, rank, date);
        document.body.appendChild(wrapper);

        try {
            const canvas = await html2canvas(wrapper.firstElementChild, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#FDFCF7',
            });
            // Return raw base64 (no data-url prefix) for the API
            return canvas.toDataURL('image/png').split(',')[1];
        } finally {
            document.body.removeChild(wrapper);
        }
    };



    const handleSendCertificates = async () => {
        if (!confirm('Generate PNG certificates and send to the top 3 winners?')) return;
        setSendingCerts(true);
        setCertResult(null);
        try {
            // leaderboard is already sorted best-first by the server
            const top3 = leaderboard.slice(0, 3);
            if (top3.length === 0) {
                setCertResult({ success: false, message: 'No participants found.' });
                return;
            }

            // Generate and send a PNG for each winner individually to avoid 4MB payload limit
            const allResults = [];
            for (let i = 0; i < top3.length; i++) {
                const winner = top3[i];
                try {
                    const pngBase64 = await generateCertificatePNG(winner.name, contest.title, i + 1);
                    const res = await fetch(`/api/admin/contests/${contest._id}/send-certificates`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ certificates: [{ name: winner.name, email: winner.email, rank: i + 1, pngBase64 }] }),
                    });
                    const data = await res.json();
                    if (data.success && data.data) {
                        allResults.push(...data.data);
                    } else {
                        allResults.push({ name: winner.name, email: winner.email, rank: i + 1, status: 'failed', error: data.message || 'Error API' });
                    }
                } catch (e) {
                    allResults.push({ name: winner.name, email: winner.email, rank: i + 1, status: 'failed', error: e.message });
                }
            }

            setCertResult({
                success: allResults.some(r => r.status === 'sent'),
                message: `Processed ${allResults.length} certificates.`,
                data: allResults
            });
        } catch (err) {
            console.error(err);
            setCertResult({ success: false, message: 'Failed to generate or send certificates.' });
        } finally {
            setSendingCerts(false);
        }
    };



    const SortIcon = ({ field }) => (
        sortField === field
            ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
            : <ChevronDown className="w-3 h-3 opacity-30" />
    );

    const rankStyle = (i) => {
        if (i === 0) return { ring: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30', emoji: '🥇' };
        if (i === 1) return { ring: 'bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/30', emoji: '🥈' };
        if (i === 2) return { ring: 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/30', emoji: '🥉' };
        return { ring: 'bg-[#1E293B] text-[#475569] border border-white/5', emoji: null };
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            {/* ── Back ── */}
            <button
                onClick={onBack}
                className="flex items-center text-[#94A3B8] hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Contests
            </button>

            {/* ── Header Card ── */}
            <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-2xl p-7">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                                Contest Finished
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mt-2">{contest.title}</h1>
                        <p className="text-[#94A3B8] text-sm mt-1">
                            {new Date(contest.startTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            {' → '}
                            {new Date(contest.endTime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {isVolunteer && (
                            <button
                                onClick={handleSendCertificates}
                                disabled={sendingCerts || leaderboard.length === 0}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0E1A] font-bold rounded-xl transition-all shadow-lg shadow-[#F59E0B]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {sendingCerts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                {sendingCerts ? 'Sending...' : 'Send Certificates (Top 3)'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Summary Stats ── */}
                {meta && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Users, label: 'Total Students', value: meta.totalStudents, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10 border-[#3B82F6]/15' },
                            { icon: BookOpen, label: 'Total Problems', value: `${meta.totalProblems} (${meta.totalMarks ?? 0} Marks)`, color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/10 border-[#22D3EE]/15' },
                            { icon: BarChart2, label: 'Avg Score', value: `${meta.avgScore}%`, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/15' },
                            { icon: Trophy, label: 'Top Solver', value: leaderboard[0]?.name?.split(' ')[0] || '—', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/15' },
                        ].map((stat, i) => (
                            <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${stat.bg}`}>
                                <div className={`p-2 rounded-lg bg-white/5`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-[#475569] font-medium">{stat.label}</p>
                                    <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Certificate Result Feedback */}
            {certResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${certResult.success ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-[#F43F5E]/10 border-[#F43F5E]/20'}`}>
                    {certResult.success
                        ? <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 text-[#F43F5E] flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                        <p className={`font-semibold text-sm ${certResult.success ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>{certResult.message}</p>
                        {certResult.data?.map((r, i) => (
                            <p key={i} className="text-xs text-[#94A3B8] mt-1">
                                {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉'} {r.name} ({r.email}) —{' '}
                                <span className={r.status === 'sent' ? 'text-[#10B981]' : 'text-[#F43F5E]'}>
                                    {r.status === 'sent' ? 'Sent ✓' : 'Failed ✗'}
                                </span>
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Problem Key (chips) ── */}
            {meta && meta.problems?.length > 0 && (
                <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-xl p-4">
                    <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3">Contest Problems</p>
                    <div className="flex flex-wrap gap-2">
                        {meta.problems.map((p, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#1E293B] border border-white/5 rounded-full text-xs text-[#94A3B8]">
                                <span className="w-4 h-4 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold text-[9px]">{i + 1}</span>
                                {p.title}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Search ── */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#475569]" />
                    <input
                        type="text"
                        placeholder="Search student by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-[#3B82F6]/10 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-white placeholder-[#475569] text-sm"
                    />
                </div>
                <p className="text-sm text-[#475569] shrink-0">
                    {processedData.length} of {leaderboard.length} students
                </p>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                </div>
            ) : (
                <div className="bg-[#111827] border border-[#3B82F6]/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-[#0d1117] border-b border-[#3B82F6]/10 text-[#475569] uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-4 font-semibold w-16">Rank</th>
                                    <th
                                        className="p-4 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">Student <SortIcon field="name" /></div>
                                    </th>
                                    <th
                                        className="p-4 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('solved')}
                                    >
                                        <div className="flex items-center gap-1">Problems Solved <SortIcon field="solved" /></div>
                                    </th>
                                    <th className="p-4 font-semibold">Questions Solved</th>
                                    <th
                                        className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('score')}
                                    >
                                        <div className="flex items-center justify-end gap-1">Score <SortIcon field="score" /></div>
                                    </th>
                                    <th
                                        className="p-4 font-semibold text-right cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('attempts')}
                                    >
                                        <div className="flex items-center justify-end gap-1">Attempts <SortIcon field="attempts" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3B82F6]/5">
                                {processedData.map((student, index) => {
                                    const { ring, emoji } = rankStyle(index);
                                    const isExpanded = expandedRow === student._id;
                                    const hasActivity = student.totalAttempts > 0;
                                    return (
                                        <React.Fragment key={`user-${student._id}`}>
                                            <tr
                                                className={`group transition-colors cursor-pointer ${isExpanded ? 'bg-[#1a2332]' : 'hover:bg-[#1E293B]'}`}
                                                onClick={() => setExpandedRow(isExpanded ? null : student._id)}
                                            >
                                                {/* Rank */}
                                                <td className="p-4">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${ring}`}>
                                                        {emoji || index + 1}
                                                    </div>
                                                </td>

                                                {/* Student */}
                                                <td className="p-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-semibold text-white group-hover:text-[#3B82F6] transition-colors">
                                                            {student.name}
                                                        </span>
                                                        <span className="text-xs text-[#475569]">{student.email}</span>
                                                        {index < 3 && (
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const certDate = contest?.startTime 
                                                                            ? new Date(contest.startTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                                                                            : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
                                                                        setPreviewModalData({
                                                                            name: student.name,
                                                                            title: contest.title,
                                                                            rank: index + 1,
                                                                            date: certDate
                                                                        });
                                                                    }}
                                                                    className="text-[10px] font-semibold text-[#3B82F6] hover:text-white transition-colors bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 px-2 py-0.5 rounded cursor-pointer border border-[#3B82F6]/20 flex items-center gap-1"
                                                                >
                                                                    <Eye className="w-3 h-3" /> Preview
                                                                </button>

                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Solved count */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm border ${student.solvedCount === 0
                                                            ? 'bg-[#1E293B] text-[#475569] border-white/5'
                                                            : student.solvedCount === meta?.totalProblems
                                                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                                : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'
                                                            }`}>
                                                            <Trophy className="w-3 h-3" />
                                                            {student.solvedCount}
                                                            {meta?.totalProblems > 0 && (
                                                                <span className="opacity-50 font-normal">/ {meta.totalProblems}</span>
                                                            )}
                                                        </div>
                                                        {student.solvedCount === meta?.totalProblems && meta?.totalProblems > 0 && (
                                                            <span className="text-xs text-[#10B981] font-bold flex items-center gap-1">
                                                                <CheckCheck className="w-3 h-3" /> All
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Question pills */}
                                                <td className="p-4">
                                                    {meta?.problems?.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {meta.problems.map((prob, pi) => {
                                                                const solved = student.solvedSlugs.includes(prob.slug);
                                                                return (
                                                                    <span
                                                                        key={pi}
                                                                        title={prob.title}
                                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${solved
                                                                            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                                                            : 'bg-[#1E293B] text-[#475569] border-white/5'
                                                                            }`}
                                                                    >
                                                                        {solved
                                                                            ? <CheckCircle2 className="w-3 h-3" />
                                                                            : <XIcon className="w-3 h-3" />
                                                                        }
                                                                        Q{pi + 1}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        student.solvedSlugs.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {student.solvedSlugs.map((slug, si) => (
                                                                    <span key={si} className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded text-[11px] font-mono">
                                                                        {slug}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-[#475569]">None</span>
                                                        )
                                                    )}
                                                </td>

                                                {/* Score */}
                                                <td className="p-4 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-lg font-black ${student.score >= 80 ? 'text-[#10B981]' :
                                                            student.score >= 50 ? 'text-[#3B82F6]' :
                                                                student.score > 0 ? 'text-[#F59E0B]' : 'text-[#475569]'
                                                            }`}>{student.scorePoints ?? student.score} <span className="text-[10px] font-normal text-[#475569]">/ {meta?.totalMarks ?? '—'}</span></span>
                                                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${student.score >= 80 ? 'bg-[#10B981]' :
                                                                    student.score >= 50 ? 'bg-[#3B82F6]' :
                                                                        student.score > 0 ? 'bg-[#F59E0B]' : 'bg-[#1E293B]'
                                                                    }`}
                                                                style={{ width: `${student.score}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Attempts */}
                                                <td className="p-4 text-right">
                                                    <span className={`text-sm font-mono ${hasActivity ? 'text-white' : 'text-[#475569]'}`}>
                                                        {student.totalAttempts}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Expanded detail row */}
                                            {isExpanded && (
                                                <tr key={`${student._id}-expanded`} className="bg-[#0d1117]">
                                                    <td colSpan="6" className="px-6 py-4">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Student Details</p>
                                                                <p className="text-white font-semibold">{student.name}</p>
                                                                <p className="text-xs text-[#475569]">{student.email}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Performance</p>
                                                                <p className="text-white font-bold">{student.solvedCount} / {meta?.totalProblems} solved</p>
                                                                <p className="text-xs text-[#475569]">{student.totalAttempts} total submissions</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Score (Marks)</p>
                                                                <p className={`text-2xl font-black ${student.score >= 80 ? 'text-[#10B981]' : student.score >= 50 ? 'text-[#3B82F6]' : student.score > 0 ? 'text-[#F59E0B]' : 'text-[#475569]'}`}>
                                                                    {student.scorePoints ?? 0} <span className="text-base font-normal text-[#475569]">/ {meta?.totalMarks ?? 0} ({student.score}%)</span>
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[#475569] font-semibold uppercase tracking-wider mb-2">Last Accepted</p>
                                                                <p className="text-white text-sm">
                                                                    {student.lastSolvedAt
                                                                        ? new Date(student.lastSolvedAt).toLocaleString()
                                                                        : '—'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {isVolunteer && (
                                                            <div className="mt-5 pt-4 border-t border-rose-500/20 bg-rose-500/5 p-4 rounded-xl flex items-center justify-between gap-4">
                                                                <div>
                                                                    <p className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                                                                        <Trash2 className="w-3.5 h-3.5" /> Danger Zone
                                                                    </p>
                                                                    <p className="text-xs text-slate-400 mt-1">Delete this student's registration and all of their submissions for this contest.</p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveStudent(student._id, student.name);
                                                                    }}
                                                                    disabled={deletingStudentId === student._id}
                                                                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors border border-rose-600 shadow-lg shadow-rose-500/10 cursor-pointer"
                                                                >
                                                                    {deletingStudentId === student._id ? 'Deleting...' : 'Delete Student & Code'}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {isVolunteer && student.solvedDetails && student.solvedDetails.length > 0 && (
                                                            <div className="mt-4 border-t border-[#3B82F6]/10 pt-5">
                                                                <h4 className="text-sm font-bold text-white mb-3">Submitted Code (Accepted)</h4>
                                                                <div className="space-y-4">
                                                                    {student.solvedDetails.map((detail, di) => (
                                                                        <div key={di} className="bg-[#1E293B] rounded-lg border border-white/10 overflow-hidden">
                                                                            <div className="flex justify-between items-center bg-white/5 px-4 py-3 border-b border-white/10">
                                                                                <span className="text-sm font-bold text-slate-300">{detail.slug}</span>
                                                                                <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">{detail.language}</span>
                                                                            </div>
                                                                            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                                                                {detail.code}
                                                                            </pre>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {processedData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-[#475569]">
                                            {leaderboard.length === 0
                                                ? 'No students registered for this contest.'
                                                : 'No students match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Certificate Preview Modal ── */}
            {previewModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    📜 Official Certificate Preview
                                </h3>
                                <p className="text-xs text-[#94A3B8] mt-0.5">
                                    TalentIQ Coding Platform &middot; {previewModalData.name} ({previewModalData.rank === 1 ? '1st Place' : previewModalData.rank === 2 ? '2nd Place' : '3rd Place'})
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPreviewModalData(null)}
                                    className="p-2 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Certificate Render Container with scaling to fit screen */}
                        <div className="flex justify-center bg-[#070a12] rounded-xl border border-white/5 p-4 overflow-auto max-w-full">
                            <div style={{ width: '561.5px', height: '397px', overflow: 'hidden', flexShrink: 0 }}>
                                <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}>
                                    <div 
                                        dangerouslySetInnerHTML={{ 
                                            __html: buildCertificateHTML(previewModalData.name, previewModalData.title, previewModalData.rank, previewModalData.date) 
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
