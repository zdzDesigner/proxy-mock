var promiseParam = require('../../util/promise-param.js')
var mock = require('../../service').mock

module.exports = function requestMock(req, res, next){
    if(req.headers.mock+'' === 'true'){
        mockFn(req,res)
    }else{
        next()
    }
}

/**
 * [mock 数据]
 */
 var mockFn = function (req,res) {

    promiseParam(req).then(data=>{

        if(typeof data === 'string'){
            // console.log(data)
            data = JSON.parse(data)
            // console.log(data)
        }

        data = mock(data)
        // console.log(data)
        res.writeHead(200,{
            'content-type':'application/json;charset=utf8'
        })
        res.end(JSON.stringify(data))

    })

 }