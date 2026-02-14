
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:3000';

async function runScalabilityTest() {
    console.log('--- Starting Scalability Test (10 Concurrent Users) ---');
    console.log(`Target: ${BASE_URL}`);

    // Create 10 different users from seed data
    const users = Array.from({ length: 10 }, (_, i) => ({
        email: `test_student_${i + 1}@example.com`,
        password: 'password123'
    }));

    // 1. Concurrent Login
    console.log('\n1. Logging in 10 users concurrently...');
    const loginPromises = users.map(async (user) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (!res.ok) {
                console.error(`Login failed for ${user.email} (${res.status})`);
                return null;
            }

            // Extract token cookie
            // Node fetch: headers.getSetCookie() returns array of strings
            const rawCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
            const tokenCookie = rawCookies.find(c => c && c.startsWith('token='));
            
            if (!tokenCookie) return null;

            return { 
                email: user.email, 
                token: tokenCookie.split(';')[0] // Just the token=... part
            };
        } catch (e) {
            console.error(`Login error for ${user.email}:`, e.message);
            return null;
        }
    });

    const loggedInUsers = (await Promise.all(loginPromises)).filter(u => u !== null);
    console.log(`Successfully logged in: ${loggedInUsers.length}/${users.length}`);

    if (loggedInUsers.length === 0) {
        console.error('No users logged in. Aborting.');
        process.exit(1);
    }

    // 2. Fetch Contest ID (to avoid CastError)
    console.log('\n2. Fetching Contest ID...');
    const listRes = await fetch(`${BASE_URL}/api/contest/list`, {
        headers: { 'Cookie': loggedInUsers[0].token }
    });
    
    let contestId = null;
    if (listRes.ok) {
        const listData = await listRes.json();
        const contest = listData.data.find(c => c.title === 'Automated Test Contest');
        if (contest) {
            contestId = contest._id;
            console.log(`Found Contest ID: ${contestId}`);
        } else {
            console.warn('Contest not found, proceeding without contestId (or with null)');
        }
    }

    // 3. Prepare Submission Payload
    const payload = {
        problemSlug: 'sum-of-two',
        language: 'python',
        code: `
a, b = map(int, input().split())
print(a + b)
`,
        contestId: contestId 
    };

    console.log('\n3. Submitting code concurrently...');
    const startTime = Date.now();

    const submissionPromises = loggedInUsers.map(async (user) => {
        try {
            const startReq = Date.now();
            const res = await fetch(`${BASE_URL}/api/contest/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': user.token
                },
                body: JSON.stringify(payload)
            });
            const duration = Date.now() - startReq;
            
            if (!res.ok) {
                const text = await res.text();
                return { email: user.email, success: false, status: res.status, duration, error: text };
            }

            const data = await res.json();
            return { email: user.email, success: true, status: res.status, duration, data };
        } catch (e) {
            return { email: user.email, success: false, status: 0, duration: 0, error: e.message };
        }
    });

    const results = await Promise.all(submissionPromises);
    const totalTime = Date.now() - startTime;

    // 3. Analyze Results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n--- Test Results ---');
    console.log(`Concurrent Requests: ${loggedInUsers.length}`);
    console.log(`Total Batch Time: ${totalTime}ms`);
    console.log(`Average Response Time: ${(results.reduce((acc, r) => acc + r.duration, 0) / results.length).toFixed(2)}ms`);
    console.log(`Successful Submissions: ${successful.length}`);
    console.log(`Failed Submissions: ${failed.length}`);

    if (failed.length > 0) {
        console.log('\nFailures:');
        failed.forEach(f => console.log(`- ${f.email}: ${f.status} (${f.error.substring(0, 100)}...)`));
    }

    if (successful.length > 0) {
        // Check Judge0 status
        const accepted = successful.filter(s => s.data.status === 'Accepted');
        console.log(`\nJudge0 Status Breakdown:`);
        console.log(`- Accepted: ${accepted.length}`);
        console.log(`- Other: ${successful.length - accepted.length}`);
        
        if (accepted.length > 0) {
            console.log(`Sample Result for ${successful[0].email}:`, JSON.stringify(successful[0].data, null, 2));
        } else {
             console.log(`Sample Result (Non-Accepted):`, JSON.stringify(successful[0].data, null, 2));
        }
    }
}

runScalabilityTest();
