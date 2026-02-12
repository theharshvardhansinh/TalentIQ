
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Submission from '@/models/Submission';
import User from '@/models/User';
import { getSession } from '@/lib/auth';


export async function GET(req, { params }) {
    try {
        const session = await getSession();
        // Leaderboard is generally public or requires login? 
        // User asked for "student/contest", so likely auth required.
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: contestId } = await params;
        await dbConnect();

        // 1. Fetch Contest to check status and time validity
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        const now = new Date();
        const isLive = now >= new Date(contest.startTime) && now < new Date(contest.endTime);
        const isEnded = now >= new Date(contest.endTime);
        const contestStatus = isLive ? 'Live' : (isEnded ? 'Ended' : 'Upcoming');

        // 2. Fetch all Accepted Submissions
        // We look for submissions with this contestId.
        // If your older submissions don't have contestId, you might want to fetch by time range + problem slugs.
        // For this implementation, we rely on the newly added contestId field.

        let query = {
            contestId: contestId,
            status: 'Accepted'
        };

        // Fallback: If no contestId on submissions (older ones), try time range matching
        // (This is an optional robustness step, skipping for strict implementation based on User Request)

        const submissions = await Submission.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: 1 }); // Process in order to find "last" correctly logic

        // 3. Aggregate Data
        // Map<UserId, { user, score: Set<slug>, lastTime, submissions: [] }>
        const leaderboardMap = new Map();

        for (const sub of submissions) {
            if (!sub.userId) continue; // Should not happen

            const uid = sub.userId._id.toString();

            if (!leaderboardMap.has(uid)) {
                leaderboardMap.set(uid, {
                    user: {
                        _id: uid,
                        name: sub.userId.name,
                        email: sub.userId.email
                    },
                    solvedProblems: new Set(), // Track unique slugs
                    lastSubmissionTime: new Date(0), // Epoch
                    details: [] // Store subset of info for "View Code"
                });
            }

            const entry = leaderboardMap.get(uid);

            // If this problem hasn't been solved by this user yet (for points)
            if (!entry.solvedProblems.has(sub.problemSlug)) {
                entry.solvedProblems.add(sub.problemSlug);

                // Update last time only if this submission contributed to score
                if (new Date(sub.createdAt) > entry.lastSubmissionTime) {
                    entry.lastSubmissionTime = new Date(sub.createdAt);
                }
            }

            // Store detail (code is only allowed if Ended)
            // We store it here, but strip it later if Live
            entry.details.push({
                problemSlug: sub.problemSlug,
                code: sub.code,
                language: sub.language,
                createdAt: sub.createdAt
            });
        }

        // 4. Convert to Array and Sort
        const leaderboard = Array.from(leaderboardMap.values()).map(entry => {
            // Strip code if Live
            const safeDetails = entry.details.map(d => ({
                ...d,
                code: contestStatus === 'Ended' ? d.code : null // SECURITY CHECK
            }));

            // We pick the latest submission for each problem to show in "View User Code" typically, 
            // or just all accepted? User asked for "View Code", let's return all accepted ones.

            return {
                user: entry.user,
                score: entry.solvedProblems.size,
                finishTime: entry.lastSubmissionTime, // ISO String
                solutions: safeDetails
            };
        });

        // Sort: Score DESC, then Time ASC
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // Higher score first
            }
            return new Date(a.finishTime) - new Date(b.finishTime); // Earlier time first
        });

        // Add Rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        return NextResponse.json({
            success: true,
            status: contestStatus,
            data: rankedLeaderboard
        });

    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
