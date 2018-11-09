var proxyServer = require('../../service').proxyServer

module.exports = function(req, res, next){
    var domain = req.headers['domain']
    var recookieStr = req.headers['recookie-domain'] || ''
    if(domain){
        delete req.headers['domain']
        delete req.headers['recookie-domain']
        delete req.headers.host
        req.headers.referer = domain
        console.log({recookieStr, domain},req.url)

        proxyServer.web(req, res, { 
            target: domain,
            cookieDomainRewrite:getRecookies(recookieStr)
        })
    }else{
        next()
    }

}

function getRecookies(recookieStr){
    var recookies = {}
    var recookieArr = recookieStr.split('|')
    if(recookieArr[0]){
        recookies[recookieArr[0]] = recookieArr[1]
    }
    return recookies
}