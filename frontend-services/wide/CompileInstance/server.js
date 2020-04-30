const http = require('http');
const compileInstance = require('./lib/compileInstance.js');

let serverPort = 1338;

http.createServer((req, res) => {
    // Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
	res.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
    router(req, res)
}).listen(serverPort, () => {
    console.log('server is now listening on port: ' + serverPort); 
})

function router(req, res){
    console.log(req.headers);
    let url = req.url; 
    if(url.slice(-1) === '/' && url.length > 1){ //removes '/' if its at the end of the url
        url = url.substring(0, url.length-1);
    }

    let resObj;
    switch(url) {
        case '/compile':
            console.log('compiling requested');
            compileRequestHandler(req,res);
            break;
        case '/currentLoad':
            console.log('current load requested');
            resObj = {
                'currentLoad': compileInstance.getCurrentLoad()
            }
            res.end(JSON.stringify(resObj));
            break;
        case '/availableLanguages':
            console.log('available languages requested');
            resObj = {
                'availableLanguages': compileInstance.getAvailableLanguages()
            }
            res.end(JSON.stringify(resObj));
            break;
        default: 
            console.log('no routing found');
            res.end('ERROR: nope');
            //error handling for wrong routing
    }
}

function compileRequestHandler(req, res){
    //TODO check if request is POST type
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
        // console.log(chunk.toString());
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        let JSONBody;
        try {
            JSONBody = JSON.parse(body);
            console.log(JSONBody)
        } catch {
            // TODO actual error handling here 
            console.log('couldnt parse JSON');
            return;
        } 
        compileInstance.addToQueue(JSONBody, res);
    })
}