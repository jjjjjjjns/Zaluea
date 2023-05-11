import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const bare = new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

server.on('request', (request, response) => {
  if (bare.route_request(request, response)) return true;
  if (checkAuthCookie(request)) {
    serve.serve(request, response);
  } else {
    response.writeHead(401, { 'Content-Type': 'text/plain' });
    response.end('Your Request Was UnAuthed By The TeamBlatant Security System');
  }
});



server.on('upgrade', (req, socket, head) => {
  if (bare.route_upgrade(req, socket, head)) return;
  socket.end();
});

server.listen(process.env.PORT || 8080);

function checkAuthCookie(request) {
  const cookies = request.headers.cookie;
  if (cookies) {
    const authCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('AUTH='));
    if (authCookie) {
      const authValue = authCookie.split('=')[1];
      if (authValue === '12313134') {
        return true;
      }
    }
  }
  return false;
}
