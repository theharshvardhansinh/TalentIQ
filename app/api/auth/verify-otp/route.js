import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        await dbConnect();

        // Find user with valid token expiry
        const user = await User.findOne({
            email,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        const isOtpValid = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isOtpValid) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
