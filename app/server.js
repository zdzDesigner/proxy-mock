
var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	request = require('request'),
	httpProxy = require('http-proxy'),
	proxy = httpProxy.createProxyServer({}),
	colors = require('colors'),
	querystring = require('querystring'),
	finalhandler = require('finalhandler'),
	router = require('router')(),
	async = require('async'),
	mime = require('mime'),
	mockData = require('./mock/mock-data'),
	config = require('./config'),

	getParse = require('./common/get-parse'),
	promiseParam = require('./common/promise-param'),
	
	staticSource = require('./common/static-source'),
	expires = require('./common/expires'),
	redirect = require('./common/redirect'),
	dirs = require('./common/dirs'),
	warn = require('./common/warn')





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




	/** 
	 * [静态文件处理]
	 *  若配置 nginx ，则有 nginx 处理
	 */
	router.use((req, res,next) => {
		
		var filePath = getParse(req.url).getPath()
		// console.log((filePath).gray,STATIC_SOURCE.indexOf(mime.lookup(filePath)))
		
		var targetIndex = path.resolve(filePath,'index.html')
		
		if(fs.existsSync(targetIndex)){
			// console.log(filePath.replace(process.cwd(),''))
			subPath = filePath.replace(process.cwd(),'')
			console.log(('cwd:'+process.cwd()).magenta)
			console.log(('sub-path:'+subPath).magenta)
			console.log(('redirect to index.html').magenta)
			filePath = targetIndex
		}

	
		
		
		// 静态文件过滤
		if(~STATIC_SOURCE.indexOf(mime.lookup(filePath))&&!req.headers.domain){

			async.series([
				// 设置缓存 ，已缓存、304
				callback=>{ expires(req,res,filePath,callback)},
				// 304 不执行
				callback=>{ staticSource.sendStaticSource(filePath,res)}
			])
		}else{
			next()
		}
		
	})

	router.use( (req, res,next) => {
		// console.log(req.headers.mock,'======')

		if(req.headers.mock){
			if(req.headers.mock+'' === 'true'){
				mockFn(req,res)	
			}else{
				mockStaticFn(req,res,req.headers.mock)
			}
			
		}else{
			requestMethod(req,res)
		}
		
	})

	/**
	 * [mock 数据]
	 */
	var mockStaticFn = function (req,res,mockRoot) {
	 	// console.log(process.cwd(),mockRoot,req.url,path.resolve(process.cwd(),mockRoot)+req.url+'.json')
	 	// console.log('==',getParse(req.url))
	 	var urlParsed = getParse(req.url)
		var query = urlParsed.param
		var pathname = urlParsed.pathname
	 	mockRoot[0] != '.' && (mockRoot = '.'+mockRoot)

	 	// console.log('dirs: ',dirs(mockRoot), pathname)
	 	var reg = dirs(mockRoot).filter(function(item){
	 		var regStr = item.replace(/\{(.+)\}/,'(.+)')
	 		if(pathname.match(new RegExp(regStr))){
	 			return true
	 		}
	 		
	 	})
	 	
	 	reg[0] && (pathname = reg[0])
	 	mockPath = path.resolve(process.cwd(),mockRoot)+pathname+'.json'
	 	// console.log('==',mockPath)
	 	subPath && (mockPath = mockPath.replace(subPath,'/'))
	 	console.log(subPath,mockPath.green)
	 	
 		var methodMockPath = mockPath.replace('.json',`[${req.method.toLowerCase()}].json`)

 		staticSource.getSource(methodMockPath, mockPath)
 			.then(function(ret){
 					console.log('method: ',methodMockPath)
					return Promise.resolve(ret)		 		
	 			},function(defaultPath){
	 				// console.log('===++',defaultPath)
	 				return staticSource.getSource(defaultPath)
	 		}).then(function(ret){
	 			var finalPath = ret.path
	 			var data = ret.data

	 			data = warn(function () {
	 				data = typeof data ==='string' && JSON.parse(data)
	 				return data
	 			},finalPath)

	 			// console.log('===--',finalPath)
		 		mockData(data,finalPath,query).then(function(data){
		 			res.writeHead(200,{
			  			'content-type':'application/json;charset=utf8'
			  		})
			 		res.end(JSON.stringify(data))	
		 		})
	 		}).catch(function(err){
	 			console.log(err)
	 		})

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

	 		data = mockData(data)
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
		proxy.web(req, res, { 
			target: target,
			cookieDomainRewrite:cookieDomainRewrite
		}, function(err) { 
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

