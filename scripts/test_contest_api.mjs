
// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:3000';

async function runTest() {
    console.log('--- Starting API Test ---');

    // 1. Login
    console.log('\n1. Logging in as test_student_1@example.com...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test_student_1@example.com',
            password: 'password123'
        })
    });

    if (!loginRes.ok) {
        console.error('Login Failed:', await loginRes.text());
        process.exit(1);
    }

    const loginData = await loginRes.json();
    console.log('Login Success:', loginData);

    // Extract Cookies
    // Extract Cookies (Node native fetch)
    const rawCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')];
    if (!rawCookies) {
        console.error('No cookies received!');
        process.exit(1);
    }
    
    // Simple cookie parser for the "token"
    const tokenCookie = rawCookies.find(c => c.startsWith('token='));
    const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');

    console.log('Captured Cookies.');

    // 2. Get Contests
    console.log('\n2. Fetching Contest List...');
    const contestListRes = await fetch(`${BASE_URL}/api/contest/list`, {
        method: 'GET',
        headers: {
            'Cookie': cookieHeader
        }
    });

    if (!contestListRes.ok) {
        console.error('Fetch Contests Failed:', await contestListRes.text());
        process.exit(1);
    }

    const contestList = await contestListRes.json();
    console.log(`Found ${contestList.data.length} contests.`);

    const targetContest = contestList.data.find(c => c.title === 'Automated Test Contest');
    
    if (!targetContest) {
        console.error('Target contest "Automated Test Contest" not found!');
        process.exit(1);
    }

    console.log(`Target Contest Found: ID=${targetContest._id}`);

    // 3. Get Contest Details (assuming endpoint exists as /api/contest/[id])
    console.log(`\n3. Fetching Contest Details for ${targetContest._id}...`);
    const detailRes = await fetch(`${BASE_URL}/api/contest/${targetContest._id}`, {
        method: 'GET',
         headers: {
            'Cookie': cookieHeader
        }
    });

    if (!detailRes.ok) {
        console.error('Fetch Detail Failed:', await detailRes.text());
        // It might be that the endpoint is different? 
        // e.g. /api/contest/get?id=...
    } else {
        const detailData = await detailRes.json();
        console.log('Contest Details Retrieved.');
        
        let problems = [];
        if (detailData.data && detailData.data.problems) {
             problems = detailData.data.problems;
             console.log(`Found ${problems.length} problems.`);
             problems.forEach(p => console.log(` - ${p.title} (${p.difficulty})`));
        } else if (detailData.contest && detailData.contest.problems) {
             problems = detailData.contest.problems;
             console.log(`Found ${problems.length} problems.`);
             problems.forEach(p => console.log(` - ${p.title} (${p.difficulty})`));
        } else {
            console.log("No problems structure found in response:", Object.keys(detailData));
        }
        
    }

    console.log('\n--- Test Complete ---');
}

runTest().catch(console.error);
