export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import User from '@/models/User'; // Assuming User model for admin verification
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Handler for DELETE request
export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ success: false, message: 'Password is required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Verify Admin Password
        const adminUser = await User.findById(session.user.id);
        if (!adminUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, message: 'Incorrect admin password' }, { status: 403 });
        }

        // 2. Delete the Contest
        const deletedContest = await Contest.findByIdAndDelete(id);

        if (!deletedContest) {
            return NextResponse.json({ success: false, message: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Contest deleted successfully' });

    } catch (error) {
        console.error('Delete Contest Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
