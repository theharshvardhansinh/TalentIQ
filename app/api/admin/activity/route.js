export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';



export async function GET(request) {
    const session = await getSession();

    if (!session || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        await dbConnect();

        // Let's seed some dummy data if empty
        const count = await ActivityLog.countDocuments();
        if (count === 0) {
            const dummyLogs = [
                { user: 'Sarah Connor', action: 'registered for', target: 'Hackathon 2024', timestamp: new Date(Date.now() - 2 * 60 * 1000), icon: 'Users' },
                { user: 'Admin', action: 'updated contest', target: 'Code Wars', timestamp: new Date(Date.now() - 60 * 60 * 1000), icon: 'Calendar' },
                { user: 'John Doe', action: 'joined as', target: 'Volunteer', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), icon: 'Plus' },
                { user: 'System', action: 'automated backup', target: 'Success', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), icon: 'Activity' },
                { user: 'Michael Scott', action: 'registered for', target: 'Code Sprint', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), icon: 'Users' }
            ];
            await ActivityLog.insertMany(dummyLogs);
        }

        const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(50);

        return new Response(JSON.stringify(logs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error getting logs:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), { status: 500 });
    }
}
