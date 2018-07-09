var proxyServer = require('../../service').proxyServer
var matchProxyDomain = require('../../service').proxy.matchProxyDomain

module.exports = function(domains, recookies){
    return function (req, res, next){

        var curDomain = matchProxyDomain(domains, req.url)
        // console.log({curDomain})
        if(curDomain){
            delete req.headers.host
            req.headers.referer = curDomain
            // console.log({proxyServer})
            proxyServer.web(req, res, { 
                target: curDomain,
                cookieDomainRewrite:recookies
            })
        }else{
            console.log('next to domain')
            next()
        }
        

        // callProxy(req, res,{ 
        //     target: curDomain,
        //     cookieDomainRewrite:recookies
        // })
    }
}
