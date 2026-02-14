const url = 'https://codeforces.com/problemset/problem/158/A';
const match = url.match(/problem\/(\d+)\/([A-Z0-9]+)/);

if (match) {
    const contestId = match[1];
    const index = match[2];

    console.log(`Sending request for Contest: ${contestId}, Index: ${index}`);

    fetch('http://localhost:3000/api/generate-problem', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            platform: 'codeforces',
            contestId: contestId,
            index: index 
        })
    })
    .then(res => res.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => console.error("Fetch Error:", err));
} else {
    console.error("Invalid Codeforces URL format. Expected: https://codeforces.com/problemset/problem/158/A");
}