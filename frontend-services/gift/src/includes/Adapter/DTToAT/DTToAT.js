/**
 * Created by Lennart on 21.05.2015.
 */
/**
 * Adapter : Datentyp zu Automatentabelle
 *
 *
 */

/**
    @module Adapter
 */

/**
 *
 * @class Datentyp zu Automatentabelle
 *
 */
var DatatypToMachineTable = (function () {
    var currentTransition, i, j, k, index, binary, binaryPrefix, transition, newStateBits, oldStateBits, output, binaryCombString, parallelVariableNumber, pBinary, maxStateBits;
    var result;
    var combinations = []; // x1:0, x2:1
    var binaryCombinations = []; // 0,1
    var inputVariables = [];
    var outputVariables = [];
    var parallelVariables = [];
    var completenessArray;
    var consistencyArray;
    var stateBits;
    var stateNumber;
    var inputNumber;
    var outputNumber;
    var inputNames;
    var outputNames;
    var returnWithNames;
    var machineCounter; //anzahl paralleler Automaten
    var currentMachine; //aktuelle paralleler Automat

    var init = function (machine){
        stateBits = machine.StateBits;
        inputNumber = machine.InputNumber;
        outputNumber = machine.OutputNumber;
        inputNames = machine.Inputnames;
        outputNames = machine.Outputnames;
        stateNumber = machine.StateNumber;
        returnWithNames = machine.ReturnWithNames;
        machine.ReturnWithNames = false;
        machineCounter = machine.GiftState.getHighestMachineNumber();
        currentMachine = machine.MachineNumber;
        maxStateBits = machine.MaxStateBits;
    };
    var close = function (machine){
      machine.ReturnWithNames = returnWithNames;
    };
    var createNames = function (machine) {
        inputVariables = [];
        outputVariables = [];
        for (i = 0; i < inputNumber; i++){
            inputVariables[i] = "x" + i;
        }
        for (i = 0; i < outputNumber; i++){
            outputVariables[i] = "y" + i;
        }
        createParallelNames(machine);
    };

    var createParallelNames = function(machine){
        var i, j;
        parallelVariables = [];
        for(i = 0; i <= machineCounter; i++){
            var thisMachine = machine.GiftState.getMachine(i);
            var machinezcount = thisMachine.StateBits;
            if(i != currentMachine) {
                for (j = 0; j < machinezcount; j++) {
                    parallelVariables.push("a" + i + "z" + j);
                }
            }
        }
        parallelVariableNumber = parallelVariables.length;
        //parallelVariables.reverse();
    };

    var createBinaryCombinations = function () {
        var i, l, k;
        var count = 0;
        combinations = [];
        binaryCombinations = [];
        for(l = 0; l < Math.pow(2,parallelVariableNumber); l++) {
            pBinary = toBinary(l, parallelVariableNumber);
            pBinary = pBinary.split("");
            for (i = 0; i < Math.pow(2, inputVariables.length); i++) {
                binary = toBinary(i, inputVariables.length);
                binary = binary.split("");
                binary.reverse();
                combinations[count] = [];
                binaryCombinations[count] = [];
                for (k = 0; k < inputVariables.length; k++) {
                    combinations[count][k] = inputVariables[k] + ":" + binary[k];
                    binaryCombinations[count][k] = binary[k];
                }
                for (k = 0; k < parallelVariableNumber; k++) {
                    combinations[count][k + inputNumber] = parallelVariables[k] + ":" + pBinary[k];
                    binaryCombinations[count][k + inputNumber] = pBinary[k];
                }
                count++;
            }
        }
    };
    var toBinary = function (number,lengthx){
        var j;
        var binary = number.toString(2);
        var binaryPrefix = "";
        for (j = binary.length; j < lengthx; j++){
            binaryPrefix  += "0";
        }
        binary = binaryPrefix + binary;
        return binary;
    };
    var transformStates = function (editable, machine,inputside){
        init(machine);
        createNames(machine);
        createBinaryCombinations();
        if(((!(editable)) && inputside) ) {
            completenessArray = checkCompleteness.createOutputForMachineTable(machine);
            consistencyArray = checkConsistency.createOutputForMachineTable(machine);
        }
        var table = [];
        for(i = 0; i < stateNumber; i++){
            table[i] = [];
        }
        for(i = 0; i < stateNumber; i++){
            for(j = 0; j < stateNumber; j++) {
                newStateBits = j.toString(2);
                oldStateBits = i;
                binaryPrefix = "";
                for (k = newStateBits.length; k < stateBits; k++){
                    binaryPrefix += "0";
                }
                newStateBits = binaryPrefix + newStateBits;
                try {
                    currentTransition = machine.getTransition(i, j);
                }
                catch(err){
                    currentTransition = "0";
                }
                if(!(typeof(currentTransition) == "undefined")) {
                    transition = Logic.evaluateExpression(currentTransition);
                }
                for(k = 0; k < combinations.length; k++){
                    if (typeof(currentTransition) == "undefined") {
                        result = false;
                    }
                    else{
                        result = transition.computearray(combinations[k]);
                    }
                    binaryCombString = binaryCombinations[k];
                    binaryCombString = binaryCombString.join("").split("").reverse().join("");
                    binaryCombString = parseInt(binaryCombString, 2);
                    if(result){
                        table[oldStateBits][binaryCombString] = newStateBits;
                    }
                    else if (!result){
                        //Do Nothing
                    }
                    else{
                        throw "Computation does not work right!";
                    }
                }
            }//second state loop
        }//first state loop
        for (i = 0 ; i < stateNumber; i++){
            for(j = 0 ; j < Math.pow(2,inputNumber + parallelVariableNumber); j++){
                if(  (editable && inputside) || (!(inputside))  ){
                    if(typeof(table[i][j]) == "undefined") {
                        binaryPrefix = "";
                        for (k = 0; k < stateBits; k++) {
                            binaryPrefix += "0";
                        }
                        table[i][j] = binaryPrefix;
                    }
                }
                else{
                    if(typeof(table[i][j]) == "undefined") {
                        binaryPrefix = "";
                        for (k = 0; k < stateBits; k++) {
                            binaryPrefix += "0";
                        }
                        table[i][j] = binaryPrefix;
                    }
                    if(completenessArray[i][j] === 0) {
                        table[i][j] = "u";
                    }
                    if(consistencyArray[i][j] === 0){
                        table[i][j] = "w";
                    }
                }
            }
        }
        close(machine);
        return table;
    };
    var transformOutput = function (outputVar, machine){
        init(machine);
        createNames(machine);
        createBinaryCombinations();
        var table = [];
        for(i = 0; i < stateNumber; i++){
            table[i] = [];
        }
        for (i = 0; i < stateNumber; i++) {
            oldStateBits = i;
            try {
                output = machine.getOutputEquation(i, outputVariables[outputVar]);
            }
            catch(err){
                output = outputVariables[outputVar] + "=0";
            }
            index = output.search("=");
            output = output.slice(index + 1);
            output = Logic.evaluateExpression(output);
            for (j = 0; j < combinations.length; j++) {
                result = output.computearray(combinations[j]);
                binaryCombString = binaryCombinations[j].join("");
                binaryCombString = parseInt(binaryCombString, 2);
                if (result) {
                    table[oldStateBits][binaryCombString] = "1";
                }
                else {
                    table[oldStateBits][binaryCombString] = "0";
                }
            }
        }
        close(machine);
        return table;
    };

    return{
        transformStates: transformStates,
        transformOutput: transformOutput
    };
})();
