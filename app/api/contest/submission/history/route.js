export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import { getSession } from '@/lib/auth';



export async function GET(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const problemSlug = searchParams.get('problemSlug');

        if (!problemSlug) {
            return NextResponse.json({ error: 'Missing problemSlug' }, { status: 400 });
        }

        await dbConnect();

        const submissions = await Submission.find({
            userId: session.user.id,
            problemSlug
        })
            .select('status language code createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: submissions });

    } catch (error) {
        console.error('Submission History Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
