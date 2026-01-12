import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await dbConnect();
        const user = await User.findById(decoded.userId).select('-password').lean();
        if (!user) return null;

        return { user: { ...user, id: user._id.toString(), _id: user._id.toString() } };
    } catch (error) {
        return null;
    }
}
