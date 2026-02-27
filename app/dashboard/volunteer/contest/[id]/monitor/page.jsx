
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import React from 'react';
import VolunteerLeaderboardWrapper from '@/app/components/VolunteerLeaderboardWrapper';

export default async function VolunteerMonitorPage({ params }) {
    const session = await getSession();

    if (!session || (session.user.role !== 'volunteer' && session.user.role !== 'admin')) {
        redirect('/login');
    }

    const { id } = await params;
    await dbConnect();
    const contest = await Contest.findById(id).lean();

    if (!contest) {
        return <div className="p-8 text-center text-white">Contest not found</div>;
    }

    const safeContest = {
        _id: contest._id.toString(),
        title: contest.title,
        startTime: contest.startTime.toISOString(),
        endTime: contest.endTime.toISOString(),
    };

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-white p-6">
            <VolunteerLeaderboardWrapper contest={safeContest} />
        </div>
    );
}
