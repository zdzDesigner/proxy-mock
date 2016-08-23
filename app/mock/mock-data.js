/**
 * [mockData 生成返回值]
 * @param  {[type]} value [数据结构]
 * @return {[type]}             [description]
 */
var util = require('util'),
    Mock = require('./mock'),
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
function mockData(value) {
    
    var data
     
    switch (true) {
        case value['no-mock']+''=='true' :
            delete(value['no-mock'])
            data = value
            break;        

        case util.isString(value) :
            data = getStringValue(value)
            break;

        case util.isNumber(value):
            data = getNumberValue(value)
            break;
        
        case util.isArray(value) :
            data = [];
            var size = Mock.Random.integer(30,30);
            for (var i = 0; i < size; i++) {
                data.push(mockData(value[0]));
            }
            break;

        case util.isObject(value) :
            data = {};
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    data[key] = mockData(value[key]);
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
var getStringValue = function (value) {
    var data,innerText

    if(value.indexOf('$empty') != -1){
        if(Math.random() >0.5){
            data = '' 
            return
        }else{
            value = value.split('|')[1]
        }
        data = getStringType(value)
    }

    if(value.indexOf('$add') != -1){
        // 前 +
        if(value.indexOf('$add') == 0){
            innerText = value.split('|')[0]
            innerText = innerText.replace('$add(','').replace(')','')
            value = value.split('|')[1]
            data = innerText + getStringType(value)    
        // 后 +
        }else{
            innerText = value.split('|')[1]
            innerText = innerText.replace('$add(','').replace(')','')
            value = value.split('|')[0]
            data = getStringType(value) + innerText
        }
        
        
    }else{
        data = getStringType(value)
    }
    

    
    return data
}

/**
 * [getStringValue 生成字符]
 * @param  {[type]} value [下面的'aaa']
 *                        {name:'aaa'} => 'aaa' 
 *                  region  省市区
 *                  leftter 字母
 *                  cname   中文名字
 *                  ename   英文名字
 *                  url     URL地址
 */
var getStringType = function (value) {

    var data

    try{

    switch(true){

        case value === 'phone':
            data = '1'
            for(var i=0;i<10;i++){
                data += Mock.Random.natural(0,9)
            }
        break;

        case value === 'url':
            data = Mock.Random.url()
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

        case value.toLowerCase() === 'yyyy-mm-dd':
            data = Mock.Random.date('yyyy-MM-dd')
        break;

        case value.toLowerCase() === 'yyyy.mm.dd':
            data = Mock.Random.date('yyyy-MM-dd').replace(/-/g,'.')
        break;

        case value.indexOf('$status')!=-1:
            var val = eval("("+value.split('|')[1]+")")
            data = val[Math.floor(Math.random()*val.length)]
        break;

        case value.indexOf('$image')!=-1:
             var val = value.split('|')[1]
            data = Mock.Random.image('300x100', Mock.Random.color(),val)
        break;

        default :
            data = Mock.Random.string('lower',1,10)
            + Mock.Random.string('number',1,3)
            + Mock.Random.string('lower',1,10);
    }

    }catch(e){
        console.log('Mock 参数错误 ：'.red)
        console.log('     '+e.toString().red)
    }
    return data
    
}
/**
 * [getStringValue 生成数字]
 * @param  {[type]} value [下面的1000]
 *                        {code:1000} => 1000 
 * @return {[type]}       [Number]
 */
var getNumberValue = function (value) {
    var data

    if(value === 1000){
        data = 1000
    }else{
        data = Mock.Random.integer(1, 100);
    }
    return data
}
module.exports = mockData