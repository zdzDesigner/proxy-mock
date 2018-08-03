var pathRegexp = require('path-to-regexp')
var querystring = require('querystring')

module.exports = {
    matchProxyDomain:matchProxyDomain,
    convertArgDomain:convertArgDomain   
}



function matchProxyDomain(domainConfig, url){
    var toRegs  = Object.keys(domainConfig).map(function(regstr ,index){
        return {
            index:index,
            reg:pathRegexp(regstr)
        }
    })
    var resExecs = toRegs.filter(function(item, index){
        if(item.reg.exec(url)) return true
    })
    var curDomain = ''
    try{
        curDomain = domainConfig[Object.keys(domainConfig)[resExecs[0].index]]    
    }catch(err){
        // console.log(url)
        curDomain = ''
        console.log('未配代理路径')
    }
    

    return curDomain
    
}


function convertArgDomain(proxyDomain){
    var domains = {} 
    
    if(proxyDomain){
        proxyDomain = (proxyDomain 
                        && decodeURIComponent(proxyDomain).replace(/@@/g,'&').replace(/@/g,'*'))
                        || ''
        domains = querystring.parse(proxyDomain)
    }
    return domains
}