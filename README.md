#proxy-mock
1. proxy 接口代理到线上地址防止开发中的跨域问题
2. mock  开发中提供数据模拟



## 开启proxy ，配置
    请求投中加入"DOMAIN"字段名，值为你的目标地址
    setRequestHeader('DOMAIN','your target address')

## 开启mock ，配置
    请求投中加入"MOCK"字段名，值为你当前项目下mock数据存放地址
    setRequestHeader('MOCK','/dev/mock')

    如你要请求接口为 /active/info
    那要在 "/dev/mock"目录下新建 active目录 ，并新建info.json文件
    即最终目录为 /dev/mock/active/info.json
    其中 info.json 中的数据即是接口文档中约定的数据 dome如下
    
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
    其中的具体规则 下看


## mock 规则    

    // 禁止mock 直接返回当前文件数据
    no-mock : "true"

    // mock中的数组长度，随机10到30之间
    mock-length:”[10,30]"

    // 接口响应的时间长度 如下为2s
    mock-delay:2000

    {{}} 规则标示符

    1. 随机固定值
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

    
