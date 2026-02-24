import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.resetPasswordToken = hashedOtp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Nodemailer Email Sending
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or use 'host' and 'port' for other providers
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Talent IQ Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - Talent IQ',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>You requested a password reset for your Talent IQ account.</p>
          <p>Your OTP code is:</p>
          <h1 style="background: #f3f4f6; padding: 10px 20px; display: inline-block; border-radius: 8px; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'OTP sent successfully to your email' }, { status: 200 });
    } catch (error) {
        console.error('Forgot Password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
