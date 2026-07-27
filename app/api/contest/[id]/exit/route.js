import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { getSession } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const contest = await Contest.findById(id);
        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Add student to exitedUsers list
        if (session.user.role === 'student') {
            await Contest.findByIdAndUpdate(
                id,
                { $addToSet: { exitedUsers: session.user.id } }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully exited the contest'
        });

    } catch (error) {
        console.error('Exit Contest Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
