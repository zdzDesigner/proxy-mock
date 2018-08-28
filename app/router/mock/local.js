var fs = require('fs')
var path = require('path')
var {warn, clearComment} = require('../../util')
var mock = require('../../service').mock
var relativePath = require('../../service').validPath.relativePath
var rootPath = path.resolve(process.cwd(), relativePath('../src/mock'))

// console.log({warn, clearComment})
module.exports = function localMock(req, res, next){
    var mockRemote = req.headers['mock-remote']
    // var rootPath = ''
    var filePath = ''
    if(mockRemote){

        // var rootPath = path.resolve(process.cwd(), relativePath('../src/mock'))
        mockRemote = mockRemote.replace('/@mock','').replace('@mock','')
        filePath = rootPath + mockRemote
        console.log('mock-local: ', filePath)
        
        if(fs.existsSync(filePath)){
            var data = fs.readFileSync(filePath)
            var dataObj = clearComment(data.toString())
            data = JSON.parse(dataObj.code)
            
            mock(data,filePath,'',validMock(dataObj.comments))
                .then(function(data){
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
function validMock(comments) {
    var commentRE = /\/+/g
    var spaceRE = /\s/g
    return comments.reduce(function(pend, val){
        val = val.replace(commentRE,'').replace(spaceRE,'')    
        var {key,value} = parseColone(val)
        if(~['mock-length' ,'mock-delay' ,'no-mock'].indexOf(key)){
            pend[key] = value
        }
        return pend
    },{})
    
}

function parseColone(val){
    var arr = val.split(':')
    return {
        key:arr[0],
        value:arr[1]
    }
}
