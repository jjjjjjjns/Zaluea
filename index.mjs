import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

const PASSWORD = 'mysecretpassword';

const bare =  new Server('/bare/', '');
const serve = new nodeStatic.Server('Site/');
const server = http.createServer();

// Handle HTTP requests
server.on('request', (request, response) => {
  // If the password is correct, set a cookie and allow access to the site
  if (request.url === '/login' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      const params = new URLSearchParams(body);
      if (params.get('password') === PASSWORD) {
        response.writeHead(302, {
          'Set-Cookie': `Access=granted; Max-Age=${8*60*60}`,
          'Location': '/'
        });
        response.end();
      } else {
        response.writeHead(401, {'Content-Type': 'text/plain'});
        response.write('Invalid password');
        response.end();
      }
    });
    return;
  }

  // If the access cookie is set, allow access to the site
  const cookie = request.headers.cookie;
  if (cookie && cookie.indexOf('Access=granted') !== -1) {
    serve.serve(request, response);
  } else {
    // Otherwise, prompt for the password
    response.writeHead(401, {'Content-Type': 'text/html'});
    response.write(`
      <html>
        <body>
          <form method="POST" action="/login">
            <input type="password" name="password" placeholder="Password">
            <input type="submit" value="Login">
          </form>
        </body>
      </html>
    `);
    response.end();
  }
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
	if(bare.route_upgrade(req, socket, head))return;
	socket.end();
});

server.listen(process.env.PORT || 8080);
