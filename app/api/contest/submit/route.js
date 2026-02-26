
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import Problem from '@/models/Problem';
import { getSession } from '@/lib/auth';

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

// Helper to map language slugs to Judge0 IDs
function getLanguageId(lang) {
    const map = {
        'python': 71,     // Python (3.8.1)
        'javascript': 63, // JavaScript (Node.js 12.14.0)
        'cpp': 54,        // C++ (GCC 9.2.0)
        'java': 62,       // Java (OpenJDK 13.0.1)
        'c': 50           // C (GCC 9.2.0)
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
        const { userId, contestId, problemSlug, code, language } = body;

        if (!problemSlug || !code || !language) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch Problem & Test Cases
        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return NextResponse.json({ error: 'No test cases to judge against' }, { status: 400 });
        }

        // 2. Prepare Parallel Submissions (Single Submission API + Base64 Encoding)
        // We use Single Submissions to avoid Batch API "No such file" errors.
        // We use Base64 Encoding to avoid "UTF-8" conversion errors.
        const languageId = getLanguageId(language);

        // Prepare the combined code
        let finalCode = code;
        if (problem.driverCode && problem.driverCode[language]) {
            finalCode = prepareSourceCode(code, problem.driverCode[language]);
        }

        const submissionPromises = problem.testCases.map(async (tc) => {
            const payload = {
                source_code: toBase64(finalCode),
                language_id: languageId,
                stdin: toBase64(tc.input),
                expected_output: toBase64(tc.output)
            };

            try {
                // Use base64_encoded=true
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
                console.error("Judge0 Fetch Error:", err);
                return {
                    status: { id: 13, description: "Connection Error" },
                    stdout: null, stderr: null, compile_output: null,
                    message: toBase64(`Connection Failed: ${err.message}`)
                };
            }
        });

        // 3. Execute All
        const judgeResults = await Promise.all(submissionPromises);

        // Debug logging
        console.log('Judge0 Parallel Results (Base64):', JSON.stringify(judgeResults, null, 2));

        // 4. Process Results
        let passedCount = 0;
        let finalStatus = 'Accepted';
        const detailResults = [];

        for (let i = 0; i < judgeResults.length; i++) {
            const res = judgeResults[i];
            const testCase = problem.testCases[i];

            // Check for timeouts
            if (res.token && !res.status) {
                detailResults.push({
                    testCaseId: i,
                    status: 'Time Limit Exceeded',
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: "",
                    message: "Execution timed out (In Queue)"
                });
                if (finalStatus === 'Accepted') finalStatus = 'Time Limit Exceeded';
                continue;
            }

            // Safety Check
            if (!res || !res.status) {
                detailResults.push({
                    testCaseId: i,
                    status: 'System Error',
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: "",
                    message: res.message || "Judge0 returned incomplete data."
                });
                if (finalStatus === 'Accepted') finalStatus = 'Runtime Error';
                continue;
            }

            // Status ID 3 means "Accepted"
            const isPassed = res.status.id === 3;

            // Decode Output
            let actualOutput = fromBase64(res.stdout).trim();
            let errorOutput = fromBase64(res.stderr) || fromBase64(res.compile_output) || fromBase64(res.message) || "";

            if (isPassed) {
                passedCount++;
            } else {
                if (finalStatus === 'Accepted') {
                    const judgeStatus = res.status.description;
                    if (judgeStatus === 'Wrong Answer') finalStatus = 'Wrong Answer';
                    else if (judgeStatus === 'Compilation Error') finalStatus = 'Compilation Error';
                    else if (judgeStatus === 'Time Limit Exceeded') finalStatus = 'Time Limit Exceeded';
                    else finalStatus = 'Runtime Error';
                }
            }

            const isHidden = !testCase.isPublic;

            detailResults.push({
                testCaseId: i,
                isHidden,
                status: isPassed ? 'Passed' : 'Failed',
                // Redact hidden test case data — only show pass/fail
                input: isHidden ? null : testCase.input,
                expectedOutput: isHidden ? null : testCase.output,
                actualOutput: isHidden ? null : (actualOutput || errorOutput),
                message: res.status.description
            });
        }

        // 5. Save Submission
        const submission = await Submission.create({
            userId: session.user.id,
            problemSlug,
            code,
            language,
            status: finalStatus,
            contestId: contestId || null
        });

        return NextResponse.json({
            status: finalStatus,
            passedCount,
            totalCount: problem.testCases.length,
            results: detailResults
        });

    } catch (error) {
        console.error('Submission Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
