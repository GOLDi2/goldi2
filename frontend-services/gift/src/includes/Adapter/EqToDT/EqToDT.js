/**
 * Created by Lennart on 07.06.2015.
 */
var EquationToDatatyp = (function () {
    var currentEquation, i, j, k, index, zBinary, pBinary,binary, binaryPrefix, transition, newStateBits, oldStateBits, output, binaryCombString, stateBits, term, zterm,  andOP, orOP, notOP, returnWithNames, parallelVariableNumber, maxStateBits;
    var result;
    var combinations = []; // x1:0, x2:1
    var binaryCombinations = []; // 0,1
    var inputVariables = [];
    var outputVariables = [];
    var stateVariables = [];
    var parallelVariables = [];
    var stateNumber;
    var inputNumber;
    var outputNumber;
    var inputNames;
    var outputNames;
    var outputIndex;
    var machineCounter; //anzahl paralleler Automaten
    var currentMachine; //aktuelle paralleler Automat
    var giftState;

    var init = function (machine){
        inputNumber = machine.InputNumber;
        outputNumber = machine.OutputNumber;
        inputNames = machine.Inputnames;
        outputNames = machine.Outputnames;
        stateNumber = machine.StateNumber;
        andOP = machine.OperatorsList[0];
        orOP = machine.OperatorsList[1];
        notOP = machine.OperatorsList[2];
        returnWithNames = machine.ReturnWithNames;
        machine.ReturnWithNames = false;
        stateBits = machine.StateBits;
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
        stateVariables = [];
        for (i = 0; i < inputNumber; i++){
            inputVariables[i] = "x" + i;
        }
        for (i = 0; i < outputNumber; i++){
            outputVariables[i] = "y" + i;
        }
        if(returnWithNames) {
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
        }
        for (i = 0; i < stateBits; i++){
            stateVariables[i] = "z" + i;
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
    };

    var createBinaryCombinationsZX = function () {
        var i, j, l, k ;
        var count = 0;
        combinations = [];
        binaryCombinations = [];
        for(l = 0; l < Math.pow(2,parallelVariableNumber); l++) {
            pBinary = toBinary(l,parallelVariableNumber);
            pBinary = pBinary.split("");
            pBinary = pBinary.reverse();
            for (i = 0; i < Math.pow(2, inputNumber); i++) {
                binary = toBinary(i, inputNumber);
                binary = binary.split("");
                binary.reverse();
                for(j = 0; j < Math.pow(2,stateBits); j++) {
                    zBinary = toBinary(j,stateBits);
                    zBinary = zBinary.split("");
                    zBinary = zBinary.reverse();
                    combinations[count] = [];
                    binaryCombinations[count] = [];
                    for (k = 0; k < stateBits; k++) {
                        combinations[count][k] = stateVariables[k] + ":" + zBinary[k];
                        binaryCombinations[count][k] = zBinary[k];
                    }
                    for (k = 0; k < inputNumber; k++) {
                        combinations[count][k + stateBits] = inputVariables[k] + ":" + binary[k];
                        binaryCombinations[count][k + stateBits] = binary[k];
                    }
                    for (k = 0; k < parallelVariableNumber; k++) {
                        combinations[count][k + inputNumber + stateBits] = parallelVariables[k] + ":" + pBinary[k];
                        binaryCombinations[count][k + inputNumber + stateBits] = pBinary[k];
                    }
                    //combinations[count].reverse();
                    //binaryCombinations[count].reverse();
                    count++;
                }
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
    var transformStates = function (equation, machine){
        var i, j, k;
        init(machine);
        createNames(machine);
        createBinaryCombinationsZX();
        var table = [];
        for(i = 0; i < stateNumber; i++){
            table[i] = [];
            for(j = 0; j < Math.pow(2,inputNumber + parallelVariableNumber); j++) {
                table[i][j] = "";
            }
        }
        for(i = 0; i < equation.length; i++){ //first z0 then z1 ...
            currentEquation = equation[i];
            index = currentEquation.search("=");
            currentEquation = currentEquation.slice(index + 1);
            currentEquation = Logic.evaluateExpression(currentEquation);
            for(k = 0; k < combinations.length; k++){
                result = currentEquation.computearray(combinations[k]);
                term = binaryCombinations[k].join("");
                binaryCombString = term.slice(stateBits);
                binaryCombString = binaryCombString.split("");
                binaryCombString = binaryCombString.reverse();
                binaryCombString = binaryCombString.join("");
                binaryCombString = parseInt(binaryCombString, 2);
                oldStateBits = term.slice(0,stateBits);
                oldStateBits = oldStateBits.split("");
                oldStateBits.reverse();
                oldStateBits= oldStateBits.join("");
                oldStateBits = parseInt(oldStateBits, 2);
                if(result){
                    table[oldStateBits][binaryCombString] = "1" + table[oldStateBits][binaryCombString];
                }
                else if (!result){
                    table[oldStateBits][binaryCombString] = "0" + table[oldStateBits][binaryCombString];
                }
                else{
                    throw "Computation does not work right!";
                }
            }
        }
        close(machine);
        machine = MachineTableToDataType.transformStates(table,machine,giftInput);
        return machine;
    };
    var transformOutput = function (outputEquation, outputVar, machine){
        init(machine);
        createNames(machine);
        createBinaryCombinationsZX();
        var table = [];
        for(i = 0; i < stateNumber; i++){
            table[i] = [];
            for(j = 0; j < Math.pow(2,inputNumber); j++) {
                table[i][j] = "";
            }
        }
        if(outputEquation == null){
            outputEquation = "y=0";
        }
        index = outputEquation.search("=");
        outputEquation = outputEquation.slice(index + 1);
        output = Logic.evaluateExpression(outputEquation);
        for (j = 0; j < combinations.length; j++) {
            result = output.computearray(combinations[j]);
            term = binaryCombinations[j].join("");
            binaryCombString = term.slice(stateBits);
            binaryCombString = parseInt(binaryCombString, 2);
            oldStateBits = term.slice(0,stateBits);
            oldStateBits = oldStateBits.split("");
            oldStateBits.reverse();
            oldStateBits= oldStateBits.join("");
            oldStateBits = parseInt(oldStateBits, 2);
            if (result) {
                table[oldStateBits][binaryCombString] = "1";
            }
            else {
                table[oldStateBits][binaryCombString] = "0";
            }
        }
        close(machine);
        machine = MachineTableToDataType.transformOutput(table,outputVar,machine,giftInput);
        return machine;
    };
    return{
        createNames: createNames,
        init: init,
        createBinaryCombinationsXZ: createBinaryCombinationsZX,
        transformOutput: transformOutput,
        transformStates: transformStates
    };
})();
