import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

server.on('request', (request, response) => {
    const cookies = parseCookies(request);
    const authCookie = cookies.Auth;
    if (authCookie === '1273174891') {
        // Serve requested content
        serve.serve(request, response);
    } else {
        // Unauthorized access, return 401 Unauthorized status code
        response.writeHead(401);
        response.end();
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.route_upgrade(req, socket, head)) return;
    socket.end();
});

function parseCookies(request) {
    const cookies = {};
    if (!request.headers.cookie) {
        return cookies;
    }
    const cookiesRaw = request.headers.cookie.split(';');
    cookiesRaw.forEach(cookieRaw => {
        const [name, value] = cookieRaw.split('=').map(c => c.trim());
        cookies[name] = value;
    });
    return cookies;
}
