
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    const pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;

    // Health check endpoint
    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: 'healthy',
            application: 'GitHub Actions Documentation Portal',
            timestamp: new Date().toISOString()
        }));
    }

    // Serve homepage and static files
    const requestedPath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const filePath = path.resolve(PUBLIC_DIR, requestedPath);

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500, {
                'Content-Type': 'text/plain; charset=utf-8'
            });

            return res.end(error.code === 'ENOENT'
                ? '404 - Page not found'
                : 'Internal Server Error');
        }

        const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType
        });

        res.end(content);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Documentation Portal running on port ${PORT}`);
});

function shutdown() {
    console.log('Shutting down server...');

    server.close(() => {
        console.log('Server stopped gracefully');
        process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

