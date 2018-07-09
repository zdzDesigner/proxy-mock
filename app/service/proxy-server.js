var httpProxy = require('http-proxy')
var proxyServer = httpProxy.createProxyServer({})

proxyServer.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  console.log({err})
  res.end('Something went wrong. And we are reporting a custom error message.');
});

module.exports = proxyServer