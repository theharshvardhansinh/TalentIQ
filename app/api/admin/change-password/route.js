import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, newPassword } = await req.json();

        if (!userId || !newPassword) {
            return NextResponse.json({ success: false, error: 'User ID and New Password are required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ success: true, message: 'Password changed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
