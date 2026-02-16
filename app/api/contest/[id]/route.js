
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Problem from '@/models/Problem'; // Register Problem model
import { getSession } from '@/lib/auth';

// Reuse GET from existing if possible, but we are overwriting the file.
// We will include GET, PUT logic here.

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const resolvedParams = await params;
        const { id } = resolvedParams;

        // Populate problems fully so we can show their titles, etc. in the list
        // Note: We avoid sending test cases for security, even for volunteers/edits usually, 
        // unless they need to see them? Let's just send title/slug/difficulty.
        const contest = await Contest.findById(id).populate({
            path: 'problems',
            select: 'title slug difficulty' // Just basic info for the list
        });

        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: contest });
    } catch (error) {
        console.error('Error fetching contest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'volunteer' && session.user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await req.json();

        await dbConnect();

        // 1. Validate fields (Basic)
        // body should contain: title, description, startTime, endTime, problems (array of ObjectIds)

        const updateData = {
            title: body.title,
            description: body.description,
            startTime: body.startTime,
            endTime: body.endTime,
            problems: body.problems // Expecting array of existing problem _ids
        };

        const updatedContest = await Contest.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedContest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedContest });

    } catch (error) {
        console.error('Error updating contest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
