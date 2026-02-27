'use client';

import { useRouter } from 'next/navigation';
import ContestLeaderboard from './ContestLeaderboard';

export default function VolunteerLeaderboardWrapper({ contest }) {
    const router = useRouter();

    const handleBack = () => {
        router.push('/dashboard/volunteer');
    };

    return <ContestLeaderboard contest={contest} onBack={handleBack} isVolunteer={true} />;
}
