import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { contestId } = await req.json();
        const userId = session.user.id;

        if (!contestId) {
            return NextResponse.json({ error: 'Contest ID is required' }, { status: 400 });
        }

        await dbConnect();

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Check if contest is upcoming (allow registration only if not ended? or strict regarding start time?)
        // Prompt says "Check if the contest is "Upcoming" (cannot register for ended contests)."
        // Usually, registration should be allowed before end time.
        // Let's allow if not ended.

        const now = new Date();
        if (now > new Date(contest.endTime)) {
            return NextResponse.json({ error: 'Contest has ended' }, { status: 400 });
        }

        // Add user to registeredUsers if not already there
        if (!contest.registeredUsers.includes(userId)) {
            contest.registeredUsers.push(userId);
            await contest.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully registered for the contest',
            registeredCount: contest.registeredUsers.length
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
