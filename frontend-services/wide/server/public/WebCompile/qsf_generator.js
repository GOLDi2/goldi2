let fs = require('fs');
let path = require('path');
let exec = require('child_process').exec;
let log4js = require('log4js');
let rimraf = require('rimraf');
let async = require('async')

module.exports = {
    generateQSF: function(tmpPath, templateQsfFilePath, chdFilePath) {
        // let tmpName = 'tmp_test';
        // const nsPath = path.resolve(process.cwd());
        tmpPath = path.resolve(tmpPath);
        const vhdPath = path.resolve(tmpPath, "out.vhd");
        const QSFTemplatePath = path.resolve(templateQsfFilePath);
        // const QPFTemplatePath = path.resolve(templateQsfFilePath, "qpftemplate.qpf");

        function createQSFFileString(cb) {
            // TODO compile here
            let QSFFileString = "";
            fs.readFile(QSFTemplatePath, 'utf8', (err, data) => {
                if (err) {
                    return cb(err);
                }
                QSFFileString = data;
                QSFFileString += "\n"; // empty line, so its easier to see in the file what WE added
                QSFFileString += "set_global_assignment -name VHDL_FILE out.vhd\r\n";
                QSFFileString += "set_global_assignment -name TOP_LEVEL_ENTITY Output_top_module\r\n";
                return cb(null, QSFFileString);
            });
        }

        function getPinDescriptionsFromChd(cb) {
            fs.readFile(chdFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                return cb(null, JSON.parse(data).pinDescriptions);
            })
        }

        // BEWARE!!!! SPAGHETTI CODE
        // TODO never look at it again unless it fails
        function getVhdUsedPorts(cb) {
            let vhdString = "";
            fs.readFile(vhdPath, 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                vhdString = data;
                vhdString = vhdString.replace(new RegExp("\t", "g"), "");
                let vhdArray = vhdString.split("\n");

                let entityStart = 0;
                let entityEnd = 0;
                vhdArray.forEach(function (value, index) {
                    if (entityStart !== 0 && entityEnd !== 0) {
                        return;
                    }
                    if (value.includes('ENTITY Output_top_module IS')) {
                        entityStart = index;
                    }
                    if (value.includes('END Output_top_module')) {
                        entityEnd = index;
                    }
                });
                let portStart = 0;
                let startBracket = 0;
                let portNames = [];
                for (let i = entityStart; i < entityEnd; i++) {
                    let line = vhdArray[i];
                    // have to find out where the actual mapping starts. You can set the "PORT" and "(" and even the first element in one row,
                    // but they could also be split over 3 lines so i have to check for every case
                    if (line.includes("PORT")) {
                        portStart = i;
                    }
                    if (line.includes("(") && i >= portStart) {
                        startBracket = i;
                    }
                    if (line.includes(":") && i >= startBracket) {
                        portNames.push(line.split(":")[0]);
                    }
                }
                // console.log(portNames);
                return cb(null, portNames);
            });
        }


        // Using series, so i can be sure that every array is completely built when i start working with them
        // if you want to modify this so that you can use different chds this might help you https://stackoverflow.com/a/15988860
        // With this you can still create functions with parameters within the series
        async.series([
            createQSFFileString,
            getPinDescriptionsFromChd,
            getVhdUsedPorts
        ], (err, results) => {
            if (err) {
                console.log("error in the series: " + err);
                return;
            }
            let QSFFileString = results[0];
            let pinDescriptions = results[1];
            let vhdUsedPorts = results[2];
            vhdUsedPorts.forEach((value) => {
                let usedPort = value;
                pinDescriptions.forEach((value) => {
                    let pinDesc = value;
                    if (usedPort.includes(pinDesc.pinName)) {
                        // console.log(`found a match: ${pinDesc.pinName} --- ${usedPort} --- ${pinDesc.ucfPortName}`);
                        QSFFileString += `set_location_assignment ${pinDesc.ucfPortName} -to ${usedPort}\n`;
                        return
                    }
                })
            });
            console.log(QSFFileString);
            fs.writeFile(path.resolve(tmpPath, 'out.qsf'), QSFFileString, (err) => {
                if (err) throw err;
                console.log('All good');
            });
        })
    }
}