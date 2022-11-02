var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

module.exports = {
    compileHandler: function (req, res, next) {

        //Confirm makefile type
        if (!req.body.makefile === 'avr-gcc') {
            next()
        } else {
            var wcPath = path.resolve(process.cwd());
            var avrPath = path.resolve(wcPath, 'makefiles/avr-gcc');
            var tmpPath = path.resolve(wcPath, 'tmp/');
            var tmpMkfilePath = path.resolve(wcPath, 'tmp/Makefile');
            var makeExePath = path.resolve(wcPath, 'toolchains/make');
            var toolchainsPath = path.resolve(wcPath, 'toolchains/');

            //copy avr-gcc to tmp
            fs.copyFile(avrPath, tmpMkfilePath, function (err) {
                res.status(500)
                res.send({error: err})
            });

            exec(makeExePath + ' all' ,
                {
                    cwd: tmpPath,
                    env: {
                        "TOOLCHAINS":toolchainsPath
                    }
                },
                function (error, stdout, stderr) {
                    console.log('make.exe error: ' + error);
                    console.log('make.exe stdout: ' + stdout);
                    console.log('make.exe stderr: ' + stderr);
                    if (error) {
                        next(error);
                    }
                });

            next();
        }
    }
};