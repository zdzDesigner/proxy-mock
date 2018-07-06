var fs = require('fs')
var path = require('path')
var staticSource = require('../../util/static-source.js')
var warn = require('../../util/warn.js')
var mock = require('../../service').mock
var relativePath = require('../../service').validPath.relativePath

module.exports = function localMock(req, res, next){
    var mockRemote = req.headers['mock-remote']
    var rootPath = ''
    var filePath = ''
    if(mockRemote){

        var rootPath = path.resolve(process.cwd(), relativePath('../src/mock'))
        mockRemote = mockRemote.replace('/@mock','').replace('@mock','')
        filePath = rootPath + mockRemote
        console.log('mock-local: ',mockRemote)
        console.log(rootPath+mockRemote)
        if(fs.existsSync(filePath)){
            var data = fs.readFileSync(filePath)    
            data = JSON.parse(data.toString())
            
            mock(data,filePath,'').then(function(data){
                res.writeHead(200,{
                    'content-type':'application/json;charset=utf8'
                })
                res.end(JSON.stringify(data))   
            }).catch(function(error){
                console.log(error)
            })

        }else{
            res.writeHead(404)
            res.end('error file path:'+filePath)
            console.log('error file path ',filePath)
        }
        
    }else{
        next()
    }
    
}
