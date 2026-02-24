
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import VolunteerDashboardClient from './VolunteerDashboardClient';
import { serialize } from '@/lib/utils';
export const dynamic = 'force-dynamic';


export default async function VolunteerDashboard() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (session.user.role !== 'volunteer' && session.user.role !== 'admin') {
        redirect('/dashboard');
    }

    await dbConnect();

    const now = new Date();

    const liveContestsData = await Contest.find({ startTime: { $lte: now }, endTime: { $gt: now } }).sort({ endTime: 1 }).lean();
    const upcomingContestsData = await Contest.find({ startTime: { $gt: now } }).sort({ startTime: 1 }).lean();
    const pastContestsData = await Contest.find({ endTime: { $lte: now } }).sort({ endTime: -1 }).lean();

    const liveContests = serialize(liveContestsData);
    const upcomingContests = serialize(upcomingContestsData);
    const pastContests = serialize(pastContestsData);

    const activeCount = liveContests.length;
    const upcomingCount = upcomingContests.length;
    const allContests = [...liveContests, ...upcomingContests, ...pastContests];
    const totalParticipants = allContests.reduce((acc, curr) => acc + (curr.registeredUsers ? curr.registeredUsers.length : 0), 0);

    return (
        <VolunteerDashboardClient
            session={session}
            liveContests={liveContests}
            upcomingContests={upcomingContests}
            pastContests={pastContests}
            activeCount={activeCount}
            upcomingCount={upcomingCount}
            totalParticipants={totalParticipants}
        />
    );
}
