var fs = require('fs')
var expires = function (req,res,path,cache) {
    fs.exists(path,function(exist){
        if(!exist) {
            res.statusCode = 404
            res.end()
            return
        }
        fs.stat(path,function (err,stats) {
            if(!err){
                var lastModified = stats.mtime.toUTCString();
                if(req.headers['if-modified-since'] && lastModified === req.headers['if-modified-since']){
                    console.log('lastModified')
                    res.writeHead(304, "Not Modified")
                    res.end()
                    cache(true)
                    return
                }
                res.setHeader('Last-Modified',lastModified);
                cache(false)
            }
        })
    })
}

module.exports = expires