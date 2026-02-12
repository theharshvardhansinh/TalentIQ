export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Submission from '@/models/Submission'; // To get performance?
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';


export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const students = await User.aggregate([
            { $match: { role: 'student' } },
            {
                $lookup: {
                    from: 'submissions',
                    let: { uid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$uid'] },
                                        { $eq: ['$status', 'Accepted'] }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: '$problemSlug' } },
                        { $count: 'count' }
                    ],
                    as: 'solvedStats'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    createdAt: 1,
                    solvedCount: { $ifNull: [{ $arrayElemAt: ['$solvedStats.count', 0] }, 0] }
                }
            },
            { $sort: { solvedCount: -1 } }
        ]);

        return NextResponse.json({ success: true, count: students.length, data: students });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
