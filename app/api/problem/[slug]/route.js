
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Problem from '@/models/Problem';
import { getSession } from '@/lib/auth';


export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        await dbConnect();

        // Fetch problem by slug
        // Exclude hidden testcases, createdBy, and timestamps
        const problem = await Problem.findOne({ slug }).select(
            'title description difficulty constraints inputFormat outputFormat testCases tags starterCode'
        ).lean();

        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        // Filter testCases to ONLY return public ones (examples)
        // We do this in JS to ensure we strictly control what is sent back
        const publicExamples = problem.testCases
            ? problem.testCases.filter(tc => tc.isPublic).map(tc => ({
                input: tc.input,
                output: tc.output,
                // explicit pick to avoid leaking hidden fields if any
            }))
            : [];

        // Construct safe response object
        const safeProblem = {
            _id: problem._id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            constraints: problem.constraints,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            tags: problem.tags,
            examples: publicExamples, // Key change: sending processed examples, not raw testCases
            starterCode: problem.starterCode
        };

        return NextResponse.json({ success: true, data: safeProblem });

    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
