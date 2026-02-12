fetch('http://localhost:5000/api/add-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://codeforces.com/problemset/problem/158/A' })
})
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));