var domain = require('./domain.js')
var cookie = require('./cookie.js')

// console.log(domain)

module.exports = {
    matchProxyDomain:domain.matchProxyDomain,
    convertArgDomain:domain.convertArgDomain,
    convertArgRecookies:domain.convertArgDomain
}

function proxy(){
    var args = Array.prototype.slice.call(arguments)
    // console.log({args})
    return domain.matchProxyDomain.apply(null, args);
}