var {killExec, fetchPid} = require('./kill.js')
module.exports = same

function same(port){
    fetchPid(port).then(function(validExec){
        var {pids, cmds} = validExec
        process.stdin.setEncoding('utf8');
        // cmds.forEach(function(cmdText){
        //     process.stdout.write(cmdText)
        //     process.stdout.write('\r\n')
        // })
        if(cmds.length) process.stdout.write('port ('+port+') is already in use:'+'\r\n')
        process.stdout.write(`you want kill ${port} port :[Y or N]`);

        process.stdin.on('readable', () => {
          var chunk = process.stdin.read()
          if(!chunk) return
          if (~chunk.indexOf('Y')) {
            killExec(pids)
          }else {
            process.stdout.write('No action'+'\r\n');
          }
        })
    })
}