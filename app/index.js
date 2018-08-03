var http = require('http')
var colors = require('colors')
var iconv = require('iconv-lite')
var finalhandler = require('finalhandler')
var router = require('router')()
var debug = require('debug')('proxy-mock')
var routers = require('./router')
var convertArgDomain = require('./service').proxy.convertArgDomain
var convertArgRecookies = require('./service').proxy.convertArgRecookies


module.exports = function (port, proxyDomain, proxyRecookie) {
	
	var domains = convertArgDomain(proxyDomain)
	var recookies = convertArgRecookies(proxyRecookie)
	
	debug({domains, recookies})

	var server = http.createServer().listen(port)

	server.on('request',(req,res)=>{
		if( ~req.url.indexOf('favicon.ico') ) {
			res.end('')
			return
		}
		router(req, res, finalhandler(req, res))
	})


	
	/** 
	 * [静态文件处理]
	 *  若配置 nginx ，则有 nginx 处理
	 */
	router.use(routers.static)
	router.use(function(req, res, next){
		debug(req.url)
		next()
	})
	// 远程 mock
	router.use(routers.mock.remote)
	// 本地远程 mock
	router.use(routers.mock.local)
	// 本地url(指定root) mock
	router.use(routers.mock.root)
	// 无静态资源，请求中参数mock
	router.use(routers.mock.request)
	// 多domain api代理
	router.use(routers.proxy.api(domains, recookies))
	// 指定domain代理
	router.use(routers.proxy.domain)
	router.use(function(req, res){
		res.statusCode = 404
		res.end('No content')
	})
	
	
	process.on( 'SIGINT', function() {
	  console.log( "\nProxy-mock Gracefully shutting down from SIGINT (Ctrl-C)" )
	  // some other closing procedures go here
	  process.exit()
	})
	

}

