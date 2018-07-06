var fs = require('fs')
var path = require('path')
var mime = require('mime')
var async = require('async')
var config = require('../../config')
var expires = require('../../util/expires.js')
var getParse = require('../../util/get-parse.js')
var staticSource = require('../../util/static-source.js')
module.exports = function staticServer(req, res, next) {

        var filePath = getParse(req.url).getPath()
        var targetIndex = path.resolve(filePath,'index.html')
        var subPath = ''
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
        
}