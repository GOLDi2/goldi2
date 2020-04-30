// Node-Debugger hilft bei soetwas gut weiter, Anleitung siehe: https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html#Node.js_run
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');
var compUtils = require('./elwsCompileUtils.js');

//spawns the code, table and exportsim modules of ELWS as child processes
var elwsCode = spawn(path.resolve('../ELWS/__workspace/code.exe'));
var elwsTable = spawn(path.resolve('../ELWS/__workspace/table.exe'));
var elwsExport = spawn(path.resolve('../ELWS/__workspace/exportsim.exe'));

var pinMapping;
// sends shutdown to the target module
sendUseQuartusTrue = function() {
    let quartusPathMsg = {
        "tid":[["exportsim.export",0]],
        "msgType":"update",
        "dataType":"sb_cfg_map",
        "info":"res",
        "data":{"class_name":"string","setting_name":"quartuspath","value":"E:/Programme/Quartus"}
    };
    let useQuartusMsg = {
        "tid":[["exportsim.export",0]],
        "msgType":"update",
        "dataType":"sb_cfg_map",
        "info":"res",
        "data":{"class_name":"bool","setting_name":"usequartus","value":"1"}
    };
    elwsExport.stdin.write(JSON.stringify(quartusPathMsg)+'\n');
    elwsExport.stdin.write(JSON.stringify(useQuartusMsg)+'\n');
    console.log('enabled export with quartus');
};

sendShutdownTo = function(target) {
    let targetString;
    switch (target) {
        case elwsCode:
            targetString = "code";
            break;
        case elwsTable:
            targetString = "table";
            break;
        case elwsExport:
            targetString = "exportsim";
            break;
        default:
            console.log('Error: No Process found');
            return;
    }
    let msg = {
        "tid": [[targetString,0]],
        "msgType": "control",
        "dataType": "string",
        "info": "req",
        "data": "shutdown"
    };
    // console.log(JSON.stringify(msg));
    target.stdin.setEncoding('utf8');
    target.stdin.write(JSON.stringify(msg)+'\n');
    console.log(`shutdown to ${targetString} sent here`);
};

sendCodeChange = function() {
    let msg = {
        "tid": [["gui.message",102],["code.document",0]],
        "msgType": "code_doc_change",
        "dataType": "gui_doc_change",
        "info": "",
        "data": [{"charIdxEnd":-1,"charIdxStart":0,"text":"t","type":0}]
    };
    // console.log(JSON.stringify(msg));
    elwsCode.stdin.setEncoding('utf8');
    elwsCode.stdin.write(JSON.stringify(msg)+'\n');
    console.log('code change sent here -----------------------------------------------------------------------------------------------------------------------------');
};

// for testing purposes
// sends the complete Code to the Code-Module (message is from the button counter example)
sendCode = function(code) {
    let msg = {
        "tid": [["gui.message",101],["save.file",0],["code.document",0]],
        "msgType": "file_load_content",
        "dataType": "code_document_save_data",
        "info": "req",
        "data": {"andOperator":"&","commentOperator":"//","notOperator":"!","orOperator":"+","text":code}
    };
    // console.log(JSON.stringify(msg));
    elwsCode.stdin.setEncoding('utf8');
    elwsCode.stdin.write(JSON.stringify(msg)+'\n');
    console.log('code sent here -----------------------------------------------------------------------------------------------------------------------------------');
};

// for testing purposes
sendExportsimQueryAutomataList = function() {
    let msg = {
        "tid":[["exportsim.export",0],["table.table",0]],
        "msgType":"exportsim_query_automata_list",
        "dataType":"none",
        "info":"req",
        "data":{}
    };
    elwsTable.stdin.write(JSON.stringify(msg)+'\n');
    console.log('Automata List request sent here -------------------------------------------------------------------------------------------------------------------');
};

sendStartExport = function() {
    let msg = {
        "tid":[["gui.message",876],["exportsim.export",0]],
        "msgType":"exportsim_start_export",
        "dataType":"exportsim_dev_proj_con_desc",
        "info":"E:/SWP-WIDE/Src/ELWS/__workspace/ausgabe,button_press_counter_min.elws",
        "data": pinMapping
            // {"debouncedPorts":[],
            // "devicePinsToInput":[[13,[0]],[15,[1]],[17,[2]],[19,[3]]],
            // "dividedInputClkSignals":[],
            // "outputToDevicePins":[[[29],1],[[30],2],[[31],3],[[32],4],[[33],5],[[34],6],[[73],0]],
            // "resetActivationLevels":[[2,true]]}
    };
    console.log(JSON.stringify(msg));
    elwsExport.stdin.write(JSON.stringify((msg))+'\n');
    console.log('Start export sent here ----------------------------------------------------------------------------------------------------------------------------');
};

sendSaveExportNoMapping = function() {
    let msg = {
        "tid":[["exportsim.export",0],["save.file",0],["exportsim.export",0]],
        "msgType":"save_export_no_mapping",
        "dataType":"none",
        "info":"res",
        "data":null
    };
    elwsExport.stdin.write(JSON.stringify(msg)+'\n');
    console.log('no mapping sent here ----------------------------------------------------------------------------------------------------------------------------');
};

sendExportSimChooseChip = function() {
    let msg = {
        "tid":[["gui.message",109],["exportsim.export",0]],
        "msgType":"exportsim_choose_chip",
        "dataType":"string",
        "info":"",
        "data":"E:/SWP-WIDE/Src/ELWS/__workspace/example/v1_00 - Kopie.chd"
    };
    elwsExport.stdin.write(JSON.stringify(msg)+'\n');
    console.log('send export sim choose chip sent here ----------------------------------------------------------------------------------------------------------------------------');
};

// generated from the .chd file referenced from the frontend, can be reused for the actual mapping later
let pinNames = [];
/**
 * reads the pin names directly from the .chd file
 * No longer needed, because we get the PinNames directly from the .chd now
 */
let getPinNames = function() {
    let chdPath = "E:/SWP-WIDE/Src/ELWS/__workspace/example/v1_00 - Kopie.chd";
    let pinNames = [];
    let rawdata = fs.readFileSync(chdPath);
    console.log(rawdata);
};
// is the source code we receive from the frontend
let code = "input BUTTON1_var;\n\na = BUTTON1_var;\n\n\nz0 := !z3&!z2&a + !z4&a;\nz1 := !z3&!z2&!z1&z0&!a + !z4&!z1&z0&!a + !z3&!z2&z1&!z0 + !z3&!z2&z1&a + !z4&z1&!z0 + !z4&z1&a;\nz2 := !z4&!z2&z1&z0&!a + !z4&z2&!z1 + !z4&z2&!z0 + !z4&z2&a;\nz3 := !z4&!z3&z2&z1&z0&!a + !z4&z3&!z2 + !z4&z3&!z1 + !z4&z3&!z0 + !z4&z3&a;\nz4 := !z4&z3&z2&z1&z0&!a + z4&!z3&!z2&!z1 + z4&!z3&!z2&!z0 + z4&!z3&!z2&a;\n \ndigit_0 = !z3&!z2&!z1&z0 + !z3&!z2&z1&!z0 + !z4&!z1&z0 + !z4&z1&!z0;                                                                                                               \ndigit_1 = !z4&!z2&z1&z0 + !z4&z2&!z1 + !z4&z2&!z0;                                                                                               \ndigit_2 = !z4&!z3&z2&z1&z0 + !z4&z3&!z2 + !z4&z3&!z1 + !z4&z3&!z0;                                                                      \ndigit_3 = !z4&z3&z2&z1&z0 + z4&!z3&!z2&!z1 + z4&!z3&!z2&!z0;\n\n// BCD-Decoder\n// 7-Segment Display\n//    0\n//   ---\n// 5| 6 | 1\n//   ---\n// 4| 3 | 2\n//   ---\n \noutput IO10_var;\noutput IO9_var;\noutput segment_output_2;\noutput segment_output_3;\noutput segment_output_4;\noutput segment_output_5;\noutput segment_output_6;\n\n\n\nx0 = digit_0;\nx1 = digit_1;\nx2 = digit_2;\nx3 = digit_3;\n\n\nsegment_0 = x3&!x2&!x1 + !x3&!x2&!x0 + !x3&x2&x0 + !x3&x1 + x3&!x2&!x1 + !x3&x2&x0 + !x2&!x1&!x0 + !x3&x1;\n //Segmente sind low-aktiv\nIO10_var = !segment_0; \n\nsegment_1 = !x3&!x1&!x0 + !x3&x1&x0 + !x3&!x2 + !x2&!x1;                                                                  \nIO9_var = !segment_1;\n\nsegment_2 = !x3&x2 + !x3&x0 + !x2&!x1;                                                                                                                                                                                                                         \nsegment_output_2 = !segment_2;\n\nsegment_3 = !x3&x2&!x1&x0 + !x3&!x2&x1 + x3&!x2&!x1 + !x3&!x2&!x0 + !x3&x1&!x0 + !x3&x2&!x1&x0 + !x3&!x2&x1 + x3&!x2&!x1 + !x3&x1&!x0 + !x2&!x1&!x0;\nsegment_output_3 = !segment_3;\n\nsegment_4 = !x3&x1&!x0 + !x2&!x1&!x0;                           \nsegment_output_4 = !segment_4;\n\nsegment_5 = !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x3&!x1&!x0 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x2&!x1&!x0;\nsegment_output_5 = !segment_5;\n\nsegment_6 = !x3&!x2&x1 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x3&!x2&x1 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x1&!x0;\nsegment_output_6 = !segment_6;\n";


/**
 * checks if the given message is a "exportsim_do_device_pin_map" and if it is maps the inputs and output and returns
 * a JSON-String how it is required for the "data"-field in the "exportsim_start_export" message
 * @param message a JSON-Message
 * @returns {string} JSON-String for the exportsim_start_export message "data" object
 */
// TODO map "clk_automaton_0","reset_automaton_0", ("debounce_clk" doesnt have to be mapped)
let doPinMapping = function(message) {
    //checks if the message is of the correct messagetype, if not, does nothing
    if (message.msgType === "exportsim_do_device_pin_map") {
        //need 2 mappers because the arrays are built differently for input and output vars
        let inMapper = function(value, index) {
            value = value.substr(0, value.length-4); //removing the _var that was added earlier for this comparison
            //check if pinNames contains the variable, if not, return error and stop compilation (only vars are allowed that are supported from the chip)
            if (pinNames.includes(value)){
                let pinIndex = pinNames.indexOf(value);
                console.log(`found a match: ${value} @ ${index} matching to pinIndex: ${pinIndex}`);
                let helpArr = [pinIndex, [index]];
                devicePinsToInput.push(helpArr);
            } else {
                // TODO throw error and abort cuz not all vars can be mapped
                // console.log('no match for: ' + value);
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
        let inputVars = message.data.inputVariables;  //names of all input vars used in the code
        let outputVars = message.data.outputVariables;  //names of all output vars used in the code
        inputVars.forEach(inMapper);
        outputVars.forEach(outMapper);
        // console.log(devicePinsToInput);
        // console.log(outputToDevicePins);
        let msg = {
            "debouncedPorts": debouncedPorts,
            "devicePinsToInput": devicePinsToInput,
            "dividedInputClkSignals": dividedInputClkSignals,
            "outputToDevicePins": outputToDevicePins,
            "resetActivationLevels": resetActivationLevels
        };
        console.log(JSON.stringify(msg));
        pinMapping = msg;
    }
};
//for testing of variable renaming: doesnt work for now
let renameVarMessage = function() {
    let msg = {
        "tid": [["code.document",0]],
        "msgType": "table_var_renamed",
        "dataType": "var_rename_desc",
        "info": "req",
        "data": {"oldName":"BUTTON1","newName":"BUTTON1_var"}
    };
    // let msg2 = {
    //     "tid": [["table",0]],
    //     "msgType": "table_var_renamed",
    //     "dataType": "var_rename_desc",
    //     "info": "req",
    //     "data": {"oldName":"BUTTON1","newName":"BUTTON1_var"}
    // };
    console.log('var rename message sent here');
    console.log(JSON.stringify(msg));
    // console.log(JSON.stringify(msg2));
    elwsCode.stdin.write(JSON.stringify(msg)+'\n');
    // elwsTable.stdin.write(JSON.stringify(msg2)+'\n');
};

// finds the module the message is supposed to go to
// if you need to add another module, add it here too
// returns null if module is not implemented or if the message is a broadcast
// returns the module the message is supposed to go to as object
getMessageTarget = function(message) {
    if (message.tid.length <= 1){return null;} //if tid consists only of 1 element its a broadcast to the core, we dont need that

    let targetString = message.tid[message.tid.length-1][0];
    let target = null; // set target to null so it can easily be handled if we can't find a target
    if (targetString.includes('table')) {target = elwsTable}
    if (targetString.includes('code')) {target = elwsCode}
    if (targetString.includes('export')) {target = elwsExport}
    return target;
};


// splits data object into multiple JSON-Objects
// Gets target of the JSON-Message and sends the Message to the targeted module
// if the message ends before the JSON-Object ends, puts the message into a buffer
// if the buffer isn't empty, message gets appended to the buffer until there's a valid JSON-Object that can be mapped
let unfinishedMessageString = ""; //is needed if the JSON-Message gets split for whatever reason
routeMessages = function(data) {
    let stringBuffer = data.toString();
    if (unfinishedMessageString === "") {
        try {
            // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
            const JSONobjectStrings = stringBuffer.split("\r\n").filter(s => s !== "");
            // Übersetzena aller Zeilen in Objekte
            var JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));
        } catch (e) {
            //if the Message is not complete, set the part to unfinishedMessageString and wait for next stdout event and hope message ends there
            console.log('String angehangen');
            unfinishedMessageString = stringBuffer;
            return;
        }
    } else {
        unfinishedMessageString = unfinishedMessageString + stringBuffer;
        try {
            // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
            const JSONobjectStrings = unfinishedMessageString.split("\r\n").filter(s => s !== "");
            // Übersetzena aller Zeilen in Objekte
            JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));
        } catch (e) {
            console.log('going for another round');
            return;
        }
    }
    // Ausgabe der einzelnen Objekte
    for (let i = 0; i < JSONObjects.length; i++) {
        let message = JSONObjects[i];
        doPinMapping(message);
        let target = getMessageTarget(message);
        if (target != null) {
            console.log(JSON.stringify((JSONObjects[i])));
            target.stdin.write(JSON.stringify(JSONObjects[i]) + '\n');
        }
    }
    unfinishedMessageString = "";
};

// check if any child process sends any data, handling the data
elwsCode.stdout.on('data', function (data) {
    // console.log('code stdout: ' + data.toString());
    routeMessages(data);
});
elwsExport.stdout.on('data', function (data) {
    console.log('export stdout: ' + data.toString());
    routeMessages(data);
});
elwsTable.stdout.on('data', function (data) {
    // console.log('table stdout: ' + data.toString());
    routeMessages(data);
});

// TEST AREA
// timeout to give process time to start / make the console more readable

let oldCode = "input BUTTON1;\n\na = BUTTON1;\n\n\nz0 := !z3&!z2&a + !z4&a;\nz1 := !z3&!z2&!z1&z0&!a + !z4&!z1&z0&!a + " +
    "!z3&!z2&z1&!z0 + !z3&!z2&z1&a + !z4&z1&!z0 + !z4&z1&a;\nz2 := !z4&!z2&z1&z0&!a + !z4&z2&!z1 + !z4&z2&!z0 + !z4&z2&a;" +
    "\nz3 := !z4&!z3&z2&z1&z0&!a + !z4&z3&!z2 + !z4&z3&!z1 + !z4&z3&!z0 + !z4&z3&a;\nz4 := !z4&z3&z2&z1&z0&!a + z4&!z3&" +
    "!z2&!z1 + z4&!z3&!z2&!z0 + z4&!z3&!z2&a;\n \ndigit_0 = !z3&!z2&!z1&z0 + !z3&!z2&z1&!z0 + !z4&!z1&z0 + !z4&z1&!z0;   " +
    "                                                                                                            \ndi" +
    "git_1 = !z4&!z2&z1&z0 + !z4&z2&!z1 + !z4&z2&!z0;                                                                      " +
    "                         \ndigit_2 = !z4&!z3&z2&z1&z0 + !z4&z3&!z2 + !z4&z3&!z1 + !z4&z3&!z0;                         " +
    "                                             \ndigit_3 = !z4&z3&z2&z1&z0 + z4&!z3&!z2&!z1 + z4&!z3&!z2&!z0;\n\n// BC" +
    "D-Decoder\n// 7-Segment Display\n//    0\n//   ---\n// 5| 6 | 1\n//   ---\n// 4| 3 | 2\n//   ---\n \noutput IO10;\n" +
    "output IO9;\noutput segment_output_2;\noutput segment_output_3;\noutput segment_output_4;\noutput segment_output_5;" +
    "\noutput segment_output_6;\n\n\n\nx0 = digit_0;\nx1 = digit_1;\nx2 = digit_2;\nx3 = digit_3;\n\n\nsegment_0 = x3&!x" +
    "2&!x1 + !x3&!x2&!x0 + !x3&x2&x0 + !x3&x1 + x3&!x2&!x1 + !x3&x2&x0 + !x2&!x1&!x0 + !x3&x1;\n //Segmente sind low-akt" +
    "iv\nIO10 = !segment_0; \n\nsegment_1 = !x3&!x1&!x0 + !x3&x1&x0 + !x3&!x2 + !x2&!x1;                                " +
    "                                  \nIO9 = !segment_1;\n\nsegment_2 = !x3&x2 + !x3&x0 + !x2&!x1;                    " +
    "                                                                                                                   " +
    "                                                                                  \nsegment_output_2 = !segment_2;\n" +
    "\nsegment_3 = !x3&x2&!x1&x0 + !x3&!x2&x1 + x3&!x2&!x1 + !x3&!x2&!x0 + !x3&x1&!x0 + !x3&x2&!x1&x0 + !x3&!x2&x1 + x3&" +
    "!x2&!x1 + !x3&x1&!x0 + !x2&!x1&!x0;\nsegment_output_3 = !segment_3;\n\nsegment_4 = !x3&x1&!x0 + !x2&!x1&!x0;       " +
    "                    \nsegment_output_4 = !segment_4;\n\nsegment_5 = !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x3&!x1&" +
    "!x0 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x2&!x1&!x0;\nsegment_output_5 = !segment_5;\n\nsegment_6 = !x3&!x2&x1" +
    " + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x3&!x2&x1 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x1&!x0;\nsegment_output_6 = !segment_6;\n";
let chdPath = "E:/SWP-WIDE/Src/ELWS/__workspace/example/v1_00 - Kopie.chd";

setTimeout(function() {
    // after we receive the code we will rename all variables in it (put '_var' at the end) because the ELWS doenst
    // accept it if the varnames equals the pinnames.
    pinNames = compUtils.getPinNames(chdPath);
    let newCode = compUtils.renameAllVars(oldCode, pinNames);
    sendCode(newCode);
}, 1000);
setTimeout(function() {
    sendExportSimChooseChip();
}, 2000);
setTimeout(function() {
    sendSaveExportNoMapping();
}, 4000);
setTimeout(function() {
    sendStartExport();
}, 6000);
setTimeout(function() {

}, 6500);
