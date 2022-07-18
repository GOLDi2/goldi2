/**
 * Created by Simon Lanfermann on 16.05.2015.
 */

/**
 @module Machine Table Input and Output
 */

/**
 *
 * @class MachineTable
 *
 */
var MachineTable = (function () {
    /**
     * Generates a machine table
     *
     * @method generateMTable
     * @public
     * @param {boolean} editable indicates if the table is able to be edited by the user
     * @param {TTable} machine machine the MTable shall show
     * @param {String} ID id of HTML Element the table shall appear under
     * @param {String} tableName name of table (remember name to use getter and setter; name is part of table ID)
     * @return {HTMLElement} Returns HTMLElement table
     */
    var generateMachineTable = function (editable,machine,ID,tableName) {

        var numberOutputs = machine.OutputNumber;
        var numberInputs = machine.InputNumber + createParallelNumber(machine);
        var numberStateBits = Math.ceil(Math.log(machine.StateNumber) / Math.log(2));

        var divPanelAndTable = document.createElement('div');
        divPanelAndTable.className = "container mobileContainer";
        var coldiv = document.createElement('div');
        coldiv.className = "col-md-12 flexDiv";
        var panelDiv = document.createElement('div');
        panelDiv.className = "panel panel-default MachineTable";
        var panelHead = document.createElement('div');
        panelHead.className = "panel-heading MachineTable clearfix";
        var heading = document.createElement('h1');
        heading.className = "panel-title";
        heading.innerHTML = "<center><span data-i18n='tabs.machineTable'></span></center>";
        var panelBody = document.createElement('div');
        panelBody.className = "panel-body col-sm 12 MachineTable flexDiv";
        panelBody.id = tableName + "PanelBody";

        panelHead.appendChild(heading);
        panelDiv.appendChild(panelHead);
        panelDiv.appendChild(panelBody);
        coldiv.appendChild(panelDiv);

        divPanelAndTable.appendChild(coldiv);


        if (editable) {
            var divRow = document.createElement('div');
            divRow.className = "row";
            divRow.appendChild(createPanelElement(1,machine,tableName));
            divRow.appendChild(createPanelElement(2,machine,tableName));
            divRow.appendChild(createPanelElement(3,machine,tableName));
            panelBody.appendChild(divRow);
        }

        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-bordered MachineTable";
        table.style.textAlign = "center";
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");

        var binaryAssignmentsStates = generateBinaryNumbers(numberStateBits);
        var binaryAssignmentsInputs = generateBinaryNumbers(numberInputs);

        if (numberInputs > 0) {

            for (var i = 1; i < (numberInputs + machine.StateNumber + 1); i++) {
                var row = document.createElement("tr");

                for (var j = 0; j < (numberStateBits + 1 + Math.pow(2, numberInputs)); j++) {

                    if (i == 1) {
                        var cell = document.createElement("th");
                    }else {
                        var cell = document.createElement("td");
                    }
                    var appendCell = true;

                    if (i < numberInputs && j < numberStateBits) {
                        if (i == 1 && j == 0) {
                            cell.colSpan = numberStateBits;
                            cell.rowSpan = numberInputs - 1;
                        } else {
                            appendCell = false;
                        }
                    }

                    //creates states variables horizontal
                    if (i == numberInputs && j == 0) {
                        for (var k = numberStateBits - 1; k >= 0; k--) {
                            var zVariableCell = document.createElement("td");
                            zVariableCell.className = "MTableStateVariables";
                            var stateVariableElement = createVariableElement("z", k, "");
                            zVariableCell.appendChild(stateVariableElement);
                            row.appendChild(zVariableCell);
                        }
                        j = numberStateBits;
                    }

                    //spreads assignments for state variables over table
                    if (i > numberInputs && j < numberStateBits) {
                        cell.innerHTML = binaryAssignmentsStates[i - numberInputs - 1][j];
                    }

                    //creates input variables vertical
                    if (j == numberStateBits && i <= numberInputs) {
                        var inputVariableElement = createVariableElement("x", i - 1, " ", machine);
                        cell.appendChild(inputVariableElement);
                        if (i == numberInputs) {
                            cell.className = "MTableLastInputVariable"
                        } else {
                            cell.className = "MTableInputVariables";
                        }
                    }

                    //spreads assignments for input variables over table
                    if (i <= numberInputs && j > numberStateBits) {
                        cell.innerHTML = binaryAssignmentsInputs[j - numberStateBits - 1][inverse(numberInputs, i - 1)];
                        if (i == numberInputs) {
                            cell.className = "MTableLastInputAssignments"
                        }
                    }

                    if (i < numberInputs && j < numberStateBits) {
                        if (i == 1 && j == 0) {
                            cell.colSpan = numberStateBits;
                            cell.rowSpan = numberInputs - 1;
                        }
                    }

                    //creates Z Elements
                    if (i > numberInputs && j == numberStateBits) {
                        var stateElement = createVariableElement("Z", i - numberInputs - 1, "a");
                        cell.appendChild(stateElement);
                        cell.className = "MTableStates";
                    }

                    //creates onclick elements
                    if (i > numberInputs && j > numberStateBits) {
                        if ((i - numberInputs - 1) < 10) {
                            cell.id += "0";
                        }
                        cell.id += (i - numberInputs - 1);
                        if ((j - numberStateBits - 1) < 10) {
                            cell.id += "0";
                        }
                        cell.id += (j - numberStateBits - 1);
                        cell.style.whiteSpace = "nowrap";
                        cell.appendChild(createButtonGroupForAssignment(numberStateBits, cell.id, "z", editable, tableName));
                        cell.appendChild(createButtonGroupForAssignment(numberOutputs, cell.id, "y", editable, tableName));
                        cell.id = tableName + cell.id;
                    }

                    if (appendCell) {
                        row.appendChild(cell);
                    }
                }
                tblBody.appendChild(row);
            }
        }

        table.appendChild(tblBody);

        panelBody.appendChild(table);


        var errorBox = document.createElement('div');
        errorBox.className = "alert fade in bg-danger";
        errorBox.id = tableName + "ErrorBox";
        if (numberInputs > 0) {
            errorBox.style.visibility = "hidden";
        } else {
            errorBox.style.visibility = "visible";
        }
        var closeButton = document.createElement('button');
        closeButton.type = "button";
        closeButton.className = "close";
        closeButton.onclick = function () {
            document.getElementById(tableName + "ErrorBox").style.visibility = "hidden";
        };
        var icon = document.createElement('a');
        icon.className = "glyphicon glyphicon-remove";
        closeButton.appendChild(icon);
        var errorParagraph = document.createElement('p');
        errorParagraph.id = tableName + "ErrorText";
        errorParagraph.style.color = "black";
        if (numberInputs <= 0) {
            errorParagraph.innerHTML = "Warnung! Nicht gen&uuml;gend Eingangsvariablen!";
        }

        errorBox.appendChild(closeButton);
        errorBox.appendChild(errorParagraph);

        panelBody.appendChild(errorBox);


        var divContainer = document.getElementById(ID);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(divPanelAndTable, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(divPanelAndTable);
        }

        $('[data-toggle="confirmation-1-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",1,tableName,machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        $('[data-toggle="confirmation-2-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",2,tableName,machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        $('[data-toggle="confirmation-3-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",3,tableName,machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
    };

    /**
     * Generates panel element for state bits, input and output variables
     *
     * @method createPanelElement
     * @private
     * @param {int} numberPanel 1 for state bit panel, 2 for input variable panel, 3 for output variable panel
     * @param {TTable} machine the panels belong to
     * @param {String} tableName name of table (remember name to use getter and setter; name is part of table ID)
     * @return {HTMLElement} Returns HTMLElement div
     */
    var createPanelElement = function(numberPanel, machine, tableName){
        var coldiv = document.createElement('div');
        coldiv.className = "col-md-4";
        var panelDiv = document.createElement('div');
        panelDiv.className = "panel panel-default MachineTable";
        var panelHead = document.createElement('div');
        panelHead.className = "panel-heading MachineTable clearfix";
        var heading = document.createElement('h3');
        heading.className = "panel-title pull-left";
        var buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group pull-right";
        var panelBody = document.createElement('div');
        panelBody.className = "panel-body MachineTable";

        switch (numberPanel){
            case 1:
                heading.innerHTML = "<span data-i18n='navbar.newMachine_State_bits'></span>: " + (Math.log(machine.StateNumber) / Math.log(2));
                if (machine.StateBits <= machine.MinStateBits) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 1, machine, tableName, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 1, machine, tableName, true));
                }
                if (machine.StateBits >= machine.MaxStateBits) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 1, machine, tableName, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 1, machine, tableName, true));
                }
                panelBody.appendChild(createStateBitNameRow(machine));
                break;
            case 2:
                heading.innerHTML = "<span data-i18n='settings.inputVars'></span>: " + machine.InputNumber;
                if (machine.InputNumber <= 0) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 2, machine, tableName, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 2, machine, tableName, true));
                }
                if (machine.InputNumber >= machine.MaxInputNumber) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 2, machine, tableName, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 2, machine, tableName, true));
                }
                panelBody.appendChild(createInputNameRow(machine));
                break;
            case 3:
                heading.innerHTML = "<span data-i18n='settings.outputVars'></span>: " + machine.OutputNumber;
                if (machine.OutputNumber <= 0) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 3, machine, tableName, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 3, machine, tableName, true));
                }
                if (machine.OutputNumber >= machine.MaxOutputNumber) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 3, machine, tableName, false));
                } else{
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 3, machine, tableName, true));
                }
                panelBody.appendChild(createOutputNameRow(machine));
                break;
        }
        panelHead.appendChild(heading);
        panelHead.appendChild(buttonGroup);
        panelDiv.appendChild(panelHead);
        panelDiv.appendChild(panelBody);
        coldiv.appendChild(panelDiv);
        return coldiv;

    };

    /**
     * Generates HTML button to change machine parameters
     *
     * @method createButtonToChangeMachineParameters
     * @private
     * @param {String} fkt "plus" for button plus, "minus" for button minus
     * @param {int} buttonNumber 1 for state bit buttons, 2 for input variable buttons, 3 for output variable buttons
     * @param {TTable} machine the panel belongs to
     * @param {String} tableName name of table (remember name to use getter and setter; name is part of table ID)
     * @param {Boolean} editable indicates if the button sholud be disabled
     * @return {HTMLElement} Returns HTMLElement button
     */
    var createButtonToChangeMachineParameters = function (fkt,buttonNumber,machine,tableName, editable) {
        var button = document.createElement('button');
        if (editable) {
            button.className = "btn btn-default btn-xs";
        } else{
            button.className = "btn btn-default btn-xs disabled";
        }

        button.style.float = "none";
        button.style.display = "inline-block";
        button.setAttribute("data-toggle","confirmation-"+buttonNumber+"-"+fkt);
        var glyphicon = document.createElement('a');
        if (fkt == "plus"){
            glyphicon.className = "glyphicon glyphicon-plus MachineTable";
            button.onclick = function(){executeOnButton(fkt,buttonNumber,tableName,machine);};
        } else {
            glyphicon.className = "glyphicon glyphicon-minus MachineTable";
        }
        button.appendChild(glyphicon);
        return button;
    };

    var executeOnButton = function (fkt,buttonNumber,tableName, machine){
        switch (buttonNumber) {
            case 1:
                if (fkt == "plus") {
                    Controller.addStateBit();
                    if (machine.StateNumber >= 16){
                        document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                        document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Maximale Anzahl an Zustandsbits erreicht!";
                    }

                } else {

                    Controller.deleteStateBit();
                    if (machine.StateNumber <= 2){
                        document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                        document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Minimale Anzahl an Zustandsbits erreicht!";
                    }

                }
                break;
            case 2:
                if (fkt == "plus") {

                    if (parseInt(machine.InputNumber) >= 6){
                        document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                        document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Maximale Anzahl an Eingangsvariablen erreicht!";
                    }
                    Controller.addInput();

                } else {

                    Controller.deleteInput();
                    if (machine.InputNumber <= 0){
                        document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                        document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Minimale Anzahl an Eingangsvariablen erreicht!";

                    }
                }
                break;
            case 3:
                if (fkt == "plus") {

                    Controller.addOutput();
                    if (machine.OutputNumber >= 6){
                        document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                        document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Maximale Anzahl an Ausgangsvariablen erreicht!";

                    }
                } else {

                    Controller.deleteOutput();
                    if (machine.OutputNumber <= 0){
                        document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                        document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Minimale Anzahl an Ausgangsvariablen erreicht!";
                    }

                }
                break;
        }
        $('[data-i18n]').i18n();
    };

    /**
     * generates all possible binary numbers based on a given number of bits up to 20
     *
     * @method generateBinaryNumbers
     * @private
     * @param {int} bits number of bits
     * @returns {Array/null} Returns sorted Array with all binary numbers; null when number of bits <1 or >20
     */
    var generateBinaryNumbers = function (bits) {
        if (bits == 1) {                                    //exception: number of bits is 1
            var oneBit = [];
            oneBit.push("0");
            oneBit.push("1");
            return oneBit;
        } else if (bits > 1 && bits < 21) {                  //tests on valid input
            var quantity = Math.pow(2, bits);
            var allBinaryNumbers = new Array(quantity);
            for (var l = 0; l < quantity; l++) {               //initializes an array that is large enough
                allBinaryNumbers[l] = "";
            }
            var modulus = quantity;
            for (var j = 0; j < bits; j++) {                //nested loop generates bit after bit
                for (var i = 0; i < (quantity); i++) {
                    if ((i % modulus) < (modulus / 2)) {
                        allBinaryNumbers[i] += "0";
                    } else {
                        allBinaryNumbers[i] += "1";
                    }
                }
                modulus = (modulus / 2);
            }
            return allBinaryNumbers;                        //returns generated array
        } else {
            return null;                                    //returns null when number of bits <1 or >20
        }
    };

    /**
     * Generates HTMLElement bold with given variable name, index and its potency
     * returns user defined name if possible
     *
     * @method createVariableElement
     * @private
     * @param {String} variableName name of the variable
     * @param {int} index index of variable
     * @param {int} age potency of variable
     * @param {TTable} machine
     * @return {HTMLElement} Returns HTMLElement bold
     */
    var createVariableElement = function (variableName, index, age, machine) {
        var boldCell = document.createElement("b");
        var exponent = document.createElement("sup");
        var indice = document.createElement("sub");
        exponent.innerHTML = age;
        var found = false;
        if (variableName == "x" && machine.Inputnames.length != 0) {
            var currentName = variableName + index;
            var nameArray = machine.Inputnames;
            for (var i = 0; i < nameArray.length; i++) {
                if (nameArray[i].search(currentName) != -1) {
                    boldCell.innerHTML = nameArray[i].slice(currentName.length + 1);
                    found = true;
                }
            }
        }
        if (found == false) {
            boldCell.innerHTML = variableName;
            boldCell.insertBefore(exponent, boldCell.childNodes[0]);
            indice.innerHTML = index.toString();
            boldCell.appendChild(indice);
        }
        return boldCell;
    };

    /**
     * Generates HTMLElement that shows all output variables in a vector; shows user defined names too, if possible
     *
     * @method createOutputNameRow
     * @private
     * @param {TTable} machine that contains number of output variables and their names
     * @return {HTMLElement} Returns HTMLElement div
     */
    var createOutputNameRow = function(machine){
        var div = document.createElement('div');
        if (machine.OutputNumber > 0) {
            div.innerHTML = "Y = (";
            var outputNumber = parseInt(machine.OutputNumber);
            for (var i = 0; i < outputNumber; i++) {
                var bold = document.createElement('f');
                bold.innerHTML = "y";
                var sub = document.createElement('sub');
                sub.innerHTML = inverse(outputNumber, i).toString();
                bold.appendChild(sub);
                var renamed = false;
                var renamedVariable = "";
                var nameArray = machine.Outputnames;
                if (nameArray.length != 0) {
                    var currentName = "y" + inverse(outputNumber, i);
                    for (var k = 0; k < nameArray.length; k++) {
                        if (nameArray[k].search(currentName) != -1) {
                            renamedVariable = nameArray[k].slice(currentName.length + 1);
                            renamed = true;
                        }
                    }
                }
                if (renamed) {
                    bold.innerHTML += ("=" + renamedVariable);
                }
                if (i < outputNumber - 1) {
                    bold.innerHTML += ", ";
                } else {
                    bold.innerHTML += ")";
                }
                div.appendChild(bold);
            }
        } else {
            div.innerHTML = "Y = 0"
        }
        return div;
    };

    /**
     * Generates HTMLElement that shows all input variables in a vector; shows user defined names too, if possible
     *
     * @method createInputNameRow
     * @private
     * @param {TTable} machine that contains number of input variables and their names
     * @return {HTMLElement} Returns HTMLElement div
     */
    var createInputNameRow = function(machine){
        var div = document.createElement('div');
        if (machine.InputNumber > 0) {
            div.innerHTML = "X = (";
            var inputNumber = parseInt(machine.InputNumber);
            for (var i = 0; i < inputNumber; i++) {
                var bold = document.createElement('f');
                bold.innerHTML = "x";
                var sub = document.createElement('sub');
                sub.innerHTML = inverse(inputNumber, i).toString();
                bold.appendChild(sub);
                var renamed = false;
                var renamedVariable = "";
                var nameArray = machine.Inputnames;
                if (nameArray.length != 0) {
                    var currentName = "x" + inverse(inputNumber, i);
                    for (var k = 0; k < nameArray.length; k++) {
                        if (nameArray[k].search(currentName) != -1) {
                            renamedVariable = nameArray[k].slice(currentName.length + 1);
                            renamed = true;
                        }
                    }
                }
                if (renamed) {
                    bold.innerHTML += ("=" + renamedVariable);
                }
                if (i < inputNumber - 1) {
                    bold.innerHTML += ", ";
                } else {
                    bold.innerHTML += ")";
                }
                div.appendChild(bold);
            }
        } else {
            div.innerHTML = "X = 0";
        }
        return div;
    };

    /**
     * Generates HTMLElement that shows all state in a vector
     *
     * @method createStateBitNameRow
     * @private
     * @param {TTable} machine that contains number of state bits
     * @return {HTMLElement} Returns HTMLElement div
     */
    var createStateBitNameRow = function(machine){
        var div = document.createElement('div');
        if (Math.ceil(( Math.log(machine.StateNumber) / Math.log(2))) > 0) {
            div.innerHTML = "Z = (";
            var stateNumber = Math.ceil(Math.log(machine.StateNumber) / Math.log(2));
            for (var i = 0; i < stateNumber; i++) {
                var bold = document.createElement('f');
                bold.innerHTML = "z";
                var sub = document.createElement('sub');
                sub.innerHTML = inverse(stateNumber, i).toString();
                bold.appendChild(sub);
                if (i < stateNumber - 1) {
                    bold.innerHTML += ", ";
                } else {
                    bold.innerHTML += ")";
                }
                div.appendChild(bold);
            }
        } else {
            div.innerHTML = "Z = 0";
        }
        return div;
    };

    /**
     * calculates to a index in an ascending array the corresponding index in an mirrored array
     *
     * @method inverse
     * @private
     * @param {int} anzahl length of array
     * @param {int} position index
     * @return {int} Returns corresponding index
     */
    var inverse = function (anzahl, position) {
        var inverseArray = [];
        for (var i = 0; i < anzahl; i++) {
            inverseArray.push(i);
        }
        inverseArray.reverse();
        return inverseArray[position];
    };

    /**
     * Generates a button group that represent the next state or the output assignment
     *
     * @method createButtonGroupForAssignment
     * @private
     * @param {int} numberButtons number of needed buttons
     * @param {String} cellID ID of corresponding cell in machine table
     * @param {String} variableName name of variable (state bit or output)
     * @param {boolean} clickable indicates if button should be clickable
     * @param {String} prefixID ID of table the row belongs to
     * @return {HTMLElement} Returns HTMLElement div
     */
    var createButtonGroupForAssignment = function (numberButtons, cellID, variableName, clickable, prefixID) {
        var paragraph = document.createElement('p');
        paragraph.id = prefixID + "p" + variableName + cellID;
        var buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group";
        buttonGroup.style.whiteSpace = "nowrap";
        for (var k = 0; k < numberButtons; k++) {
            var button = document.createElement('button');
            button.className = "btn btn-xs BitButton";
            button.style.float = "none";
            button.style.display = "inline-block";
            button.id = prefixID + variableName + cellID.toString() + k;
            button.innerHTML = "0";
            if (clickable == false) {
                button.className = "btn btn-xs BitButton disabled";
            } else {
                button.onclick = function () {
                    toggleBit(this.id)
                };
            }
            buttonGroup.appendChild(button);
        }
        paragraph.appendChild(buttonGroup);
        return paragraph;
    };

    /**
     * toggles innerHTML of button between 1 and 0
     *
     * @method toggleBit
     * @private
     * @param {String} buttonID buttons ID
     */
    var toggleBit = function (buttonID) {
        var button = document.getElementById(buttonID);
        machine.ChangeStruct.Inputs[0] = true;
        machine.ChangeStruct.Inputs[1] = true;
        machine.ChangeStruct.Inputs[3] = true;
        machine.ChangeStruct.Outputs[0] = true;
        machine.ChangeStruct.Outputs[1] = true;
        machine.ChangeStruct.Outputs[2] = true;
        machine.ChangeStruct.Outputs[3] = true;
        machine.ChangeStruct.SimFlops[0] = true;
        machine.ChangeStruct.SimFlops[1] = true;
        if (button.innerHTML == "0") {
            button.innerHTML = "1"
        } else {
            button.innerHTML = "0"
        }
    };

    /**
     * replaces the buttons group for the next state with a colored button for contradictions/incompleteness
     *
     * @method replaceButtonRowForNextStateWithColoredButton
     * @private
     * @param {string} cellID ID of the cell the row has to be replaced in
     * @param {string} errorType "w" if the state is contradictory, "u" if the state is incomplete
     * @param {String} tableName name of table (same name you used when generating table)
     */
    var replaceButtonRowForNextStateWithColoredButton = function (cellID, errorType, tableName) {
        var paragraph = document.createElement('p');
        paragraph.id = cellID;
        var button = document.createElement('button');
        if (errorType == "u") {
            button.className = "btn btn-xs btn-warning disabled";
        } else if (errorType == "w") {
            button.className = "btn btn-xs btn-danger disabled"
        } else {
            button.className = "btn btn-xs disabled";
        }
        button.innerHTML = errorType;
        paragraph.appendChild(button);
        document.getElementById(tableName + cellID).replaceChild(paragraph, document.getElementById(tableName + "p" + "z" + cellID));
    };

    /**
     * gets all next states as binary number from machine table
     * returns them in an array: first dimension is old state, second input assignment
     *
     * @method getArrayNextStates
     * @public
     * @param {TTable} machine machine the table represents
     * @param {String} tableName name of table (same name you used when generating table)
     * @return {Array} Returns array with next states
     */
    var getArrayNextStates = function (machine, tableName) {

        var numberInputVariables = machine.InputNumber + createParallelNumber(machine);
        var numberStateBits = Math.ceil(Math.log(machine.StateNumber) / Math.log(2));

        var outerArray = [];
        if (numberInputVariables < 1){
            return outerArray;
        }
        for (var i = 0; i < Math.pow(2, numberStateBits); i++) {
            var innerArray = [];
            for (var j = 0; j < Math.pow(2, numberInputVariables); j++) {
                var currentID = "z";
                if (i < 10) {
                    currentID += "0";
                }
                currentID += i;
                if (j < 10) {
                    currentID += "0";
                }
                currentID += j;
                var nextState = "";
                for (var m = 0; m < numberStateBits; m++) {
                    var stateID = currentID;
                    stateID = tableName + currentID.toString() + m.toString();
                    nextState += document.getElementById(stateID).innerHTML;
                }
                innerArray.push(nextState);
            }
            outerArray[i] = innerArray;
        }
        return outerArray;
    };

    /**
     * sets all next states as binary number in machine table on input side
     * assignments have to be from type String in a two dimensional array: first dimension is old state, second input assignment
     *
     * @method setArrayNextStates
     * @public
     * @param {Array) nextStateMatrix two dimensional array with assignments of type String
     * @param {TTable} machine machine the table represents
     * @param {String} tableName name of table (same name you used when generating table)
     */
    var setArrayNextStates = function (nextStateMatrix, machine, tableName) {

        var numberInputVariables = machine.InputNumber + createParallelNumber(machine);
        var numberStateBits = Math.ceil(Math.log(machine.StateNumber) / Math.log(2));

        if (numberInputVariables > 0) {
            for (var i = 0; i < Math.pow(2, numberStateBits); i++) {
                for (var j = 0; j < Math.pow(2, numberInputVariables); j++) {
                    var currentID = "";
                    if (i < 10) {
                        currentID += "0";
                    }
                    currentID += i;
                    if (j < 10) {
                        currentID += "0";
                    }
                    currentID += j;
                    if (nextStateMatrix[i][j] == "u" || nextStateMatrix[i][j] == "w") {
                        replaceButtonRowForNextStateWithColoredButton(currentID, nextStateMatrix[i][j], tableName);
                    } else {
                        var assignment = nextStateMatrix[i][j];
                        for (var m = 0; m < numberStateBits; m++) {
                            document.getElementById(tableName + 'z' + currentID + m).innerHTML = assignment[m];
                        }
                    }
                }
            }
        }
    };

    /**
     * gets all output assignments of a output variable with a given index
     * returns them in an array: first dimension is old state, second input assignment
     *
     * @method getOutputAssignment
     * @public
     * @param {int} indexOfOutputVariable
     * @param {TTable} machine machine the table represents
     * @param {String} tableName name of table (same name you used when generating table)
     * @return {Array} Returns array output assignments
     */
    var getOutputAssignment = function (indexOfOutputVariable, machine, tableName) {

        var numberOutputVariables = machine.OutputNumber;
        var numberInputVariables = machine.InputNumber  + createParallelNumber(machine);
        var numberStateBits = Math.ceil(Math.log(machine.StateNumber) / Math.log(2));

        var assignments = [];
        if (indexOfOutputVariable + 1 > numberOutputVariables) {
            return assignments;
        }
        if (numberInputVariables < 1){
            return assignments;
        }

        for (var i = 0; i < Math.pow(2, numberStateBits); i++) {
            var innerArray = [];
            for (var j = 0; j < Math.pow(2, numberInputVariables); j++) {
                var currentID = "y";
                if (i < 10) {
                    currentID += "0";
                }
                currentID += i;
                if (j < 10) {
                    currentID += "0";
                }
                currentID += j;
                var cellID = currentID;
                cellID = currentID.toString() + inverse(numberOutputVariables, indexOfOutputVariable).toString();
                innerArray[j] = document.getElementById(tableName + cellID).innerHTML;
            }
            assignments[i] = innerArray;
        }
        return assignments;
    };

    /**
     * sets all output assignments in machine table on input side
     * assignments have to be from type String in a two dimensional array: first dimension is old state, second dimension input assignment
     *
     * @method setArrayNextStates
     * @public
     * @param {Array) outputMatrix two dimensional array with assignments of type String
     * @param {int) outputVariableIndex index of output variable the matrix of assignments belong to
     * @param {String} tableName name of table (same name you used when generating table)
     * @param {TTable} machine - machine the table shall represent
     */
    var setOutputAssignment = function (outputMatrix, outputVariableIndex, machine, tableName) {

        var numberOutputVariables = machine.OutputNumber;
        var numberInputVariables = machine.InputNumber + createParallelNumber(machine);
        var numberStateBits = Math.ceil(Math.log(machine.StateNumber) / Math.log(2));

        if (numberInputVariables > 0) {
            var mirrorIndex = inverse(numberOutputVariables, outputVariableIndex);
            for (var i = 0; i < Math.pow(2, numberStateBits); i++) {
                for (var j = 0; j < Math.pow(2, numberInputVariables); j++) {
                    var currentID = "y";
                    if (i < 10) {
                        currentID += "0";
                    }
                    currentID += i;
                    if (j < 10) {
                        currentID += "0";
                    }
                    currentID += j;
                    currentID += mirrorIndex;
                    document.getElementById(tableName + currentID).innerHTML = outputMatrix[i][j];
                }
            }
        }
    };
    var createParallelNumber = function(machine){
        var i, j;
        var parallelVariableNumber = 0;
        for(i = 0; i <= machine.GiftState.getHighestMachineNumber(); i++){
            var thisMachine = machine.GiftState.getMachine(i);
            var machinezcount = thisMachine.StateBits;
            if(i != machine.MachineNumber) {
                for (j = 0; j < machinezcount; j++) {
                    parallelVariableNumber++;
                }
            }
        }
        return parallelVariableNumber;
    };
    return {
        generateMachineTable: generateMachineTable,
        getArrayNextStates: getArrayNextStates,
        setArrayNextStates: setArrayNextStates,
        getOutputAssignment: getOutputAssignment,
        setOutputAssignment: setOutputAssignment
    };
})();