module.exports = function (cb,mock_path) {
    var data
  
    try{
        data = cb()
    }catch(e){
        
        if(mock_path){
            console.log(('JSON 语法错误 ：'+mock_path).red.bold)    
            console.log(('请用JSON解析工具查看 ：http://www.bejson.com').yellow.underline)    
        }
        
        console.log('Mock 参数错误 ：'.red)
        console.log(e.stack.red)
        console.log('--------------'.gray)
    }
    
    return data    
    
}