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
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'submissions'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    createdAt: 1,
                    solvedCount: {
                        $size: {
                            $filter: {
                                input: "$submissions",
                                as: "sub",
                                cond: { $eq: ["$$sub.status", "Accepted"] }
                            }
                        }
                    }
                }
            },
            { $sort: { solvedCount: -1 } }
        ]);

        return NextResponse.json({ success: true, count: students.length, data: students });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
