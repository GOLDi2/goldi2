var path = require('path');
var spawn = require('child_process').spawn;

//spawns code.exe
var elwsCode = spawn(path.resolve('../ELWS/__workspace/code.exe')); //be aware if you have to change the path: its two underscores in front of workspace, cost me some time to figure that out x)

sendShutdown = function() {
    var msg = {
        "tid": [["core.exportsim_master",2],["core.shutdown",0],["code",0]],
        "msgType": "control",
        "dataType": "string",
        "info": "req",
        "data": "shutdown"
    };
    // console.log(JSON.stringify(msg));
    elwsCode.stdin.setEncoding('utf8');
    elwsCode.stdin.write(JSON.stringify(msg)+'\n');
    console.log('shutdown sent here ------------------------------------------------------------------------------------------------------------------------------');
};

sendCodeChange = function() {
    var msg = {
        "tid": [["gui.message",102],["code.document",0]],
        "msgType": "code_doc_change",
        "dataType": "gui_doc_change",
        "info": "",
        "data": [{"charIdxEnd":-1,"charIdxStart":0,"text":"t","type":0}]
    };
//    console.log(JSON.stringify(msg));
    elwsCode.stdin.setEncoding('utf8');
    elwsCode.stdin.write(JSON.stringify(msg)+'\n');
    console.log('code change sent here -----------------------------------------------------------------------------------------------------------------------------');
};

// check if process sends any data, not interested in any other events right now
elwsCode.stdout.on('data', function (data) {
    console.log('elws stdout:' + data.toString());
});

// timeout to give process time to start
// just makes the console more readable because otherwise it would send the CodeChange / Shutdown basically before the program even started
setTimeout(function() {
    sendCodeChange();
}, 3000);
setTimeout(function() {
    sendShutdown();
}, 6000);