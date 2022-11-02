/**
 * Created by Simon Lanfermann on 09.05.2015.
 */

/**
 @module Transition Table Input and Output
 */

/**
 *
 * @class TransitionTable
 *
 */

var TransitionTable = (function () {

    /**
     * Generates a transition table based on the input side
     *
     * @method generateTransitionTable
     * @public
     * @param {boolean} editable indicates if the table is able to be edited by the user
     * @param {TTable} machine
     * @param {String} ID id of HTML Element the table shall appear under
     * @param {String} tableName name of table (remember name to use getter and setter; name is part of table ID)
     * @return {HTMLElement} Returns HTMLElement div
     */
    var generateTransitionTable = function (editable, machine, ID, tableName) {

        var statesbits = Math.ceil(Math.log(parseInt(machine.StateNumber))/Math.log(2));
        var states = Math.pow(2,statesbits);
        var numberInputVariables = machine.InputNumber;
        var numberOutputVariables = machine.OutputNumber;
        var saveBoolean = machine.ReturnWithNames;
        machine.ReturnWithNames = true;

        var divTableAndError =document.createElement('div');
        divTableAndError.className = "container mobileContainer";
        var Trans_coldiv = document.createElement('div');
        Trans_coldiv.className = "col-md-12 flexDiv";
        var Trans_panelDiv = document.createElement('div');
        Trans_panelDiv.className = "panel panel-default MachineTable";
        var Trans_panelHead = document.createElement('div');
        Trans_panelHead.className = "panel-heading MachineTable clearfix";
        var Trans_heading = document.createElement('h1');
        Trans_heading.className = "panel-title";
        Trans_heading.innerHTML = "<center><span data-i18n='tabs.transitionMatrix'></span></center>";
        var Trans_panelBody = document.createElement('div');
        Trans_panelBody.className = "panel-body col-sm 12 MachineTable flexDiv";
        Trans_panelBody.id = tableName + "Trans_panelBody";

        Trans_panelHead.appendChild(Trans_heading);
        Trans_panelDiv.appendChild(Trans_panelHead);
        Trans_panelDiv.appendChild(Trans_panelBody);
        Trans_coldiv.appendChild(Trans_panelDiv);

        divTableAndError.appendChild(Trans_coldiv);

        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-bordered MachineTable";
        table.style.textAlign = "center";
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");

        if (editable) {
            Trans_panelBody.appendChild(createPanelElement(machine,tableName));
        }

        var headerRow = document.createElement("tr");

        var transitionCell = document.createElement("th");
        transitionCell.id = "titleTransition";
        transitionCell.innerHTML = "<span data-i18n='infoedit.transitions'></span>";
        transitionCell.className = "Transitionstabelle_TableHead";
        transitionCell.style.textAlign = "center";
        transitionCell.colSpan = states + 1;
        headerRow.appendChild(transitionCell);

        var variablesCell = document.createElement("th");
        variablesCell.id = "titleVariables";
        variablesCell.innerHTML = "<span data-i18n='settings.outputVars'></span>";
        variablesCell.className = "Transitionstabelle_TableHead";
        variablesCell.style.textAlign = "center";
        variablesCell.colSpan = numberOutputVariables + 1;
        headerRow.appendChild(variablesCell);

        tblBody.appendChild(headerRow);


        for (var i = 1; i < states + 2; i++) {
            var row = document.createElement("tr");

            for (var j = 0; j < states + 1; j++) {

                var cell = document.createElement("td");
                if (i == 1 && j == 0 && editable) {
                    //up and down button for states
                    var Trans_buttonGroup = document.createElement('div');
                    Trans_buttonGroup.className = "btn-group";
                    Trans_buttonGroup.style.whiteSpace = "nowrap";
                    if (statesbits <= 1) {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 1, machine, tableName, false));
                    } else {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 1, machine, tableName, true));
                    }
                    if (statesbits >= machine.MaxStateBits) {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 1, machine, tableName, false));
                    } else {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 1, machine, tableName, true));
                    }
                    cell.className = "MTableLastInputVariable";
                    cell.appendChild(Trans_buttonGroup);
                } else if (i == 1 && j == 0) {
                    cell.className = "MTableLastInputVariable";
                } else if (i == 1) {
                    //state headings horizontal
                    var newZElement = createVariableElement("Z",j-1,"n",machine);
                    cell.className = "MTableLastInputVariable";
                    cell.appendChild(newZElement);
                } else if (j == 0) {
                    //state headings vertical
                    var oldZElement = createVariableElement("Z",i-2,"a",machine);
                    cell.className = "MTableLastInputVariable";
                    cell.appendChild(oldZElement);
                } else {
                    if (editable) {
                        //input forms for transitions
                        var input = createFormElementForTransitions(i - 2, j - 1, tableName, machine);
                        cell.appendChild(input);
                    } else {
                        cell.id = tableName + "t";
                        if (i < 10) {
                            cell.id += "0";
                        }
                        cell.id += i-2;
                        if (j < 10) {
                            cell.id += "0";
                        }
                        cell.id += j-1;
                        if (machine.getTransition(i-2,j-1)){
                            cell.innerHTML = machine.getTransition(i-2,j-1);
                        } else {
                            cell.innerHTML = "0";
                        }
                    }
                }
                row.appendChild(cell);
            }

            for (var k = 0; k < numberOutputVariables + 1; k++) {

                var cell = document.createElement("td");

                if (i == 1 && k == 0 && editable) {
                    //up and down button for states
                    var Trans_buttonGroup = document.createElement('div');
                    Trans_buttonGroup.className = "btn-group";
                    Trans_buttonGroup.style.whiteSpace = "nowrap";
                    if (numberOutputVariables <= 0) {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 3, machine, tableName, false));
                    } else {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 3, machine, tableName, true));
                    }
                    if (numberOutputVariables >= machine.MaxOutputNumber) {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 3, machine, tableName, false));
                    } else {
                        Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("plus",3,machine,tableName, true));
                    }
                    cell.className = "MTableLastInputVariable";
                    cell.appendChild(Trans_buttonGroup);
                } else if (i == 1 && k== 0) {
                    cell.className = "MTableLastInputVariable";
                } else if (i == 1 && k > 0) {
                    //output names
                    cell.appendChild(createVariableElement("y",k-1," ",machine));
                    cell.className = "MTableLastInputVariable";
                } else if (k == 0) {
                    //state headings vertical
                        var oldZElement = createVariableElement("Z",i-2," ",machine);
                    cell.className = "MTableLastInputVariable";
                    cell.appendChild(oldZElement);
                } else {
                    if (editable) {
                        //all input forms for y-variable expressions
                        var inputFormOutput = createFormElementForOutputVariablesEquation(i - 2, k - 1, tableName, machine);
                        cell.appendChild(inputFormOutput);
                    } else {
                        cell.id = tableName + "y";
                        cell.id += k-1;
                        cell.id += i-2;
                        var equation;
                        var index;
                        try {
                            equation = machine.getOutputEquation(i-2,"y"+(k-1));
                        }
                        catch(err){
                            equation = "y=0";
                        }
                        index = equation.search("=");
                        cell.innerHTML = equation.slice(index + 1);

                    }
                }

                row.appendChild(cell);
            }

            tblBody.appendChild(row);
        }

        table.appendChild(tblBody);
        Trans_panelBody.appendChild(table);

        if (editable) {
            var errorBox = document.createElement('div');
            errorBox.className = "alert fade in bg-danger";
            errorBox.id = tableName + "ErrorBox";
            errorBox.style.visibility = "hidden";
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

            errorBox.appendChild(closeButton);
            errorBox.appendChild(errorParagraph);

            Trans_panelBody.appendChild(errorBox);
        }

        var divContainer = document.getElementById(ID);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(divTableAndError, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(divTableAndError);
        }

        machine.ReturnWithNames = saveBoolean;
        $('[data-toggle="confirmation-1-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",1,tableName,machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        $('[data-toggle="confirmation-2-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",2,tableName,machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        $('[data-toggle="confirmation-3-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",3,tableName,machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
    };

    /**
     * Generates panel element input variables
     *
     * @method createPanelElement
     * @private
     * @param {TTable} machine the panel belongs to
     * @param {String} tableName name of table (remember name to use getter and setter; name is part of table ID)
     * @return {HTMLElement} Returns HTMLElement div
     */
    var createPanelElement = function(machine, tableName){
        var Trans_panelDiv = document.createElement('div');
        Trans_panelDiv.className = "panel panel-default MachineTable";
        var Trans_panelHead = document.createElement('div');
        Trans_panelHead.className = "panel-heading MachineTable clearfix";
        var Trans_heading = document.createElement('h3');
        Trans_heading.className = "panel-title pull-left";
        var Trans_buttonGroup = document.createElement('div');
        Trans_buttonGroup.className = "btn-group pull-right";
        var Trans_panelBody = document.createElement('div');
        Trans_panelBody.className = "panel-body MachineTable";
        Trans_heading.innerHTML = "<span data-i18n='settings.inputVars'></span>: " + machine.InputNumber;
        if (machine.InputNumber <= 0) {
            Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 2, machine, tableName, false));
        } else {
            Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 2, machine, tableName, true));
        }
        if (machine.InputNumber >= machine.MaxInputNumber) {
            Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 2, machine, tableName, false));
        } else {
            Trans_buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 2, machine, tableName, true));
        }
        Trans_panelBody.appendChild(createInputNameRow(machine));
        Trans_panelHead.appendChild(Trans_heading);
        Trans_panelHead.appendChild(Trans_buttonGroup);
        Trans_panelDiv.appendChild(Trans_panelHead);
        Trans_panelDiv.appendChild(Trans_panelBody);
        return Trans_panelDiv;
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
        if (variableName == "y" && machine.Outputnames.length != 0) {
            var currentName = variableName + index;
            var nameArray = machine.Outputnames;
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
            div.innerHTML = "X = [";
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
                    bold.innerHTML += "]";
                }
                div.appendChild(bold);
            }
        } else {
            div.innerHTML = "X = 0";
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
    var createButtonToChangeMachineParameters = function (fkt,buttonNumber,machine,tableName,editable) {
        var button = document.createElement('button');
        if (editable) {
            button.className = "btn btn-default btn-xs";
        } else {
            button.className = "btn btn-default btn-xs disabled";
        }
        button.style.float = "none";
        button.style.display = "inline-block";
        button.setAttribute("data-toggle","confirmation-"+buttonNumber+"-"+fkt);
        var glyphicon = document.createElement('a');
        if (fkt == "plus"){
            button.onclick = function(){executeOnButton(fkt,buttonNumber,tableName,machine);};
            glyphicon.className = "glyphicon glyphicon-plus MachineTable";
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
                            document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Maximale Anzahl an Eingabevariablen erreicht!";
                        }
                        Controller.addInput();
                } else {
                        Controller.deleteInput();
                        if (machine.InputNumber <= 0){
                            document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                            document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Minimale Anzahl an Eingabevariablen erreicht!";
                    }
                }
                break;
            case 3:
                if (fkt == "plus") {
                        Controller.addOutput();
                        if (machine.OutputNumber >= 6){
                            document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                            document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Maximale Anzahl an Ausgabevariablen erreicht!";
                    }
                } else {
                        Controller.deleteOutput();
                        if (machine.OutputNumber <= 0){
                            document.getElementById(tableName + "ErrorBox").style.visibility = "visible";
                            document.getElementById(tableName + "ErrorText").innerHTML = "Warnung! Minimale Anzahl an Ausgabevariablen erreicht!";
                        }
                }
                break;
        }
        $('[data-i18n]').i18n();
    };

    /**
     * Generates HTML input form to change a transition expression
     *
     * @method createFormElementForTransitions
     * @private
     * @param {int} i state the transition starts
     * @param {int} j state the transition ends
     * @param {String} tableName name of table
     * @param {TTable} machine
     * @return {HTMLElement} Returns HTMLElement input form
     */
    var createFormElementForTransitions = function (i, j, tableName, machine) {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control input-sm TransitionTable";
        input.id = tableName + "t";
        if (i < 10) {
            input.id += "0";
        }
        input.id += i;
        if (j < 10) {
            input.id += "0";
        }
        input.id += j;
        input.onblur = function () {
            setTransitionInTTable(document.getElementById(this.id).value, this.id, machine);
        };
        if (machine.getTransition(i,j)){
            input.value = machine.getTransition(i,j);
        }

        var div = document.createElement( 'div');
        div.className = "form-group has-success";
        div.id = "form-group" + input.id;
        div.appendChild(input);
        return div;
    };

    /**
     * Generates HTML input form to change expressions for output variables in a given state
     *
     * @method createFormElementForOutputVariablesEquation
     * @private
     * @param {int} i state the expression is valid
     * @param {int} k index of output variable
     * @param {String} tableName name of table
     * @param {TTable} machine
     * @return {HTMLElement} Returns HTMLElement input form
     */
    var createFormElementForOutputVariablesEquation = function (i, k, tableName, machine) {

        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control input-sm TransitionTable";
        input.onblur = function () {setOutputEquationInTTable(document.getElementById(this.id).value, this.id, machine)};
        input.id = tableName + "y";
        input.id += k;
        input.id += i;

        var equation;
        var index;
        try {
            equation = machine.getOutputEquation(i,"y"+k);
        }
        catch(err){
            equation = "y=0";
        }
        index = equation.search("=");
        if (equation.slice(index+1) != "0") {
            input.value = equation.slice(index + 1);
        }

        var div = document.createElement( 'div');
        div.className = "form-group has-success";
        div.id = "form-group" + input.id;
        div.appendChild(input);
        return div;
    };

    /**
     * sets Transition in instance of TTable that table was generated with
     *
     * @method setTransitionInTTable
     * @private
     * @param {String} expression expression that was entered
     * @param {String} formID ID of HTML form element
     * @param {TTable} machine TTable instance that has to be changed
     */
    var setTransitionInTTable = function (expression, formID, machine) {
        var success = true;
        expression = expression.replace(/\s/g, '');
        document.getElementById(formID).value = expression;
        var changed = true;
        var existing = false;
        var oldExpression;
        var transition = formID.slice(-4);

        if (machine.getTransition(parseInt(transition.slice(0, 2)), parseInt(transition.slice(-2)))){
            oldExpression = machine.getTransition(parseInt(transition.slice(0, 2)), parseInt(transition.slice(-2)));
            existing = true;
        }

        if (existing){
            if (oldExpression == expression){
                changed = false;
            }
        }

        try {
            if (changed) {
                if (expression.length == 0) {
                    machine.setTransition("0", parseInt(transition.slice(0, 2)), parseInt(transition.slice(-2)));
                } else {
                    machine.setTransition(expression, parseInt(transition.slice(0, 2)), parseInt(transition.slice(-2)));
                }
            }
        }
        catch(err) {
            success = false;
            var errorMessage = err.toString();
        }
        finally {
            if (changed){
                machine.ChangeStruct.Inputs[0] = true;
                machine.ChangeStruct.Inputs[2] = true;
                machine.ChangeStruct.Inputs[3] = true;
                machine.ChangeStruct.Outputs[0] = true;
                machine.ChangeStruct.Outputs[1] = true;
                machine.ChangeStruct.Outputs[2] = true;
                machine.ChangeStruct.Outputs[3] = true;
                machine.ChangeStruct.SimFlops[0] = true;
                machine.ChangeStruct.SimFlops[1] = true;
            }
            var td = document.getElementById("form-group" + formID).parentNode;
            if (success){
                document.getElementById("form-group" + formID).className = "form-group has-success";
                td.className = "";
            } else {
                document.getElementById("form-group" + formID).className = "form-group has-error";
                td.className = "bg-danger";
                document.getElementById(formID.slice(0,-5) + "ErrorBox").style.visibility = "visible";
                if (errorMessage.slice(131,-2).length ==  0) {
                    document.getElementById(formID.slice(0, -5) + "ErrorText").innerHTML = "Warnung! Transition&auml;nderung wurde nicht &uuml;bernommen. Unklarer Gebrauch der Operatoren.";
                } else {
                    document.getElementById(formID.slice(0, -5) + "ErrorText").innerHTML = "Warnung! Transition&auml;nderung wurde nicht &uuml;bernommen. Gebrauch von unbekannten Eingangsvariablen und/oder Operatoren: " + errorMessage.slice(130);
                }
            }
        }
    };

    /**
     * sets output equation in the instance of TTable that table was generated with
     *
     * @method setOutputEquationInTTable
     * @private
     * @param {String} expression expression that was entered
     * @param {String} formID ID of HTML form element
     * @param {TTable} machine TTable instance that has to be changed
     */
    var setOutputEquationInTTable = function (expression, formID, machine) {

        var success = true;
        var transition = formID.slice(-2);
        var changed = true;
        var oldExpression;

        var equation;
        var index;
        try {
            equation = machine.getOutputEquation(parseInt(transition.slice(-1)),"y"+ transition.slice(0, 1));
        }
        catch(err){
            equation = "y=0";
        }
        index = equation.search("=");
        if (equation.slice(index+1) != "0") {
            oldExpression = equation.slice(index + 1);
        }

        if (oldExpression == expression){
            changed = false;
        }

        if (/\S/.test(expression)) {
            try {
                if (changed) {
                    machine.setOutputEquation(parseInt(transition.slice(-1)), "y" + transition.slice(0, 1) + "=" + expression);
                }
            }
            catch (err) {
                success = false;
                var errorMessage = err.toString();
            }
            finally {
                var td = document.getElementById("form-group" + formID).parentNode;
                if (success) {
                    document.getElementById("form-group" + formID).className = "form-group has-success";
                    td.className = "";
                } else {
                    document.getElementById("form-group" + formID).className = "form-group has-error";
                    td.className = "bg-danger";
                    document.getElementById(formID.slice(0, -3) + "ErrorBox").style.visibility = "visible";
                    if (errorMessage.slice(120).replace(/\s/g, '').length <=  2) {
                        document.getElementById(formID.slice(0, -3) + "ErrorText").innerHTML = "Warnung! Transition&auml;nderung wurde nicht &uuml;bernommen. Unklarer Gebrauch der Operatoren.";
                    } else {
                        document.getElementById(formID.slice(0, -3) + "ErrorText").innerHTML = "Warnung! Z-Gleichung wurde nicht &uuml;bernommen. Gebrauch von unbekannten Eingangsvariablen und/oder Operatoren: " + errorMessage.slice(120);
                    }
                }
            }
        } else {
            try {
                machine.setOutputEquation(parseInt(transition.slice(-1)), "y" + transition.slice(0, 1) + "=0");
                document.getElementById(formID).value = "";
            }
            catch (err) {
                console.log(err.toString());
            }
        }
        if (changed) {
            machine.ChangeStruct.Inputs[0] = true;
            machine.ChangeStruct.Inputs[2] = true;
            machine.ChangeStruct.Inputs[3] = true;
            machine.ChangeStruct.Outputs[0] = true;
            machine.ChangeStruct.Outputs[1] = true;
            machine.ChangeStruct.Outputs[2] = true;
            machine.ChangeStruct.Outputs[3] = true;
            machine.ChangeStruct.SimFlops[0] = true;
            machine.ChangeStruct.SimFlops[1] = true;
        }
    };

    return {
        generateTransitionTable: generateTransitionTable
    };
})();