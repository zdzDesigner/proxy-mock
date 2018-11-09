var exec = require('child_process').exec


exports.killPort = killPort
exports.killExec = killExec
exports.fetchPid = fetchPid


function killPort(port){
    fetchPid(port)
    .then(function(validExec){
        let {pids} = validExec
        return killExec(pids)
    })
    .then(function(message){
        console.log({message})
    })
    .catch(function(err){
        console.log({err})
    })
}

// 杀死进程
function killExec(pids){
    // console.log({pids})
    return Promise.all(pids.map(function(pid){
            return new Promise(function(resolve, reject){
                
                    exec(`kill -9 ${pid}`,function(err, stdout, stderr){
                    if(err) reject(err)
                    
                    resolve(`kill process ${pid} success!`)
                })    
            })
        }))
}

// 根据port查找pid
function fetchPid(port){
    return new Promise(function(resolve ,reject){
        let cmd = killCmd()
        // console.log({cmd},port)
        exec(cmd, function(err, stdout, stderr) {
            if(err){ reject(err) }

            let validExec = stdout.split('\n').reduce(function(pend ,list){
                let listArr = list.trim().split(/\s+/)
                // console.log({listArr})
                if(~listArr.indexOf(''+port)) {
                    // console.log(listArr)
                    pend.cmds.push(list)
                    pend.pids.push(listArr[1])
                }
                return pend
            },{cmds:[],pids:[]})

            // console.log({pids})
            if(validExec.pids.length){
                resolve(validExec)
            }else{
                reject(`找不到端口：${port} 对应的Pid`)
            }
        })
    })
}




// 获取平台查询命令
function killCmd(){
    return process.platform == 'win32' 
                ? 'netstat -ano' 
                : 'ps aux'
}