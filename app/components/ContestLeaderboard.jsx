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
    const buildCertificateHTML = (studentName, contestTitle, rank, date) => {
        const rankLabel = rank === 1 ? '1st Position' : rank === 2 ? '2nd Position' : rank === 3 ? '3rd Position' : `${rank}th Position`;
        const sealText = rank === 1 ? 'GOLD MEDAL' : rank === 2 ? 'SILVER MEDAL' : rank === 3 ? 'BRONZE MEDAL' : 'MERIT AWARD';
        const certType = rank === 1 ? 'CERTIFICATE OF EXCELLENCE' : 'CERTIFICATE OF MERIT';

        return `
        <div style="width: 860px; padding: 24px; background: #0b1120; font-family: 'Segoe UI', Georgia, serif; box-sizing: border-box;">
          <div style="background: #FFFDF9; border: 10px solid #0F172A; padding: 32px 28px 28px 28px; position: relative; border-radius: 4px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); box-sizing: border-box; overflow: hidden;">
            
            <!-- Inner Decorative Gold Border Frame -->
            <div style="border: 2px solid #C5A059; padding: 28px 24px 24px 24px; position: relative; background: #FFFDF9;">

              <!-- Watermark Background Crest -->
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; pointer-events: none; text-align: center; width: 100%;">
                <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="90" stroke="#0F172A" stroke-width="4" stroke-dasharray="8 4"/>
                  <circle cx="100" cy="100" r="75" stroke="#0F172A" stroke-width="2"/>
                  <path d="M100 25 L120 70 L170 70 L130 100 L145 150 L100 120 L55 150 L70 100 L30 70 L80 70 Z" fill="#0F172A"/>
                </svg>
              </div>

              <!-- Corner Ornaments (Gold SVGs - aligned flush with inner border) -->
              <div style="position: absolute; top: 2px; left: 2px; width: 32px; height: 32px;">
                <svg width="32" height="32" viewBox="0 0 40 40"><path d="M0 0 H40 V6 H6 V40 H0 Z" fill="#C5A059"/><path d="M10 10 H30 V14 H14 V30 H10 Z" fill="#C5A059"/></svg>
              </div>
              <div style="position: absolute; top: 2px; right: 2px; width: 32px; height: 32px; transform: scaleX(-1);">
                <svg width="32" height="32" viewBox="0 0 40 40"><path d="M0 0 H40 V6 H6 V40 H0 Z" fill="#C5A059"/><path d="M10 10 H30 V14 H14 V30 H10 Z" fill="#C5A059"/></svg>
              </div>
              <div style="position: absolute; bottom: 2px; left: 2px; width: 32px; height: 32px; transform: scaleY(-1);">
                <svg width="32" height="32" viewBox="0 0 40 40"><path d="M0 0 H40 V6 H6 V40 H0 Z" fill="#C5A059"/><path d="M10 10 H30 V14 H14 V30 H10 Z" fill="#C5A059"/></svg>
              </div>
              <div style="position: absolute; bottom: 2px; right: 2px; width: 32px; height: 32px; transform: scale(-1);">
                <svg width="32" height="32" viewBox="0 0 40 40"><path d="M0 0 H40 V6 H6 V40 H0 Z" fill="#C5A059"/><path d="M10 10 H30 V14 H14 V30 H10 Z" fill="#C5A059"/></svg>
              </div>

              <!-- Header Section -->
              <div style="text-align: center; margin-bottom: 14px; position: relative; z-index: 2;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px;">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style="font-family: Georgia, serif; font-size: 23px; font-weight: 800; color: #0F172A; letter-spacing: 2.5px; text-transform: uppercase;">
                    COMPUTER SOCIETY OF INDIA
                  </span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>

                <div style="font-family: 'Segoe UI', sans-serif; font-size: 13px; font-weight: 800; color: #B45309; letter-spacing: 4px; text-transform: uppercase; margin-top: 2px;">
                  BVM STUDENT CHAPTER
                </div>
                <div style="font-family: 'Segoe UI', sans-serif; font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 1px; margin-top: 3px;">
                  Birla Vishvakarma Mahavidyalaya Engineering College (An Autonomous Institution)
                </div>
                <div style="font-family: 'Segoe UI', sans-serif; font-size: 10.5px; color: #64748B; margin-top: 2px;">
                  TalentIQ Platform
                </div>
              </div>

              <!-- Divider Motif -->
              <div style="text-align: center; margin: 12px 0 18px 0; position: relative;">
                <div style="height: 1px; background: linear-gradient(90deg, transparent 5%, #C5A059 50%, transparent 95%); width: 75%; margin: 0 auto;"></div>
                <span style="position: absolute; top: -7px; left: 50%; transform: translateX(-50%); background: #FFFDF9; padding: 0 8px; color: #C5A059; font-size: 10px;">◆</span>
              </div>

              <!-- Title of Achievement -->
              <div style="text-align: center; margin-bottom: 18px; position: relative; z-index: 2;">
                <div style="font-family: Georgia, serif; font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: 3.5px; text-transform: uppercase;">
                  ${certType}
                </div>
                <div style="font-family: Georgia, serif; font-size: 12px; font-style: italic; color: #64748B; margin-top: 6px;">
                  This certificate is proudly awarded to
                </div>
              </div>

              <!-- Recipient Name -->
              <div style="text-align: center; margin-bottom: 20px; position: relative; z-index: 2;">
                <div style="display: inline-block; position: relative; padding: 0 24px 6px 24px; border-bottom: 2px solid #C5A059;">
                  <span style="font-family: Georgia, serif; font-size: 34px; font-weight: 800; color: #0F172A; letter-spacing: 1px; text-transform: uppercase;">
                    ${studentName}
                  </span>
                </div>
              </div>

              <!-- Citation Body -->
              <div style="text-align: center; max-width: 660px; margin: 0 auto 28px auto; position: relative; z-index: 2; line-height: 1.7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13.5px; color: #334155;">
                for demonstrating exceptional coding proficiency and securing
                <strong style="color: #0F172A; font-weight: 800; text-decoration: underline decoration-[#C5A059] decoration-2;">${rankLabel}</strong>
                in the official coding contest
                <strong style="color: #1E3A8A; font-weight: 800;">"${contestTitle}"</strong>
                held on <strong style="color: #0F172A; font-weight: 700;">${date}</strong>
                organized by Computer Society of India (CSI) BVM Student Chapter.
              </div>

              <!-- Medal Ribbon & Signature Row -->
              <div style="display: flex; align-items: flex-end; justify-content: space-between; max-width: 660px; margin: 24px auto 0 auto; padding-top: 16px; border-top: 1px solid #E2E8F0; position: relative; z-index: 2;">

                <!-- Signature: CSI Faculty Advisor (Dr. N. M. Patel) -->
                <div style="text-align: center; width: 220px;">
                  <div style="height: 36px;"></div>
                  <div style="width: 160px; height: 1px; background: #0F172A; margin: 4px auto 6px auto;"></div>
                  <div style="font-family: Georgia, serif; font-size: 13.5px; font-weight: 700; color: #0F172A;">Dr. N. M. Patel</div>
                  <div style="font-family: 'Segoe UI', sans-serif; font-size: 11px; color: #64748B;">CSI Faculty Advisor</div>
                </div>

                <!-- Right: Gold Medal Emblem Badge -->
                <div style="text-align: center; width: 140px; position: relative; bottom: -4px;">
                  <div style="display: inline-block; position: relative;">
                    <!-- Ribbons -->
                    <div style="position: absolute; top: 38px; left: 16px; width: 18px; height: 32px; background: #991B1B; transform: rotate(15deg); border-bottom: 4px solid #7F1D1D;"></div>
                    <div style="position: absolute; top: 38px; right: 16px; width: 18px; height: 32px; background: #991B1B; transform: rotate(-15deg); border-bottom: 4px solid #7F1D1D;"></div>
                    
                    <!-- Medal Circle -->
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #FBBF24 0%, #D97706 50%, #92400E 100%); border: 3px solid #FFFDF9; box-shadow: 0 4px 10px rgba(180,83,9,0.4); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 3;">
                      <div style="width: 52px; height: 52px; border-radius: 50%; border: 1.5px dashed rgba(255,255,255,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                        <span style="font-size: 13px; font-weight: 900; color: #FFFFFF; font-family: 'Segoe UI', sans-serif; line-height: 1; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">
                          #${rank}
                        </span>
                        <span style="font-size: 7px; font-weight: 800; color: #FFFDF9; letter-spacing: 0.5px; margin-top: 2px; text-transform: uppercase;">
                          ${sealText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
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
                backgroundColor: '#0b1120',
            });
            // Return raw base64 (no data-url prefix) for the API
            return canvas.toDataURL('image/png').split(',')[1];
        } finally {
            document.body.removeChild(wrapper);
        }
    };

    const handleDownloadCert = async (studentName, contestTitle, rank) => {
        try {
            const pngBase64 = await generateCertificatePNG(studentName, contestTitle, rank);
            const a = document.createElement("a");
            a.href = "data:image/png;base64," + pngBase64;
            a.download = `Certificate_${studentName.replace(/\s+/g, '_')}_Rank${rank}.png`;
            a.click();
        } catch (error) {
            console.error("Download failed", error);
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
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownloadCert(student.name, contest.title, index + 1);
                                                                    }}
                                                                    className="text-[10px] font-semibold text-[#F59E0B] hover:text-white transition-colors bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 px-2 py-0.5 rounded cursor-pointer border border-[#F59E0B]/20 flex items-center gap-1"
                                                                >
                                                                    <Download className="w-3 h-3" /> Download
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
                                    Computer Society of India (CSI) BVM Student Chapter &middot; {previewModalData.name} ({previewModalData.rank === 1 ? '1st Place' : previewModalData.rank === 2 ? '2nd Place' : '3rd Place'})
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDownloadCert(previewModalData.name, previewModalData.title, previewModalData.rank)}
                                    className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0E1A] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                                >
                                    <Download className="w-4 h-4" /> Download PNG
                                </button>
                                <button
                                    onClick={() => setPreviewModalData(null)}
                                    className="p-2 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Certificate Render Container */}
                        <div className="flex justify-center bg-[#070a12] p-4 rounded-xl overflow-x-auto border border-white/5">
                            <div 
                                dangerouslySetInnerHTML={{ 
                                    __html: buildCertificateHTML(previewModalData.name, previewModalData.title, previewModalData.rank, previewModalData.date) 
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
