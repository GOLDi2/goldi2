var exec = require('child_process').execFile;
var path = require('path');
var exePath = path.resolve(__dirname, '../ELWS/ELWS_Workspace/code.exe');
var guiPath = path.resolve(__dirname, '../ELWS/ELWS_Workspace/gui.exe');


/**
 * Create an ELWS child process.
 * @returns {Reference of the ELWS child process}
 */
createElws = function () {

    var elws = exec(exePath, [], {stdio: ['pipe', process.stdout, process.stderr]});

    /*
     * Event listeners on stdout for elws
     */
    elws.stdout.on('data', function (data) {
        console.log('elws stdout:\n' + data.toString());
    }).on('close', function () {
        console.log('elws stdout:closed\n');
    }).on('end', function () {
        console.log('elws stdout:end\n');
    }).on('error', function (error) {
        console.log('elws stdout error :\n' + error);
    }).on('pause', function () {
        console.log('elws stdout:paused\n');
    }).on('resume', function () {
        console.log('elws stdout:resumed\n');
    })

    /*
     * Event listener on stderr for elws
     */
    elws.stderr.on('data', function (data) {
        console.log('elws stderr:\n' + data.toString());
    }).on('end', function () {
        console.log('elws stdout:closed\n');
    })

    /*
     * Event listener on stdin for elws
     */
    elws.stdin.on('drain', function () {
        console.log('elws stdin:drain\n');
    }).on('error', function (error) {
        console.log('elws stdin error:\n' + error);
    }).on('finish', function () {
        console.log('elws stdin:finished\n');
    }).on('pipe', function () {
        console.log('elws stdin:pipe\n');
    }).on('unpipe', function () {
        console.log('elws stdin:unpipe\n');
    })
    return elws;
}

//only for test
module.exports.shutdown = function (msgObj){
    var elws = createElws();
    var msg = {
        "tid": [["code", 0]],
        "msgType": "control",
        "dataType": "string",
        "info": "req",
        "data": msgObj.nodeData
    }
    elws.stdin.setDefaultEncoding('utf8');
    elws.stdin.write(JSON.stringify(msg));
    elws.stdin.end();
}

module.exports.code_doc_change = function(msgObj){
    var elws = createElws();
    var msg = {
        "tid": [["code.document", 0]],
        "msgType": "code_doc_change",
        "dataType": "gui_doc_change",
        "info": "",
        "data": msgObj.nodeData
    }
    elws.stdin.setDefaultEncoding('utf8');
    elws.stdin.write(JSON.stringify(msg));
    elws.stdin.end();
}

