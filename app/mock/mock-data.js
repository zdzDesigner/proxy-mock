/**
 * [mockData 生成返回值]
 * @param  {[type]} value [数据结构]
 * @return {[type]}             [description]
 */
var util = require('util'),
    curry = require('lodash.curry'),
    Mock = require('./mock'),
    warn = require('../common/warn'),
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
function mockData(value,arr_range,mock_path) {
    
    var data
     
    switch (true) {

        case util.isString(value) :
            data = getStringValue(value,index,mock_path)
            data = isNaN(+data) ? data : +data
            break;

        case util.isNumber(value):
            data = getNumberValue(value)
            break;
        
        case util.isArray(value) :
            data = [];
            var size = Mock.Random.integer(arr_range[0],arr_range[1]);
            for (var i = 0; i < size; i++) {
                index = i+1
                data.push(mockData(value[0],arr_range,mock_path));
            }
            break;

        case util.isObject(value) :
            data = {};
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    data[key] = mockData(value[key],arr_range,mock_path);
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
var getStringValue = function (msg,index,mock_path) {

    var reg = /\{\{(.+?)\}\}/g;
    var reg_match_arr = msg.match(reg)
    if(reg_match_arr){
        reg_match_arr.forEach(function(value,i){
            var str = getStringType(value,index,mock_path)
            if(~msg.indexOf(value)){
                msg=msg.replace(value,str)
            }
        })    
    }else{

        msg = Mock.Random.string('lower',1,10)
                + Mock.Random.string('number',1,3)
                + Mock.Random.string('lower',1,10)    
    }
    
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

var getStringType = function (value,index,mock_path) {
    var reg = /\{\{(.+?)\}\}/,
        data

    value = value.match(reg)[1].trim()
    
    return warn(function () {

    switch(true){

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

        case value.toLowerCase().match(/yyyy|mm|dd|hh|ss/g) != null:
            // console.log(value.toLowerCase().yellow);
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
            data = convert_val(value) 
            
        break;

    }
    return data

    },mock_path)

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

    switch(type){
        case 'to_fixed':
            val = ((Math.random()*(+val[1]-val[0]))+val[0]).toFixed(type_arg)
        break;
        default:
            val = val[Math.floor(Math.random()*val.length)]
        break;
    }
    return val
}

/**
 * [getStringValue 生成数字]
 * @param  {[type]} value [下面的1000]
 *                        {code:1000} => 1000 
 * @return {[type]}       [Number]
 */
var getNumberValue = function (value) {
    return  Mock.Random.integer(1, 100)
}



// console.log(curry)
var map = curry(function (callback , arr) {
    return arr.map(callback)    
})
// has_mock 
var clear_mock = function (value) {
    delete(value['no-mock'])
    return value
}
var cry_clear_attr = curry(function (value,attr) {
    delete(value[attr])
    return value
})

var keys = ['no-mock','mock-length','mock-delay']


// 输出
module.exports = function(value,mock_path) {

    var arr_range = [30,30],
        delay=0,
        data

    var clear_attr = cry_clear_attr(value)    

    if(util.isObject(value) && value['no-mock']){
        data = clear_attr('no-mock')

    }else{
        
        if(util.isObject(value) && value['mock-length']){
            arr_range = JSON.parse(value['mock-length'])
            arr_range = arr_range.slice(0,2)
            if(arr_range.length ==1){
                arr_range.push(arr_range[0])
            }
            // delete(value['mock-length'])
            data = clear_attr('mock-length')
        }
        if(util.isObject(value) && value['mock-delay']){
            delay = +value['mock-delay']
            // delete(value['mock-length'])
            data = clear_attr('mock-delay')
        }
        // data = map(function (attr) {
        //     delete(value[attr])
        //     return value
        // })(keys)[0]
        // console.log(data)
        data = mockData(value,arr_range,mock_path)
    }
    
    // console.log(data)

    return new Promise(function(resolve,reject){
        setTimeout(function(){
            resolve(data)
        },delay)
    })
}