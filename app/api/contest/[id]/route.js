
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

export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'volunteer' && session.user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        await dbConnect();

        const contest = await Contest.findById(id);
        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        // Check if the user is an admin or the creator of the contest
        if (session.user.role !== 'admin' && contest.createdBy.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized to delete this contest' }, { status: 403 });
        }

        // Delete associated problems
        if (contest.problems && contest.problems.length > 0) {
            await Problem.deleteMany({ _id: { $in: contest.problems } });
        }

        // Delete associated submissions
        const Submission = (await import('@/models/Submission')).default;
        await Submission.deleteMany({ contestId: id });

        await Contest.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Contest and associated data deleted successfully' });

    } catch (error) {
        console.error('Error deleting contest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
