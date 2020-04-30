const fs = require('fs');
const path = require('path');
const Queue = require('./queue');

// load all languages
var compiler = {}
let foldernames = fs.readdirSync('./Languages');
for(folder of foldernames){ 
    if(!folder.includes('.')){ // if there are any files in the Languages folder, they get ignored, only care about folders //TODO change how i check if its a folder (fs.filetype or smth like that)
        try {
            compiler[folder] = require(path.resolve(`./Languages/${folder}/Languagemodule.js`));
            console.log(`imported Languagemodule.js for ${folder}`)
        } catch {
            console.log(`Error, couldn\'t find a Languagemodule.js file in the folder: ${folder}. Skipping`);
        }
    }
}

//main function for compiling, needed for the queue
async function compile(task){
    try {
        await compiler[task.language].compile(task);
        task.resHandler.end('done');
    } catch {
        console.log('Error compiling')
        task.resHandler.end('error');
    }
}

//initializing queue with compile function
let queue = new Queue(compile);


// returns a JSON-Object with all languages that are supported on this machine
module.exports.getAvailableLanguages = function() {
    let languages = Array();
    for (lang in compiler){
        try{
            // calling the functions before creating a property on languages
            let av = compiler[lang].isAvailableOnHost();
            if (!(typeof(av) === 'boolean')){
                throw new Error('isAvailableOnHost() exists, but is not correctly implemented for ' + lang + ', it should return a boolean value');
            }
            let v = compiler[lang].getVersion();
            if (!(typeof(v) === 'number')){
                throw new Error('getVersion() exists, but is not correctly implemented for ' + lang + ', it should return a numerical value');
            }
            languages.push({
                "name": lang,
                "isAvailableOnHost": av,
                "version": v
            })
        } catch (error){
            console.error(`${lang}: ` + error.message)
        }
    }
    // let languages = Array();
    // for (lang in compiler){
    //     languages.push(lang);
    // }
    return languages;
}

module.exports.getCurrentLoad = function() {
    return queue.getCurrentLoad()
}


module.exports.addToQueue = function(JSONBody, res){
    // language, files, parameters, experimentId, sessionId, upload
    // experimentID and sessionID are only necessary if upload = true
    let experimentId, sessionId, upload, files, language, parameters;
    if(!(JSONBody.hasOwnProperty(upload))){
        JSONBody.upload = false;
    }
    //TODO error handling
    if (JSONBody.upload) {
        ({experimentId, sessionId, upload, files, language, parameters} = JSONBody)
    } else {
        experimentId = null;
        sessionId = null;
        upload = false;
        ({ language, files, parameters } = JSONBody);
    }
    let obj = { // just for testing purposes
        "experimentId" : experimentId, 
        "sessionId" : sessionId, 
        "upload" : upload, 
        "files" : files, 
        "language" : language, 
        "parameters" : parameters
    }
    console.log(obj);
    //TODO check that there is actually an id, language and files. if upload does not exist / is not set -> false; 
    queue.push(language, files, parameters, upload, sessionId, experimentId, res);
}
