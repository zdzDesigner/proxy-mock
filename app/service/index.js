var proxy = require('./proxy')
var mock = require('./mock')
var validPath = require('./valid-path.js')
var proxyServer = require('./proxy-server.js')
var {samePort} = require('./manage-port/')

module.exports = {
    mock:mock,
    validPath:validPath,
    proxy:proxy,
    proxyServer:proxyServer,
    samePort:samePort

}