export const dynamic = 'force-dynamic';

import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import User from '@/models/User';
import Contest from '@/models/Contest';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // Verify contest exists
        const contest = await Contest.findById(id);
        if (!contest) {
            return NextResponse.json({ success: false, message: 'Contest not found' }, { status: 404 });
        }

        // Aggregate submissions for this contest
        const leaderboard = await Submission.aggregate([
            {
                $match: {
                    contestId: new mongoose.Types.ObjectId(id), // Use ObjectId
                    status: 'Accepted'
                }
            },
            {
                $group: {
                    _id: { userId: '$userId', problem: '$problemSlug' }, // Groups by user AND distinct problem
                }
            },
            {
                $group: {
                    _id: '$_id.userId',
                    solvedCount: { $sum: 1 } // Count unique problems solved
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    solvedCount: 1
                }
            },
            { $sort: { solvedCount: -1, name: 1 } }
        ]);

        return NextResponse.json({ success: true, data: leaderboard });

    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
