const Queue = require('better-queue');
const Task = require('./res/task.js.js');
const bqueue = require('better-queue');
const fs = require('fs');
const http = require('http');

var compiler = {}

// load all languages
let foldernames = fs.readdirSync('./Languages');
for(folder of foldernames){
    if(!folder.includes('.')){ // if there are any files in the Languages folder, they get ignored, only care about folders
        try {
            compiler[folder] = require(`./Languages/${folder}/Languagemodule.js`);
            console.log(`imported Languagemodule.js for ${folder}`)
        } catch {
            console.log(`Error, couldn\'t find a Languagemodule.js file in the folder: ${folder}. Skipping`);
        }
    }
}

// init queue with compile as function to run on given tasks
var queue = new Queue(compile);

//create server, listening on port 1337
http.createServer((request, response) => {
    const { headers, method, url } = request;
    request.on('error', (err) => {
        console.error(err);
    })
    //TODO implement actual routing (maybe with Express?), this is only for testing purposes
    switch (headers['type']) {
        case 'compRequest':
            compileRequestHandler(request, response);
            break;
        case 'loadRequest':
            //answer with current load
            loadRequestHandler(request, response);
            break;
        case 'languageRequest':
            languageRequestHandler(request, response); //TODO
            break;
        //more cases if needed
        default:
            response.writeHead(200, {
                'Content-Type': 'application/json',
                'Trailer':'Compilation-Result-Code'
            }); 
            response.end('request type was not an implemented type, check if headers are set correctly')
    }
}).listen('1337')

function getAvailableLanguages () {
    // TODO implement reply on availableLanguages request
    // available languages are saved in compiler and can be read with the following code if needed:
    console.log('Available languages: ')
    for (language in compiler){ //iterates through all imported languages
        console.log(language); 
    }
};

function compileRequestHandler (request, response) {
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        //write header for response, so the response is writable
        response.writeHead(200, {
            'Content-Type': 'application/json',
            'Trailer':'Compilation-Result-Code'
        });
        // prepare values for task 
        language = request.headers['language'];
        if(!compiler.hasOwnProperty(language)){
            response.end('language not supported');
            return;
        }
        let JSONbody;
        try {
            JSONbody = JSON.parse(body);
        } catch {
            // TODO actual error handling here 
            console.log('couldnt parse JSON');
            return;
        } 
        // create new task for the queue
        // TODO implement something for the id
        let task = new Task(0, language, JSONbody, response, false);
        // add task to the queue
        queue.push(task);
    });
};

function loadRequestHandler(request, response) {
    console.log('Load Request arrived');
    response.writeHead(200, {
        'Content-Type': 'application/json',
    });
    res = {
        load:queue.getCurrentLoad()
    }
    response.end(JSON.stringify(res));
}

function languageRequestHandler(request, response) {
    console.log('Language Request arrived');
    response.writeHead(200, {
        'Content-Type': 'application/json',

    });
    let langArray = Array();
    for (item in compiler) {
        langArray.push(item);
    }
    res = {
        'languages':langArray
    }
    response.end(JSON.stringify(res));
}

async function compile(task, cb) {
    await compiler[task.language](task, cb);
    task.resStream.end('compilation finished');
    cb();
}