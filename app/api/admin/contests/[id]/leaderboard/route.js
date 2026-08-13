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

        // ── 2. Per-user: which unique problems did they solve (at least one Accepted)
        const solvedAgg = await Submission.aggregate([
            {
                $match: {
                    contestId: contestObjId,
                    status: 'Accepted',
                }
            },
            {
                $sort: { createdAt: 1 }
            },
            {
                // Deduplicate: one entry per (user, problem)
                $group: {
                    _id: { userId: '$userId', problemSlug: '$problemSlug' },
                    firstAcceptedAt: { $first: '$createdAt' },
                    code: { $first: '$code' },
                    language: { $first: '$language' }
                }
            },
            {
                // Group by user: collect slug list and count
                $group: {
                    _id: '$_id.userId',
                    solvedSlugs: { $push: '$_id.problemSlug' },
                    solvedDetails: { $push: { slug: '$_id.problemSlug', code: '$code', language: '$language', time: '$firstAcceptedAt' } },
                    solvedCount: { $sum: 1 },
                    lastSolvedAt: { $max: '$firstAcceptedAt' },
                }
            }
        ]);

        // ── 3. Build a map userId → solved info ────────────────────────────────
        const solvedMap = {};
        solvedAgg.forEach(row => {
            solvedMap[row._id.toString()] = {
                solvedSlugs: row.solvedSlugs,
                solvedDetails: row.solvedDetails,
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
            const info = solvedMap[uid] || { solvedSlugs: [], solvedDetails: [], solvedCount: 0, lastSolvedAt: null };
            
            // Calculate total marks earned by this user
            let userMarks = 0;
            info.solvedSlugs.forEach(slug => {
                userMarks += problemDifficultyMap[slug] || 0;
            });

            return {
                _id: uid,
                name: u.name,
                email: u.email,
                solvedCount: info.solvedCount,
                solvedSlugs: info.solvedSlugs,
                solvedDetails: info.solvedDetails,
                totalAttempts: attemptsMap[uid] || 0,
                lastSolvedAt: info.lastSolvedAt,
                // Score: percentage of marks earned out of total marks
                score: totalContestMarks > 0
                    ? Math.round((userMarks / totalContestMarks) * 100)
                    : 0,
                scorePoints: userMarks,
            };
        });

        // Sort: most points first, then earliest last-solved (tiebreak)
        rows.sort((a, b) => {
            if (b.scorePoints !== a.scorePoints) return b.scorePoints - a.scorePoints;
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
