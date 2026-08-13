import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Submission from '@/models/Submission';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params; // Contest ID
        const body = await req.json();
        const { studentId } = body;

        if (!id || !studentId) {
            return NextResponse.json({ success: false, message: 'Contest ID and Student ID are required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Delete all submissions of this student for this contest
        const deleteSubmissionsResult = await Submission.deleteMany({
            contestId: id,
            userId: studentId
        });

        // 2. Remove student from Contest registeredUsers and exitedUsers
        const updateContestResult = await Contest.findByIdAndUpdate(
            id,
            {
                $pull: {
                    registeredUsers: studentId,
                    exitedUsers: studentId
                }
            },
            { new: true }
        );

        if (!updateContestResult) {
            return NextResponse.json({ success: false, message: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Student and submissions deleted successfully',
            deletedSubmissionsCount: deleteSubmissionsResult.deletedCount
        });

    } catch (error) {
        console.error('Remove Student Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
