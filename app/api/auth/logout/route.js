

import { NextResponse } from 'next/server';

export async function POST(req) {
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
