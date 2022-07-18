/**
 * Created by luucy on 14.06.15.
 */


var Equations = (function (){
    var  equations = [];
    var equationNormalizer = new EquationNormalizer();
    var qmc = new QMC();
    /////////////////////////
    var expressions = [];
    var expressionsZ = [];
    var expressionsWithNames = [];
    var expressionsWithNamesZ = [];
    var minimizedExpressions = [];
    var minimizedExpressionsZ = [];
    var minimizedWithHExpressions = [];
    var minimizedWithHExpressionsZ = [];
    var canonCDNFExpressions = [];
    var canonCCNFExpressions = [];
    var paraExpressions = [];
    var minimizedParaExpressions = [];
    var minimizedWithH = false;
    var minimized = false;
    var canonCDNF = false;
    var canonCCNF = false;
    var tableNameGlobalZ;
    var tableNameGlobalY;
    var tableNameGlobalPara;


    var generateTable = function(editable,machine,ID,tableName) {
        minimizedWithH = false;
        minimized = false;
        canonCDNF = false;
        canonCCNF = false;
        var divPanelAndTable = document.createElement('div');
        divPanelAndTable.className = "container";
        divPanelAndTable.id = tableName + "EquationsPanels";

        if (editable) {
            var divRow = document.createElement('div');
            divRow.className = "row";
            divRow.appendChild(createPanelElement(1, machine));
            divRow.appendChild(createPanelElement(2, machine));
            divRow.appendChild(createPanelElement(3, machine));
            divPanelAndTable.appendChild(divRow);
        }


        var divContainer = document.getElementById(ID);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(divPanelAndTable, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(divPanelAndTable);
        }
        $('[data-toggle="confirmation-1-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",1,"",machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        $('[data-toggle="confirmation-2-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",2,"",machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        $('[data-toggle="confirmation-3-minus"]').confirmation({onConfirm: function(){executeOnButton("minus",3,"",machine)},placement:"bottom",title:"Sind Sie sicher? Es koennen Daten verloren gehen",btnOkLabel:"Ja",btnCancelLabel:"Nein"});
        try {
            $('[data-i18n]').i18n();
        }
        catch(e){}
    };

    var generateTableZ = function(editable,machine,ID,tableName){
        tableNameGlobalZ = tableName;
        expressionsZ = [];
        expressionsWithNamesZ = [];
        minimizedExpressionsZ = [];
        minimizedWithHExpressionsZ = [];
        canonCDNFExpressions = [];
        canonCCNFExpressions = [];
        minimizedWithH = false;
        minimized = false;
        canonCDNF = false;
        canonCCNF = false;
        var states = machine.StateNumber;

        var containerZ = document.createElement('div');
        containerZ.className = "container";
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table MachineTable";
        table.border = 0;
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");

        if (editable) {
            var row = document.createElement("tr");
            var transitionCell = document.createElement("th");
            transitionCell.className = "MTableLastInputVariable";
            transitionCell.id = "ztitle";
            transitionCell.innerHTML = "<span data-i18n='global.zEquation'></span>";
            transitionCell.style.textAlign = "center";
            transitionCell.colSpan = states + 1;
            row.appendChild(transitionCell);
            tblBody.appendChild(row);
        }

        // Berechnung Anzahl der z-Gleichungen
        var z = Math.ceil((Math.log(states) / Math.log(2)));
        for (var i = 0; i < z; i++) {
            var row = document.createElement("tr");
            if (editable) {

                var cell = document.createElement("td");

                var formHorzion = document.createElement("form");
                formHorzion.className = "form-horizontal";

                var formGroup = document.createElement("div");
                formGroup.className = "form-group has-feedback has-success";
                formGroup.id = tableName + "zGleichungen" + i + "FormGroup";

                var label = document.createElement("label");
                label.className = "col-sm-2 control-label";
                label.style.color = "white";
                label.htmlFor = tableName + "z" + i;
                label.appendChild(createVariableElement("z",i,"",machine));

                var span = document.createElement('span');
                //span.className = "glyphicon glyphicon-ok form-control-feedback";
                span.id = tableName + "zGleichungen" + i + "Span";

                var div = document.createElement("div");
                div.className = "col-sm-10";
                div.appendChild(createFormElementForZExpressions(i,tableName,machine));
                div.appendChild(span);
                formGroup.appendChild(label);
                formGroup.appendChild(div);
                formHorzion.appendChild(formGroup);
                cell.appendChild(formHorzion);

                row.appendChild(cell);

            }else {
                for (var j = 0; j < 2; j++) {

                    var cell = document.createElement("td");
                    if (j == 0) {
                        var inputVariableForm = createVariableElement("z", i, "", machine);
                        cell.className = "col-sm-1";
                        cell.style.verticalAlign = "top";
                        inputVariableForm.className = "pull-right";
                        cell.appendChild(inputVariableForm);
                    } else {
                        cell.className = "col-sm-11";
                        cell.style.textAlign = "left";
                        var expression = document.createElement("h");
                        var equation = "";
                        try {
                            equation = (machine.getZEquation("z" + i,false,false,true,true).slice(3));
                        }
                        catch (err) {
                            equation = "0";
                        }
                        equation = replaceOROperatorInEquation(equation);
                        expression.innerHTML = equation;
                        cell.appendChild(expression);
                    }
                    row.appendChild(cell);
                }
            }
            tblBody.appendChild(row);
        }


        table.appendChild(tblBody);
        var divContainer = document.getElementById(ID);

        if (!editable) {
            var coldiv = document.createElement('div');
            coldiv.className = "col-md-12";
            var panelDiv = document.createElement('div');
            panelDiv.className = "panel panel-default MachineTable";
            var panelHead = document.createElement('div');
            panelHead.className = "panel-heading MachineTable clearfix";
            var heading = document.createElement('h1');
            heading.className = "panel-title pull-left";
            heading.innerHTML = "<span data-i18n='global.zEquation'></span>";
            var panelBody = document.createElement('div');
            panelBody.className = "panel-body col-sm 12 MachineTable";
            panelBody.id = tableName + "PanelBody";

            panelHead.appendChild(heading);
            panelHead.appendChild(createButtonGroupZEquations(tableName,machine));
            panelDiv.appendChild(panelHead);
            panelDiv.appendChild(panelBody);
            coldiv.appendChild(panelDiv);

            panelBody.appendChild(table);
            containerZ.appendChild(coldiv);
            if (divContainer.childNodes[0]) {
                divContainer.replaceChild(containerZ, divContainer.childNodes[0]);
            } else {
                divContainer.appendChild(containerZ);
            }
        } else {
            containerZ.appendChild(table);
            if (divContainer.childNodes[0]) {
                divContainer.replaceChild(containerZ, divContainer.childNodes[0]);
            } else {
                divContainer.appendChild(containerZ);
            }
        }
        try {
            $('[data-i18n]').i18n();
        }
        catch(e){}
    };

    var generateTableY = function(editable,machine,ID,tableName){
        tableNameGlobalY = tableName;
        expressions = [];
        expressionsWithNames = [];
        minimizedExpressions = [];
        minimizedWithHExpressions = [];
        canonCDNFExpressions = [];
        canonCCNFExpressions = [];
        minimizedWithH = false;
        minimized = false;
        canonCDNF = false;
        canonCCNF = false;
        var numberOutputVariables = machine.OutputNumber;

        var containerY = document.createElement('div');
        containerY.className = "container";
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table MachineTable";
        table.style.textAlign = "left";
        table.style.width = "100%";
        table.border = 0;
        var tblBody = document.createElement("tbody");

        if (editable) {
            var row = document.createElement("tr");
            var transitionCell = document.createElement("th");
            transitionCell.className = "MTableLastInputVariable";
            transitionCell.id = "ytitle";
            transitionCell.innerHTML = "<span data-i18n='global.yEquation'></span>";
            transitionCell.style.textAlign = "center";
            transitionCell.colSpan = 3;
            row.appendChild(transitionCell);
            tblBody.appendChild(row);
        }


        //Anzahl y-Variablen
        var y = numberOutputVariables;

        for (var i = 0; i < y; i++) {
            var row = document.createElement("tr");
            if (editable) {

                var cell = document.createElement("td");

                //1.Spalte mit y-Variablen, Möglichkeit der Variablennamenänderung
                //var inputVariableForm = createVariableElement("y", i, "", machine);
                //cell.appendChild(inputVariableForm);

                //2.Spalte für Gleichungseingabe

                var formHorzion = document.createElement("form");
                formHorzion.className = "form-horizontal";

                var formGroup = document.createElement("div");
                formGroup.className = "form-group has-feedback has-success";
                formGroup.id = tableName + "yGleichungen" + i + "FormGroup";

                var label = document.createElement("label");
                label.className = "col-sm-2 control-label";
                label.style.color = "white";
                label.htmlFor = tableName + "y" + i;
                label.appendChild(createVariableElement("y",i,"",machine));

                var span = document.createElement('span');
                //span.className = "glyphicon glyphicon-ok form-control-feedback";
                span.id = tableName + "yGleichungen" + i + "Span";

                var div = document.createElement("div");
                div.className = "col-sm-10";
                div.appendChild(createFormElementForOutputVariablesEquation(i,tableName,machine));
                div.appendChild(span);
                formGroup.appendChild(label);
                formGroup.appendChild(div);
                formHorzion.appendChild(formGroup);
                cell.appendChild(formHorzion);

                row.appendChild(cell);
            } else {
                for (var j = 0; j < 2; j++) {

                    var cell = document.createElement("td");
                    if (j == 0) {
                        var inputVariableForm = createVariableElement("y", i, "", machine);
                        if (machine.Outputnames.length > 0){
                            cell.className = "col-sm-2";
                        } else {
                            cell.className = "col-sm-1";
                        }
                        cell.style.verticalAlign = "top";
                        inputVariableForm.className = "pull-right";
                        cell.appendChild(inputVariableForm);
                    } else {
                        if (machine.Outputnames.length > 0){
                            cell.className = "col-sm-10";
                        } else {
                            cell.className = "col-sm-11";
                        }
                        cell.style.textAlign = "left";
                        var expression = document.createElement("h");
                        expression.className = "pull-left";
                        var equation;
                        var index;
                        try {
                            equation = machine.getYEquation("y" + i,false,false,true,true);
                        }
                        catch (err) {
                            equation = "y=0";
                        }
                        index = equation.search("=");
                        equation = equation.slice(index + 1);
                        equation = replaceOROperatorInEquation(equation);
                        expression.innerHTML = equation;
                        cell.appendChild(expression);
                    }
                    row.appendChild(cell);
                }
            }
            tblBody.appendChild(row);
        }



        table.appendChild(tblBody);

        var divContainer = document.getElementById(ID);

        if (editable) {
            var errorBox = document.createElement('div');
            errorBox.className = "alert fade in bg-danger";
            errorBox.id = "ErrorBox";
            errorBox.style.visibility = "hidden";
            var closeButton = document.createElement('button');
            closeButton.type = "button";
            closeButton.className = "close";
            closeButton.onclick = function () {
                document.getElementById("ErrorBox").style.visibility = "hidden";
            };
            var icon = document.createElement('a');
            icon.className = "glyphicon glyphicon-remove";
            closeButton.appendChild(icon);
            var errorParagraph = document.createElement('p');
            errorParagraph.id = "ErrorText";
            errorParagraph.style.color = "black";

            errorBox.appendChild(closeButton);
            errorBox.appendChild(errorParagraph);

            containerY.appendChild(table);
            containerY.appendChild(errorBox);
        } else{
            var coldiv = document.createElement('div');
            coldiv.className = "col-md-12";
            var panelDiv = document.createElement('div');
            panelDiv.className = "panel panel-default MachineTable";
            var panelHead = document.createElement('div');
            panelHead.className = "panel-heading MachineTable clearfix";
            var heading = document.createElement('h1');
            heading.className = "panel-title pull-left";
            heading.innerHTML = "<span data-i18n='global.yEquation'></span>";
            var panelBody = document.createElement('div');
            panelBody.className = "panel-body MachineTable";
            panelBody.id = tableName + "PanelBody";

            panelHead.appendChild(heading);
            panelHead.appendChild(createButtonGroupYEquations(tableName,machine));
            panelDiv.appendChild(panelHead);
            panelDiv.appendChild(panelBody);
            coldiv.appendChild(panelDiv);

            panelBody.appendChild(table);
            containerY.appendChild(coldiv);

            if (divContainer.childNodes[0]) {
                divContainer.replaceChild(containerY, divContainer.childNodes[0]);
            } else {
                divContainer.appendChild(containerY);
            }
        }


        if (editable) {
            if (divContainer.childNodes[0]) {
                divContainer.replaceChild(containerY, divContainer.childNodes[0]);
            } else {
                divContainer.appendChild(containerY);
            }
        }
        try {
            $('[data-i18n]').i18n();
        }
        catch(e){}
    };

    var generateTableYPara = function(ID,tableName){
        tableNameGlobalPara = tableName;
        paraExpressions = [];
        var tmpMachine;

        var containerY = document.createElement('div');
        containerY.className = "container";
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-hover";
        table.style.textAlign = "left";
        table.style.width = "100%";
        table.border = 0;
        var tblBody = document.createElement("tbody");


        //Anzahl y-Variablen
        var tmpExpression,tmpStateBits;
        var maxOutputNumber = 0;
        var tmp = giftInput.getHighestMachineNumber();
        for (var i = 0; i <= tmp ; i++){
            tmpMachine = giftInput.getMachine(i);
            var tmpOutput = tmpMachine.OutputNumber;
            if(maxOutputNumber < tmpOutput){
                maxOutputNumber = tmpOutput;
            }
        }
        for(var i = 0; i < maxOutputNumber; i++){
            paraExpressions[i] = [];
        }
        for (var i = 0; i <= tmp ; i++){
            tmpMachine = giftInput.getMachine(i);
            tmpStateBits = tmpMachine.StateBits;
            for(var j = 0; j < maxOutputNumber; j++){
                tmpExpression = undefined;
                try {
                    tmpExpression = tmpMachine.getYEquation("y" + j, false, false, false, false);
                }
                catch(e){}
                if(tmpExpression == undefined){
                    tmpExpression = "y"+ j + "=0";
                }
                tmpExpression =  tmpExpression.split("=")[1];
                tmpExpression = Logic.evaluateExpression(tmpExpression);
                for(var k = 0; k < tmpStateBits; k++){
                    tmpExpression.renameVariable("z" + k, "a" + i + "z" + k);
                }
                paraExpressions[j][i] = tmpExpression.toString();
            }
        }
        for(var i = 0; i < paraExpressions.length; i++){
            paraExpressions[i] = paraExpressions[i].join("+");
            var sort = Logic.evaluateExpression(paraExpressions[i]);
            sort.SimpleReduce();
            sort.sortExp(false);
            paraExpressions[i] = sort.toString();
        }

        for (var i = 0; i < paraExpressions.length; i++) {
            var row = document.createElement("tr");
                for (var j = 0; j < 2; j++) {

                    var cell = document.createElement("td");
                    if (j == 0) {
                        var inputVariableForm = createVariableElement("y", i, "", machine);
                        if (machine.Outputnames.length > 0){
                            cell.className = "col-sm-2";
                        } else {
                            cell.className = "col-sm-1";
                        }
                        cell.style.verticalAlign = "top";
                        inputVariableForm.className = "pull-right";
                        cell.appendChild(inputVariableForm);
                    } else {
                        if (machine.Outputnames.length > 0){
                            cell.className = "col-sm-10";
                        } else {
                            cell.className = "col-sm-11";
                        }
                        cell.style.textAlign = "left";
                        var expression = document.createElement("h");
                        expression.className = "pull-left";
                        var equation;
                        var index;
                        equation = paraExpressions[i];
                        equation = replaceOROperatorInEquation(equation);
                        expression.innerHTML = equation;
                        cell.appendChild(expression);
                    }
                    row.appendChild(cell);
                }
                tblBody.appendChild(row);
            }



        table.appendChild(tblBody);

        var divContainer = document.getElementById(ID);


        var coldiv = document.createElement('div');
        coldiv.className = "col-md-12";
        var panelDiv = document.createElement('div');
        panelDiv.className = "panel panel-default";
        var panelHead = document.createElement('div');
        panelHead.className = "panel-heading clearfix";
        var heading = document.createElement('h1');
        heading.className = "panel-title pull-left";
        heading.innerHTML = "<span data-i18n='global.yEquation'></span>";
        var panelBody = document.createElement('div');
        panelBody.className = "panel-body";
        panelBody.id = tableName + "PanelBody";

        panelHead.appendChild(heading);
        panelHead.appendChild(createButtonGroupYEquationsPara(tableName,machine));
        panelDiv.appendChild(panelHead);
        panelDiv.appendChild(panelBody);
        coldiv.appendChild(panelDiv);

        panelBody.appendChild(table);
        containerY.appendChild(coldiv);


        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(containerY, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(containerY);
        }
        try {
            $('[data-i18n]').i18n();
        }
        catch(e){}
    };

    var createPanelElement = function(numberPanel, machine){
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
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 1, machine, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 1, machine, true));
                }
                if (machine.StateBits >= machine.MaxStateBits) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 1, machine, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 1, machine, true));
                }
                panelBody.appendChild(createStateBitNameRow(machine));
                break;
            case 2:
                heading.innerHTML = "<span data-i18n='settings.inputVars'></span>: " + machine.InputNumber;
                if (machine.InputNumber <= 0) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 2, machine, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 2, machine, true));
                }
                if (machine.InputNumber >= machine.MaxInputNumber) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 2, machine, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 2, machine, true));
                }
                panelBody.appendChild(createInputNameRow(machine));
                break;
            case 3:
                heading.innerHTML = "<span data-i18n='settings.outputVars'></span>: " + machine.OutputNumber;
                if (machine.OutputNumber <= 0) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 3, machine, false));
                } else {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("minus", 3, machine, true));
                }
                if (machine.OutputNumber >= machine.MaxOutputNumber) {
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 3, machine, false));
                } else{
                    buttonGroup.appendChild(createButtonToChangeMachineParameters("plus", 3, machine, true));
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
     * @param {Boolean} editable indicates if the button should be pressable
     * @return {HTMLElement} Returns HTMLElement button
     */
    var createButtonToChangeMachineParameters = function (fkt,buttonNumber,machine, editable) {
        var button = document.createElement('button');
        if (editable) {
            button.className = "btn btn-default btn-xs";
        } else {
            button.className = "btn btn-default btn-xs disabled";
        }
        button.style.float = "none";
        button.style.display = "inline-block";
        var glyphicon = document.createElement('a');
        var glyphicon = document.createElement('a');
        button.setAttribute("data-toggle","confirmation-"+buttonNumber+"-"+fkt);
        if (fkt == "plus"){
            glyphicon.className = "glyphicon glyphicon-plus MachineTable";
            button.onclick = function(){executeOnButton(fkt,buttonNumber,"",machine);};
        } else {
            glyphicon.className = "glyphicon glyphicon-minus MachineTable";
        }
        button.appendChild(glyphicon);
        return button;
    };

    var createVariableElement = function (variableName, index, age, machine) {
        var boldCell = document.createElement("h");
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
        var equal = document.createElement("b");
        equal.innerHTML = " = ";
        boldCell.appendChild(equal);
        return boldCell;
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
    };
    var createFormElementForOutputVariablesEquation = function (k, tableName,machine) {

        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control";
        //hier set y gleichungen in datentyp ?
        input.onblur = function () {
            input.value = input.value.replace(/\s/g, '');
            var success = true;
            try {
                machine.setYEquation("y" + k + "=" + input.value,false, false);
                Controller.changeStructSetAll(true,machine);
            }
            catch(err){
                document.getElementById("ErrorBox").style.visibility = "visible";
                document.getElementById("ErrorText").innerHTML = "Warnung! y-Gleichung wurde nicht &uuml;bernommen. Gebrauch von unbekannten Inputvariablen und/oder Opertatoren.";
                success = false;
            }
            finally{
                if (success){
                    document.getElementById(tableName + "yGleichungen" + k + "Span").className = "glyphicon glyphicon-ok form-control-feedback";
                    document.getElementById(tableName + "yGleichungen" + k + "FormGroup").className = "form-group has-feedback has-success";
                } else {
                    document.getElementById(tableName + "yGleichungen" + k + "Span").className = "glyphicon glyphicon-remove form-control-feedback";
                    document.getElementById(tableName + "yGleichungen" + k + "FormGroup").className = "form-group has-feedback has-error";
                }
            }
        };
        input.id = tableName + "y" + k;

        var equation;
        var index;
        try {
            equation = machine.getYEquation("y" + k,false,false,true,true);
        }
        catch(err){
            equation = "y=0";
        }
        index = equation.search("=");
        input.value = equation.slice(index+1);

        return input;
    };

    function createFormElementForZExpressions(i,tableName,machine){

        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control";
        //hier set z gleichungen in datentyp ?
        input.onblur = function () {
            var success = true;
            var previousEquation = "";
            try {
                previousEquation = machine.getZEquation("z" + i,false,false,true,true).slice(3);
            } catch(err){
                previousEquation = "0";
            }

            if (previousEquation != input.value) {
                try {
                    machine.setZEquation("z" + i + "=" + input.value,false,false);
                    Controller.changeStructSetAll(true,machine);
                }
                catch (err) {
                    document.getElementById("ErrorBox").style.visibility = "visible";
                    document.getElementById("ErrorText").innerHTML = "Warnung! z-Gleichung wurde nicht &uuml;bernommen. Gebrauch von unbekannten Inputvariablen und/oder Opertatoren.";
                    success = false;
                }
            }

            if (success){
                document.getElementById(tableName + "zGleichungen" + i + "Span").className = "glyphicon glyphicon-ok form-control-feedback";
                document.getElementById(tableName + "zGleichungen" + i + "FormGroup").className = "form-group has-feedback has-success";
            } else {
                document.getElementById(tableName + "zGleichungen" + i + "Span").className = "glyphicon glyphicon-remove form-control-feedback";
                document.getElementById(tableName + "zGleichungen" + i + "FormGroup").className = "form-group has-feedback has-error";
            }

        };
        input.id = tableName + "z"+ i;
        try {
            input.value = machine.getZEquation("z" + i,false,false,true,true).slice(3);
        }
        catch(err){
            input.value ="0";
        }
        return input;
    }

    var createStateBitNameRow = function(machine){
        var div = document.createElement('div');
        div.innerHTML = "Z = (";
        var stateNumber = Math.log(machine.StateNumber) / Math.log(2);
        for (var i = 0; i < stateNumber; i++){
            var bold = document.createElement('f');
            bold.innerHTML = "z";
            var sub = document.createElement('sub');
            sub.innerHTML = inverse(stateNumber,i).toString();
            bold.appendChild(sub);
            if (i < stateNumber-1) {
                bold.innerHTML += ", ";
            } else {
                bold.innerHTML += ")";
            }
            div.appendChild(bold);
        }
        return div;
    };

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
            div.innerHTML = "Y = 0";
        }
        return div;
    };

    var inverse = function (anzahl, position) {
        var inverseArray = [];
        for (var i = 0; i < anzahl; i++) {
            inverseArray.push(i);
        }
        inverseArray.reverse();
        return inverseArray[position];
    };

    var createButtonGroupYEquations = function(tableName,machine){

        /*var expressions = [];
         var expressionsWithNames = [];
         var minimizedExpressions = [];
         var minimizedWithHExpressions = [];
         var canonCDNFExpressions = [];
         var canonCCNFExpressions = [];
         var minimized = false;
         var minimizedWithH = false;
         var canonCDNF = false;
         var canonCCNF = false;*/
        for (var i = 0; i < machine.OutputNumber; i++) {
            var equation = "";
            var index;
            machine.ReturnWithNames = false;
            try {
                equation = machine.getYEquation("y"+ i,false,false,true,true);
            }
            catch (err) {
                equation = "y=0";
            }
            index = equation.search("=");
            equation = equation.slice(index+1);
            expressions[i] = equation;
            machine.ReturnWithNames = true;
            try {
                equation = machine.getYEquation("y"+ i,false,false,true,true);
            }
            catch (err) {
                equation = "y=0";
            }
            index = equation.search("=");
            equation = equation.slice(index+1).replace('*(1)','');
            expressionsWithNames.push(replaceOROperatorInEquation(equation));
        }

        var buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group pull-right";

        var leftButton = document.createElement('button');
        leftButton.type = "button";
        leftButton.className = "btn btn-default";
        leftButton.innerHTML = "<span data-i18n='qmc.unminimized'></span>";
        leftButton.id = tableName + "leftButton";
        var middleButton = document.createElement('button');
        middleButton.type = "button";
        middleButton.className = "btn btn-default";
        middleButton.innerHTML = "<span data-i18n='qmc.minimized'></span>";
        middleButton.id = tableName + "middleButton";
        var secondMiddleButton = document.createElement('button');
        secondMiddleButton.type = "button";
        secondMiddleButton.className = "btn btn-default";
        secondMiddleButton.innerHTML = "<span data-i18n='qmc.minimized_h'></span>";
        secondMiddleButton.id = tableName + "secondMiddleButton";
        var rightButton = document.createElement('button');
        rightButton.type = "button";
        rightButton.className = "btn btn-default";
        rightButton.innerHTML = "<span data-i18n='qmc.cdnf'></span>";
        var outerRightButton = document.createElement('button');
        outerRightButton.type = "button";
        outerRightButton.className = "btn btn-default";
        outerRightButton.innerHTML = "<span data-i18n='qmc.ccnf'></span>";
        if(giftInput.getHighestMachineNumber() > 0){
            rightButton.disabled = true;
            outerRightButton.disabled = true;
        }

        leftButton.onclick = function(){
            replacePanelYTable(tableName,expressionsWithNames,machine)

        };
        middleButton.onclick = function(){
            minimizedExpressions = [];
            //aus machine auslesen wenn möglich
            var existing = true;
            for(var i = 0; i < expressions.length; i++){
                try{
                    var equation = "";
                    var index;
                    machine.ReturnWithNames = true;
                    equation = machine.getYEquation("y" + i,true,false,true,true);
                    index = equation.search("=");
                    minimizedExpressions[i] = equation.slice(index+1);
                } catch(err){
                    existing = false;
                }
                if(!existing) {
                    Worker.qmcExec(expressions[i], "0", i,2);
                }
                else{
                    minimizedExpressions[i] = replaceOROperatorInEquation(minimizedExpressions[i]);
                }
            }
            if(existing){
                replacePanelYTable(tableNameGlobalY,minimizedExpressions,machine);
            }
        };

        secondMiddleButton.onclick = function(){
            machine.ReturnWithNames = false;
            var hReduce = machine.HReduce;
            minimizedWithHExpressions =[];
            for (var i = 0; i < expressions.length; i++) {
                //Holen wenn schon existiert
                var existing = true;
                try {
                    var equation = "";
                    var index;
                    machine.ReturnWithNames = true;
                    equation = machine.getYEquation("y" + i, true, true,true,true);
                    index = equation.search("=");
                    minimizedWithHExpressions[i] = equation.slice(index+1);
                } catch (err) {
                    existing = false;
                }
                //Kürzeste Gleichung holen also minimiert, wenn nicht dann unminimiert
                var shortestZEquation = "";
                machine.ReturnWithNames = false;
                try {
                    shortestZEquation = machine.getYEquation("y" + i, true, false,true,true).slice(3);
                } catch (err) {
                    shortestZEquation = expressions[i];
                }
                if (!existing) {
                    Worker.qmcExec(expressions[i], hReduce, i, 3);
                }
                else {
                    minimizedWithHExpressions[i] = replaceOROperatorInEquation(minimizedWithHExpressions[i]);
                }
            }
            if(existing){
                replacePanelYTable(tableNameGlobalY,minimizedWithHExpressions,machine);
            }
        };

        rightButton.onclick = function(){
            canonCDNFExpressions = [];
            for (var i = 0; i < expressions.length; i++) {
                //minimieren
                var equation;
                var index;
                equation = equationNormalizer.normalizeZToCDNF("y" + i + "=" + expressions[i],machine.InputNumber,machine.StateBits);
                index = equation.search("=");
                equation = equation.slice(index+1);
                if (equation == ""){
                    equation = "0"
                }

                //umwandeln in equation mit namen
                console.log(canonCDNFExpressions[i]);
                canonCDNFExpressions[i] = machine.NormalEquationToEquation(equation);
                console.log('s ' + canonCDNFExpressions[i]);

                //From anpassen
                canonCDNFExpressions[i] = replaceOROperatorInEquation(canonCDNFExpressions[i]);

            }

            replacePanelYTable(tableName,canonCDNFExpressions,machine);
        };

        outerRightButton.onclick = function(){
            canonCCNFExpressions = [];
            for (var i = 0; i < expressions.length; i++) {
                //minimieren
                var equation;
                var index;
                equation = equationNormalizer.normalizeZToCCNF("y" + i + "=" + expressions[i],machine.InputNumber,machine.StateBits);
                index = equation.search("=");
                equation = equation.slice(index+1);
                if (equation == ""){
                    equation = "0"
                }

                //umwandeln in equation mit namen
                canonCCNFExpressions[i] = machine.NormalEquationToEquation(equation);

                //From anpassen
                canonCCNFExpressions[i] = replaceANDOperatorInEquation(canonCCNFExpressions[i]);
            }
            replacePanelYTable(tableName,canonCCNFExpressions,machine);
        };

        buttonGroup.appendChild(leftButton);
        buttonGroup.appendChild(middleButton);
        buttonGroup.appendChild(secondMiddleButton);
        buttonGroup.appendChild(rightButton);
        buttonGroup.appendChild(outerRightButton);
        return buttonGroup;
    };

    var createButtonGroupYEquationsPara = function(tableName,machine){

        var buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group pull-right";

        var leftButton = document.createElement('button');
        leftButton.type = "button";
        leftButton.className = "btn btn-default";
        leftButton.innerHTML = "<span data-i18n='qmc.unminimized'></span>";
        var middleButton = document.createElement('button');
        middleButton.type = "button";
        middleButton.className = "btn btn-default";
        middleButton.innerHTML = "<span data-i18n='qmc.minimized'></span>";

        leftButton.onclick = function(){
            for(var i = 0; i < paraExpressions.length; i++){
                paraExpressions[i] = replaceOROperatorInEquation(paraExpressions[i]);
            }
            replacePanelYTablePara(tableName,paraExpressions,machine)

        };
        middleButton.onclick = function(){
            minimizedParaExpressions = [];
            //aus machine auslesen wenn möglich
            var existing = true;
            for(var i = 0; i < paraExpressions.length; i++){
                try{
                    machine.ReturnWithNames = true;
                    minimizedParaExpressions[i] = giftInput.getYEquation(i,true,false);
                } catch(err){
                    existing = false;
                }
                if(minimizedParaExpressions[i] == undefined) {
                    existing = false;
                }
                if(!existing) {
                    Worker.qmcExec(paraExpressions[i], "0", i,6);
                }
                else{
                    minimizedParaExpressions[i] = replaceOROperatorInEquation(minimizedParaExpressions[i]);
                }
            }
            if(existing){
                replacePanelYTablePara(tableName,minimizedParaExpressions,machine)
            }
        };
        buttonGroup.appendChild(leftButton);
        buttonGroup.appendChild(middleButton);
        return buttonGroup;
    };

    var createButtonGroupZEquations = function(tableName,machine){

        for (var i = 0; i < machine.StateBits; i++) {
            var equation = "";
            machine.ReturnWithNames = false;
            try {
                equation = machine.getZEquation("z" + i,false,false,true,true).slice(3);
            }
            catch (err) {
                equation = "0";
            }
            equation = equation.replace(/\s/g, '');
            expressionsZ.push(equation);
            machine.ReturnWithNames = true;
            try {
                equation = machine.getZEquation("z" + i,false,false,true,true).slice(3);
            }
            catch (err) {
                equation = "0";
            }
            expressionsWithNamesZ.push(replaceOROperatorInEquation(equation));
        }

        var buttonGroup = document.createElement('div');
        buttonGroup.className = "btn-group pull-right";
        var leftButton = document.createElement('button');
        leftButton.type = "button";
        leftButton.className = "btn btn-default";
        leftButton.innerHTML = "<span data-i18n='qmc.unminimized'></span>";
        var middleButton = document.createElement('button');
        middleButton.type = "button";
        middleButton.className = "btn btn-default";
        middleButton.innerHTML = "<span data-i18n='qmc.minimized'></span>";
        var secondMiddleButton = document.createElement('button');
        secondMiddleButton.type = "button";
        secondMiddleButton.className = "btn btn-default";
        secondMiddleButton.innerHTML = "<span data-i18n='qmc.minimized_h'></span>";
        var rightButton = document.createElement('button');
        rightButton.type = "button";
        rightButton.className = "btn btn-default";
        rightButton.innerHTML = "<span data-i18n='qmc.cdnf'></span>";
        var outerRightButton = document.createElement('button');
        outerRightButton.type = "button";
        outerRightButton.className = "btn btn-default";
        outerRightButton.innerHTML = "<span data-i18n='qmc.ccnf'></span>";
        if(giftInput.getHighestMachineNumber() > 0){
            rightButton.disabled = true;
            outerRightButton.disabled = true;
        }

        leftButton.onclick = function (){
            replacePanelZTable(tableName,expressionsWithNamesZ,machine)
        };

        middleButton.onclick = function(){
            minimizedExpressionsZ = [];
            //aus machine auslesen wenn möglich
            var existing = true;
            for(var i = 0; i < expressionsZ.length; i++){
                try{
                    machine.ReturnWithNames = true;
                    minimizedExpressionsZ[i] = machine.getZEquation("z" + i,true,false,true,true).slice(3);
                } catch(err){
                    existing = false;
                }
                if(!existing) {
                    Worker.qmcExec(expressionsZ[i], "0", i,0);
                }
                else{
                    minimizedExpressionsZ[i] = replaceOROperatorInEquation(minimizedExpressionsZ[i]);
                }
            }
            if(existing){
                replacePanelZTable(tableNameGlobalZ,minimizedExpressionsZ,machine);
            }
        };


        secondMiddleButton.onclick = function(){
            machine.ReturnWithNames = false;
            var hReduce = machine.HReduce;
            minimizedWithHExpressionsZ =[];
            for (var i = 0; i < expressionsZ.length; i++) {
                //Holen wenn schon existiert
                var existing = true;
                try {
                    machine.ReturnWithNames = true;
                    minimizedWithHExpressionsZ[i] = machine.getZEquation("z" + i, true, true,true,true).slice(3);
                } catch (err) {
                    existing = false;
                }
                //Kürzeste Gleichung holen also minimiert, wenn nicht dann unminimiert
                var shortestZEquation = "";
                machine.ReturnWithNames = false;
                try {
                    shortestZEquation = machine.getZEquation("z" + i, true, false,true,true).slice(3);
                } catch (err) {
                    shortestZEquation = expressionsZ[i];
                }
                if (!existing) {
                    Worker.qmcExec(expressionsZ[i], hReduce, i, 1);
                }
                else {
                    minimizedExpressionsZ[i] = replaceOROperatorInEquation(minimizedExpressionsZ[i]);
                }
            }
            if(existing){
                replacePanelZTable(tableNameGlobalZ,minimizedExpressionsZ,machine);
            }
        };

        rightButton.onclick = function(){
            canonCDNFExpressions = [];
            for (var i = 0; i < expressionsZ.length; i++) {
                //minimieren
                var equation;
                var index;
                equation = equationNormalizer.normalizeZToCDNF("z" + i + "=" + expressionsZ[i],machine.InputNumber,machine.StateBits);
                index = equation.search("=");
                equation = equation.slice(index+1);
                if (equation == ""){
                    equation = "0";
                }

                //umwandeln in equation mit namen
                canonCDNFExpressions[i] = machine.NormalEquationToEquation(equation);

                //Form anpassen
                canonCDNFExpressions[i] = replaceOROperatorInEquation(canonCDNFExpressions[i]);
            }
            replacePanelZTable(tableName,canonCDNFExpressions,machine);
        };

        outerRightButton.onclick = function(){

            canonCCNFExpressions = [];
            for (var i = 0; i < expressionsZ.length; i++) {
                //minimieren
                var equation;
                var index;
                equation = equationNormalizer.normalizeZToCCNF("z" + i + "=" + expressionsZ[i],machine.InputNumber,machine.StateBits);
                index = equation.search("=");
                equation = equation.slice(index+1);
                if (equation == ""){
                    equation = "0";
                }
                //umwandeln in equation mit namen
                canonCCNFExpressions[i] = machine.NormalEquationToEquation(equation);

                //Form anpassen
                canonCCNFExpressions[i] = replaceANDOperatorInEquation(canonCCNFExpressions[i]);
            }
            replacePanelZTable(tableName,canonCCNFExpressions,machine);
        };

        buttonGroup.appendChild(leftButton);
        buttonGroup.appendChild(middleButton);
        buttonGroup.appendChild(secondMiddleButton);
        buttonGroup.appendChild(rightButton);
        buttonGroup.appendChild(outerRightButton);
        return buttonGroup;
    };

    var setMinimizedExpressions = function(expression,i,mode){
        var tempMinimizedExpressions = [];
        switch(mode){
            case 0:
                minimizedExpressionsZ[i] = expression;
                tempMinimizedExpressions = minimizedExpressionsZ;
                var executeClick = true;
                if(tempMinimizedExpressions.length === expressionsZ.length){
                    for(var i = 0; i < tempMinimizedExpressions.length; i++){
                        if(tempMinimizedExpressions[i] == undefined){
                            executeClick = false;
                        }
                    }
                    if(executeClick) {
                        changeProgressbarValue("progressbar1",'#');
                        middleButtonClickZ();
                    }
                }
                break;
            case 1:
                minimizedWithHExpressionsZ[i] = expression;
                tempMinimizedExpressions = minimizedWithHExpressionsZ;
                var executeClick = true;
                if(tempMinimizedExpressions.length === expressionsZ.length){
                    for(var i = 0; i < tempMinimizedExpressions.length; i++){
                        if(tempMinimizedExpressions[i] == undefined){
                            executeClick = false;
                        }
                    }
                    if(executeClick) {
                        changeProgressbarValue("progressbar1",'#');
                        secondMiddleButtonClickZ();
                    }
                }
                break;
            case 2:
                minimizedExpressions[i] = expression;
                tempMinimizedExpressions = minimizedExpressions;
                var executeClick = true;
                if(tempMinimizedExpressions.length === expressions.length){
                    for(var i = 0; i < tempMinimizedExpressions.length; i++){
                        if(tempMinimizedExpressions[i] == undefined){
                            executeClick = false;
                        }
                    }
                    if(executeClick) {
                        changeProgressbarValue("progressbar1",'#');
                        middleButtonClickY();
                    }
                }
                break;
            case 3:
                minimizedWithHExpressions[i] = expression;
                tempMinimizedExpressions = minimizedWithHExpressions;
                var executeClick = true;
                if(tempMinimizedExpressions.length === expressions.length){
                    for(var i = 0; i < tempMinimizedExpressions.length; i++){
                        if(tempMinimizedExpressions[i] == undefined){
                            executeClick = false;
                        }
                    }
                    if(executeClick) {
                        changeProgressbarValue("progressbar1",'#');
                        secondMiddleButtonClickY();
                    }
                }
                break;
            case 6:
                minimizedParaExpressions[i] = expression;
                tempMinimizedExpressions = minimizedParaExpressions;
                var executeClick = true;
                if(tempMinimizedExpressions.length === paraExpressions.length){
                    for(var i = 0; i < tempMinimizedExpressions.length; i++){
                        if(tempMinimizedExpressions[i] == undefined){
                            executeClick = false;
                        }
                    }
                    if(executeClick) {
                        changeProgressbarValue("progressbar1",'#');
                        middleButtonClickPara();
                    }
                }

        }

    };

    var middleButtonClickZ = function(){
        for (var i = 0; i < expressionsZ.length; i++) {
            try{
                machine.setZEquation("z" + i + "=" + minimizedExpressionsZ[i],true,false);
            } catch (err){
                console.log(err);
            }
            machine.ReturnWithNames = true;
            try{
                minimizedExpressionsZ[i] = machine.getZEquation("z" + i,true,false,true,true).slice(3);
            } catch(err){
                console.log(err);
            }
            //Form anpassen
            minimizedExpressionsZ[i] = replaceOROperatorInEquation(minimizedExpressionsZ[i]);
        }
        replacePanelZTable(tableNameGlobalZ,minimizedExpressionsZ,machine);
    };

    var secondMiddleButtonClickZ = function(){
        machine.ReturnWithNames = false;
        for (var i = 0; i < expressionsZ.length; i++) {
            //minimieren
            try {
                machine.setZEquation("z" + i + "=" + minimizedWithHExpressionsZ[i], true, true);
            } catch (err) {
                console.log(err);
            }
            //wieder rausholen
            machine.ReturnWithNames = true;
            try {
                minimizedWithHExpressionsZ[i] = machine.getZEquation("z" + i, true, true,true,true).slice(3);
            }
            catch (err) {
                console.log(err);
            }
            //Form anpassen
            minimizedWithHExpressionsZ[i] = replaceOROperatorInEquation(minimizedWithHExpressionsZ[i]);
        }

        replacePanelZTable(tableNameGlobalZ,minimizedWithHExpressionsZ,machine);
    };

    var middleButtonClickY = function(){
        for (var i = 0; i < expressions.length; i++) {
            try{
                machine.setYEquation("y" + i + "=" + minimizedExpressions[i],true,false);
            } catch (err){
                console.log(err);
            }
            machine.ReturnWithNames = true;
            try{
                var equation = "";
                var index;
                equation = machine.getYEquation("y" + i,true,false,true,true)
                index = equation.search("=");
                minimizedExpressions[i] = equation.slice(index+1);
            } catch(err){
                console.log(err);
            }
            //Form anpassen
            minimizedExpressions[i] = replaceOROperatorInEquation(minimizedExpressions[i]);
        }
        replacePanelYTable(tableNameGlobalY,minimizedExpressions,machine);
    };

    var middleButtonClickPara = function(){
        for (var i = 0; i < paraExpressions.length; i++) {
            try{
                giftInput.setYEquation(minimizedParaExpressions[i],i,true);
            } catch (err){
                console.log(err);
            }
            try{
                minimizedExpressions[i] = giftInput.getYEquation(i,true);
            } catch(err){
                console.log(err);
            }
            //Form anpassen
            minimizedExpressions[i] = replaceOROperatorInEquation(minimizedExpressions[i]);
        }
        replacePanelYTablePara(tableNameGlobalPara,minimizedParaExpressions,machine);
    };
    var secondMiddleButtonClickY = function(){
        machine.ReturnWithNames = false;
        for (var i = 0; i < expressions.length; i++) {
            //minimieren
            try {
                machine.setYEquation("y" + i + "=" + minimizedWithHExpressions[i], true, true);
            } catch (err) {
                console.log(err);
            }
            //wieder rausholen
            machine.ReturnWithNames = true;
            try {
                var equation = "";
                var index;
                machine.ReturnWithNames = true;
                equation = machine.getYEquation("y" + i, true, true,true,true);
                index = equation.search("=");
                minimizedWithHExpressions[i] = equation.slice(index+1);
            }
            catch (err) {
                console.log(err);
            }
            //Form anpassen
            minimizedWithHExpressions[i] = replaceOROperatorInEquation(minimizedWithHExpressions[i]);
        }
        replacePanelYTable(tableNameGlobalY,minimizedWithHExpressions,machine);

    };

    var replacePanelZTable = function(tableName,equationsArray,machine){
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table MachineTable";
        table.border = 0;
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");
        for (var i = 0; i < machine.StateBits; i++) {
            var row = document.createElement("tr");

            for (var j = 0; j < 2; j++) {
                var cell = document.createElement("td");
                if (j == 0) {
                    var inputVariableForm = createVariableElement("z", i, "", machine);
                    cell.className = "col-sm-1";
                    cell.style.verticalAlign = "top";
                    inputVariableForm.className = "pull-right";
                    cell.appendChild(inputVariableForm);
                } else {
                    cell.className = "col-sm-11";
                    cell.style.textAlign = "left";
                    var expression = document.createElement("h");
                    var tmpExpression = Logic.evaluateExpression(equationsArray[i]);
                    tmpExpression.SimpleReduce();
                    tmpExpression.sortExp(false);
                    expression.innerHTML = replaceOROperatorInEquation(tmpExpression.toString());
                    cell.appendChild(expression);
                }
                row.appendChild(cell);
            }
            tblBody.appendChild(row);
        }
        table.appendChild(tblBody);

        var panelBody = document.getElementById(tableName + "PanelBody");

        if (panelBody.childNodes[0]) {
            panelBody.replaceChild(table, panelBody.childNodes[0]);
        } else {
            panelBody.appendChild(table);
        }
    };

    var replacePanelYTable = function(tableName,equationsArray,machine){
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table MachineTable";
        table.border = 0;
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");
        for (var i = 0; i < machine.OutputNumber; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < 2; j++) {
                var cell = document.createElement("td");
                if (j == 0) {
                    var inputVariableForm = createVariableElement("y", i, "", machine);
                    if (machine.Outputnames.length > 0){
                        cell.className = "col-sm-2";
                    } else {
                        cell.className = "col-sm-1";
                    }
                    cell.style.verticalAlign = "top";
                    inputVariableForm.className = "pull-right";
                    cell.appendChild(inputVariableForm);
                } else {
                    if (machine.Outputnames.length > 0){
                        cell.className = "col-sm-10";
                    } else {
                        cell.className = "col-sm-11";
                    }
                    cell.style.textAlign = "left";
                    var expression = document.createElement("h");
                    var tmpExpression = Logic.evaluateExpression(equationsArray[i]);
                    tmpExpression.SimpleReduce();
                    tmpExpression.sortExp(false);
                    expression.innerHTML = replaceOROperatorInEquation(tmpExpression.toString());
                    cell.appendChild(expression);
                }
                row.appendChild(cell);
            }
            tblBody.appendChild(row);
        }
        table.appendChild(tblBody);

        var panelBody = document.getElementById(tableName + "PanelBody");

        if (panelBody.childNodes[0]) {
            panelBody.replaceChild(table, panelBody.childNodes[0]);
        } else {
            panelBody.appendChild(table);
        }
    };

    var replacePanelYTablePara = function(tableName,equationsArray,machine){
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-hover";
        table.border = 0;
        table.style.textAlign = "left";
        table.style.width = "100%";
        var tblBody = document.createElement("tbody");

        for (var i = 0; i < equationsArray.length; i++) {
            var tmpEquation = Logic.evaluateExpression(equationsArray[i]);
            tmpEquation.sortExp(false);
            tmpEquation.SimpleReduce();
            equationsArray[i] = tmpEquation.toString();
            var row = document.createElement("tr");
            for (var j = 0; j < 2; j++) {
                var cell = document.createElement("td");
                if (j == 0) {
                    var inputVariableForm = createVariableElement("y", i, "", machine);
                    if (machine.Outputnames.length > 0){
                        cell.className = "col-sm-2";
                    } else {
                        cell.className = "col-sm-1";
                    }
                    cell.style.verticalAlign = "top";
                    inputVariableForm.className = "pull-right";
                    cell.appendChild(inputVariableForm);
                } else {
                    if (machine.Outputnames.length > 0){
                        cell.className = "col-sm-10";
                    } else {
                        cell.className = "col-sm-11";
                    }
                    cell.style.textAlign = "left";
                    var expression = document.createElement("h");
                    expression.className = "pull-left";
                    expression.innerHTML = equationsArray[i];
                    cell.appendChild(expression);
                }
                row.appendChild(cell);
            }
            tblBody.appendChild(row);
        }
        table.appendChild(tblBody);

        var panelBody = document.getElementById(tableName + "PanelBody");

        if (panelBody.childNodes[0]) {
            panelBody.replaceChild(table, panelBody.childNodes[0]);
        } else {
            panelBody.appendChild(table);
        }
    };

    var replaceOROperatorInEquation = function(equation){

        var OROperator = "";
        for (var m=0; m < machine.OperatorsList.length; m++){
            if (machine.OperatorsList[m].slice(0,1) == "+"){
                OROperator = machine.OperatorsList[m].slice(-1);
            }
        }

        return equation.split(OROperator).join(" " + OROperator + " ");
    };

    var replaceANDOperatorInEquation = function(equation){

        var OROperator = "";
        for (var m=0; m < machine.OperatorsList.length; m++){
            if (machine.OperatorsList[m].slice(0,1) == "*"){
                OROperator = machine.OperatorsList[m].slice(-1);
            }
        }
        return equation.split(OROperator).join(" " + OROperator + " ");
    };

    return {
        generateTable: generateTable,
        generateTableZ: generateTableZ,
        generateTableY: generateTableY,
        generateTableYPara: generateTableYPara,
        setMinimizedExpressions : setMinimizedExpressions
    };

})();
