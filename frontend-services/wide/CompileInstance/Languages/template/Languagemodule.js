/**
 * function for compiling
 * compile inside of the promise, resolve if everthing worked, reject in case of an error
 * send updates to the client via the resHandler (see below for more info)
 * if the task object emits an 'abort' event, stop compiling
 * 
 * task is an object of the CompileTask class (../../lib/task.js)
 * task has the following public propertys: 
 *  language
 *  files: all files as an JSON-Object
 *  parameters: (optional) parameters for compilation
 *  resHandler: object of the ResponseHandler class (see below)
 *  upload: boolean value if the compiled file(s) should be uploaded to GOLDi after compiling
 * in the sample implementation all of these propertys are accesible as variables
 * task also can emit an 'abort' event, in which case compiling should be stopped, because the client disconnected
 * 
 * resHandler (../../lib/responseHandler.js) has the following public methods for updating the client:
 *  stdout
 *  error
 *  setEstimate (also updates the current estimate)
 * NEVER !!! call resHandler.end() !!! NEVER <- !!!!!!!!!
 */
module.exports.compile = async function(task) {
    // destructuring assignment of all relevant properties
    const { language, content, parameters, resHandler, files} = task;
    return new Promise((resolve, reject) => {
        events.on('abort', () => { //triggers if connection to client gets closed
            // DO STUFF TO ABORT COMPILATION
            reject('Compilation got aborted!')
        })
        //IMPLEMENT COMPILATION HERE


        //resolve promise when done
        resolve();
    }).catch((error) => {
        //send error messages here
        resHandler.error(error);
    })

}

/**
 * implement something here, that checks what the current version is and return it as integer
 */
module.exports.getVersion = function () {
    let version;

    return version;
}

/**
 * implement checks here, if the required software is installed
 * return boolean value
 */
module.exports.isAvailableOnHost = function() {
    let isAvailable = Boolean;

    return isAvailable;
}

