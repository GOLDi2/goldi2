var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');

// you need the update version of the save module. Just build it yourself with cargo --release from the save module folder

// TODO CLEANUP + COMMENTS

// TODO ELWS crashes if we give it no text at all (happens for example if the line only contains a comment or obivously nothing in the first place)
// TODO Error handling if we get something that is not an equation... maybe check if there is a "=" in the string

// TODO bei syntaxerror abbrechen, da keine gültige gleichung
module.exports = {
    /**
     *
     * @param req
     * @param res
     */
    minimizeEquation: function (req, res) {
        let code = spawn(path.resolve('../ELWS/__workspace/code.exe'));
        let save = spawn(path.resolve('../ELWS/__workspace/save.exe'));
        //gonna use one process per request for now, but should be possible to multiplex that
        //problem: code is gonna get overwritten with every request

        let request = req.body.content;
        let resSent = false;
        let response = "";
        let codeBuffer = {value: ''};
        let saveBuffer = {value: ''};
        let minimizeResponseReceived = false;
        // check if there is a comment at the end of the line and remove it if so
        let equation = "";
        if (request.includes('//')){
            equation = request.split('//')[0];
            console.log('removed comment')
        } else {
            equation = request;
        }

        // check if the string is a equation
        if (!(equation.includes('='))){
            sendErrorResponse('There is no "=" in the equation');
            return;  // TODO  error: no equation
        }

        //check if the equation is finished (with a ";")
        if (!(equation.includes(';'))){
            sendErrorResponse('Could not find a semicolon (";") at the end of the equation');
            return;  // TODO  error: no semicolon
        }

        //get the operation (either ":=" or "=") and save it for later
        let operation = "";
        if (equation.split('=')[0].slice(-1) === ':') {
            operation = ' :=' ;
        } else {
            operation = ' = ';
        }
        console.log(`operation: ${operation}`);

        // get only unique variables from the equation so we can declare them as inputs so the elws doesnt crash later when we send the code because we use variables that are not declared
        let onlyVarString = equation.replace(/[\W_]+/g, " "); // removes everything but variable names... see: https://stackoverflow.com/a/20864946
        let varArray = onlyVarString.split(" ");
        let uniqueVarArray = [...new Set(varArray)];  // removes all duplicates from the var array... see: https://wsvincent.com/javascript-remove-duplicates-array/
        //TODO if theres a ; in the equation we get an extra, empty, string as last object of the uniqueVarArray. Gotta debug that, works for now though
        console.log("unique array length: " + uniqueVarArray.length + " content: ");
        console.log(uniqueVarArray);
        if (uniqueVarArray.length < 3){
            sendErrorResponse('Couldn\'t find enough variables for minimizing');
            return;  // TODO  error: no equation
        }
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

        //TODO check if there is a way to check if a given object is a JSON-object (before trying to map it)
        //TODO at the moment, if we try to handle a unparseable message the buffer will never get cleared again, trust ELWS it only sends valid messages?

        // We need 2 message handlers because the save-module separates Messages differently from the code-module
        function saveMessageHandler(data) {
            saveBuffer.value += data.toString();
            try {
                // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
                const JSONobjectStrings = saveBuffer.value.split("\n").filter(s => s !== "");
                // Übersetzena aller Zeilen in Objekte
                var JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));

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
            try {
                // Aufteilen in Zeilen mit Strings, filtern von Leerzeilen
                const JSONobjectStrings = codeBuffer.value.split("\n").filter(s => s !== "");
                // Übersetzena aller Zeilen in Objekte
                var JSONObjects = JSONobjectStrings.map(o => JSON.parse(o));

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
            // console.log("equation: " + equation);

            return equation;
        }

        function specificMessageHandler(message) {
            if (message.msgType === 'minimized_equation') {
                minimizeResponseReceived = true;
                response = uniqueVarArray[0] + operation + parseMinimizedEquationMessageInfixRep(message) + ";\n";
                if (!resSent) {
                    console.log("The input was: " + request);
                    console.log("Equation for response: " + response);
                    res.send({success: 'true', output: response});
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
                }
            }
            // file_new_ack is the last message code sends after receiving new code (dont know what it does, but it means for us it's done with processing the data)
            // so we can send the minimize request after that
            if (message.msgType === 'file_new_ack') {
                console.log("sending minimize request msg: " + JSON.stringify(minimize_request_msg));
                code.stdin.write(JSON.stringify(minimize_request_msg) + '\n');
                setTimeout(function(){
                    if (!minimizeResponseReceived){
                        sendErrorResponse('Minimize timed out in the ELWS, something is probably wrong with the equation')
                    }
                }, 2000);
            }
        }

        function sendErrorResponse(error) {
            response = error;
            if (!resSent) {
                console.log("The input was: " + request);
                console.log("Equation for response: " + response);
                res.send({success: 'false', output: response});
                resSent = true
            }
            code.kill();
            save.kill();
        }
    }
};
