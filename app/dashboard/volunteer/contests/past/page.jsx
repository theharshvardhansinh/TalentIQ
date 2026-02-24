import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { serialize } from '@/lib/utils';
import PastContestsClient from './PastContestsClient';

export const dynamic = 'force-dynamic';

export default async function PastContestsPage() {
    const session = await getSession();

    if (!session || (session.user.role !== 'volunteer' && session.user.role !== 'admin')) {
        redirect('/login');
    }

    await dbConnect();
    const now = new Date();

    const pastContestsData = await Contest.find({ endTime: { $lte: now } }).sort({ endTime: -1 }).lean();
    const pastContests = serialize(pastContestsData);

    return <PastContestsClient pastContests={pastContests} />;
}
