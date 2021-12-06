const path = require('path');
const parentDir = require('path').dirname;
const fs = require('fs');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const execF = require('child_process').execFile;
const rimraf = require('rimraf');
const log4js = require('log4js');
const qsf = require('./qsf_generator');
const config = require('./config/vhdl_config.json');
const request = require('request');
const runningProcesses = require('./runningProcesses');

module.exports = {
    compile : function(req, res, tmpName){

        //TODO USE SPECIALIZED TEMP DIRECTORY TO TEST
        //tmpName = 'tmp_testvhdl';
        //important paths
        let nsPath = path.resolve(process.cwd()); //NodeServer Path
        let quartusPath = path.resolve(config.development.quartus_sh_path);
        let tmpPath = path.resolve(nsPath, tmpName);
        let chdDirPath = path.resolve('../Nodeserver/public/WebCompile/chd');
        let chdPath = path.resolve(chdDirPath, 'v1_21.chd'); //TODO default chd file
        let qsfDirPath = path.resolve('../Nodeserver/public/WebCompile/qsf');
        let qsfPath = path.resolve(qsfDirPath, 'qsftemplate.qsf');
        runningProcesses.addProcess(req.body.sessionId);

        //resSent flag to prevent repeating sending the message, which will lead to server corruption.
        var resSent = false;

        //find out the path of vhd file
        let vhdPath = '';
        let vhdBasename = '';
        for(let i = 0; i < req.body.files.length; i++) {
            if(req.body.files[i].name.slice(-4) === '.vhd'){
                vhdPath = path.resolve(tmpPath, req.body.files[i].name);
                vhdBasename = path.basename(vhdPath,'.vhd');
                break;
            }
        }
        let vhdParentPath = path.resolve(parentDir(vhdPath));

        //generate qsf file
        qsf.generateQSF(vhdParentPath, qsfPath ,chdPath);

        //spawn quartus as child process
        let cmd = spawn('cmd');


        //Use quartus to compile
        cmd.stdin.write(quartusPath + ' --flow compile '+
            '\"'+ vhdPath.replace(/\\/g, '//') + '\" ' +
             '\r\n');


        cmd.stdout.on('data', function (data) {
            let str = data.toString();
            console.log('cmd stdout:\n' + str);
            if(str.includes('Processing ended')){
                cmd.stdin.end();
                if(str.includes('0 errors')){
                    if(!resSent){
                        //upload

                        if ((req.body.experimentId != undefined) &&(req.body.uploadServer != undefined)) {
                            let timeoutHandle = setTimeout(() => {
                                var formData = {
                                    UserFile: {
                                        value: fs.createReadStream(vhdParentPath+ '/output_files/out.pof'),
                                        options: {
                                            //'content-type': 'application/octet-stream',
                                            filename: 'VHDLProgrammingFile.pof'
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

                                        console.log('Upload Response: '+ err + httpResponse + body);
                                    });
                            }, 10000);

                        }
                            //send response
                        res.send({success: 'true', sessionId: req.body.sessionId, output: str});
                        resSent = true;
                        runningProcesses.removeProcess(req.body.sessionId);
                    }
                } else {
                    if(!resSent){
                        res.status(500);
                        res.send({success: '', sessionId: req.body.sessionId, output: str});
                        resSent = true;
                        runningProcesses.removeProcess(req.body.sessionId);
                    }
                }
            }
        }).on('close', function () {
             if (tmpPath.includes(tmpName)) {                            //TODO original: if(delPath.includes(tmpName)){
                 rimraf(tmpPath, function (err) {
                     if (err) {
                         console.log('Deleting tmp files error: ' + err + ' | tmp file dir: ' + tmpName);
                     }
                 });
             }
            console.log('cmd stdout:closed\n');
        }).on('end', function () {
            console.log('cmd  stdout:end\n');
        }).on('error', function (error) {
            console.log('cmd  stdout error :\n' + error);
        }).on('pause', function () {
            console.log('cmd  stdout:paused\n');
        }).on('resume', function () {
            console.log('cmd  stdout:resumed\n');
        });

        cmd.stderr.on('data', function (data) {
            console.log('cmd  stderr:\n' + data.toString());
        }).on('end', function () {
            console.log('cmd  stdout:closed\n');
        });

        cmd.stdin.on('drain', function () {
            console.log('cmd  stdin:drain\n');
        }).on('error', function (error) {
            console.log('cmd  stdin error:\n' + error);
        }).on('finish', function () {
            console.log('cmd  stdin:finished\n');
        }).on('pipe', function () {
            console.log('cmd  stdin:pipe\n');
        }).on('unpipe', function () {
            console.log('cmd stdin:unpipe\n');
        });
    }
};