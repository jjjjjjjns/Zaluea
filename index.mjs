import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

// Set the password to "mypassword"
const PASSWORD = 'mypassword';

server.on('request', (request, response) => {
    // Check if the user has provided the correct password
    if (request.headers.authorization !== `Basic ${Buffer.from(`:${PASSWORD}`).toString('base64')}`) {
        response.writeHead(403);
        response.end('Access denied');
        return;
    }

    if (bare.route_request(request, response)) return true;
    serve.serve(request, response);
});

server.on('upgrade', (req, socket, head) => {
    // Check if the user has provided the correct password
    if (req.headers.authorization !== `Basic ${Buffer.from(`:${PASSWORD}`).toString('base64')}`) {
        socket.write('HTTP/1.1 403 Access denied\r\n\r\n');
        socket.end();
        return;
    }

    if (bare.route_upgrade(req, socket, head)) return;
    socket.end();
});

server.listen(process.env.PORT || 8080);
