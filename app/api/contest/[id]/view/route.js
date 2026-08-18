
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Submission from '@/models/Submission';
import Problem from '@/models/Problem'; // Ensure registered
import { getSession } from '@/lib/auth';



export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // 1. Fetch Contest with basic fields first to check timing
        let contest = await Contest.findById(id);

        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        const isStudent = session.user.role === 'student';
        const hasExited = contest.exitedUsers && contest.exitedUsers.some(u => u.toString() === session.user.id.toString());

        if (isStudent && hasExited) {
            return NextResponse.json({ error: 'You have exited this contest and cannot rejoin.' }, { status: 403 });
        }

        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        const isUpcoming = now < startTime;
        const isEnded = now >= endTime;

        const isRegistered = contest.registeredUsers && contest.registeredUsers.includes(session.user.id);

        if (isStudent && !isRegistered) {
            await Contest.findByIdAndUpdate(
                id,
                { $addToSet: { registeredUsers: session.user.id } }
            );
        }

        // 2. Security Check
        // If student AND contest hasn't started, hide problems
        if (isStudent && isUpcoming) {
            // Return stripped data
            return NextResponse.json({
                success: true,
                data: {
                    _id: contest._id,
                    title: contest.title,
                    description: contest.description,
                    startTime: contest.startTime,
                    endTime: contest.endTime,
                    questionCount: contest.questionCount,
                    status: 'upcoming',
                    isEnded: false,
                    isRegistered: isRegistered,
                    userScore: 0,
                    userMarks: 0,
                    totalMarks: 0,
                    problems: [] // Explicitly empty
                }
            });
        }

        // 3. If Live/Past or Admin, populate problems fully (excluding secrets)
        contest = await Contest.findById(id).populate({
            path: 'problems',
            select: '-testCases -expectedOutput -createdBy', // Exclude sensitive info
            model: Problem
        }).lean();

        // 4. Solve Status Integration & Score Calculation
        const problemSlugs = contest.problems.map(p => p.slug);
        const submissions = await Submission.find({
            userId: session.user.id,
            problemSlug: { $in: problemSlugs },
            contestId: id
        }).select('problemSlug status passedCount totalCount').lean();

        // Find the max pass ratio for each problem
        const scoreMap = {};

        submissions.forEach(sub => {
            let passRatio = 0;
            if (sub.totalCount > 0) {
                passRatio = sub.passedCount / sub.totalCount;
            } else {
                passRatio = sub.status === 'Accepted' ? 1 : 0;
            }
            
            if (!scoreMap[sub.problemSlug] || passRatio > scoreMap[sub.problemSlug]) {
                scoreMap[sub.problemSlug] = passRatio;
            }
        });

        // 5. Attach status and calculate score
        let earnedScore = 0;
        let userMarks = 0;
        let totalMarks = 0;

        const problemsWithStatus = contest.problems.map(prob => {
            const ratio = scoreMap[prob.slug] || 0;
            const diff = prob.difficulty || 'Medium';
            const marks = diff === 'Easy' ? 2 : diff === 'Hard' ? 6 : 4;
            
            totalMarks += marks;
            
            let status = 'unsolved';
            if (ratio === 1) {
                status = 'solved';
                earnedScore++; // Fully solved count
            } else if (ratio > 0) {
                status = 'attempted';
            }

            userMarks += (marks * ratio);

            return {
                ...prob,
                userStatus: status
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                ...contest,
                problems: problemsWithStatus,
                status: isEnded ? 'past' : (isUpcoming ? 'upcoming' : 'live'),
                isEnded: isEnded,
                userScore: earnedScore, // Count of fully solved problems
                userMarks: Math.round(userMarks), // Rounded marks as requested
                totalMarks: totalMarks,
                totalProblems: contest.problems.length,
                isRegistered: isRegistered
            }
        });

    } catch (error) {
        console.error('Error fetching contest details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
