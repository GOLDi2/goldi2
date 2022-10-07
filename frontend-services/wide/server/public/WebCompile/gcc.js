const path = require('path');
const parentDir = require('path').dirname;
const fs = require('fs');
const fsextra = require('fs-extra');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const execF = require('child_process').execFile;
const rimraf = require('rimraf');
const request = require('request');
const log4js = require('log4js');
const config = require('./config/gcc_config.json');
const runningProcesses = require('./runningProcesses');
//create logger
let gccLogger = log4js.getLogger('gcc');

module.exports = {

    /**
     * Compile C/C++ source codes
     * @param req HTTP request with C/C++ source code files
     * @param res HTTP response
     * @param tmpName Name of the temporary path
     */
  compile : function(req, res, tmpName){

      gccLogger.addContext('sid', req.body.sessionId);

      //resSent flag to prevent repeating sending the message, which will lead to server corruption.
      var resSent = false;

      //important paths
      let nsPath = path.resolve(process.cwd()); //NodeServer Path
      let avrPath = path.resolve(nsPath, 'makefiles/avr-gcc');
      let tmpPath = path.resolve(nsPath, tmpName);
      let makeExePath = path.resolve(nsPath, 'toolchains/make');
      let toolchainsPath = path.resolve(nsPath, 'toolchains/');

      let fqbn = "";
      let arduinocliPath = path.resolve(nsPath, 'makefiles/arduino-cli');
      let sketchPath;
      let mainSketch;
      if (req.body.files.length > 0) {
          mainSketch = req.body.files[0].name.slice(0, req.body.files[0].name.indexOf("/"));
          sketchPath = path.resolve(tmpPath, mainSketch);
      }
      let tmpMkfilePath = path.resolve(sketchPath??tmpPath, 'Makefile');

      if (req.body.makefile === "arduino") {
          let board = req.body.board;
          fqbn = board.fqbn;
          if (board.options !== undefined && board.options.length > 0) {
              fqbn = fqbn.concat(':');
              board.options.forEach((option) => {
                  fqbn = fqbn.concat(option.option + '=' + option.value + ",");
              });
              fqbn = fqbn.slice(0, fqbn.length-1);
          }
      }

      //copy avr-gcc to tmp
        if (req.body.makefile !== "arduino") {
            try {
                fs.copyFileSync(avrPath, tmpMkfilePath);
            } catch (e) {
                if (e instanceof Error) {
                    if (!resSent) {
                        gccLogger.error('copy avr-gcc to tmp error: ' + e);
                        res.status(500);
                        res.send({error: e});
                        resSent = true;
                    }
                }
            }
      exec(makeExePath + ' all',
          {
              cwd: sketchPath??tmpPath+'/',
          },
          function (error, stdout, stderr) { // wichtig, an dateien immer .c anhängen, weil sonst nivht funktioniert
              gccLogger.info('make.exe stdout: ' + stdout);
              runningProcesses.addProcess(req.body.sessionId);
              if (error) {
                  if (!resSent) {
                      gccLogger.error('make.exe error: ' + error);
                      gccLogger.error('make.exe stderr: ' + stderr);
                      res.status(500);
                      res.send({success: '', sessionId: req.body.sessionId, output: stderr});//res.send({error: error})
                      resSent = true;
                      runningProcesses.removeProcess(req.body.sessionId);
                  }
              } else {

                  if (!resSent) {
                      if ((req.body.experimentId != undefined) &&(req.body.uploadServer != undefined)){
                          resSent = true;
                         /* request({
                                  method: 'POST',
                                 // preambleCRLF: true,
                                  //postambleCRLF: true,
                                  uri: req.body.uploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId,
                                  multipart: [
                                      {   'content-type': 'application/octet-stream',
                                          body: fs.createReadStream(tmpPath+'/main.hex') }
                                  ],
                              },
                              function (error, response, body) {
                                  if (error) {
                                      return console.error('upload failed:', error);
                                  }
                                  console.log('Upload successful!  Server responded with:', body);
                              })*/

                          //upload main.hex:
                          // passe datei zum senden an
                          /*console.log(req.body.uploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId);
                          var options = {
                              url:  req.body.uploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId,
                              headers: {
                                  'content-type': 'application/octet-stream'
                              }
                          };*/
                          var formData = {
                              UserFile: {
                                  value:  fs.createReadStream(tmpPath+'/main.hex'),
                                  options: {
                                      //'content-type': 'application/octet-stream',
                                      filename: 'MicrocontrollerProgrammingFile.hex'
                                 }
                              }
                          };


                          const GOLDiWebRoot = req.headers.referer.replace("WIDE/no-referrer","");
                          console.log(req);
                          console.log("REQUEST-URL:",req.body.uploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId);
                          console.log("FORM-DATA",formData);
                          // Post the file to the upload server
                           request.post({url: GOLDiWebRoot+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId, formData: formData}
                               ,function optionalCallback(err, httpResponse, body) {
                               if (err) {
                                   res.send({success: '', sessionId: req.body.sessionId, output: err});
                                }else{
                                   gccLogger.info('Upload Response: ', err, httpResponse, body);
                                   res.send({success: 'true', sessionId: req.body.sessionId, output: stdout});

                                   runningProcesses.removeProcess(req.body.sessionId);
                               }
                          });
                      }
                      if (!resSent) {
                          res.send({success: 'true', sessionId: req.body.sessionId, output: stdout});
                          resSent = true;
                          runningProcesses.removeProcess(req.body.sessionId);
                      }
                  }
              }

              //delete tmp dir after using
              var nsPath = path.resolve(process.cwd());
              var delPath = path.resolve(nsPath, tmpName);
              gccLogger.info('DELETING: ' + delPath);
              if (delPath.includes(tmpName)) {                            //TODO original: if(delPath.includes(tmpName)){
                  rimraf(delPath, function (err) {
                      if (err) {
                          gccLogger.info('Deleting tmp files error: ' + err + ' | tmp file dir: ' + tmpName);
                      }
                  });
              }
          });
        } else {
            let bonus_flags = "";
            if (fqbn.includes("goldi:avr:experiment")) {
                bonus_flags = bonus_flags.concat('--build-property runtime.tools.avr-gcc.path="/usr/"');
            }
            exec('./arduino-cli compile -v -b ' + fqbn + ' ' + sketchPath  + ' --build-path "' + path.join(tmpPath, "ArduinoCLIBuild") + '" ' + bonus_flags, {cwd: arduinocliPath},
                function (error, stdout, stderr) { // wichtig, an dateien immer .ino anhängen, weil sonst nicht funktioniert
                    gccLogger.info('make.exe stdout: ' + stdout);
                    runningProcesses.addProcess(req.body.sessionId);
                    if (error) {
                        if (!resSent) {
                            gccLogger.error('make.exe error: ' + error);
                            gccLogger.error('make.exe stderr: ' + stderr);
                            res.status(500);
                            res.send({success: '', sessionId: req.body.sessionId, output: stderr});//res.send({error: error})
                            resSent = true;
                            runningProcesses.removeProcess(req.body.sessionId);
                        }
                    } else {

                        if (!resSent) {
                            if ((req.body.experimentId != undefined) &&(req.body.uploadServer != undefined)){
                                resSent = true;

                                fs.renameSync(path.join(sketchPath, mainSketch + ".goldi.avr.experiment.hex"), path.join(tmpPath, "main.hex"));

                                var formData = {
                                    UserFile: {
                                        value:  fs.createReadStream(tmpPath+'/main.hex'),
                                        options: {
                                            //'content-type': 'application/octet-stream',
                                            filename: 'MicrocontrollerProgrammingFile.hex'
                                        }
                                    }
                                };


                                const GOLDiWebRoot = req.headers.referer.replace("WIDE/no-referrer","");
                                console.log(req);
                                console.log("REQUEST-URL:",req.body.uploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId);
                                console.log("FORM-DATA",formData);
                                // Post the file to the upload server
                                request.post({url: GOLDiWebRoot+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId, formData: formData}
                                    ,function optionalCallback(err, httpResponse, body) {
                                        if (err) {
                                            res.send({success: '', sessionId: req.body.sessionId, output: err});
                                        }else{
                                            gccLogger.info('Upload Response: ', err, httpResponse, body);
                                            res.send({success: 'true', sessionId: req.body.sessionId, output: stdout});

                                            runningProcesses.removeProcess(req.body.sessionId);
                                        }
                                    });
                            }
                            if (!resSent) {
                                res.send({success: 'true', sessionId: req.body.sessionId, output: stdout});
                                resSent = true;
                                runningProcesses.removeProcess(req.body.sessionId);
                            }
                        }
                    }

                    //delete tmp dir after using
                    var nsPath = path.resolve(process.cwd());
                    var delPath = path.resolve(nsPath, tmpName);
                    gccLogger.info('DELETING: ' + delPath);
                    if (delPath.includes(tmpName)) {                            //TODO original: if(delPath.includes(tmpName)){
                        rimraf(delPath, function (err) {
                            if (err) {
                                gccLogger.info('Deleting tmp files error: ' + err + ' | tmp file dir: ' + tmpName);
                            }
                        });
                    }
                });
        }
  }
};