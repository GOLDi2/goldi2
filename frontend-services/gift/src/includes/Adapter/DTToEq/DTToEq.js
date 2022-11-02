/**
 * Created by Lennart on 07.06.2015.
 */
var DatatypToEquation = (function () {
    var currentTransition, i, j, k, index, binary, binaryPrefix, transition, newStateBits, oldStateBits, output, stateBits, zterm,  andOP, orOP, notOP, returnWithNames;
    var inputVariables = [];
    var outputVariables = [];
    var stateVariables = [];
    var parallelVariables = [];
    var stateNumber;
    var inputNumber;
    var outputNumber;
    var inputNames;
    var outputNames;

    var init = function (machine){
        inputNumber = machine.InputNumber;
        outputNumber = machine.OutputNumber;
        inputNames = machine.Inputnames;
        outputNames = machine.Outputnames;
        stateNumber = machine.StateNumber;
        andOP =  "*" ; //machine.OperatorsList[0];
        orOP = "+" ; // machine.OperatorsList[1];
        notOP = "/" ; //machine.OperatorsList[2];
        returnWithNames = machine.ReturnWithNames;
        machine.ReturnWithNames = true;
        stateBits = machine.StateBits;
    };
    var close = function (machine){
        machine.ReturnWithNames = returnWithNames;
    };

    var createNames = function () {
        for (i = 0; i < inputNumber; i++){
            inputVariables[i] = "x" + i;
        }
        for (i = 0; i < outputNumber; i++){
            outputVariables[i] = "y" + i;
        }
        for (k = 0; k < inputNames.length; k++) {
            i = inputNames[k].search("x");
            i = inputNames[k].slice(i + 1, i + 2);
            index = inputNames[k].search(":");
            inputVariables[i] = inputNames[k].slice(index + 1);
        }
        for (k = 0; k < outputNames.length; k++) {
            i = outputNames[k].search("y");
            i = outputNames[k].slice(i + 1, i + 2);
            index = outputNames[k].search(":");
            outputVariables[i] = outputNames[k].slice(index + 1);
        }
        for (i = 0; i < stateBits; i++){
            stateVariables[i] = "z" + i;
        }
        stateVariables.reverse();
    };
    var toBinary = function (number,length){
        var j;
        binary = number.toString(2);
        binaryPrefix = "";
        for (j = binary.length; j <= length-1; j++){
            binaryPrefix  += "0";
        }
        binary = binaryPrefix + binary;
        return binary;
    };
    var transformStates = function (machine){
        init(machine);
        createNames();
        var equations = [];
        for (i = 0; i < stateBits; i++){
            equations[i] = "";
        }
        for(i = 0; i < stateNumber; i++) {
            for (j = 0; j < stateNumber; j++) {
                newStateBits = toBinary(j, stateBits);
                oldStateBits = toBinary(i, stateBits);
                newStateBits = newStateBits.split("");
                oldStateBits = oldStateBits.split("");
                newStateBits.reverse();
                zterm = "";
                for (k = 0; k < stateBits; k++) {
                    if (oldStateBits[k] === "1") {
                        zterm += stateVariables[k];
                    }
                    else {
                        zterm += notOP + stateVariables[k];
                    }
                    if (k < (stateBits - 1)) {
                        zterm += andOP;
                    }
                }
                currentTransition = machine.getTransition(i, j);
                if(!(currentTransition === undefined)){
                    currentTransition = "(" + machine.getTransition(i, j) + ")";
                }
                else {
                    currentTransition = "0";
                }
                if (!(currentTransition === "0")) {
                    for (k = 0; k < stateBits; k++) {
                        if (newStateBits[k] === "1") {
                            equations[k] += zterm + andOP + currentTransition + orOP;
                        }
                    }
                }
            }
        }

        for (i = 0 ; i < stateBits; i++){
            equations[i] = equations[i].slice(0,equations[i].length - orOP.length);
            if(equations[i] === ""){
                equations[i] = "0";
            }
//Change RENE            var sort = Logic.evaluateExpression(equations[i]);
            var sort = Logic.evaluateExpression(machine.EquationToNormalEquation(equations[i]));
            sort.sortExp(false);
            equations[i] = sort.toString();
            if(equations[i] == undefined){
                equations[i] = "0";
            }
        }
        return equations;
    };
    var transformOutput = function (outputVar, machine){
        init(machine);
        createNames();
        var equation = "" ;
        for(i = 0; i < stateNumber; i++) {
            oldStateBits = toBinary(i, stateBits);
            oldStateBits = oldStateBits.split("");
            zterm = "";
            for (k = 0; k < stateBits; k++) {
                if (oldStateBits[k] === "1") {
                    zterm += stateVariables[k];
                }
                else {
                    zterm += notOP + stateVariables[k];
                }
                if (k < (stateBits - 1)) {
                    zterm += andOP;
                }
            }
            try {
                output = machine.getOutputEquation(i, outputVariables[outputVar]);
            }
            catch(err){
                output = outputVariables[outputVar] + "=0";
            }
            index = output.search("=");
            output = output.slice(index + 1);

            if (!(output === "0")) {
                equation += zterm + andOP + "(" + output + ")" + orOP;
            }
        }
        equation = equation.slice(0,equation.length - orOP.length);
        if(equation === ""){
            equation = "0";
        }
        return equation;
    };


    return{
        transformOutput: transformOutput,
        transformStates: transformStates
    };
})();
