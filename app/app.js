const Koa = require('koa')
const path = require('path')
const static = require('koa-static')
const { findFile, mock } = require('./service')
const { getSource, warn } = require('./util')
const app = new Koa()


const staticPath = process.cwd()

console.log(warn)
// console.log('ppp', staticPath,findFile,getSource)

app.use(static(staticPath))
app.use(async function(ctx,next){

    console.log('===',ctx.url,'===')
    // console.log(ctx.header.mock)
    // console.log(ctx.req)
    await next()
})
app.use(async function(ctx,next){
    var mockRoot = ctx.header.mock
    if(mockRoot){
        let pathObj = findFile(ctx.req, mockRoot)
        let onePath = pathObj.onePath
        
        if(onePath) await mockStaticFn(ctx.req, ctx.res, pathObj)
        
    }
    // await next()
})
module.exports = function (port) {
    app.listen(port)
}





/**
 * [mock 数据]
 */
const mockStaticFn = async function (req,res,pathObj) {

    
    
    let file = await getSource(pathObj.onePath)
        
    let finalPath = file.path
    let data = file.data

    data = warn(function () {
        data = typeof data ==='string' && JSON.parse(data)
        return data
    },finalPath)

    // console.log(data)
    let ret = await mock(data,finalPath,pathObj.query)
    // console.log(ret)
    res.writeHead(200,{
        'content-type':'application/json;charset=utf8'
    })
    res.end(JSON.stringify(ret))   
            // console.log('===--',finalPath)
            

                
                
            
        // }).catch(function(err){
        //     console.log(err)
        // })

}