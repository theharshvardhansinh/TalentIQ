

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
    } catch (error) {
        console.error('Reset Password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
