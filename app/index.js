var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	url = require('url'),
	httpProxy = require('http-proxy'),
	proxyServer = httpProxy.createProxyServer({}),
	colors = require('colors'),
	iconv = require('iconv-lite'),
	querystring = require('querystring'),
	finalhandler = require('finalhandler'),
	router = require('router')(),
	async = require('async'),
	mime = require('mime'),
	pathRegexp = require('path-to-regexp'),
	debug = require('debug')('http')
	mock = require('./service').mock,
	convertArgDomain = require('./service').proxy.convertArgDomain,
	convertArgRecookies = require('./service').proxy.convertArgRecookies,
	matchProxyDomain = require('./service').proxy.matchProxyDomain,

	findFile = require('./service').findFile,
	config = require('./config'),


	getParse = require('./util/get-parse.js'),
	promiseParam = require('./util/promise-param.js'),
	
	staticSource = require('./util/static-source.js'),
	expires = require('./util/expires.js'),
	redirect = require('./util/redirect.js'),
	dirs = require('./util/dirs.js'),
	warn = require('./util/warn.js')


module.exports = function (port, proxyDomain, proxyRecookie) {
	
	var domains = convertArgDomain(proxyDomain)
	var recookies = convertArgRecookies(proxyRecookie)
	console.log({domains, recookies})

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


	router.use(function(req, res, next){
		next()
	})



	/** 
	 * [静态文件处理]
	 *  若配置 nginx ，则有 nginx 处理
	 */
	router.use((req, res, next) => {

		var filePath = getParse(req.url).getPath()
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
	/**
	 * [解析请求路由，匹配domain]
	 * @next {[string]} 命中的路由
	 */
	router.use(function(req, res, next){
		var curDomain = matchProxyDomain(domains, req.url)
		next(curDomain)
	})


	router.use( function(curDomain, req, res, next) {

		var mockRemote = req.headers['mock-remote']
		if(mockRemote){
			console.log('mock-remote: ',mockRemote)
			var mockParsed = url.parse(mockRemote)
			req.url = mockParsed.pathname
			req.method = 'GET'
			
			delete req.headers.host
			delete req.headers.domain
			delete req.headers['mock-remote']
			callProxy(req, res,{
				target:`${mockParsed.protocol}//${mockParsed.hostname}`
			})
		}else if(req.headers.mock){
			if(req.headers.mock+'' === 'true'){
				mockFn(req,res)	
			}else{
				mockStaticFn(req, res, req.headers.mock)
			}
			
		}else{
			requestMethod(curDomain, req, res)
		}
		
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
	var requestMethod = (curDomain, req,res) => {
		
		delete req.headers.host
		// [代理请求]
		nodeHttpProxyModule(curDomain,req,res,recookies)
	}

	function nodeHttpProxyModule(target,req,res){
		req.headers.referer = target
		callProxy(req, res,{ 
			target: target,
			cookieDomainRewrite:recookies
		})
	}

	function callProxy(req, res, options){
		// options.selfHandleResponse = true
		// proxyServer.on('proxyRes', function (proxyRes, req, res) {
		// 	var body = [];
		// 	console.log(proxyRes.headers)
		// 	console.log(proxyRes.body)
			// proxyRes.setEncoding('utf8');
			// proxyRes.on('data', (chunk) => {
			// 	console.log({chunk})
			//   	body.push(chunk);
			// })
			// proxyRes.on('end', () => {
			// 	body = character(body.join(''))
			// 	console.log(body)
			//   	// body = Buffer.concat(body);
			//   	// body = iconv.decode(body, 'utf-16be');
			//   	res.end(body);

			// });
	        // var body = new Buffer('');
	        // proxyRes.on('data', function (data) {
	        //     body = Buffer.concat([body, data]);
	        // });
	        // proxyRes.on('end', function () {
	        //     body = body.toString();
	        //     console.log("res from proxied server:", body);
	        //     console.log(proxyRes)
	        //     res.end('a');
	        // });
	        // proxyRes.pipe(res)
	    // });
		proxyServer.web(req, res, options )

	}
	// setTimeout(function(){
	// 	process.exit()
	// },10000)
	process.on( 'SIGINT', function() {
	  console.log( "\nProxy-mock Gracefully shutting down from SIGINT (Ctrl-C)" )
	  // some other closing procedures go here
	  process.exit()
	})
	function character(str) {
	    return str.replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "");
	}

}

