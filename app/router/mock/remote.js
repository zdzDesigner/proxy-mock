/**
 * [remote 线上mock数据]
 * @param  {[type]} callProxy [proxy]
 * @return {[type]}           [routeFunction]
 */
var url = require('url')
var proxyServer = require('../../service').proxyServer

module.exports = function remoteMock(req, res, next){
    // return function(req, res, next){
        var mockRemote = req.headers['mock-remote']
        if(!mockRemote) {
            next()
            return
        }
        
        
        var mockParsed = url.parse(mockRemote)
           
        // console.log('mockParsed.protocol: ', mockParsed.protocol)
        if(~['http:','https:'].indexOf(mockParsed.protocol)){
            console.log('mock-remote: ',mockRemote)
            req.url = mockParsed.pathname
            req.method = 'GET'
            
            delete req.headers.host
            delete req.headers.domain
            delete req.headers['mock-remote'] 
            
            // console.log({proxyServer})
            proxyServer.web(req, res,{
                target:`${mockParsed.protocol}//${mockParsed.hostname}`
            })  
            // callProxy(req, res,{
            //     target:`${mockParsed.protocol}//${mockParsed.hostname}`
            // })    
        }else{
            next()    
        }
        
        
    // }
}