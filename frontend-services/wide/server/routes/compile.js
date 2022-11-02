const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const mkdirp = require('mkdirp');
const parentDir = require('path').dirname;
const requestHandler = require('../public/WebCompile/requestHandler');
const md5 = require('md5');
const async = require('async');
const uuidv4 = require('uuid/v4');
const gcc = require('../public/WebCompile/gcc');
const elws = require('../public/WebCompile/elws');
const vhdl = require('../public/WebCompile/vhdl');
const runningProcesses = require('../public/WebCompile/runningProcesses');
const log4js = require('log4js');
//var uniqid = require('uniqid'); (alternative zu uuid/4)

//create loggers
const compileLogger = log4js.getLogger('compile');

// parse application/json
router.use(express.json({limit: '100mb'})); //TODO Confirm usage of middleware

// parse application/x-www-form-urlencoded
router.use(express.urlencoded({limit: '100mb', extended: true}));  //TODO Confirm usage of middleware


/* GET home page. */
router.get('/', function (req, res) {
    res.end();
});

//router.use(requestHandler.elwsReqParser);
//router.use(requestHandler.elwsFileParser);
router.use(requestHandler.print);
//router.use(saveTemp.saveTemp);//TODO DEPRECATED
//router.use(gccHandler.compileHandler);//TODO DEPRECATED
//router.use(generalErrorHandler.errorHandler);//TODO DEPRECATED


router.post('/', function (req, res) {

        //resSent flag to prevent repeating sending the message, which will lead to server corruption.
        console.log(req.body);
        var resSent = false;
        var makefile = req.body.makefile;
        var makefileChecked = false;
        var firstFileIndex = 0;
        if (req.body.sessionId === "") {
            req.body.sessionId = uuidv4();
        }
        compileLogger.info(uuidv4());

        var tmpName = 'tmp_' + req.body.sessionId;

        //create tmp Dir.
        if(req.body.makefile!="TestProcessRunning"){
            fs.mkdir(tmpName, function (err) {
                if (err) {
                    if (err.code === 'EEXIST') {
                        console.log(tmpName + ' Dir already exists');
                        compileLogger.warn(tmpName + ' Dir already exists');
                    } else {
                        if (!resSent) {
                            console.log('create tmp dir error: ' + err);
                            compileLogger.error('create tmp dir error: ' + err);
                            res.status(500);
                            res.send({error: err});
                            resSent = true;
                        }
                    }
                }
            });
        }



        //copy wide-project from frontend to nodeserver
    if(req.body.makefile!="TestProcessRunning") {
        for (let i = 0; i < req.body.files.length; i++) {

            //var filename = tmpName + req.body.files[i].name.slice(12);
            let filename = tmpName + '/' + req.body.files[i].name;

            //make dir structure
            mkdirp.sync(parentDir(filename));

            //write all files into the corresponding dir
            if (req.body.files[i].name.slice(-2) != '/.') {
                if (!makefileChecked) {
                    firstFileIndex = i;
                    if (req.body.files[i].name.slice(-2) === '.c' || req.body.files[i].name.slice(-2) === '.h') {
                        makefile = 'avr-gcc';
                        makefileChecked = true;
                    } else if (req.body.files[i].name.slice(-5) === '.logic') {
                        makefile = 'elws';
                        makefileChecked = true;
                    } else if (req.body.files[i].name.slice(-4) === '.vhd') {
                        makefile = 'vhdl';
                        makefileChecked = true;
                    } else if (req.body.files[i].name.slice(-4) === '.cpp') {
                        makefile = 'arduino';
                        makefileChecked = true;
                    }
                }
                try {
                    fs.writeFileSync(path.resolve(filename), req.body.files[i].content);
                } catch (e) {
                    if (e instanceof Error) {
                        if (!resSent) {
                            console.log('copy wide-project to tmp dir error: ' + e);
                            compileLogger.error('copy wide-project to tmp dir error: ' + e);
                            res.status(500);
                            res.send({error: e});
                            resSent = true
                        }
                    }
                }
            }
        }
    }

        req.body.makefile = makefile;

        if (req.body.makefile === 'avr-gcc') {
            gcc.compile(req, res, tmpName);
        } else if (req.body.makefile === 'arduino') {
            gcc.compile(req, res, tmpName);
        } else if (req.body.makefile === 'elws') {
            elws.compile(req, res, tmpName);
        } else if (req.body.makefile === 'vhdl'){
            vhdl.compile(req, res, tmpName);
        }
        else if (req.body.makefile ==="TestProcessRunning"){
            if(runningProcesses.checkIfProcessIsIn(req.body.sessionId)){
                res.send({answer:"yes"})
            }else{
                res.send({answer:"no"})
            }

        }
    }
);

module.exports = router;