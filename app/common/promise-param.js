var get_parse = require('./get-parse'),
	post_parse = require('./post-parse')

var promise_param = (req)=>{

	req.query_param = get_parse(req.url).param
	
	return new Promise((resolve,reject)=>{
		
		switch(req.method.toLowerCase()){

			case 'get':
				resolve(req.query_param)
			break;
			case 'put':
				post_parse(req,data=>{resolve(data)})
			break;
			case 'delete':
				post_parse(req,data=>{resolve(data)})
			break;
			case 'update':
				post_parse(req,data=>{resolve(data)})
			break;
			case 'post':
				post_parse(req,data=>{resolve(data)})
			break;

		}
		
	})

}


module.exports = promise_param