import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import redis from '@/lib/redis';

export async function POST(req) {
    const token = req.cookies.get('token')?.value;
    const refreshToken = req.cookies.get('refresh_token')?.value;
    let userId = null;

    try {
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        } else if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
    } catch (error) {
        // Token might be expired, which is fine during logout
        // If access token expired, try decoding refresh token if we verified it above?
        // If error occurred above, we might not have userId.
        // Let's try to just decode if verification failed due to expiry?
        // For security, only use verified tokens. If expired, they are useless anyway.
        // But refresh token is long lived. If it's expired, it's definitely gone.
        console.log("Logout: Token verification failed or expired");
    }

    if (userId) {
        try {
            await redis.del(`refresh_token:${userId}`);
        } catch (error) {
            console.error('Logout: Redis error', error);
        }
    }

    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    // Clear the token cookie
    response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    response.cookies.set('refresh_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    return response;
}
