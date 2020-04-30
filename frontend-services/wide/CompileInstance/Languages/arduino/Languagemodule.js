const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

let arduinocliPath = path.resolve(__dirname, "arduino-cli");
let toolchainsPath = ""; // the path to avr-gcc for use with goldi experiments

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

        let aborted = false;

        console.log('task arrived at languagemodule (arduino)');
        resHandler.stdout('Task arrived at Languagemodule.js (arduino)');
        task.on('abort', () => { //triggers if connection to client gets closed
            // DO STUFF TO ABORT COMPILATION
            console.log('Compilation aborted');
            aborted = true;
            compileprocess.kill('SIGINT');
            if(tmpPathCreated) {
                fs.rmdirSync(tmpPaths.tmpPath, {recursive: true});
            }
            reject('Compilation got aborted!');
        });
        //IMPLEMENT COMPILATION HERE

        resHandler.stdout("creating temporary directory");
        let tmpPaths = createTempDirSync(task.files);
        let tmpPathCreated = true;

        resHandler.stdout("reading board options");
        let fqbn = "";

        let board = task.parameters.board;
        fqbn = board.FQBN;
        if (board.options !== undefined && board.options.length > 0) {
            fqbn = fqbn.concat(':');
            board.options.forEach((option) => {
                fqbn = fqbn.concat(option.option + '=' + option.value + ",");
            });
            fqbn = fqbn.slice(0, fqbn.length-1);
        }

        let bonus_flags = "";
        // if a goldi experiment is selected use the normal c toolchain
        /*
        if (fqbn.includes("goldi:avr:experiment")) {
            bonus_flags = bonus_flags.concat("--build-properties runtime.tools.avr-gcc.path=" + '"' + path.join(toolchainsPath, "avr-gcc/"));
        }
         */
        resHandler.stdout("starting compilation");
        let compileprocess = exec('arduino-cli compile -v -b ' + fqbn + ' ' + tmpPaths.sketchPath  + ' --build-path "' + path.join(tmpPaths.tmpPath, "ArduinoCLIBuild") + '" ' + bonus_flags, {cwd: arduinocliPath},
            function (error, stdout, stderr) {
                if (error) {
                    if (!aborted) {
                        fs.rmdirSync(tmpPaths.tmpPath, {recursive: true});
                        reject('compilation failed');
                    }
                } else {
                    resHandler.stdout("compilation successful");
                    if (task.upload) {
                        upload(tmpPaths.sketchPath);
                        fs.rmdirSync(tmpPaths.tmpPath, {recursive: true});
                        resolve("upload successful");
                    } else {
                        fs.rmdirSync(tmpPaths.tmpPath, {recursive: true});
                        resolve("compilation successful");
                    }
                }
            }
        );

        //task.emit("abort");

        //resolve promise when done
        //resolve();
    }).catch((error) => {
        //send error messages here
        resHandler.error(error);
    })

};

/**
 * implement something here, that checks what the current version is and return it as integer
 */
module.exports.getVersion = function () {
    let version = 0.0;

    try {
        let version_text = execSync('arduino-cli version', {cwd: arduinocliPath, encoding: "utf8"});
        version = parseFloat(version_text.slice(version_text.indexOf("Version:") + 8, version_text.indexOf("Commit:")));
        return version;
    } catch (e) {
        return version;
    }

};

/**
 * implement checks here, if the required software is installed
 * return boolean value
 */
module.exports.isAvailableOnHost = function() {
    return fs.existsSync(path.join(arduinocliPath, "arduino-cli.yaml"));
};

function createTempDir() {
    return new Promise(function (resolve, reject) {
        fs.mkdtemp(path.join(__dirname, 'tempDir_'), (err, folder) => {
            if (err) throw err;
            console.log("created " + folder);
            resolve(folder);
        });
    });
}

/**
 * creates a temporary folder for arduino-projects
 * @param files - the received files
 * @returns {{sketchPath: string, tmpPath: string}} - the paths to the temporary folder and the folder containing the sketch
 */
function createTempDirSync(files) {
    let tmpPath = fs.mkdtempSync(path.join(__dirname, 'tempDir_'));
    let sketchPath;
    let sketchFolderCreated = false;
    for (let file in files) {
        if (!sketchFolderCreated) {
            fs.mkdirSync(path.join(tmpPath, file.slice(0, file.indexOf("/"))));
            sketchPath = path.resolve(tmpPath, file.slice(0, file.indexOf("/")));
            sketchFolderCreated = true;
        }
        fs.writeFileSync(path.join(tmpPath, file), files[file]);
    }
    return {tmpPath: tmpPath, sketchPath: sketchPath};
}

//TODO complete upload
function upload(sketchPath) {
    let sketchName = sketchPath.slice(sketchPath.lastIndexOf("\\"));
    let tmpPath = sketchPath.slice(0, sketchPath.lastIndexOf("\\"));
    fs.copyFileSync(path.join(sketchPath, sketchName + ".goldi.avr.experiment.hex"), path.join(tmpPath, "main.hex"));
}