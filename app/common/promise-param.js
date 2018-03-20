var getParse = require('./get-parse'),
	postParse = require('./post-parse')

var promiseParam = (req)=>{

	req.queryParam = getParse(req.url).param
	
	return new Promise((resolve,reject)=>{
		
		switch(req.method.toLowerCase()){

			case 'get':
				resolve(req.queryParam)
			break;
			case 'put':
			case 'delete':
			case 'update':
			case 'post':
				postParse(req,data=>{resolve(data)})
			break;

		}
		
	})

}


module.exports = promiseParam