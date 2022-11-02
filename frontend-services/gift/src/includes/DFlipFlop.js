/**
 * Created by luucy on 16.06.15.
 */
var FlipFlop = (function (){

    var equations = [];
    var equationNormalizer = new EquationNormalizer();
    var qmc = new QMC();

    var expressionsZ = [];
    var expressionsWithNamesZ = [];
    var minimizedExpressionsZ = [];
    var minimizedWithHExpressionsZ = [];
    var canonCDNFExpressions = [];
    var canonCCNFExpressions = [];
    var minimizedWithH = false;
    var minimized = false;
    var canonCDNF = false;
    var canonCCNF = false;
    var tableNameGlobalZ;


    var generateTableD = function(editable,machine,ID,tableName){
        tableNameGlobalZ = tableName;
        expressionsZ = [];
        expressionsWithNamesZ = [];
        minimizedExpressionsZ = [];
        minimizedWithHExpressionsZ = [];
        var states = machine.StateNumber;

        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-hover";
        table.style.textAlign = "left";
        table.border = 0;
        table.style.width = "100%";
        var tblHeadRow = document.createElement('tr');
        var tblHeadCell = document.createElement('th');
        tblHeadCell.className = "clearfix";
        tblHeadCell.innerHTML = "D-FlipFlop";
        tblHeadCell.style.textAlign = "left";
        tblHeadCell.verticalAlign = "bottom";
        tblHeadCell.colSpan = 2;

        tblHeadCell.appendChild(createButtonGroupDEquations(tableName,machine));

        tblHeadRow.appendChild(tblHeadCell);
        table.appendChild(tblHeadCell);

        var tblBody = document.createElement("tbody");
        tblBody.id = tableName + "TableBody";

        // Berechnung Anzahl der z-Gleichungen
        var z = Math.ceil((Math.log(states) / Math.log(2)));
        for (var i = 0; i < z; i++) {
            var row = document.createElement("tr");
            for(var j = 0; j < 2; j++) {
                var cell = document.createElement("td");
                if (j==0) {
                    var inputVariableForm = createVariableElement("D", i, "");
                    cell.className = "col-sm-1";
                    cell.style.verticalAlign = "top";
                    inputVariableForm.className = "pull-right";
                    cell.appendChild(inputVariableForm);
                } else {
                    cell.className = "col-sm-11";
                    cell.style.textAlign = "left";
                    var expression = document.createElement("h");
                    //z-gleichungen aus datentyp berechnen?
                    var equation = "";
                    try {
                        equation = machine.getZEquation("z" + i,false,false,true,true).slice(3);
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

            tblBody.appendChild(row);
        }

        table.appendChild(tblBody);

        var divContainer = document.getElementById(ID);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(table, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(table);
        }
        $('[data-i18n]').i18n();
    };

    var generateTableJK = function(editable,machine,ID,tableName){

        var expressionsArray = JKFlipFlop.getEquation(machine);
        var states = machine.StateNumber;
        var table = document.createElement('table');
        table.id = tableName;
        table.className = "table table-hover";
        table.style.textAlign = "left";
        table.border = 0;
        table.style.width = "100%";
        var tblHeadRow = document.createElement('tr');
        var tblHeadCell = document.createElement('th');
        tblHeadCell.className = "clearfix";
        tblHeadCell.innerHTML = "JK-FlipFlop";
        tblHeadCell.style.textAlign = "left";
        tblHeadCell.colSpan = 2;

        //tblHeadCell.appendChild(createButtonGroupDEquations(tableName,machine));

        tblHeadRow.appendChild(tblHeadCell);
        table.appendChild(tblHeadCell);

        var tblBody = document.createElement("tbody");
        tblBody.id = tableName + "TableBody";

        // Berechnung Anzahl der z-Gleichungen
        var z = Math.ceil((Math.log(states) / Math.log(2)));
        var index = 0;
        for (var i = 0; i < 2*z; i++) {
            var row = document.createElement("tr");
            for(var j = 0; j < 2; j++) {
                var cell = document.createElement("td");
                if (j==0) {
                    if(i % 2 == 0) {
                        var inputVariableForm = createVariableElement("J", index, "");
                    } else {
                        var inputVariableForm = createVariableElement("K", index, "");
                    }
                    cell.className = "col-sm-1";
                    cell.style.verticalAlign = "top";
                    inputVariableForm.className = "pull-right";
                    cell.appendChild(inputVariableForm);
                } else {
                    cell.className = "col-sm-11";
                    cell.style.textAlign = "left";
                    var expression = document.createElement("h");
                    //z-gleichungen aus datentyp berechnen?
                    //equation = equation.split("+").join(" + ");
                    var equation = expressionsArray[index][i % 2];
                    equation = replaceOROperatorInEquation(equation);
                    var tmpExpression = Logic.evaluateExpression(equation);
                    tmpExpression.SimpleReduce();
                    tmpExpression.sortExp(false);
                    expression.innerHTML = tmpExpression.toString();
                    cell.appendChild(expression);
                }
                row.appendChild(cell);
            }
            if(i % 2 == 1) {
                index += 1;
            }
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

    var createVariableElement = function (variableName, index, age) {
        var boldCell = document.createElement("h");
        var exponent = document.createElement("sup");
        var indice = document.createElement("sub");
        var equal = document.createElement("h");
        exponent.innerHTML = age;
        boldCell.innerHTML = variableName;
        boldCell.insertBefore(exponent, boldCell.childNodes[0]);
        indice.innerHTML = index.toString();
        boldCell.appendChild(indice);
        equal.innerHTML = "=";
        boldCell.appendChild(equal);
        return boldCell;
    };

    var createButtonGroupDEquations = function(tableName,machine){

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
        leftButton.className = "btn btn-sm";
        leftButton.innerHTML = "<span data-i18n='qmc.unminimized'></span>";
        var middleButton = document.createElement('button');
        middleButton.type = "button";
        middleButton.className = "btn btn-sm";
        middleButton.innerHTML = "<span data-i18n='qmc.minimized'></span>";
        var secondMiddleButton = document.createElement('button');
        secondMiddleButton.type = "button";
        secondMiddleButton.className = "btn btn-sm";
        secondMiddleButton.innerHTML = "<span data-i18n='qmc.minimized_h'></span>";
        var rightButton = document.createElement('button');
        rightButton.type = "button";
        rightButton.className = "btn btn-sm";
        rightButton.innerHTML = "<span data-i18n='qmc.cdnf'></span>";
        var outerRightButton = document.createElement('button');
        outerRightButton.type = "button";
        outerRightButton.className = "btn btn-sm";
        outerRightButton.innerHTML = "<span data-i18n='qmc.ccnf'></span>";
        if(giftInput.getHighestMachineNumber() > 0){
            rightButton.disabled = true;
            outerRightButton.disabled = true;
        }

        leftButton.onclick = function (){
            replaceDTableBody(tableName,expressionsWithNamesZ,machine)
        };
        /*
        middleButton.onclick = function(){
            if (minimized == false) {
                for (var i = 0; i < expressions.length; i++) {
                    //aus machine auslesen wenn m�glich
                    var existing = true;
                    try{
                        machine.ReturnWithNames = true;
                        minimizedExpressions[i] = machine.getZEquation("z" + i,true,false).slice(3);
                    } catch(err){
                        existing = false;
                    }
                    //minimeren wenn noch nicht existiert und reinschreiben und wieder mit namen rausholen
                    if (!existing){
                        try{
                            machine.setZEquation("z" + i + "=" + qmc.compute(expressions[i]),true,false);
                        } catch (err){
                            console.log(err);
                        }
                        machine.ReturnWithNames = true;
                        try{
                            minimizedExpressions[i] = machine.getZEquation("z" + i,true,false).slice(3);
                        } catch(err){
                            console.log(err);
                        }
                    }
                    //Form anpassen
                    minimizedExpressions[i] = minimizedExpressions[i].split("+").join(" + ");
                    if (i == expressions.length-1) {
                        minimized = true;
                    }
                }
            }
            replaceDTableBody(tableName,minimizedExpressions,machine);
        };

        secondMiddleButton.onclick = function(){
            machine.ReturnWithNames = false;
            var hReduce = machine.HReduce;
            if (minimizedWithH == false) {
                for (var i = 0; i < expressions.length; i++) {
                    //Holen wenn schon existiert
                    var existing = true;
                    try{
                        machine.ReturnWithNames = true;
                        minimizedWithHExpressions[i] = machine.getZEquation("z" + i,true,true).slice(3);
                    } catch(err){
                        existing = false;
                    }
                    if (!existing) {
                        //K�rzeste Gleichung holen also minimiert, wenn nicht dann unminimiert
                        var shortestZEquation = "";
                        machine.ReturnWithNames = false;
                        try {
                            shortestZEquation = machine.getZEquation("z" + i, true, false).slice(3);
                        } catch (err) {
                            shortestZEquation = expressions[i];
                        }
                        //minimieren
                        try {
                            machine.setZEquation("z" + i + "=" + qmc.compute(shortestZEquation, hReduce), true, true);
                        } catch (err) {
                            console.log(err);
                        }
                        //wieder rausholen
                        machine.ReturnWithNames = true;
                        try {
                            minimizedWithHExpressions[i] = machine.getZEquation("z" + i, true, true).slice(3);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                    //Form anpassen
                    minimizedWithHExpressions[i] = minimizedWithHExpressions[i].split("+").join(" + ");
                    if (i == expressions.length-1) {
                        minimizedWithH = true;
                    }
                }
            }
            replaceDTableBody(tableName,minimizedWithHExpressions,machine);
        };
        */
        middleButton.onclick = function(){
            minimizedExpressionsZ = [];
            //aus machine auslesen wenn m�glich
            var existing = true;
            for(var i = 0; i < expressionsZ.length; i++){
                try{
                    machine.ReturnWithNames = true;
                    minimizedExpressionsZ[i] = machine.getZEquation("z" + i,true,false,true,true).slice(3);
                    //machine.setZEquation("z" + i + "=" + qmc.compute(expressions[i]),true,false)
                } catch(err){
                    existing = false;
                }
                if(!existing) {
                    Worker.qmcExec(expressionsZ[i], "0", i,4);
                }
                else{
                    minimizedExpressionsZ[i] = replaceOROperatorInEquation(minimizedExpressionsZ[i]);
                }
            }
            if(existing){
                replaceDTableBody(tableNameGlobalZ,minimizedExpressionsZ,machine);
            }
        };

        secondMiddleButton.onclick = function(){
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
                //K�rzeste Gleichung holen also minimiert, wenn nicht dann unminimiert
                var shortestZEquation = "";
                machine.ReturnWithNames = false;
                try {
                    shortestZEquation = machine.getZEquation("z" + i, true, false,true,true).slice(3);
                } catch (err) {
                    shortestZEquation = expressionsZ[i];
                }
                if (!existing) {
                    Worker.qmcExec(expressionsZ[i], hReduce, i, 5);
                }
                else {
                    minimizedExpressionsZ[i] = replaceOROperatorInEquation(minimizedExpressionsZ[i]);
                }
            }
            if(existing){
                replaceDTableBody(tableNameGlobalZ,minimizedExpressionsZ,machine);
            }
        };

        rightButton.onclick = function(){
            canonCDNFExpressions = [];
            for (var i = 0; i < expressionsZ.length; i++) {
                //minimieren
                var equation;
                var index;
                equation = equationNormalizer.normalizeZToCDNF("z" + i + "=" + expressionsZ[i],machine.InputNumber,machine.StateBits);

                if (equation != "") {
                    index = equation.search("=");
                    equation = equation.slice(index + 1);
                } else {
                    equation = "0";
                }

                //umwandeln in equation mit namen
                canonCDNFExpressions[i] = machine.NormalEquationToEquation(equation);

                //Form anpassen
                canonCDNFExpressions[i] = replaceOROperatorInEquation(canonCDNFExpressions[i]);
            }
            replaceDTableBody(tableName,canonCDNFExpressions,machine);
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
            replaceDTableBody(tableName,canonCCNFExpressions,machine);
        };

        buttonGroup.appendChild(leftButton);
        buttonGroup.appendChild(middleButton);
        buttonGroup.appendChild(secondMiddleButton);
        buttonGroup.appendChild(rightButton);
        buttonGroup.appendChild(outerRightButton);
        return buttonGroup;
    };

    var replaceDTableBody = function(tableName,equationsArray,machine){

        var tblBody = document.createElement("tbody");
        tblBody.id = tableName + "TableBody";
        for (var i = 0; i < machine.StateBits; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < 2; j++) {
                var cell = document.createElement("td");
                if (j == 0) {
                    var inputVariableForm = createVariableElement("D", i, "");
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

        var DTable = document.getElementById(tableName);

        if (document.getElementById(tableName + "TableBody")) {
            DTable.replaceChild(tblBody, document.getElementById(tableName + "TableBody"));
        } else {
            DTable.appendChild(tblBody);
        }
    };
    var setMinimizedExpressions = function(expression,i,mode){
        var tempMinimizedExpressions = [];
        switch(mode){
            case 4:
                minimizedExpressionsZ[i] = expression;
                tempMinimizedExpressions = minimizedExpressionsZ;
                var executeClick = true;
                if(tempMinimizedExpressions.length === expressionsZ.length){
                    for(var i = 0; i < minimizedExpressionsZ.length; i++){
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
            case 5:
                minimizedWithHExpressionsZ[i] = expression;
                tempMinimizedExpressions = minimizedWithHExpressionsZ;
                var executeClick = true;
                if(tempMinimizedExpressions.length === expressionsZ.length){
                    for(var i = 0; i < minimizedExpressionsZ.length; i++){
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
        replaceDTableBody(tableNameGlobalZ,minimizedExpressionsZ,machine);
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

        replaceDTableBody(tableNameGlobalZ,minimizedWithHExpressionsZ,machine);
    };

    var replaceOROperatorInEquation = function(equation){

        var OROperator = "";
        for (var m=0; m < machine.OperatorsList.length; m++){
            if (machine.OperatorsList[m].slice(0,1) == "+"){
                OROperator = machine.OperatorsList[m].slice(-1);
            }
        }
        return (equation == undefined) ? undefined : equation.split(OROperator).join(" " + OROperator + " ");
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

    return{
        generateTableD: generateTableD,
        generateTableJK: generateTableJK,
        setMinimizedExpression: setMinimizedExpressions
    };
})();