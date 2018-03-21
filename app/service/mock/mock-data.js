/**
 * [mockData 生成返回值]
 * @param  {[type]} value [数据结构]
 * @return {[type]}             [description]
 */
var util = require('util'),
    curry = require('lodash.curry'),
    Mock = require('./mock.js'),
    warn = require('../../util/warn.js'),
    Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

/**
 * [mockData 生成数据]
 * @param  {[type]} value [如下值]
 *                          {
 *                              code:1000,
                                data:[
                                    {
                                        letter: 'A',
                                        citys:[ {id:12,val:'region'}]
                                    }
                                ]
 *                          }
 * @return {[type]}       [description]
 */
var index
function mockData(value, arrRange, mockPath, query) {
    
    var data
     
    switch (true) {

        case util.isString(value) :
            // console.log(hasQuery(query,value))
            value = hasQuery(query, value)
            
            // console.log(value)
            data = getStringValue(value, index, mockPath, query)
            data = isNaN(+data) ? data : +data
            break;

        case util.isNumber(value):
            // console.log(hasQuery(query,value))
            value = hasQuery(query, value)
            data = getNumberValue(value, index)
            break;
        
        case util.isArray(value) :
            data = [];
            
            
            var min = arrRange[0]
            var max = arrRange[1]
            var mockTarget = value[0]
            var size = Mock.Random.integer(min,max);

            if( 'string' == typeof value[0] && ~value[0].indexOf('$length')){
                size = getStringType(value[0])
                mockTarget = value[1]
            }

            
            for (var i = 0; i < size; i++) {
                index = i+1
                data.push(mockData(mockTarget, [min,max], mockPath, query));
            }
            
            data = uniq(data)

            if(data.length < size){
                for(var j =0;j<size*9;j++){
                    data.push(mockData(mockTarget, [min,max], mockPath, query));
                }
                data = uniq(data)
            }
            
            break;

        case util.isObject(value) :
            data = {};
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    data[key] = mockData(value[key], arrRange, mockPath, query);
                }
            }
            break;
    }
    return data;
}

/**
 * [getStringValue 生成字符]
 * @param  {[type]} value [下面的'aaa']
 *                        {name:'aaa'} => 'aaa' 
 *                  $empty  是否为空随机
 *                  $add    $add(加的内容)|cname
 * @return {[type]}       [String]
 */
var getStringValue = function (msg,index,mockPath, query) {
    
    var reg = /\{\{(.+?)\}\}/g;
    var reg_match_arr = msg.match(reg)
    
    if(reg_match_arr){
        // console.log(reg_match_arr)
        reg_match_arr.forEach(function(value,i){
            // console.log('value --',value)
            var str = getStringType(value,index,mockPath)
            
            if(~msg.indexOf(value)){
                msg=msg.replace(value,str)
            }
        }) 
        // console.log(msg)   
    }else{

        msg = Mock.Random.string('lower',1,10)
                + Mock.Random.string('number',1,3)
                + Mock.Random.string('lower',1,10)    
    }
    // console.log('==msg==',msg)
    
    return msg

}

/**
 * [getStringType 生成字符]
 * @param  {[type]} value [下面的'aaa']
 *                        {name:'aaa'} => 'aaa' 
 *                  region  省市区
 *                  leftter 字母
 *                  cname   中文名字
 *                  ename   英文名字
 *                  url     URL地址
 */

var getStringType = function (value,index,mockPath) {
    var reg = /\{\{(.+?)\}\}/,
        data
    
    value = value.match(reg)[1].trim()
    return warn(function () {

    switch(true){
        case value.indexOf('$length')!=-1 :
            arr = value.split('|')
            data = convert_val(arr[1],'to_fixed',0)

        break;

        case value.indexOf('$range')!=-1 :
            // console.log(value)
            arr = value.split('|')
            temp = arr[0].split(':')[1]
            temp = temp || 0
            data = convert_val(arr[1],'to_fixed',temp)

        break;


        case value === 'phone':
            data = '1'
            for(var i=0;i<10;i++){
                data += Mock.Random.natural(0,9)
            }
        break;

        case value === 'url':
            data = Mock.Random.url()
        break;

        case value === 'index':
        console.log(value)
            data = index
        break;

        case value === 'region':
            data = Mock.Random.region();
        break;
        
        case value === 'letter':
            data = Mock.Random.pick(Letters)
        break;

        case value === 'cname':
            data = Mock.Random.cname()
        break;

        case value === 'ename':
            data = Mock.Random.first()
        break;

        case value === 'paragraph':
            data = Mock.Random.paragraph()
        break;

        case value === 'color':
            data = Mock.Random.color()
        break;

        case value.toLowerCase().match(/yyyy|mm|dd|hh|ss/g) 
                && value.toLowerCase().match(/yyyy|mm|dd|hh|ss/g).length>=2 :
            // console.log('yyyy|mm|dd|hh|ss'.yellow);
            data = Mock.Random.date(value)
            if(value.toLowerCase().match(/\./g)){
                data = data.replace(/-/g,'.')
            }
            if(value.toLowerCase().match(/\//g)){
                data = data.replace(/-/g,'/')
            }
            
        break;

        case value.indexOf('$image')!=-1:
             var val = value.split('|')[1]
            data = Mock.Random.image('300x100', Mock.Random.color(),val)
        break;

        default :
            // console.log('convert_val default==',value)
            data = convert_val(value) 
        break;

    }
    return data

    },mockPath)

    // }catch(e){
    //     console.log('Mock 参数错误 ：'.red)
    //     console.log(e.stack.red)
    //     console.log('--------------'.gray)
    //     // console.log(e.stack.red)
        
        
        
        
    // }
    
    
}

function convert_val(val,type,type_arg) {
    try{
        val = JSON.parse(val)    
    }catch(e){
        val = eval("("+val+")")
    }

    // console.log('convert_val',val)

    switch(type){
        case 'to_fixed':
            val = ((Math.random()*(+val[1]-val[0]))+val[0]).toFixed(type_arg)
        break;
    }
    if(util.isArray(val)){
        val = val[Math.floor(Math.random()*val.length)]
    }
    return val
}

function uniq(data){
    return data.reduce((newarr,val)=>{
            if(!~newarr.indexOf(val))  newarr.push(val)
            return newarr
        },[])
}
/**
 * [getStringValue 生成数字]
 * @param  {[type]} value [下面的1000]
 *                        {code:1000} => 1000 
 * @return {[type]}       [Number]
 */
var getNumberValue = function (value, index) {
    return  Mock.Random.integer(1, 100)
}


var hasQuery = function(query,template){

    var reg = /\[@(.+?)\]/,key 
    template = template+''
    var matched = template.match(reg)
    if(matched){
        key = template.match(reg)[1]    
        template = template.replace(reg,query[key]||'')
    }
    

    return template
    
}


// console.log(curry)
var map = curry(function (callback , arr) {
    return arr.map(callback)    
})

var cclearAttr = curry(function (value,attr) {
    delete(value[attr])
    return value
})

var keys = ['no-mock','mock-length','mock-delay']


// 输出
module.exports = function(value,mockPath,query) {

    var arrRange = [30, 30],
        delay = 0,
        clearAttr = cclearAttr(value),
        data, mockLength, mockDelay, noMock


    if(util.isObject(value)){
        
        mockLength = value['mock-length']
        mockDelay = value['mock-delay'] || 0
        noMock = value['no-mock'] || false
        clearAttr('no-mock')
        clearAttr('mock-length')
        clearAttr('mock-delay')

        if(noMock) {
            data = value
        }else{
            if(mockLength){
                arrRange = JSON.parse(mockLength)
                arrRange = arrRange.slice(0,2)
                if(arrRange.length == 1){
                    arrRange.push(arrRange[0])
                }
            }
            data = mockData(value, arrRange, mockPath, query)
        }
        
    }
    
    // console.log(data)

    return new Promise(function(resolve,reject){
        setTimeout(function(){
            resolve(data)
        },+mockDelay)
    })
}