
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
		console.log((filePath).gray,STATIC_SOURCE.indexOf(mime.lookup(filePath)))
		
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
		if(~STATIC_SOURCE.indexOf(mime.lookup(filePath))){

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
		// console.log(req.headers)

		if(req.headers.mock){
			if(req.headers.mock+'' === 'true'){
				mock_fn(req,res)	
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
	 	
	 	mockRoot[0] != '.' && (mockRoot = '.'+mockRoot)
	 	mockPath = path.resolve(process.cwd(),mockRoot)+req.url+'.json'
	 	subPath && (mockPath = mockPath.replace(subPath,'/'))
	 	console.log(subPath,mockPath.green)

 		
 		staticSource.getSource(mockPath,function(data,mockPath){
 			
 			data = data.toString()
 			data = warn(function () {
 				data = typeof data ==='string' && JSON.parse(data)
 				return data
 			},mockPath)

	 		mockData(data,mockPath).then(function(data){
	 			res.writeHead(200,{
		  			'content-type':'application/json;charset=utf8'
		  		})
		 		res.end(JSON.stringify(data))	
	 		})
	 		
 		})

	 }


	 /**
	 * [mock 数据]
	 */
	 var mock_fn = function (req,res) {

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
		delete req.headers.host
		delete req.headers.domain
		// [代理请求]
		nodeHttpProxyModule(target,req,res)
	}

	function nodeHttpProxyModule(target,req,res){
		console.log((target+req.url).green)
		proxy.web(req, res, { target: target }, function(err) { 
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

