const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    res.end(`
        <h1>Hello from GitHub Actions!</h1>
        <p>My Docker image was built automatically.</p>
    `);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
