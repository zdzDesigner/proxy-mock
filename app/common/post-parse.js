/**
 * post-parse.js
 * 
 */
 var querystring = require('querystring')

 var postParse = function (req,cb) {
 	var post_data = ''

 	req.setEncoding('utf8')
 	req.addListener('data', function (chunk) {
 		post_data += chunk
 	})
 	
 	req.addListener('end',function () {
 		// console.log(typeof post_data)
 		cb(post_data)
 	})
 }


 module.exports = postParse