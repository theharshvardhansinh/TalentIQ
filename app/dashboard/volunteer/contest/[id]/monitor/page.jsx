
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LeaderboardClient from '@/app/dashboard/student/contest/[contestId]/leaderboard/page';

export default async function VolunteerMonitorPage({ params }) {
    const session = await getSession();

    if (!session || (session.user.role !== 'volunteer' && session.user.role !== 'admin')) {
        redirect('/login');
    }

    const { id } = await params;

    return (
        <div className="min-h-screen bg-black text-white">
            <LeaderboardClient
                params={Promise.resolve({ contestId: id })}
                showBackButton={true}
                backDestination="/dashboard/volunteer"
            />
        </div>
    );
}
