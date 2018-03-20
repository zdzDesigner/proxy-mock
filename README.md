#proxy-mock
1. proxy 接口代理到线上地址防止开发中的跨域问题
2. mock  开发中提供数据模拟



## 开启proxy ，配置
    请求投中加入"DOMAIN"字段名，值为你的目标地址
    setRequestHeader('DOMAIN','your target address')

### 新增重写cookie中的domain功能
    setRequestHeader('RECOOKIE-DOMAIN','kashuo.net|localhost')

## 开启mock ，配置
    请求投中加入"MOCK"字段名，值为你当前项目下mock数据存放地址
    setRequestHeader('MOCK','/dev/mock')

    如你要请求接口为 /active/info
    那要在 "/dev/mock"目录下新建 active目录 ，并新建info.json文件
    即最终目录为 /dev/mock/active/info.json

### 目录设置1
    接口中相同的url但不同的方法
    如 URL：/active/info 接口有两个方法 GET PUT
    则可建立两个文件, 
```js
/dev/mock/active/info.json
/dev/mock/active/info[put].json
    // mock服务会优先匹配带有方法（即：info[METHOD].json）规则文件，
    // 如果没有则取默认的info.json文件 
    // /dev/mock/为mock配置的根路径
```
### 目录设置2
    适应restful请求，url中的字段会成为变量即：
    URL: /get/user/{id}/info => 发起请求 /get/user/224234/info
    基于这种方式我们的路径又该如何创建呐？
```js
/dev/mock/get/user/{id}/info.json  
// 直接创建即可 
// /dev/mock/为mock配置的根路径
```
### 目录设置3
    有些请求会在URL添加query参数,即：
    URL: /get/user/info?id=323423 
    针对这种请求文件路径如下
```js
/dev/mock/get/user/info.json      
// 此时 服务接收的请求依然是/get/user/info?id=323423 
// 会根据 ? 分割,读取 /dev/mock/get/user/info.json规则文件，
// 同时会把参数 {id:323423} compile到文件配置规则中
```


### DEMO
    其中 info.json 中的数据即是接口文档中约定的数据 dome如下
```json
    {
        "mock-length":"[2,3]",
        "message": "{{['请求成功']}}",
        "result": {
            "act_desc": "{\"expire\":\"有效期:{{yyyy-mm-dd}} 领取后,{{$range|[3,22]}}天有效\",\"store\":{\"pre_show\":\"适用全部门店\",\"choose_store\":[\"{{cname}}\",\"{{cname}}\"]},\"desc\":\"222\"}",
            "act_title":"{{cname}}活动",
            "act_start":"{{yyyy-mm-dd HH:mm:ss}}",
            "act_end":"{{yyyy-mm-dd HH:mm:ss}}",
            "act_limit":"{{['到店消费即可用']}}",
            "use_amount":"{{[22.0]}}",
            "max_amount":"{{$range|[22,100]}}",
            "act_status":"{{[1,-1,0]}}",
            "rush_times":[
                {"start":"{{A hh:mm:ss}}","end":"{{HH:mm:ss}}"}
             ],
            "act_value":"{{[222.00]}}",
            "act_type":"{{[14,12,13,21,22]}}",
            "act_expire_desc":"活动已结束",
            "act_stores":"全部门店"
        },
        "code":"{{[10000]}}" 
    }
```
    其中的具体规则 下看


## mock 规则    

    // 禁止mock 直接返回当前文件数据
>    no-mock : "true"

    // mock中的数组长度，随机10到30之间
>    mock-length:”[10,30]"

    【新增每条数组长度控制】
>>    arr:["{{$length|[2,9]}}",{key:'val',...}]
>
>    针对这条规则的数组长度为[2,9]随机值（如果想设定具体值，设置相同即可。如：[3,3]）
>    {key:'val',...} 为要mock的数据（可为满足一下规则数值,也可继续嵌套）

>    列：想输出1到10中的任意5个非重复数，返回数组
>>    arr:["{{$length|[5,5]}}","{{$range|[1,10]}}"]

    // 接口响应的时间长度 如下为2s
    mock-delay:2000

    {{}} 规则标示符

    1. 随机固定值 5
        [3,4,5,6]           {{[3,4,5,6]}}
    
    2.随机范围中的整数值 22
        $range|[1,100]          {{$range|[1,100]}}

        随机范围中的带一个小数值  22.2
        $range:1|[1,100]       {{$range:1|[1,100]}}

        随机范围中的带两个小数值  22.22
        $range:2|[1,100]       {{$range:2|[1,100]}}
        ….. 一次类推

    3.手机号
    phone

    4.资源地址
    url

    5.地区名
    region

    6.中文名
    cname

    7.英文名
    ename

    8.段落
    paragraph

    9.颜色
    color

    10.日期
    yyyy-mm-dd
    yyyy.mm.dd
    mm-dd
    mm.dd
    yyyy-MM-dd A HH:mm:ss     2011-07-11 PM 14:00:34
    yy-MM-dd a HH:mm:ss       80-01-14 pm 13:43:31
    y-MM-dd HH:mm:ss          73-04-21 05:35:55
    y-M-d H:m:s               74-6-2 17:6:16
    yyyy-MM-dd                1994-12-19
    yy-MM-dd                  87-04-18
    y-MM-dd                   04-10-29
    y-M-d                     78-1-19
    A HH:mm:ss                AM 09:06:50
    a HH:mm:ss                am 06:00:15
    HH:mm:ss                  02:52:32
    H:m:s                     1:35:37

    11.序列
    index

    
