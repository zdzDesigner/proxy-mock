var fs = require('fs')
var path = require('path')

/** 
 * 文件遍历方法 
 * @param filePath 需要遍历的文件路径 
 */  
function fileDisplay(filePath, dirs, paths){
    dirs = dirs || []
    paths = paths || []
    paths.push(filePath)
    //根据文件路径读取文件，返回文件列表  
    var files = fs.readdirSync(filePath)
    files.forEach(function(filename){  
        //获取当前文件的绝对路径  
        var filedir = path.join(filePath,filename);  
        //根据文件路径获取文件信息，返回一个fs.Stats对象  
        var stats = fs.statSync(filedir)
        if(stats){
            var isFile = stats.isFile()
            //是文件夹  
            var isDir = stats.isDirectory()
            if(isFile){  
                if(!~filedir.indexOf('.DS_Store') && filedir.match(/\{(.+?)\}/)){
                    dirs.push(filedir.replace(paths[0],'').replace('.json',''))    
                }
            }  
            if(isDir){  
                //递归，如果是文件夹，就继续遍历该文件夹下面的文件  
                return fileDisplay(filedir, dirs, paths)
            } 
        }
        
    })
    
    return dirs
}  



function readdir(filePath){
    return new Promise(function(resolve, reject){
        fs.readdir(filePath,function(err,files){  
            if(err){  
                console.warn(err)  
            }else{  
                //遍历读取到的文件列表  
                resolve(files)
            }  
        })
    })
}

module.exports = fileDisplay