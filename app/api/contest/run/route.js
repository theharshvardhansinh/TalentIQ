
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Problem from '@/models/Problem';
import { getSession } from '@/lib/auth';

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

function getLanguageId(lang) {
    const map = {
        'python': 71,
        'javascript': 63,
        'cpp': 54,
        'java': 62,
        'c': 50
    };
    return map[lang.toLowerCase()] || 71;
}

// Base64 Helpers
const toBase64 = (str) => Buffer.from(str || "").toString('base64');
const fromBase64 = (str) => Buffer.from(str || "", 'base64').toString('utf-8');

// Combine user and driver code
function prepareSourceCode(userCode, driverCodeTemplate) {
    if (driverCodeTemplate && driverCodeTemplate.includes('{{USER_CODE}}')) {
        return driverCodeTemplate.replace('{{USER_CODE}}', userCode);
    }
    return userCode;
}

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { problemSlug, code, language } = body;

        if (!problemSlug || !code || !language) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        // Filter for Public Test Cases
        let casesToRun = problem.testCases.filter(tc => tc.isPublic);

        if (casesToRun.length === 0 && problem.testCases.length > 0) {
            casesToRun = [problem.testCases[0]];
        }

        if (casesToRun.length === 0) {
            return NextResponse.json({ error: 'No test cases available to run' }, { status: 400 });
        }

        // Execute Parallel Single Submissions (Base64)
        const languageId = getLanguageId(language);

        // Prepare the combined code
        let finalCode = code;
        if (problem.driverCode && problem.driverCode[language]) {
            finalCode = prepareSourceCode(code, problem.driverCode[language]);
        }

        const submissionPromises = casesToRun.map(async (tc) => {
            const payload = {
                source_code: toBase64(finalCode),
                language_id: languageId,
                stdin: toBase64(tc.input),
                expected_output: toBase64(tc.output)
            };

            try {
                // Base64 Encoded Request
                const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    return {
                        status: { id: 13, description: "Connection Error" }, // Standardize on Connection Error for health check
                        stdout: null, stderr: null, compile_output: null,
                        message: toBase64(`Judge0 API Error: ${res.statusText}`)
                    };
                }
                return await res.json();
            } catch (err) {
                return {
                    status: { id: 13, description: "Connection Error" },
                    stdout: null, stderr: null, compile_output: null,
                    message: toBase64(`Connection Failed: ${err.message}`)
                };
            }
        });

        const judgeResults = await Promise.all(submissionPromises);

        let passedCount = 0;
        let finalStatus = 'Accepted';
        const detailResults = [];

        for (let i = 0; i < judgeResults.length; i++) {
            const res = judgeResults[i];
            const testCase = casesToRun[i];

            if (res.token && !res.status) {
                detailResults.push({
                    id: i,
                    status: 'Failed',
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: "In Queue (Timeout)",
                    message: "Execution timed out."
                });
                if (finalStatus === 'Accepted') finalStatus = 'Time Limit Exceeded';
                continue;
            }

            const isPassed = res.status && res.status.id === 3;

            // Decode Outputs
            let actualOutput = fromBase64(res.stdout).trim();
            let errorOutput = fromBase64(res.stderr) || fromBase64(res.compile_output) || fromBase64(res.message) || "";

            if (isPassed) {
                passedCount++;
            } else {
                if (finalStatus === 'Accepted') {
                    const judgeStatus = res.status ? res.status.description : 'Unknown Error';
                    if (judgeStatus === 'Wrong Answer') finalStatus = 'Wrong Answer';
                    else if (judgeStatus === 'Compilation Error') finalStatus = 'Compilation Error';
                    else if (judgeStatus === 'Time Limit Exceeded') finalStatus = 'Time Limit Exceeded';
                    else finalStatus = 'Runtime Error';
                }
            }

            detailResults.push({
                id: i,
                status: isPassed ? 'Passed' : 'Failed',
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: actualOutput || errorOutput,
                message: res.status ? res.status.description : 'Error'
            });
        }

        return NextResponse.json({
            success: true,
            status: finalStatus,
            passed: passedCount,
            total: casesToRun.length,
            results: detailResults
        });

    } catch (error) {
        console.error('Run Code Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
