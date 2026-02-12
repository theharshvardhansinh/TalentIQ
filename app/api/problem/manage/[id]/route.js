export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Problem from '@/models/Problem';
import { getSession } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params; // Next.js 15+ await

        const problem = await Problem.findById(id);

        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: problem });
    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Validate basic fields
        if (!body.title || !body.description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updateData = {
            title: body.title,
            description: body.description,
            difficulty: body.difficulty,
            constraints: body.constraints,
            inputFormat: body.inputFormat,
            outputFormat: body.outputFormat,
            tags: body.tags,
            testCases: body.testCases,
            starterCode: body.starterCode
        };

        const problem = await Problem.findByIdAndUpdate(id, updateData, { new: true });

        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: problem });

    } catch (error) {
        console.error('Error updating problem:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        await Problem.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Problem deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
