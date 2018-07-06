function callProxy(req, res, options){
        // options.selfHandleResponse = true
        // proxyServer.on('proxyRes', function (proxyRes, req, res) {
        //  var body = [];
        //  console.log(proxyRes.headers)
        //  console.log(proxyRes.body)
            // proxyRes.setEncoding('utf8');
            // proxyRes.on('data', (chunk) => {
            //  console.log({chunk})
            //      body.push(chunk);
            // })
            // proxyRes.on('end', () => {
            //  body = character(body.join(''))
            //  console.log(body)
            //      // body = Buffer.concat(body);
            //      // body = iconv.decode(body, 'utf-16be');
            //      res.end(body);

            // });
            // var body = new Buffer('');
            // proxyRes.on('data', function (data) {
            //     body = Buffer.concat([body, data]);
            // });
            // proxyRes.on('end', function () {
            //     body = body.toString();
            //     console.log("res from proxied server:", body);
            //     console.log(proxyRes)
            //     res.end('a');
            // });
            // proxyRes.pipe(res)
        // });
        proxyServer.web(req, res, options )

    }


    function character(str) {
        return str.replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "");
    }