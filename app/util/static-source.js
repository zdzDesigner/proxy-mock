/**
 * Created by Administrator on 2015/3/10.
 */

    var fs = require('fs'),
        mime = require('mime')
        // gzip = require('gzip-js')
    


    /**
     * 【读取文件返回内容】
     * @param path 文件路径
     * @param callback 回掉函数
     *      引入 fs
     *      1. 判断文件存在 exists
     *      2. 异步读取文件 readFile
     *      3. 返回值转字符串
     */

    var getSource = function(path, defaultPath, encode){
        encode = encode || 'utf8'
        return new Promise(function(resolve,reject){
            fs.exists(path,function(exist){
                if(!exist) {
                    reject(defaultPath)
                    return
                }
                fs.readFile(path,function(err,data){
                    err ? reject('读取'+path+'文件错误') 
                        : resolve({data:data.toString(encode),path})
                    
                })
            })
        })
    }
    
    // 发送静态文件
    var sendStaticSource = function(path,res){
         
        fs.exists(path,function(exist){
            if(!exist) {
                res.statusCode = 404
                res.end()
                return
            }



            fs.readFile(path,function(err,data){
                
                
                if(~path.indexOf('5.b10b4f8d')){
                    console.log('5.b10b4f8d')
                    setTimeout(function(){
                        res.writeHead(200,{'Content-type':mime.lookup(path) +';charset=utf8'})
                        res.end(data)
                    },20000)
                }else{
                    res.writeHead(200,{'Content-type':mime.lookup(path) +';charset=utf8'})
                    res.end(data)
                }
                
                // res.writeHead(200,{'Content-type':mime.lookup(path) +';charset=utf8'})
                // res.end(data)
                


                // res.setHeader("content-encoding", "gzip");
                // res.writeHead(200,{'Content-type':mime.lookup(path) +';charset=utf8'});
                // var options = {
                //     level: 3,
                //     // name: 'hello-world.txt',
                //     timestamp: parseInt(Date.now() / 1000, 10)
                // };
                // // out will be a JavaScript Array of bytes
                // var out = gzip.zip(data, options);
                // // console.log(new Buffer(out))
                // res.end(new Buffer(out))   
            });
        });
          
        
        
    };
    exports.getSource = getSource
    exports.sendStaticSource = sendStaticSource