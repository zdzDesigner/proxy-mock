var redirect = function (res,location) {
	res.writeHead(302, {
	  'Location': location
	});
	res.end()
}
var redirect_post = function (res,location) {
	res.writeHead(307, {
	  'Location': location
	});
	res.end()
}

module.exports = {
	get:redirect,
	post:redirect_post
}
