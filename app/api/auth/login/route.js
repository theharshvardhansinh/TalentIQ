

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redis from '@/lib/redis';

export async function POST(req) {
    try {


        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
        }

        await dbConnect();

        const emailInput = email.trim().toLowerCase();

        // Special case for initial admin setup
        if (emailInput === 'admin' && password === 'admin') {
            // Check if admin exists using native collection to bypass schema cache
            const adminUser = await User.collection.findOne({ email: 'admin' });

            if (!adminUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('admin', salt);
                // Direct insert to ensure role is saved
                await User.collection.insertOne({
                    name: 'Admin',
                    email: 'admin',
                    password: hashedPassword,
                    role: 'admin',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    __v: 0
                });
            } else if (adminUser.role !== 'admin') {
                // Fix role if it's missing (e.g. stale schema issue)
                await User.collection.updateOne(
                    { _id: adminUser._id },
                    { $set: { role: 'admin' } }
                );
            }
        }

        // Use lean() to get plain object, ensuring we see fields even if not in cached schema
        const user = await User.findOne({ email: { $regex: new RegExp(`^${emailInput}$`, 'i') } }).lean();

        if (!user) {
            console.log("Login failed: User not found for email:", emailInput);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Login failed: Password mismatch for user:", user.email);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role || 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Access token valid for 1 day
        );

        // Generate a refresh token (random string or long-lived JWT)
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store refresh token in Redis (valid for 7 days)
        try {
            await redis.set(`refresh_token:${user._id}`, refreshToken, { ex: 7 * 24 * 60 * 60 });
        } catch (redisError) {
            console.error('Redis error:', redisError);
            // Continue login even if Redis fails? Or fail? 
            // Failing is safer if we depend on it, but for now let's log.
        }

        const response = NextResponse.json({
            message: 'Login successful',
            role: user.role || 'student'
        }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
