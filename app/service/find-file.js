var fs = require('fs')
var path = require('path')
var dirs = require('./../util/dirs.js')
var getParse = require('./../util/get-parse.js')
var staticSource = require('./../util/static-source.js')
/**
 * [fineFile 查找文件]
 * @return {[type]} [description]
 * 
 */

function fineFile(req, root){
    var url = req.url
    var method = '['+req.method.toLowerCase()+']'
    var urlParsed = getParse(url)
    var query = urlParsed.param
    var pathname = urlParsed.pathname
    var rootPath = path.resolve(process.cwd(), relativePath(root))
    

    var onePath = validPath(rootPath, pathname, method, query)

    console.log({onePath})
    if(!onePath){
        // console.log({rootPath, pathname})
        var matchPath = getMatchPath(rootPath, pathname, method)
        query = Object.assign(query, matchPath.params)
        // onePath = matchPath.pathname
        onePath = validPath(rootPath, matchPath.pathname, method, query)
    }

    if(!fs.existsSync(onePath)){
        onePath = ''
    }
    console.log({onePath}) 
    
    return {
        query:query,
        onePath:onePath
    }    
    
    

}

/**
 * [validPath 有效的文件路径]
 * @param  {[type]} rootPath [mock目录]
 * @param  {[type]} pathname [接口路径]
 * @param  {[type]} method   [请求方法]
 * @param  {[type]} query    [参数]
 * @return {[type]}          [description]
 */
function validPath(rootPath, pathname, method, query){

    var filePath = path.resolve(rootPath, relativePath(pathname))
    var suffix = '.json'
    var methodQueryPath = [filePath, method, suffix, serialize(query)].join('')
    var defaultPath = [filePath, suffix, serialize(query)].join('')
    var methodPath = [filePath, method, suffix].join('')
    var purePath = [filePath, suffix].join('')

    var fileList = [methodQueryPath, defaultPath, methodPath, purePath]
    // console.log({fileList})
    

    var onePath = fileList.filter(function(item){
        // console.log(item, fs.existsSync(item))
        return fs.existsSync(item)    
    })[0]

    return onePath
}

function relativePath(path){
    // console.log({path})
    path[0] != '.' && (path = '.'+path)
    path = clearLastToken(path).join('/')
    return path
}


function clearLastToken(path){
    return path.split('/').filter(function(item){
        if(!!item) return item
    })
}


function serialize(obj) {
    var queryValue = Object.keys(obj).map(function(key){
        return key+'='+obj[key]
    }).join('&')

    return queryValue 
                ? '?'+queryValue
                : ''

}



/**
 * [getMatchPath 配置文件筛选]
 * @param  {[type]} mockRoot [mock根文件目录]
 * @param  {[type]} pathname [请求url]
 * @return {[type]}          [资源地址]
 */
function getMatchPath (mockRoot, pathname, method){
    var params = {}
    var reg = dirs(mockRoot).filter(function(item){
        console.log({item})
        var regStr = item.replace(/\{(.+)\}/,'(.+)').replace('[','\\[').replace(']','\\]');
        console.log({regStr})
        var regexp = new RegExp(regStr),
            reqMatch = pathname.match(regexp) || (pathname+method).match(regexp),
            key

        // console.log(regStr)
        // console.log(regStr, regexp ,pathname, pathname+method, reqMatch)
        if(reqMatch){
            key = item.match(regexp)[1].match(/\{(.+)\}/)[1]
            params[key] = clearLastToken(''+reqMatch[1]).join('') 
            console.log('params : ',params)

            return true
        }
    })
    // console.log({reg})
    reg[0] && (pathname = reg[0])
    return {
        pathname:pathname,
        params:params
    }
}

module.exports = fineFile
