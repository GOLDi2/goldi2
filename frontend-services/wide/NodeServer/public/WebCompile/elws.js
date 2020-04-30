const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const rimraf = require('rimraf');
const config = require('./config/elws_config.json');
const runningProcesses = require('./runningProcesses');
const request = require('request');

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

/*async function getPathed(tmpPath) {
    //let help="dummy";
    let promise = new Promise((resolve, reject) => {
        walk(tmpPath, function (err, results) {
            if (err) throw err;
            console.log("hier stehen alle dateien:    " + results);
            for (let i = 0; i < results.length; i++) {
                let s = results[i];
                if (s.match(/.*out.pof/)) {
                    resolve(s);//results[i];
                }
            }
        });
    });
    let result = await promise;
    return result;

};*/

module.exports = {

    /**
     * Synthesize the Logic Codes
     * @param req HTTP POST request with contents of source code
     * @param res HTTP response
     * @param tmpName Name of the temporary path
     */
    compile: function (req, res, tmpName) {
        var resSent = false;
        var firstFileIndex = 0;
        for (let i = 0; i < req.body.files.length; i++) {
            if (req.body.files[i].name.slice(-2) != '/.') {
                firstFileIndex = i;
                break;
            }
        }
        runningProcesses.addProcess(req.body.sessionId);
        //important paths
        let workspacePath = path.resolve('../ELWS/__workspace');
        let chdDirPath = path.resolve('../Nodeserver/public/WebCompile/chd');
        let codePath = path.resolve(workspacePath, 'code.exe');
        let tablePath = path.resolve(workspacePath, 'table.exe');
        let exportsimPath = path.resolve(workspacePath, 'exportsim.exe');
        let savePath = path.resolve(workspacePath, 'save.exe');
        let nsPath = path.resolve(process.cwd());
        let tmpPath = path.resolve(nsPath, tmpName);
        //TODO select chd files according to the choosen device
        let chdPath = path.resolve(chdDirPath, 'v1_00.chd'); //TODO default chd file
        /*if(req.body.device === '3AxisPortal'){
                chdPath = ...;
        }*/


        //var core = spawn(corePath);
        let save = spawn(savePath);
        let code = spawn(codePath);
        let exportsim = spawn(exportsimPath);
        let table = spawn(tablePath);
        //var gui = spawn(guiPath);

        /**
         * Initialize the Logic codes with adding "_var" after the variables.
         */
         function parseCode() {
            let content = req.body.files[firstFileIndex].content;
            let pinNames = [];
            let rawdata = fs.readFileSync(chdPath); //TODO replace with parameter after testing
            let data = JSON.parse(rawdata);
            data.pinDescriptions.forEach(function (value) {
                pinNames.push(value.pinName);
            });
            console.log('pinNames::::::'+pinNames);
            pinNames.forEach(function(value){
                let regexp = new RegExp(value + '\\b', 'g');
                content = content.replace(regexp, value + '_var');
            });
            req.body.files[firstFileIndex].content = content;
            console.log('PARSEDCODE::::::'+req.body.files[firstFileIndex].content);
        }

        /**
         * gets the code from the request and sends it to the code-module
         */
        function sendCode() {
            if (req.body.files[firstFileIndex].name.slice(-6) === '.logic') {
                let elwsString = req.body.files[firstFileIndex].content;
                let elws =
                    {
                        "tid": [["gui.message", 101], ["save.file", 0], ["code.document", 0]],
                        "msgType": "file_load_content",
                        "dataType": "code_document_save_data",
                        "info": "req",
                        "data": {
                            "andOperator": "&",
                            "commentOperator": "//",
                            "notOperator": "!",
                            "orOperator": "+",
                            "text": elwsString
                        }
                    };
                code.stdin.write(JSON.stringify(elws) + '\n');
            }
        }

        //Convert .logic codes to VHDL
        /**
         * sends the path of the used .chd file to the export module
         * @returns {Promise<void>}
         */
        function sendChd() {

            let chd = {
                "tid": [["gui.message", 109], ["exportsim.export", 0]],
                "msgType": "exportsim_choose_chip",
                "dataType": "string",
                "info": "",
                "data": chdPath.replace(/\\/g, '/')
            };
            exportsim.stdin.write(JSON.stringify(chd) + '\n');
            console.log('send export sim choose chip sent here ---------------------------------------------------');
        }

        /**
         * tells the export module there is no existing mapping for the used .chd file
         * This is required because we do not use the save module that would usually check if there is already a
         * existing mapping for the used chip
         * We just pretend there is no already existing mapping and handle the mapping ourselfes later
         */
         function sendSaveExportNoMapping() {
            let msg = {
                "tid": [["exportsim.export", 0], ["save.file", 0], ["exportsim.export", 0]],
                "msgType": "save_export_no_mapping",
                "dataType": "none",
                "info": "res",
                "data": null
            };
            console.log('no mapping sent here ----------------------------------------------------------------------------------------------------------------------------');
            exportsim.stdin.write(JSON.stringify(msg) + '\n');

        }

        /**
         * Generate the contents of exportsim_start_export.data
         * @param doDevicePinMapMsg JSON object of the message exportsim_do_device_pin_mapping
         *
         */

        /**
         *  Generate the contents of exportsim_start_export.data
         * @param doDevicePinMapMsg JSON object of the message exportsim_do_device_pin_mapping
         * @param clkAutomaton0PinIndex Pin index of clk_automaton_0
         * @param resetAutomaton0PinIndex Pin index of reset_automaton_0
         * @param debounceClkPinIndex Pin index of debounce_clk
         * @returns {{dividedInputClkSignals: Array, resetActivationLevels: *[][], debouncedPorts: Array, outputToDevicePins: Array, devicePinsToInput: Array}} contents of exportsim_start_export.data
         */
        function generateStartExportData(doDevicePinMapMsg, clkAutomaton0PinIndex, resetAutomaton0PinIndex, debounceClkPinIndex){
            let pinNames = [];
            let rawdata = fs.readFileSync(chdPath); //TODO replace with parameter after testing
            let data = JSON.parse(rawdata);
            data.pinDescriptions.forEach(function (value) {
                pinNames.push(value.pinName);
            });
            //checks if the message is of the correct messagetype, if not, does nothing
            if (doDevicePinMapMsg.msgType === "exportsim_do_device_pin_map") {
                //need 2 mappers because the arrays are built differently for input and output vars
                let inMapper = function(value, index) {
                    if(!value.includes('clk_automaton_0') && !value.includes('reset_automaton_0')
                        && !value.includes('debounce_clk')){
                        value = value.substr(0, value.length-4); //removing the _var that was added earlier for this comparison
                    }
                    //check if pinNames contains the variable, if not, return error and stop compilation (only vars are allowed that are supported from the chip)
                    if (pinNames.includes(value)){
                        let pinIndex = pinNames.indexOf(value);
                        console.log(`found a match: ${value} @ ${index} matching to pinIndex: ${pinIndex}`);
                        let helpArr = [pinIndex, [index]];
                        devicePinsToInput.push(helpArr);
                    } else if (value.includes('clk_automaton_0')) {
                        console.log(`found a match: ${value} @ ${index} matching to pinIndex: ${clkAutomaton0PinIndex}`);
                        let helpArr = [clkAutomaton0PinIndex,[index]];
                        devicePinsToInput.push(helpArr);
                    } else if (value.includes('reset_automaton_0')) {
                        console.log(`found a match: ${value} @ ${index} matching to pinIndex: ${resetAutomaton0PinIndex}`);
                        let helpArr = [resetAutomaton0PinIndex,[index]];
                        devicePinsToInput.push(helpArr);
                    } else if (value.includes('debounce_clk')) {
                        console.log(`found a match: ${value} @ ${index} matching to pinIndex: ${debounceClkPinIndex}`);
                        let helpArr = [debounceClkPinIndex,[index]];
                        devicePinsToInput.push(helpArr);
                    } else {
                        //do nothing because error message will be generated from ELWS
                    }
                };
                let outMapper = function(value, index) {
                    //check if pinNames contains the variable, if not, return error and stop compilation (only vars are allowed that are supported from the chip)
                    value = value.substr(0, value.length-4); //removing the _var that was added earlier for this comparison
                    if (pinNames.includes(value)){
                        let pinIndex = pinNames.indexOf(value);
                        console.log(`found a match: ${value} @ ${index} matching to pinIndex: ${pinIndex}`);
                        let helpArr = [[pinIndex], index];
                        outputToDevicePins.push(helpArr);
                    } else {
                        // TODO throw error and abort cuz not all vars can be mapped
                        // console.log('no match for: ' + value);
                    }
                };
                // console.log('DEVICE PIN MAP FOUND');
                //All of the elements needed for the pinmapping
                let debouncedPorts = [];
                let devicePinsToInput = [];
                let dividedInputClkSignals = [];
                let outputToDevicePins = [];
                let resetActivationLevels = [[2,true]];
                // let pinNames = message.data.pinNames;  //names of all pins of the selected .chd //no longer needed, get the names directly from .chd now
                let inputVars = doDevicePinMapMsg.data.inputVariables;  //names of all input vars used in the code
                let outputVars = doDevicePinMapMsg.data.outputVariables;  //names of all output vars used in the code
                inputVars.forEach(inMapper);
                outputVars.forEach(outMapper);
                //TODO DOESN'T NEED
                /*
                for(let i = 0; i < outputToDevicePins.length; i++){
                    if(i === outputToDevicePins.length - 1){
                        outputToDevicePins[i][1]=0;
                    } else {
                        outputToDevicePins[i][1]=outputToDevicePins[i][1]+1;
                    }
                }*/
                let result = {
                    "debouncedPorts": debouncedPorts,
                    "devicePinsToInput": devicePinsToInput,
                    "dividedInputClkSignals": dividedInputClkSignals,
                    "outputToDevicePins": outputToDevicePins,
                    "resetActivationLevels": resetActivationLevels
                };
                console.log('Pinmapping result:'+JSON.stringify(result)); //TODO Test
                return result;
            }
        }

        /**
         * Sends the Pinmapping to the export module
         * Then tells the export module to start the export
         * Can be used even if the code and table module do not contain any data (and therefore there is no code to
         * export) and the export module will still say "export succesful" (atleast when not using quartus), so be
         * careful about that
         */
         function sendStartExport(startExportData) {

            let str = req.body.files[firstFileIndex].name;
            let out = {
                "tid": [["gui.message", 876], ["exportsim.export", 0]],
                "msgType": "exportsim_start_export",
                "dataType": "exportsim_dev_proj_con_desc",
                "info": (tmpPath + ',' + str.slice(str.lastIndexOf('/')).slice(1)).replace(/\\/g, '/'),
                "data": startExportData

            };
            console.log('Start export sent --------' + (tmpPath + ',' + str.slice(str.lastIndexOf('/'))).replace(/\\/g, '/'));
            exportsim.stdin.write(JSON.stringify(out) + '\n');
        }

        /**
         * Using Quartus to compile the vhd file and export.
         */
         function sendUseQuartusTrue() {
            let quartusPathMsg = {
                "tid":[["exportsim.export",0]],
                "msgType":"update",
                "dataType":"sb_cfg_map",
                "info":"res",
                "data":{"class_name":"string","setting_name":"quartuspath","value":config.development.quartus_path}
            };
            let useQuartusMsg = {
                "tid":[["exportsim.export",0]],
                "msgType":"update",
                "dataType":"sb_cfg_map",
                "info":"res",
                "data":{"class_name":"bool","setting_name":"usequartus","value":"1"}
            };
            exportsim.stdin.write(JSON.stringify(quartusPathMsg)+'\n');
            exportsim.stdin.write(JSON.stringify(useQuartusMsg)+'\n');
            console.log('enabled export with quartus');
        }

        /**
         * Sends a shutdown message to the "target" module
         * @param target the module that should get shutdown
         */
         function sendShutdownTo(target) {
            // We need a string of the module name to put it into the Message
            // Modules check if the Message is actually for them, so the Module-name is required
            let targetString;
            switch (target) {
                case code:
                    targetString = "code";
                    break;
                case table:
                    targetString = "table";
                    break;
                case exportsim:
                    targetString = "exportsim";
                    break;
                case save:
                    targetString = "save";
                    break;
                case gui:
                    targetString = "gui";
                    break;
                default:
                    console.log('Error: No Process found');
                    return;
            }
            let msg = {
                "tid": [[targetString, 0]],
                "msgType": "control",
                "dataType": "string",
                "info": "req",
                "data": "shutdown"
            };
            target.stdin.setEncoding('utf8');
            target.stdin.write(JSON.stringify(msg) + '\n');
        }

        //Start sending elws codes
        parseCode();
        sendCode();


        /**
         * Read the given message and returns the target the message is supposed to go to
         * If the message is a broadcast or the target is not implemented returns null for further handling
         * @param message The message
         * @returns {null} Returns null if the message is a broadcast or the target is not implemented
         * @returns target Returns the targeted module as object, so you can directly write to the targets stream by using target.stdin.write etc.
         */
         function getMessageTarget(message) {
            if (message.tid.length <= 1) {
                return null;
            } //if tid consists only of 1 element its a broadcast to the core, we dont need that

            let targetString = message.tid[message.tid.length - 1][0];
            let target = null; // set target to null so it can easily be handeled if we can't find a target
            if (targetString.includes('table')) {
                target = table
            }
            if (targetString.includes('code')) {
                target = code
            }
            if (targetString.includes('export')) {
                target = exportsim
            }
            return target;
        }

        //Buffers for undeterministic messages.
        let full_automata_list_Buffer = {value : ''};
        let code_all_equations_list_Buffer = {value : ''};
        let exportsim_do_device_pin_map_Buffer = {value : ''};
        let defaultBuffer = {value: ''};
        //lead messages between modules
        /**
         * receives a block of messages or one (part of a) message and then maps the JSON Object(s) to an array
         * If data contains multiple JSONs splits the JSONs first and then maps them
         * If data conatins an unfinished JSON Buffers this part and then adds the next data to it until the message
         * is finished
         * After the mapping, trys to find the destination of the message by using getMessageTarget function and then
         * send writes the Message to the targets stdin.
         * Some Messages get delayed until a certain response has been received, because the ELWS need some messages
         * in a certain sequence (for example you cant start the export until you didnt get the code_all_equations list and the full_automata_list)
         * @param data the content of a "data" event on the stdout stream of one of the child processes. Contains one (maybe unfinished) or multiple JSON Objects
         */
         function routeMessages(data) {
            let msgBuffer = defaultBuffer;
            let JSONObjects;
            if(data.toString().includes('full_automata_list')){
                msgBuffer = full_automata_list_Buffer;
            } else if(data.toString().includes('code_all_equations_list')){
                msgBuffer = code_all_equations_list_Buffer;
            } else if(data.toString().includes('exportsim_do_device_pin_map')){
                msgBuffer = exportsim_do_device_pin_map_Buffer;
            }

            let stringBuffer = data.toString();
            if (!JSON.stringify(msgBuffer.value.toString().slice(-2)) === '\r\n') {
                try {
                    // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
                    const JSONobjectStrings = stringBuffer.split("\r\n").filter(s => s !== "");
                    // Übersetzena aller Zeilen in Objekte
                    let JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));
                } catch (e) {
                    //if the Message is not complete, set the part to unfinishedMessageString and wait for next stdout event and hope message ends there
                    console.log('String angehangen');
                    let value = msgBuffer.value.toString();
                    value += stringBuffer;
                    msgBuffer.value = value;
                    return;
                }
            } else {
                let value = msgBuffer.value.toString();
                value += stringBuffer;
                msgBuffer.value = value;
                try {
                    // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
                    const JSONobjectStrings = msgBuffer.value.toString().split("\r\n").filter(s => s !== "");
                    // Übersetzena aller Zeilen in Objekte
                    JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));
                } catch (e) {
                    console.log('going for another round');
                    return;
                }
            }

            // Ausgabe der einzelnen Objekte
            // Node-Debugger hilft bei soetwas gut weiter, Anleitung siehe: https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html#Node.js_run
            for (let i = 0; i < JSONObjects.length; i++) {
                let message = JSONObjects[i];
                let target = getMessageTarget(message);
                if (target != null) {
                    console.log("sending message: " + JSON.stringify((JSONObjects[i])));
                    target.stdin.write(JSON.stringify(JSONObjects[i]) + '\n');
                }
                if (message.msgType === 'file_new_ack') {
                    sendChd();
                }
                if(message.msgType === 'code_doc_syntax_error' && message.data.length > 0){
                    if (!resSent) {
                        res.status(500);
                        res.send({success: '', sessionId: req.body.sessionId, output: JSON.stringify(message)});
                        resSent = true;
                        runningProcesses.removeProcess(req.body.sessionId);
                    }
                }
                if (message.msgType === 'exportsim_chd_loaded') {
                    sendSaveExportNoMapping();
                }
                if(message.msgType === 'exportsim_do_device_pin_map'){
                    sendUseQuartusTrue(); //TODO SEND QUARTUS DEBUG
                    let chdBaseName = path.basename(chdPath,'.chd');
                    let clkAutomaton0PinIndex = config.development.chd_hidden_var_pin_index[chdBaseName].clk_automaton_0;
                    let resetAutomaton0PinIndex = config.development.chd_hidden_var_pin_index[chdBaseName].reset_automaton_0;
                    let debounceClkPinIndex = config.development.chd_hidden_var_pin_index[chdBaseName].debounce_clk;
                    sendStartExport(generateStartExportData(message,clkAutomaton0PinIndex, resetAutomaton0PinIndex, debounceClkPinIndex));
                }
                if (message.msgType === 'exportsim_export_finished') {
                    if (!resSent) {
                        let pathToOutput = "dummy";
                        if ((req.body.experimentId != undefined) &&(req.body.uploadServer != undefined)) {
                        walk(tmpPath, function (err, results) {
                            if (err) throw err;
                            console.log("hier stehen alle dateien:    " + results);
                            for (i = 0; i < results.length; i++) {
                                let s = results[i];
                                if (s.match(/.*out.pof/)) {
                                    pathToOutput = s;//results[i];
                                }
                            }
                        });
                      // pathToOutput=getPathed(tmpPath);
                            console.log(pathToOutput);
                        if (pathToOutput != "dummy") {
                            var formData = {
                                UserFile: {
                                    value: fs.createReadStream(pathToOutput),
                                    options: {
                                        //'content-type': 'application/octet-stream',
                                        filename: 'LogIProgrammingFile.hex'
                                    }
                                }
                            };


                            const GOLDiWebRoot = req.headers.referer.replace("WIDE/no-referrer", "");
                            console.log(req);
                            console.log("REQUEST-URL:", req.body.uploadServer + "/index.php?Function=ServerUploadFile&ExperimentID=" + req.body.experimentId + "&SessionID=" + req.body.sessionId);
                            console.log("FORM-DATA", formData);
                            // Post the file to the upload server
                            request.post({
                                    url: GOLDiWebRoot + "/index.php?Function=ServerUploadFile&ExperimentID=" + req.body.experimentId + "&SessionID=" + req.body.sessionId,
                                    formData: formData
                                }
                                , function optionalCallback(err, httpResponse, body) {
                                    // if (err) {
                                    //     return console.error('upload failed:', err);
                                    // }

                                    console.log('Upload Response: ', err, httpResponse, body);
                                });
                        }
                    }
                        res.send({success: 'true', sessionId: req.body.sessionId, output: data.toString()});
                        runningProcesses.removeProcess(req.body.sessionId);
                        resSent = true
                    }
                    sendShutdownTo(code);
                    sendShutdownTo(exportsim);
                    sendShutdownTo(table);
                    sendShutdownTo(save);
                }
            }
            msgBuffer.value = '';
        }

        /*
        Event listeners for child processes
         */
        code.stdout.on('data', function (data) {
            routeMessages(data);
            console.log('code stdout:\n' + data.toString());
        }).on('close', function () {
            console.log('code  stdout:closed\n');
        }).on('end', function () {
            console.log('code  stdout:end\n');
        }).on('error', function (error) {
            console.log('code  stdout error :\n' + error);
        }).on('pause', function () {
            console.log('code  stdout:paused\n');
        }).on('resume', function () {
            console.log('code  stdout:resumed\n');
        });

        code.stderr.on('data', function (data) {
            console.log('code  stderr:\n' + data.toString());
        }).on('end', function () {
            console.log('code  stdout:closed\n');
        });

        code.stdin.on('drain', function () {
            console.log('code  stdin:drain\n');
        }).on('error', function (error) {
            console.log('code  stdin error:\n' + error);
        }).on('finish', function () {
            console.log('code  stdin:finished\n');
        }).on('pipe', function () {
            console.log('code  stdin:pipe\n');
        }).on('unpipe', function () {
            console.log('code stdin:unpipe\n');
        });

        table.stdout.on('data', function (data) {
            routeMessages(data);
            console.log('code stdout:\n' + data.toString());
        }).on('close', function () {
            console.log('table stdout:closed\n');
        }).on('end', function () {
            console.log('table stdout:end\n');
        }).on('error', function (error) {
            console.log('table stdout error :\n' + error);
        }).on('pause', function () {
            console.log('table stdout:paused\n');
        }).on('resume', function () {
            console.log('table stdout:resumed\n');
        });

        table.stderr.on('data', function (data) {
            console.log('table stderr:\n' + data.toString());
        }).on('end', function () {
            console.log('table stdout:closed\n');
        });

        table.stdin.on('drain', function () {
            console.log('table stdin:drain\n');
        }).on('error', function (error) {
            console.log('table stdin error:\n' + error);
        }).on('finish', function () {
            console.log('table stdin:finished\n');
        }).on('pipe', function () {
            console.log('table stdin:pipe\n');
        }).on('unpipe', function () {
            console.log('table stdin:unpipe\n');
        });

        exportsim.stdout.on('data', function (data) {
            routeMessages(data);
            console.log('code stdout:\n' + data.toString());
        }).on('close', function () {
            //Delete tmp dir after child process finished
            if (tmpPath.includes(tmpName)) {                            //TODO original: if(delPath.includes(tmpName)){
                rimraf(tmpPath, function (err) {
                    if (err) {
                        console.log('Deleting tmp files error: ' + err + ' | tmp file dir: ' + tmpName);
                    }
                });
            }
            console.log('export stdout:closed\n');
        }).on('end', function () {
            console.log('export stdout:end\n');
        }).on('error', function (error) {
            console.log('export stdout error :\n' + error);
        }).on('pause', function () {
            console.log('export stdout:paused\n');
        }).on('resume', function () {
            console.log('export stdout:resumed\n');
        });

        exportsim.stderr.on('data', function (data) {
            console.log('export stderr:\n' + data.toString());
        }).on('end', function () {
            console.log('export stdout:closed\n');
        });

        exportsim.stdin.on('drain', function () {
            console.log('export stdin:drain\n');
        }).on('error', function (error) {
            console.log('export stdin error:\n' + error);
        }).on('finish', function () {
            console.log('export stdin:finished\n');
        }).on('pipe', function () {
            console.log('export stdin:pipe\n');
        }).on('unpipe', function () {
            console.log('export stdin:unpipe\n');
        });
    },

    minimizeEquation: function (req, res) {
        let code = spawn(path.resolve('../ELWS/__workspace/code.exe'));
        let save = spawn(path.resolve('../ELWS/__workspace/save.exe'));

        // necessary global variables
        let request = req.body.content;
        let resSent = false;
        let response = "";
        let codeBuffer = {value: ''};
        let saveBuffer = {value: ''};
        let minimizeResponseReceived = false; //was used for the timeout

        //needed for the response
        let comment;
        let operation = "";

        let equation = prepareEquation(request);

        // get only unique variables from the equation so we can declare them as inputs so the elws doesnt crash
        // it sometimes crashes, most of the time it doesnt, this is more of a precaution than anything else
        let onlyVarString = equation.replace(/[\W]+/g, " "); // removes everything but variable names... see: https://stackoverflow.com/a/20864946
        let varArray = onlyVarString.split(" ");
        let uniqueVarArray = [...new Set(varArray)];  // removes all duplicates from the var array... see: https://wsvincent.com/javascript-remove-duplicates-array/
        //TODO if theres a ; in the equation we get an extra, empty, string as last object of the uniqueVarArray. Gotta debug that, works for now though
        uniqueVarArray = uniqueVarArray.filter(Boolean); //removes empty element
        console.log("unique array length: " + uniqueVarArray.length + " content: ");
        console.log(uniqueVarArray);

        let fixedCode = "";
        let linecounter = 0;
        for (let i = 1; i < uniqueVarArray.length - 1; i++) { //last element is an empty string, dont know why yet (has something to do with the semicolon at the end) works for now though
            fixedCode = fixedCode.concat('input ' + uniqueVarArray[i] + ';\n');
            linecounter += 1;
        }
        fixedCode = fixedCode.concat(equation);

        let send_code_msg = {
            "tid": [["", 0], ["code.document", 0]],
            "msgType": "file_load_content",
            "dataType": "code_document_save_data",
            "info": "req",
            "data": {
                "andOperator": "&",
                "commentOperator": "//",
                "notOperator": "!",
                "orOperator": "+",
                "text": fixedCode
            }
        };
        let minimize_request_msg = {
            "tid": [["", 0], ["code.document", 0]],
            "msgType": "code_text_selection_query",
            "dataType": "gui_text_selection_query",
            "info": "",
            "data": {"charIdxStart": 0, "lineStart": linecounter, "queryType": 1}
        };

        save.stdout.on('data', function (data) {
            console.log("save stdout: " + data.toString());
            saveMessageHandler(data);
        });
        code.stdout.on('data', function (data) {
            console.log("code stdout: " + data.toString());
            codeMessageHandler(data)
        });
        code.on('exit', function(code) {
            sendErrorResponse(`An error occurred in the backend, please check your equation and try again (error code: ${code}`);
        });

        /**
         * Goes over the Equation, checks prerequisites and fixes possible problems like faulty whitespace
         * @param equation
         * @returns {*|string} fixed equation
         */
        function prepareEquation(equation) {
            // check if there is a comment at the end of the line and remove it if so
            if (request.includes('//')){
                comment = ('//') + request.split(/\/\/(.+)/g)[1];  //saving inline comment for later... see: https://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character
                equation = request.split('//')[0];
                console.log('removed comment')
            } else {
                equation = request;
            }

            // check if the string is a equation
            if (!(equation.includes('='))){
                sendErrorResponse('There is no "=" in the equation');
                return;
            }

            //check if the equation is finished (with a ";")
            if (!(equation.includes(';'))){
                sendErrorResponse('Could not find a semicolon (";") at the end of the equation');
                return;
            }

            //get the operation (either ":=" or "=") and save it for later
            if (equation.split('=')[0].slice(-1) === ':') {
                operation = ' :=' ;
            } else {
                operation = ' =';
            }
            console.log(`operation: ${operation}`);

            // remove whitespace in front of equation (just in case)
            while(equation.charAt(0) === " "){
                equation = equation.substr(1);
            }
            return equation;
        }

        //TODO check if there is a way to check if a given object is a JSON-object (before trying to map it)
        //TODO at the moment, if we try to handle a unparsable message the buffer will never get cleared again, trust ELWS it only sends valid messages?

        // We need 2 message handlers because the save-module separates Messages differently from the code-module
        function saveMessageHandler(data) {
            saveBuffer.value += data.toString();
            let JSONObjects;
            try {
                // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
                const JSONobjectStrings = saveBuffer.value.split("\n").filter(s => s !== "");
                // Übersetzena aller Zeilen in Objekte
                JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));

            } catch (e) {
                console.log('ERROR WHILE PROCESSING A MESSAGE FOR THE SAVE MODULE');
                return;
            }
            saveBuffer.value = '';
            for (let i = 0; i < JSONObjects.length; i++) {
                let message = JSONObjects[i];
                let target = getMessageTarget(message);
                if (target != null) {
                    console.log(`sending to ${target.spawnfile}: ` + JSON.stringify((JSONObjects[i])));
                    target.stdin.write(JSON.stringify(JSONObjects[i]) + '\n');
                }
                specificMessageHandler(message);
            }
        }

        function codeMessageHandler(data) {
            codeBuffer.value += data.toString();
            let JSONObjects;
            try {
                // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
                const JSONobjectStrings = codeBuffer.value.split("\r\n").filter(s => s !== "");
                // Übersetzena aller Zeilen in Objekte
                JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));

            } catch (e) {
                console.log('ERROR WHILE PROCESSING A MESSAGE FOR THE CODE MODULE');
                return;
            }
            codeBuffer.value = '';
            for (let i = 0; i < JSONObjects.length; i++) {
                let message = JSONObjects[i];
                let target = getMessageTarget(message);
                if (target != null) {
                    console.log(`sending to ${target.spawnfile}: ` + JSON.stringify((JSONObjects[i])));
                    target.stdin.write(JSON.stringify(JSONObjects[i]) + '\n');
                }
                specificMessageHandler(message);
            }
        }

        function getMessageTarget(message) {
            if (message.tid.length <= 1) {
                return null;
            } //if tid consists only of 1 element its a broadcast to the core, we dont need that
            let target = null; // set target to null so it can easily be handeled if we can't find an implemented target
            let targetString = message.tid[message.tid.length - 1][0];
            if (targetString.includes('code')) {
                target = code
            } else if (targetString.includes('utils')) {
                target = save
            }
            return target;
        }

        function parseMinimizedEquationMessageInfixRep(message) {
            let equation = "";

            let tokenizedInfixRep = message.data.infixRep;
            //remove tokens
            tokenizedInfixRep.forEach(function (value) {
                equation += " " + value[1]; // adding a space between every value/operator because thats what the elws does //TODO should we remove that?
            });

            return equation;
        }

        /**
         * basically an event handler, does stuff when a special message gets sent, currently used for sending messages at the right time for example
         * @param message
         */
        function specificMessageHandler(message) {
            if (message.msgType === 'minimized_equation') {
                minimizeResponseReceived = true;
                response = uniqueVarArray[0] + operation + parseMinimizedEquationMessageInfixRep(message) + ";";
                if (comment) {
                    response += ` ${comment}`;
                }
                if (!resSent) {
                    console.log("The input was: " + request);
                    console.log("Equation for response: " + response);
                    res.send({success: true, output: response});
                    resSent = true
                }
                code.kill();
                save.kill();
            }
            // after code broadcasts its address its ready to receive data
            if (message.msgType === 'address_single') {
                if (message.tid[0][0] === "code") {
                    console.log("sending code msg: " + JSON.stringify(send_code_msg));
                    code.stdin.write(JSON.stringify(send_code_msg) + '\n');
                    // timeout, in case anything goes wrong inside the ELWS (it doenst send error messages) we send an error and stop the processes
                    // setTimeout(function(){
                    //     if (!minimizeResponseReceived){
                    //         sendErrorResponse('Minimize timed out in the ELWS, please check your equation and try again')
                    //     }
                    // }, 60000);
                }
            }
            // file_new_ack is the last message code sends after receiving new code (dont know what it does, but it means for us it's done with processing the data)
            // so we can send the minimize request after that
            if (message.msgType === 'file_new_ack') {
                console.log("sending minimize request msg: " + JSON.stringify(minimize_request_msg));
                code.stdin.write(JSON.stringify(minimize_request_msg) + '\n');
            }
        }

        /**
         * sends the given error message to the front end and then kills the processes
         * @param error
         */
        function sendErrorResponse(error) {
            response = error;
            if (!resSent) {
                console.log("The input was: " + request);
                console.log("Equation for response: " + response);
                res.send({success: false, output: response});
                resSent = true;
            }
            code.kill();
            save.kill();
        }
    }
};