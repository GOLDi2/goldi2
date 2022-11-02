/**
 * Created by Simon Lanfermann on 23.06.2015.
 */

var UserDefinedInputVariables = (function () {

    /**
     * Generates a table to change input variables
     *
     * @method generateTable
     * @public
     * @param {TTable} machine
     * @param {String} ID id of HTML Element the table shall appear under
     * @param {String} tableName name of table, is part of the HTML id
     * @param {Boolean} dynamic true when table shall show only number of input variables, false shows all possible variables
     * @param {String} ButtonParentElementID id of element the button has to be in
     * @return {HTMLElement} Returns HTMLElement div
     */
    var generateTable = function (machine, ID, tableName, dynamic, ButtonParentElementID, ButtonID) {

        var numberVariables = machine.MaxInputNumber;
        if (dynamic){
            numberVariables = machine.InputNumber;
        }

        var clearButton = document.createElement('button');
        clearButton.className = "btn btn-default pull-right";
        clearButton.id = ButtonID;
        clearButton.style.display = "none";
        clearButton.onclick = function(){
            for (var k=0; k < numberVariables; k++){ // statt machine.InputNumber
                document.getElementById(tableName + "xVariable" + k).value = "";
                document.getElementById(tableName + "xVariable" + k + "Span").className = "";
            }
            var emptyArray = [];
            machine.Inputnames = emptyArray;
        };
        var a = document.createElement('h');
        a.innerHTML = " Reset";
        var glyphicon = document.createElement('div');
        glyphicon.className = "glyphicon glyphicon-remove-circle";
        clearButton.appendChild(glyphicon);
        clearButton.appendChild(a);
        var LabelOne = document.getElementById(ButtonParentElementID);
        if (LabelOne.childNodes[0]) {
            LabelOne.replaceChild(clearButton, LabelOne.childNodes[0]);
        } else {
            LabelOne.appendChild(clearButton);
        }

        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-striped table-hover UserDefinedVariablesTable";
        table.style.textAlign = "center";
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");

        for (var i = 0; i < numberVariables; i++) {
            var row = document.createElement("tr");

            var cell = document.createElement("td");

            var formHorzion = document.createElement("form");
            formHorzion.className = "form-horizontal";

            var formGroup = document.createElement("div");
            formGroup.className = "form-group has-feedback has-success";
            formGroup.id = tableName + "xVariable" + i + "FormGroup";

            var label = document.createElement("label");
            label.className = "col-sm-1 control-label";
            label.htmlFor = tableName + "xVariable" + i;
            label.appendChild(createVariableElement("x",i));
            var equal = document.createElement("h");
            equal.innerHTML = "=";
            label.appendChild(equal);

            var span = document.createElement('span');
            //span.className = "glyphicon glyphicon-ok form-control-feedback";
            span.id = tableName + "xVariable" + i + "Span";

            var div = document.createElement("div");
            div.className = "col-sm-11";
            div.appendChild(createFormElementForVariableNames(i,tableName,machine,dynamic));
            div.appendChild(span);
            formGroup.appendChild(label);
            formGroup.appendChild(div);
            formHorzion.appendChild(formGroup);
            cell.appendChild(formHorzion);

            row.appendChild(cell);
            tblBody.appendChild(row);
        }

        table.appendChild(tblBody);

        var divContainer = document.getElementById(ID);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(table, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(table);
        }
    };

    /**
     * Generates HTMLElement tag with given variable name, and index
     *
     * @method createVariableElement
     * @private
     * @param {String} variableName name of the variable
     * @param {int} index index of variable
     * @return {HTMLElement} Returns HTMLElement tag
     */
    var createVariableElement = function (variableName, index) {
        var boldCell = document.createElement("h");
        var indice = document.createElement("sub");
        boldCell.innerHTML = variableName;
        indice.innerHTML = index.toString();
        boldCell.appendChild(indice);
        return boldCell;
    };

    /**
     * Generates HTML input form to change a input variable name
     *
     * @method createFormElementForVariableNames
     * @private
     * @param {int} i number of x variable
     * @param {String} tableName name of table
     * @param {TTable} machine
     * @return {HTMLElement} Returns HTMLElement input form
     */
    var createFormElementForVariableNames = function (i, tableName, machine, dynamic) {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control";
        input.id = tableName + "xVariable" + i;
        input.oninput = function () {
            setInputVariables(machine,input.id, dynamic);
        };
        for (var k = 0; k < machine.Inputnames.length; k++){
            if (machine.Inputnames[k].search("x"+ i.toString()) != -1){
                input.value = machine.Inputnames[k].slice(3);
            }
        }
        return input;
    };

    /**
     * Changes a input variable name in given machine
     *
     * @method setInputVariables
     * @private
     * @param {TTable} machine
     * @param {String} currentID id of form input
     */
    var setInputVariables = function (machine, currentID, dynamic){

        var currentInput = document.getElementById(currentID).value;
        currentInput = currentInput.replace(/\s/g, '');
        //currentInput = currentInput.toLowerCase();
        var currentInputNumber = currentID.slice(-1);

        var finalValid = true;
        var onlyDelete = false;
        var existing = false;
        var existingPosition = -1;
        var feedback ="";

        /*
        var pattern = /([a-z]+)([0-9]*)/g;

        if (pattern.test(currentInput)){
        } else {
            finalValid = false
        }
        */

        //Operatoren im namen
        if (currentInput.indexOf("_") != -1){finalValid = false;}

        //check auf Sonderzeichen
        if (!(/^\w+$/i.test(currentInput))){
            finalValid = false;
        }

        //L�nge gr��er als 18
        if (currentInput.length > 18){finalValid = false;}

        //name enth�lt z0 bis z3
        for (var j = 0; j < 4; j++) {
            if (currentInput.indexOf("z" + j) != -1) {finalValid = false;}
        }

        //name ist y0 bis y5 oder x0 bis x5 au�er x + Inputnumber
        for (var j = 0; j < 6; j++) {
            if (currentInput.indexOf("y"+j) != -1){finalValid = false;}
            if (j != currentInputNumber) {
                if (currentInput.indexOf("x" + j) != -1) {
                    finalValid = false;
                }
            }
        }

        //name ist schon als Outputname vergeben
        for (var m = 0; m < machine.Outputnames.length; m++){
            if (currentInput == machine.Outputnames[m].slice(3)){
                finalValid = false;
            }
        }

        //name kommt in einem User defined Outputname als substring vor und umgekehrt
        for (var m=0; m < machine.Outputnames.length; m++){
            if (machine.Outputnames[m].indexOf(currentInput) != -1){
                finalValid = false;
            }
            if (currentInput.indexOf(machine.Outputnames[m].slice(3)) != -1){
                finalValid = false;
            }
        }

        //name kommt in einem User defined Inputname als substring vor und umgekehrt
        for (var m=0; m < machine.Inputnames.length; m++){
            if (currentInputNumber != machine.Inputnames[m].slice(1,2)){
                if (machine.Inputnames[m].indexOf(currentInput) != -1) {
                    finalValid = false;
                }
                if (currentInput.indexOf(machine.Inputnames[m].slice(3)) != -1){
                    finalValid = false;
                }
            }
        }

        //name ist schon als Inputname vergeben au�er er ist der aktuellen InputNumber zugeordnet
        for (var m = 0; m < machine.Inputnames.length; m++){
            if (currentInputNumber != machine.Inputnames[m].slice(1,2)){
                if (machine.Inputnames[m].slice(3) == currentInput) {
                    finalValid = false;
                }
            }
        }

        //y + InputNumber im Namen ber�cksichtigt Name ist "  " oder "" oder "y0=y0"
        if ("x" + currentInputNumber == currentInput || currentInput.length == 0){
            onlyDelete = true;
        } else if (currentInput.indexOf("x" + currentInputNumber) != -1) {
            finalValid = false;
        }

        //sucht existing position im Namesarray
        for (var i = 0; i < machine.Inputnames.length; i++) {
            if (machine.Inputnames[i].slice(0,2).search("x"+currentInputNumber) != -1){
                existing = true;
                existingPosition = i;
            }
        }

        //Auswertung
        if (onlyDelete){
            //delete only da Input = " " oder "" oder "x1=x1"
            if (existing) {
                machine.Inputnames.splice(existingPosition, 1);
                feedback = "success";
                document.getElementById(currentID).value = currentInput;
            } else {
                feedback = "success";
                document.getElementById(currentID).value = currentInput;
            }
        } else {
            if (finalValid && existing){
                //replace element
                machine.Inputnames.splice(existingPosition,1,"x"+currentInputNumber+":"+currentInput);
                feedback = "success";
                document.getElementById(currentID).value = currentInput;
            } else
            if (finalValid && !existing){
                //add Element
                machine.Inputnames.push("x"+currentInputNumber+":"+currentInput);
                feedback = "success";
                document.getElementById(currentID).value = currentInput;
            } else
            if (!finalValid && existing){
                //delete Element
                machine.Inputnames.splice(existingPosition,1);
                feedback = "error";
                document.getElementById(currentID).value = currentInput;
            } else
            if (!finalValid && !existing){
                feedback = "error";
                document.getElementById(currentID).value = currentInput;
            }
        }

        if (feedback == "error"){
            document.getElementById(currentID + "FormGroup").className = "form-group has-feedback has-error";
            document.getElementById(currentID + "Span").className = "glyphicon glyphicon-remove form-control-feedback";
        } else if (feedback == "success"){
            document.getElementById(currentID + "FormGroup").className = "form-group has-feedback has-success";
            document.getElementById(currentID + "Span").className = "glyphicon glyphicon-ok form-control-feedback";
        } else {
            document.getElementById(currentID + "FormGroup").className = "form-group has-feedback has-warning";
            document.getElementById(currentID + "Span").className = "glyphicon glyphicon-warning-sign form-control-feedback";
        }

        if (dynamic){
            var allsuccess = true;
            for (var i = 0; i < machine.InputNumber; i++){
                var calledID = document.getElementById(currentID.slice(0,-1)+ i + "FormGroup").className;
                if (document.getElementById(currentID.slice(0,-1)+ i + "FormGroup").className == "form-group has-feedback has-error"){
                    allsuccess = false;
                }
            }
            for (var i = 0; i < machine.OutputNumber; i++){
                var calledID = "DefineNewMachine_OutputNamesTableyVariable" + i + "FormGroup";
                if (document.getElementById("DefineNewMachine_OutputNamesTableyVariable" + i + "FormGroup").className == "form-group has-feedback has-error"){
                    allsuccess = false;
                }
            }

            if (allsuccess){
                $('#New_Create_Button').attr('disabled',false);
            } else{
                $('#New_Create_Button').attr('disabled',true);
            }
        }

    };

    return {
        generateTable: generateTable
    };
})();


var UserDefinedOutputVariables = (function () {

    /**
     * Generates a table to change output variables
     *
     * @method generateTable
     * @public
     * @param {TTable} machine
     * @param {String} ID id of HTML Element the table shall appear under
     * @param {String} tableName name of table, is part of the HTML id
     * @param {Boolean} dynamic true when table shall show only number of output variables, false shows all possible variables
     * @param {String} ButtonParentElementID id of element the button has to be in
     * @return {HTMLElement} Returns HTMLElement div
     */
    var generateTable = function (machine, ID, tableName, dynamic, ButtonParentElementID, ButtonID) {

        var numberVariables = machine.MaxOutputNumber;
        if (dynamic){
            numberVariables = machine.OutputNumber;
        }

        var clearButton = document.createElement('button');
        clearButton.className = "btn btn-default pull-right";
        clearButton.id = ButtonID;
        clearButton.style.display = "none";
        clearButton.onclick = function(){
            for (var k=0; k < numberVariables; k++){ //statt machine.OutputNumber
                document.getElementById(tableName + "yVariable" + k).value = "";
                document.getElementById(tableName + "yVariable" + k + "Span").className = "";
            }
            var emptyArray = [];
            machine.Outputnames = emptyArray;
        };
        var a = document.createElement('h');
        a.innerHTML = " Reset";
        var glyphicon = document.createElement('div');
        glyphicon.className = "glyphicon glyphicon-remove-circle";
        clearButton.appendChild(glyphicon);
        clearButton.appendChild(a);
        var LabelOne = document.getElementById(ButtonParentElementID);
        if (LabelOne.childNodes[0]) {
            LabelOne.replaceChild(clearButton, LabelOne.childNodes[0]);
        } else {
            LabelOne.appendChild(clearButton);
        }

        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-striped table-hover  UserDefinedVariablesTable";
        table.style.textAlign = "center";
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");

        for (var i = 0; i < numberVariables; i++) {
            var row = document.createElement("tr");

            var cell = document.createElement("td");

            var formHorzion = document.createElement("form");
            formHorzion.className = "form-horizontal";

            var formGroup = document.createElement("div");
            formGroup.className = "form-group has-feedback has-success";
            formGroup.id = tableName + "yVariable" + i + "FormGroup";

            var label = document.createElement("label");
            label.className = "col-sm-1 control-label";
            label.htmlFor = tableName + "yVariable" + i;
            label.appendChild(createVariableElement("y",i));
            var equal = document.createElement("h");
            equal.innerHTML = "=";
            label.appendChild(equal);

            var span = document.createElement('span');
            //span.className = "glyphicon glyphicon-ok form-control-feedback";
            span.id = tableName + "yVariable" + i + "Span";

            var div = document.createElement("div");
            div.className = "col-sm-11";
            div.appendChild(createFormElementForVariableNames(i,tableName,machine, dynamic));
            div.appendChild(span);
            formGroup.appendChild(label);
            formGroup.appendChild(div);
            formHorzion.appendChild(formGroup);
            cell.appendChild(formHorzion);

            row.appendChild(cell);
            tblBody.appendChild(row);
        }

        table.appendChild(tblBody);

        var divContainer = document.getElementById(ID);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(table, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(table);
        }
    };

    /**
     * Generates HTMLElement tag with given variable name, and index
     *
     * @method createVariableElement
     * @private
     * @param {String} variableName name of the variable
     * @param {int} index index of variable
     * @return {HTMLElement} Returns HTMLElement tag
     */
    var createVariableElement = function (variableName, index) {
        var boldCell = document.createElement("h");
        var indice = document.createElement("sub");
        boldCell.innerHTML = variableName;
        indice.innerHTML = index.toString();
        boldCell.appendChild(indice);
        return boldCell;
    };

    /**
     * Generates HTML input form to change a output variable name
     *
     * @method createFormElementForVariableNames
     * @private
     * @param {int} i number of x variable
     * @param {String} tableName name of table
     * @param {TTable} machine
     * @return {HTMLElement} Returns HTMLElement input form
     */
    var createFormElementForVariableNames = function (i, tableName, machine,dynamic) {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control";
        input.id = tableName + "yVariable" + i;
        input.oninput = function () {
            setOutputVariables(machine,input.id, dynamic);
        };
        for (var k = 0; k < machine.Outputnames.length; k++){
            if (machine.Outputnames[k].search("y"+ i.toString()) != -1){
                input.value = machine.Outputnames[k].slice(3);
            }
        }
        return input;
    };

    /**
     * changes output variable name in given machine
     *
     * @method setOutputVariables
     * @private
     * @param {TTable} machine
     * @param {String} currentID id of form input
     */
    var setOutputVariables = function (machine, currentID, dynamic){

        var currentOutput = document.getElementById(currentID).value;
        currentOutput = currentOutput.replace(/\s/g, '');
        currentOutput = currentOutput.toLowerCase();
        var currentOutputNumber = currentID.slice(-1);

        var finalValid = true;
        var onlyDelete = false;
        var existing = false;
        var existingPosition = -1;
        var feedback ="";

        /*
        var pattern = /([a-z]+)([0-9]*)/g;

        if (pattern.test(currentOutput)){
        } else {
            finalValid = false
        }
         */


        //Operatoren im namen
        if (currentOutput.indexOf("_") != -1){finalValid = false;}

        //check auf Sonderzeichen
        if (!(/^\w+$/i.test(currentOutput))){
            finalValid = false;
        }


        //L�nge gr��er als 18
        if (currentOutput.length > 18){finalValid = false;}

        //name enth�lt z0 bis z3
        for (var j = 0; j < 4; j++) {
            if (currentOutput.indexOf("z" + j) != -1) {finalValid = false;}
        }

        //name ist x0 bis x5 oder y0 bis y5 au�er y + Outputnumber
        for (var j = 0; j < 6; j++) {
            if (currentOutput.indexOf("x"+j) != -1){finalValid = false;}
            if (j != currentOutputNumber) {
                if (currentOutput.indexOf("y" + j) != -1) {
                    finalValid = false;
                }
            }
        }

        //name ist schon als Inputname vergeben
        for (var m = 0; m < machine.Inputnames.length; m++){
            if (currentOutput == machine.Inputnames[m].slice(3)){
                finalValid = false;
            }

        }

        //name ist schon als Outputname vergeben au�er er ist der aktuellen QutputNumber zugeordnet
        for (var m = 0; m < machine.Outputnames.length; m++){
            if (currentOutputNumber != machine.Outputnames[m].slice(1,2)){
                if (machine.Outputnames[m].slice(3) == currentOutput) {
                    finalValid = false;
                }
            }
        }

        //name kommt in einem User defined Inputname als substring vor und umgekehrt
        for (var m=0; m < machine.Inputnames.length; m++){
            if (machine.Inputnames[m].indexOf(currentOutput) != -1){
                finalValid = false;
            }
            if (currentOutput.indexOf(machine.Inputnames[m].slice(3)) != -1){
                finalValid = false;
            }
        }

        //name kommt in einem User defined Outputname als substring vor und umgekehrt
        for (var m=0; m < machine.Outputnames.length; m++){
            if (currentOutputNumber != machine.Outputnames[m].slice(1,2)){
                if (machine.Outputnames[m].indexOf(currentOutput) != -1) {
                    finalValid = false;
                }
                if (currentOutput.indexOf(machine.Outputnames[m].slice(3)) != -1){
                    finalValid = false;
                }
            }
        }

        //y + OutputNumber im Namen ber�cksichtigt Name ist "  " oder "" oder "y0=y0"
        if ("y" + currentOutputNumber == currentOutput || currentOutput.length == 0){
            onlyDelete = true;
        } else if (currentOutput.indexOf("y" + currentOutputNumber) != -1) {
            finalValid = false;
        }

        //sucht existing position im Namesarray
        for (var i = 0; i < machine.Outputnames.length; i++) {
            if (machine.Outputnames[i].slice(0,2).search("y"+currentOutputNumber) != -1){
                existing = true;
                existingPosition = i;
            }
        }

        //Auswertung
        if (onlyDelete){
            //delete only da Input = " " oder "" oder "y1=y1"
            if (existing) {
                machine.Outputnames.splice(existingPosition, 1);
                feedback = "success";
                document.getElementById(currentID).value = currentOutput;
            } else {
                feedback = "success";
                document.getElementById(currentID).value = currentOutput;
            }
        } else {
            if (finalValid && existing){
                //replace element
                machine.Outputnames.splice(existingPosition,1,"y"+currentOutputNumber+":"+currentOutput);
                feedback = "success";
                document.getElementById(currentID).value = currentOutput;
            } else
            if (finalValid && !existing){
                //add Element
                machine.Outputnames.push("y"+currentOutputNumber+":"+currentOutput);
                feedback = "success";
                document.getElementById(currentID).value = currentOutput;
            } else
            if (!finalValid && existing){
                //delete Element
                machine.Outputnames.splice(existingPosition,1);
                feedback = "error";
                document.getElementById(currentID).value = currentOutput;
            } else
            if (!finalValid && !existing){
                feedback = "error";
                document.getElementById(currentID).value = currentOutput;
            }
        }

        if (feedback == "error"){
            document.getElementById(currentID + "FormGroup").className = "form-group has-feedback has-error";
            document.getElementById(currentID + "Span").className = "glyphicon glyphicon-remove form-control-feedback";
        } else if (feedback == "success"){
            document.getElementById(currentID + "FormGroup").className = "form-group has-feedback has-success";
            document.getElementById(currentID + "Span").className = "glyphicon glyphicon-ok form-control-feedback";
        } else {
            document.getElementById(currentID + "FormGroup").className = "form-group has-feedback has-warning";
            document.getElementById(currentID + "Span").className = "glyphicon glyphicon-warning-sign form-control-feedback";
        }

        if (dynamic){
            var allsuccess = true;
            for (var i = 0; i < machine.OutputNumber; i++){
                var calledID = document.getElementById(currentID.slice(0,-1)+ i + "FormGroup").className;
                if (document.getElementById(currentID.slice(0,-1)+ i + "FormGroup").className == "form-group has-feedback has-error"){
                    allsuccess = false;
                }
            }
            for (var i = 0; i < machine.InputNumber; i++){
                var calledID = "DefineNewMachine_InputNamesTablexVariable" + i + "FormGroup";
                if (document.getElementById("DefineNewMachine_InputNamesTablexVariable" + i + "FormGroup").className == "form-group has-feedback has-error"){
                    allsuccess = false;
                }
            }

            if (allsuccess){
                $('#New_Create_Button').attr('disabled',false);
            } else{
                $('#New_Create_Button').attr('disabled',true);
            }
        }

    };

    return {
        generateTable: generateTable
    };
})();


var UserDefinedVariablesCreateNew = (function(){

    var internalMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftInput);
    var InputTableParentElementID;
    var OutputTableParentElementID;

    var generateTables = function(InputTableParentElement,OutputTableParentElement){

        InputTableParentElementID = InputTableParentElement;
        OutputTableParentElementID = OutputTableParentElement;

        document.getElementById("L_count_Z").onchange = function(){
            updateInternalMachine();
        };
        document.getElementById("L_count_X").onchange = function(){
            updateInternalMachine();
        };
        document.getElementById("L_count_Y").onchange = function(){
            updateInternalMachine();
        };


        internalMachine = new TTable(parseInt(document.getElementById("L_count_Z").value), parseInt(document.getElementById("L_count_X").value), parseInt(document.getElementById("L_count_Y").value), ["*:*","+:+","/:/"],giftInput);

        UserDefinedInputVariables.generateTable(internalMachine,InputTableParentElement,"DefineNewMachine_InputNamesTable",true, "LabelOne_new", "SettingsResetButtonInputVariablesNewMachine");
        UserDefinedOutputVariables.generateTable(internalMachine,OutputTableParentElement,"DefineNewMachine_OutputNamesTable",true, "LabelTwo_new", "SettingsResetButtonOutputVariablesNewMachine");
    };

    var updateInternalMachine = function(){
        //neue Werte holen
        var stateBits = parseInt(document.getElementById("L_count_Z").value);
        var numberInputs = parseInt(document.getElementById("L_count_X").value);
        var numberOutputs = parseInt(document.getElementById("L_count_Y").value);

        //neue TTable instanz anlegen
        var newMachine = new TTable(stateBits,numberInputs,numberOutputs,["*:*","+:+","/:/"],giftInput);

        //array mit namen bernehmen
        newMachine.Inputnames = internalMachine.Inputnames;
        newMachine.Outputnames = internalMachine.Outputnames;

        //internalMachine berschreiben
        internalMachine = newMachine;

        //tabellen updaten
        UserDefinedInputVariables.generateTable(internalMachine,InputTableParentElementID,"DefineNewMachine_InputNamesTable",true,"LabelOne_new", "SettingsResetButtonInputVariablesNewMachine");
        UserDefinedOutputVariables.generateTable(internalMachine,OutputTableParentElementID,"DefineNewMachine_OutputNamesTable",true,"LabelTwo_new", "SettingsResetButtonOutputVariablesNewMachine");
    };

    var getMachine = function(){
        return internalMachine;
    };

    return{
        generateTables: generateTables,
        getMachine: getMachine
    };
})();

var UserDefinedOperators = (function(){

    var changeMachineOperators = function(OperatorID){

        var currentCase = "";
        var currentSymbol = "";
        if (OperatorID == "UserDefinedOperators_UND"){
            currentCase = "AND";
            currentSymbol = "*";
        } else if (OperatorID == "UserDefinedOperators_ODER"){
            currentCase = "OR";
            currentSymbol = "+";
        } else {
            currentCase = "NOT";
            currentSymbol = "/";
        }

        var newSymbol = document.getElementById(OperatorID).value;

        var grammaticalCorrect = checkSymbol(newSymbol);

        //Zeichen schon vergeben
        var existing = false;
        for (var i=0; i < 3; i++){
            if (currentSymbol != machine.OperatorsList[i].slice(0,1)){
                if (machine.OperatorsList[i].slice(-1) == newSymbol) {
                    existing = true;
                }
            }
        }

        var newArray = [];
        for (var i=0; i < 3; i++){
            newArray.push(machine.OperatorsList[i]);
        }

        var index;
        for (var i=0; i < 3; i++){
            if (newArray[i].slice(0,1) == currentSymbol){
                index = i;
            }
        }
        newArray.splice(index,1);

        var finalValid = true;

        if(grammaticalCorrect && !existing){
            finalValid = true;
        } else {
            finalValid = false;
        }

        //ersetzten
        if (finalValid){
            if (newSymbol == currentSymbol || newSymbol.length < 1){
                newSymbol = currentSymbol;
            }
            newArray.push(currentSymbol + ":" + newSymbol);
            machine = Util.copyDatatype(machine,true,machine.StateBits,machine.InputNumber,machine.OutputNumber,machine.graphStorage,newArray);
        }


        //neuer Fall zwei sind falsch
        var newOperatorsList = [];
        var combinedValid = [false,false,false];
        var newAND = document.getElementById("UserDefinedOperators_UND").value;
        if (newAND.length < 1){
            newAND = "*"
        }
        newOperatorsList.push(newAND);
        var newOR = document.getElementById("UserDefinedOperators_ODER").value;
        if (newOR.length < 1){
            newOR = "+"
        }
        newOperatorsList.push(newOR);
        var newNOT = document.getElementById("UserDefinedOperators_NICHT").value;
        if (newNOT.length < 1){
            newNOT = "/"
        }
        newOperatorsList.push(newOR);

        if (newOR != newAND && newAND != newNOT && newOR != newNOT) {
            for (var i = 0; i < 3; i++) {

                //check nur Sonderzeichen
                if (/\W/.test(newOperatorsList[i])) {
                    combinedValid[i] = true;
                }
                //Additionals Sonderzeichen
                if (newOperatorsList[i] == "_" || newOperatorsList[i] == "") {
                    combinedValid[i] = true;
                }
                //Verbotene Zeichen
                if (newOperatorsList[i] == "=" || newOperatorsList[i] == "(" || newOperatorsList[i] == ")" || newOperatorsList[i] == "\"" || newOperatorsList[i] == ":") {
                    combinedValid[i] = false;
                }
            }
        }

        if (combinedValid[0] && combinedValid[1] && combinedValid[2]){
            newOperatorsList = [];
            newOperatorsList.push("*:" + newAND);
            newOperatorsList.push("+:" + newOR);
            newOperatorsList.push("/:" + newNOT);

            //machine neu setzen
            machine = Util.copyDatatype(machine,true,machine.StateBits,machine.InputNumber,machine.OutputNumber,machine.graphStorage,newOperatorsList);
            document.getElementById("UserDefinedOperators_UND_DivGroup").className = "form-group has-feedback has-success";
            document.getElementById("UserDefinedOperators_UND_Glyphicon").className = "glyphicon glyphicon-ok form-control-feedback";
            document.getElementById("UserDefinedOperators_ODER_DivGroup").className = "form-group has-feedback has-success";
            document.getElementById("UserDefinedOperators_ODER_Glyphicon").className = "glyphicon glyphicon-ok form-control-feedback";
            document.getElementById("UserDefinedOperators_NICHT_DivGroup").className = "form-group has-feedback has-success";
            document.getElementById("UserDefinedOperators_NICHT_Glyphicon").className = "glyphicon glyphicon-ok form-control-feedback";
        }

        if (finalValid){
            document.getElementById(OperatorID + "_DivGroup").className = "form-group has-feedback has-success";
            document.getElementById(OperatorID + "_Glyphicon").className = "glyphicon glyphicon-ok form-control-feedback";
        } else {
            document.getElementById(OperatorID + "_DivGroup").className = "form-group has-feedback has-error";
            document.getElementById(OperatorID + "_Glyphicon").className = "glyphicon glyphicon-remove form-control-feedback";
        }
        UserDefinedInputVariables.generateTable(machine,"User_defined_Inputvariables","userDefinedInputvariables",false, "LabelOne","SettingsResetButtonInputVariables");
        UserDefinedOutputVariables.generateTable(machine,"User_defined_Outputvariables","userDefinedOutputvariables",false, "LabelTwo","SettingsResetButtonOutputVariables");
    };

    var checkSymbol = function(symbol){

        var finalValid = false;

        //check nur Sonderzeichen
        if (/\W/.test(symbol)) {
            finalValid = true;
        }
        //Additionals Sonderzeichen
        if (symbol == "_" || symbol == "") {
            finalValid = true;
        }
        //Verbotene Zeichen
        if (symbol == "=" || symbol == "(" || symbol == ")" || symbol == "\"" || symbol == ":") {
            finalValid = false;
        }

        return finalValid;
    };

    var updateOperatorsInputs = function(){

        var newArray = [];
        for (var i=0; i < 3; i++){
            newArray.push(machine.OperatorsList[i]);
        }

        for (var i=0; i < 3; i++){
            if (newArray[i].slice(0,1) == "*"){
                document.getElementById("UserDefinedOperators_UND").value = newArray[i].slice(-1);
            }
            if (newArray[i].slice(0,1) == "+"){
                document.getElementById("UserDefinedOperators_ODER").value = newArray[i].slice(-1);
            }
            if (newArray[i].slice(0,1) == "/"){
                document.getElementById("UserDefinedOperators_NICHT").value = newArray[i].slice(-1);
            }
        }
        document.getElementById("UserDefinedOperators_UND_DivGroup").className = "form-group has-feedback";
        document.getElementById("UserDefinedOperators_UND_Glyphicon").className = "";
        document.getElementById("UserDefinedOperators_ODER_DivGroup").className = "form-group has-feedback";
        document.getElementById("UserDefinedOperators_ODER_Glyphicon").className = "";
        document.getElementById("UserDefinedOperators_NICHT_DivGroup").className = "form-group has-feedback";
        document.getElementById("UserDefinedOperators_NICHT_Glyphicon").className = "";

    };

    return{
        changeMachineOperators: changeMachineOperators,
        updateOperatorsInputs: updateOperatorsInputs
    };
})();
