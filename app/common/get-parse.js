/**
 * url-parser.js
 * Url {
	  protocol: null,
	  slashes: null,
	  auth: null,
	  host: null,
	  port: null,
	  hostname: null,
	  hash: null,
	  search: '?name=zdz&work=designer',
	  query: 'name=zdz&work=designer',
	  pathname: '/list.html',
	  path: '/list.html?name=zdz&work=designer',
	  href: '/list.html?name=zdz&work=designer' }
 */
var url = require('url')
var querystring = require('querystring')
// PUBLIC_PATH global



var getParse = function (path) {
	var urlData = url.parse(path)
	return {
		param : querystring.parse(urlData.query),
		pathname : urlData.pathname,
		getPath : function (filename) {
			return PUBLIC_PATH + urlData.pathname + (filename||'')
		}
	}
}

module.exports = getParse