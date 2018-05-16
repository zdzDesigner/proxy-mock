var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	request = require('request'),
	httpProxy = require('http-proxy'),
	proxy = httpProxy.createProxyServer({}),
	colors = require('colors'),
	querystring = require('querystring'),
	finalhandler = require('finalhandler'),
	router = require('router')(),
	async = require('async'),
	mime = require('mime'),
	mock = require('./service').mock,
	findFile = require('./service').findFile,
	config = require('./config'),


	getParse = require('./util/get-parse.js'),
	promiseParam = require('./util/promise-param.js'),
	
	staticSource = require('./util/static-source.js'),
	expires = require('./util/expires.js'),
	redirect = require('./util/redirect.js'),
	dirs = require('./util/dirs.js'),
	warn = require('./util/warn.js')




module.exports = function (port) {

	var subPath = ''

	var server = http.createServer()

	server.on('request',(req,res)=>{

		if( ~req.url.indexOf('favicon.ico') ) {
			res.end('')
			return
		}

		router(req, res, finalhandler(req, res))

	})
	server.listen(port)


	router.use((req, res, next)=>{
		console.log(req.url)
		next()
	})



	/** 
	 * [静态文件处理]
	 *  若配置 nginx ，则有 nginx 处理
	 */
	router.use((req, res, next) => {
		// var method = req.headers.
		var filePath = getParse(req.url).getPath()
		// console.log((filePath).gray,STATIC_SOURCE.indexOf(mime.lookup(filePath)))
		
		var targetIndex = path.resolve(filePath,'index.html')
			
		// console.log(filePath,path.extname(filePath))

		if(fs.existsSync(targetIndex) && !path.extname(filePath)){
			// console.log({targetIndex},req)
			// console.log(filePath.replace(process.cwd(),''))
			subPath = filePath.replace(process.cwd(),'')
			console.log(('cwd:'+process.cwd()).magenta)
			console.log(('sub-path:'+subPath).magenta)
			console.log(('redirect to index.html').magenta)
			filePath = targetIndex
		}

	
		// console.log({filePath})
		
		// 静态文件过滤
		if(~STATIC_SOURCE.indexOf(mime.lookup(filePath))){
			
			async.series([
				// 设置缓存 ，已缓存、304
				callback=>{ expires(req,res,filePath,callback)},
				// 304 不执行
				callback=>{ staticSource.sendStaticSource(filePath,res)}
			])
			// staticSource.sendStaticSource(filePath,res)
		}else{
			
			next()
		}
		
	})

	router.use( (req, res,next) => {
		// console.log(req.headers.mock,'======')

		console.log('===',req.url,'===')
		// console.log('req.headers: ',req.headers)
		var mockRemote = req.headers['mock-remote']
		if('false' == mockRemote){ 
			delete req.headers['mock-remote']
			delete req.headers['MOCK']
		}else if(mockRemote){
			console.log('mock-remote: ',mockRemote)
			// console.log('mockRemote:',url.parse(req.url))
			var mockParsed = url.parse(mockRemote)
			// console.log({mockParsed})
			req.url = mockParsed.pathname
			req.method = 'GET'
			
			delete req.headers.host
			delete req.headers.domain
			delete req.headers['mock-remote']
			callProxy(req, res,{
				target:`${mockParsed.protocol}//${mockParsed.hostname}`
			})
			return
		}else if(req.headers.mock){
			if(req.headers.mock+'' === 'true'){
				mockFn(req,res)	
			}else{
				mockStaticFn(req, res, req.headers.mock)
			}
			return	
		}
		requestMethod(req,res)
	})

	/**
	 * [mock 数据]
	 */
	var mockStaticFn = function (req,res,mockRoot) {

 		var pathObj = findFile(req, mockRoot)
 		if(pathObj.onePath){
 			staticSource.getSource(pathObj.onePath)
	 			.then(function(ret){
	 			
		 			var finalPath = ret.path
		 			var data = ret.data

		 			data = warn(function () {
		 				data = typeof data ==='string' && JSON.parse(data)
		 				return data
		 			},finalPath)

		 			// console.log('===--',finalPath)
			 		mock(data,finalPath,pathObj.query).then(function(data){
			 			res.writeHead(200,{
				  			'content-type':'application/json;charset=utf8'
				  		})
				 		res.end(JSON.stringify(data))	
			 		})
		 		})
 		}else{
 			res.writeHead(404)
			res.end()
 		}
 		

	}


	 /**
	 * [mock 数据]
	 */
	 var mockFn = function (req,res) {

	 	promiseParam(req).then(data=>{

	 		if(typeof data === 'string'){
	 			// console.log(data)
	 			data = JSON.parse(data)
	 			// console.log(data)
	 		}

	 		data = mock(data)
	 		// console.log(data)
	 		res.writeHead(200,{
	  			'content-type':'application/json;charset=utf8'
	  		})
	 		res.end(JSON.stringify(data))

	 	})

	 }



	/**
	 * [请求方法]
	 */
	var requestMethod = (req,res) => {
		var target = req.headers.domain
		var recookieDomain = req.headers['recookie-domain']
		delete req.headers.host
		delete req.headers.domain
		delete req.headers['recookie-domain']
		// [代理请求]
		nodeHttpProxyModule(target,req,res,recookieDomain)
	}

	function nodeHttpProxyModule(target,req,res,recookieDomain){
		console.log((target+req.url).green)
		var cookieDomainRewrite = {}
		
		if(recookieDomain){
			recookieDomain = recookieDomain.split('|')
			cookieDomainRewrite[recookieDomain[0]] = recookieDomain[1]
			console.log(('recookie-domain: '+JSON.stringify(cookieDomainRewrite)).green)
		}
		
		
		req.headers.referer = target
		callProxy(req, res,{ 
			target: target,
			cookieDomainRewrite:cookieDomainRewrite
		})
	}

	function callProxy(req, res, options){
		proxy.web(req, res, options , function(err) { 
				console.log(String(err).red)
				var data = {
					'message':'后台接口错误'+String(err),
					'node-err':err
				}
				res.writeHead(600,{'Content-type':'application/json','charset':'urf-8'});
			    res.end(JSON.stringify(data))
		})
	}

	
	process.on( 'SIGINT', function() {
	  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" )
	  // some other closing procedures go here
	  process.exit()
	})

}

