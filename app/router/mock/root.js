/**
 * [rootMock header 有 mock 字段, mock本地根路径]
 * @return {[type]}           []
 */


var staticSource = require('../../util/static-source.js')
var warn = require('../../util/warn.js')
var service = require('../../service')
var mock = service.mock
var findFile = service.validPath.findFile

module.exports = function rootMock(req, res, next){
    var mockRoot = req.headers.mock
    if(mockRoot){
        mockStaticFn(req, res, mockRoot)
    }else{
        next()
    }
}

/**
 * [mock 数据]
 */
var mockStaticFn = function (req, res, mockRoot) {

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