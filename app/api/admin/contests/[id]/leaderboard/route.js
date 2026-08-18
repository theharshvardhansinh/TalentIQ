import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import User from '@/models/User';
import Contest from '@/models/Contest';
import Problem from '@/models/Problem'; // Import Problem model for population
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // Verify contest exists and populate problem slugs
        const contest = await Contest.findById(id).populate('problems', 'slug title difficulty');
        if (!contest) {
            return NextResponse.json({ success: false, message: 'Contest not found' }, { status: 404 });
        }

        const contestObjId = new mongoose.Types.ObjectId(id);

        // ── 1. All unique problems in this contest ──────────────────────────────
        const problemDifficultyMap = {};
        let totalContestMarks = 0;
        const contestProblems = (contest.problems || []).map(p => {
            const diff = p.difficulty || 'Medium';
            const marks = diff === 'Easy' ? 2 : diff === 'Hard' ? 6 : 4;
            problemDifficultyMap[p.slug] = marks;
            totalContestMarks += marks;
            return {
                slug: p.slug,
                title: p.title || p.slug,
                difficulty: diff,
                marks: marks,
            };
        });

        // ── 2. Per-user: which unique problems did they solve (or partially solve)
        const solvedAgg = await Submission.aggregate([
            {
                $match: {
                    contestId: contestObjId
                }
            },
            {
                $addFields: {
                    passRatio: {
                        $cond: {
                            if: { $gt: ['$totalCount', 0] },
                            then: { $divide: ['$passedCount', '$totalCount'] },
                            else: {
                                $cond: { if: { $eq: ['$status', 'Accepted'] }, then: 1, else: 0 }
                            }
                        }
                    }
                }
            },
            {
                // Sort by highest pass ratio, then oldest first for tie breaking
                $sort: { passRatio: -1, createdAt: 1 }
            },
            {
                // Group by user & problem to pick the best submission
                $group: {
                    _id: { userId: '$userId', problemSlug: '$problemSlug' },
                    maxPassRatio: { $first: '$passRatio' },
                    bestSubmissionAt: { $first: '$createdAt' },
                    code: { $first: '$code' },
                    language: { $first: '$language' }
                }
            },
            {
                // Group by user: collect scores, details, and count fully solved
                $group: {
                    _id: '$_id.userId',
                    problemScores: { 
                        $push: { 
                            slug: '$_id.problemSlug', 
                            ratio: '$maxPassRatio' 
                        } 
                    },
                    solvedDetails: { 
                        $push: { 
                            slug: '$_id.problemSlug', 
                            code: '$code', 
                            language: '$language', 
                            time: '$bestSubmissionAt' 
                        } 
                    },
                    solvedCount: { 
                        $sum: { $cond: { if: { $eq: ['$maxPassRatio', 1] }, then: 1, else: 0 } }
                    },
                    lastSolvedAt: { 
                        $max: {
                            $cond: { if: { $eq: ['$maxPassRatio', 1] }, then: '$bestSubmissionAt', else: null }
                        }
                    },
                }
            }
        ]);

        // ── 3. Build a map userId → solved info ────────────────────────────────
        const solvedMap = {};
        solvedAgg.forEach(row => {
            // for compatibility with frontend pill icons, include slugs where they got > 0 ratio
            const attemptedSlugs = row.problemScores.filter(p => p.ratio > 0).map(p => p.slug);
            const attemptedDetails = row.solvedDetails.filter(d => {
                const score = row.problemScores.find(p => p.slug === d.slug);
                return score && score.ratio > 0;
            });
            solvedMap[row._id.toString()] = {
                problemScores: row.problemScores,
                solvedSlugs: attemptedSlugs,
                solvedDetails: attemptedDetails,
                solvedCount: row.solvedCount,
                lastSolvedAt: row.lastSolvedAt,
            };
        });

        // ── 4. Total attempts per user (all statuses) ──────────────────────────
        const attemptsAgg = await Submission.aggregate([
            { $match: { contestId: contestObjId } },
            { $group: { _id: '$userId', totalAttempts: { $sum: 1 } } }
        ]);
        const attemptsMap = {};
        attemptsAgg.forEach(r => { attemptsMap[r._id.toString()] = r.totalAttempts; });

        // ── 5. All registered students for this contest ────────────────────────
        const registeredUserIds = contest.registeredUsers || [];
        const users = await User.find(
            { _id: { $in: registeredUserIds } },
            'name email'
        ).lean();

        // ── 6. Build leaderboard rows ──────────────────────────────────────────
        const rows = users.map(u => {
            const uid = u._id.toString();
            const info = solvedMap[uid] || { problemScores: [], solvedSlugs: [], solvedCount: 0, lastSolvedAt: null };
            
            // Calculate total marks earned by this user (can be decimal)
            let rawUserMarks = 0;
            info.problemScores.forEach(ps => {
                rawUserMarks += (problemDifficultyMap[ps.slug] || 0) * ps.ratio;
            });

            return {
                _id: uid,
                user: { _id: uid, name: u.name, email: u.email }, // admin format
                name: u.name,
                email: u.email,
                solvedCount: info.solvedCount,
                solvedSlugs: info.solvedSlugs,
                solvedDetails: info.solvedDetails,
                totalAttempts: attemptsMap[uid] || 0,
                lastSolvedAt: info.lastSolvedAt,
                // Score: percentage of marks earned out of total marks
                score: totalContestMarks > 0
                    ? Math.round((rawUserMarks / totalContestMarks) * 100)
                    : 0,
                scorePoints: Math.round(rawUserMarks), // Rounded for display as requested
                rawScorePoints: rawUserMarks, // Kept for exact sorting
            };
        });

        // Sort: most exact points first, then earliest last-solved (tiebreak)
        rows.sort((a, b) => {
            if (b.rawScorePoints !== a.rawScorePoints) return b.rawScorePoints - a.rawScorePoints;
            if (a.lastSolvedAt && b.lastSolvedAt) return new Date(a.lastSolvedAt) - new Date(b.lastSolvedAt);
            return 0;
        });

        return NextResponse.json({
            success: true,
            data: rows,
            meta: {
                totalStudents: rows.length,
                totalProblems: contestProblems.length,
                totalMarks: totalContestMarks,
                problems: contestProblems,
                avgScore: rows.length > 0
                    ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
                    : 0,
            }
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
