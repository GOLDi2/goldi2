// http://x105.theoinf.tu-ilmenau.de/WIDEDEV/index.php?Function=ServerUploadFile&ExperimentID=69&SessionID=9q7f7o877df1jaqfvkmvetr716

module.exports.uploadToGoldi = function (sessionId, experimentId, filePath){
    if((experimentId != undefined) && (uploadServer != undefined)){
        let formData = {
            UserFile: {
                value:  fs.createReadStream(filePath),
                options: {
                    //'content-type': 'application/octet-stream',
                    filename: 'MicrocontrollerProgrammingFile.hex'
               }
            }
        };
        //TODO in Task o.ä. experimentId implementieren oder wie soll das gelöst werden?
        //TODO GOLDiWebRoot ??? 
        const GOLDiWebRoot = req.headers.referer.replace("WIDE/no-referrer","");
        // console.log(req);
        // console.log("REQUEST-URL:",req.body.uploadServer+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId);
        // console.log("FORM-DATA",formData);
        // Post the file to the upload server
        request.post({url: GOLDiWebRoot+"/index.php?Function=ServerUploadFile&ExperimentID="+req.body.experimentId+"&SessionID="+req.body.sessionId, formData: formData}
            ,function optionalCallback(err, httpResponse, body) {
            if (err) {
                // res.send({success: '', sessionId: req.body.sessionId, output: err});
            }else{
                // gccLogger.info('Upload Response: ', err, httpResponse, body);
                // res.send({success: 'true', sessionId: req.body.sessionId, output: stdout});

                // runningProcesses.removeProcess(req.body.sessionId);
            }
        });
    }
}


// KOPIE AUS SWP WIDE BACKEND
// const GOLDiWebRoot = req.headers.referer.replace("WIDE/no-referrer", "");
// console.log(req);
// console.log("REQUEST-URL:", req.body.uploadServer + "/index.php?Function=ServerUploadFile&ExperimentID=" + req.body.experimentId + "&SessionID=" + req.body.sessionId);
// console.log("FORM-DATA", formData);
// // Post the file to the upload server
// request.post({
//         url: GOLDiWebRoot + "/index.php?Function=ServerUploadFile&ExperimentID=" + req.body.experimentId + "&SessionID=" + req.body.sessionId,
//         formData: formData
//     }
//     , function optionalCallback(err, httpResponse, body) {
//         // if (err) {
//         //     return console.error('upload failed:', err);
//         // }

//         console.log('Upload Response: ', err, httpResponse, body);
//     });