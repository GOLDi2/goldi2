/**
 * Created by Lennart on 23.06.2015.
 */
var Util = (function () {
    var copyMatrice = function (matrice) {
        var output = [];
        for (var e = 0; e < matrice.length; e++) {
            output[e] = matrice[e];
        }
        return output;
    };
    var createArray = function (length) {
        var arr = new Array(length || 0),
            i = length;
        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = createArray.apply(this, args);
        }

        return arr;
    };
    var copyDatatype = function(machine, withTransitions, stateBits, inputnumber, outputnumber, graphstorage, operatorslist){
        var json = JSON.stringify(machine);
        var data = JSON.parse(json);
        var i, j, tempTable, length1, length2, tempYEq, tempYEqMin, tempYEqMinH, tempZEq, tempZEqMin, tempZEqMinH;
        var tmpgiftState = new GiftState(true,["+:+", "*:*", "/:/"]);
        var newmachine = new TTable(2,2,2,copyMatrice(machine.OperatorsList),tmpgiftState);
        var oldStateNumber = data.stateNumber;
        data.stateNumber = Math.pow(2,stateBits);
        if(operatorslist == undefined){
            data.operators = machine.OperatorsList;
        }
        else{
            data.operators = operatorslist;
        }
        if(data.stateNumber > oldStateNumber){
            length1 = oldStateNumber;
        }
        else{
            length1 = data.stateNumber;
        }
        if(!withTransitions){
            data.transitionTable = createArray(data.stateNumber, data.stateNumber);
        }
        else{
            tempTable = data.transitionTable;
            data.transitionTable = createArray(data.stateNumber, data.stateNumber);
            for(i = 0; i < length1; i++){
                for(j = 0; j < length1; j++){
                    data.transitionTable[i][j] = tempTable[i][j];
                }
            }
        }
        data.inputnumber = inputnumber;
        var oldOutputNumber = data.outputnumber;
        data.outputnumber = outputnumber;
        tempTable = data.outputEquations;
        data.outputEquations = createArray(data.stateNumber, outputnumber);
        if(data.outputnumber > oldOutputNumber){
            length2 = oldOutputNumber;
        }
        else{
            length2 = data.outputnumber;
        }
        for(i = 0; i < length1; i++){
            for(j = 0; j < length2; j++){
                data.outputEquations[i][j] = tempTable[i][j];
            }
        }
        data.statebits = stateBits;
        if(graphstorage != undefined) {
            data.graphStorage = graphstorage;
        }
        tempZEq = data.zEquations;
        tempZEqMin = data.zEquationsminimized;
        tempZEqMinH = data.zEquationshreducedminimized;
        tempYEq = data.yEquations;
        tempYEqMin = data.yEquationsminimized;
        tempYEqMinH = data.yEquationshreducedminimized;
        data.zEquations = createArray(stateBits);
        data.zEquationsminimized = createArray(stateBits);
        data.zEquationshreducedminimized = createArray(stateBits);
        data.yEquations = createArray(outputnumber);
        data.yEquationsminimized = createArray(outputnumber);
        data.yEquationshreducedminimized = createArray(outputnumber);
        for(i = 0; i < length1; i++){
            data.zEquations[i] = tempZEq[i];
            data.zEquationsminimized[i] = tempZEqMin[i];
            data.zEquationshreducedminimized[i] = tempZEqMinH[i];
        }
        for(i = 0; i < length2; i++){
            data.yEquations[i] = tempYEq[i];
            data.yEquationsminimized[i] = tempYEqMin[i];
            data.yEquationshreducedminimized[i] = tempYEqMinH[i];
        }

        newmachine.createOnData(data);
        var tempGiftState = machine.GiftState;
        if (!(typeof giftInput === 'undefined')) {
            if (tempGiftState.InputSide) {
                newmachine.GiftState = giftInput;
            }
            else {
                newmachine.GiftState = giftOutput;
            }
        }

        return newmachine;
    };



    var createBinaryCombinationsXZA = function (machine) {
        var i, j, l, k, zBinary,pBinary, binary, parallelVariableNumber ;
        var count = 0;
        var inputNumber = machine.InputNumber;
        var outputNumber = machine.OutputNumber;
        var stateBits = machine.StateBits;
        var machineCounter = machine.GiftState.getHighestMachineNumber();
        var currentMachine = machine.MachineNumber;
        var combinations = []; // x1:0, x2:1
        var binaryCombinations = []; // 0,1
        var inputVariables = [];
        var outputVariables = [];
        var stateVariables = [];
        var parallelVariables = [];

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
            for (i = 0; i < stateBits; i++){
                stateVariables[i] = "z" + i;
            }
            stateVariables.reverse();
            createParallelNames(machine);
        };

        var createParallelNames = function(machine){
            var i, j;
            parallelVariables  = [];
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

        createNames(machine);
        for(j = 0; j < Math.pow(2,stateBits); j++) {
            zBinary = toBinary(j,stateBits);
            zBinary = zBinary.split("");
            for(l = 0; l < Math.pow(2,parallelVariableNumber); l++) {
                pBinary = toBinary(l,parallelVariableNumber);
                pBinary = pBinary.split("");
                for (i = 0; i < Math.pow(2, inputNumber); i++) {
                    binary = toBinary(i, inputNumber);
                    combinations[count] = [];
                    binaryCombinations[count] = [];
                    binary = binary.split("");
                    binary.reverse();
                    for (k = 0; k < inputNumber; k++) {
                        combinations[count][k] = inputVariables[k] + ":" + binary[k];
                        binaryCombinations[count][k] = binary[k];
                    }
                    for (k = 0; k < stateBits; k++) {
                        combinations[count][k + inputNumber] = stateVariables[k] + ":" + zBinary[k];
                        binaryCombinations[count][k + inputNumber] = zBinary[k];
                    }
                    for (k = 0; k < parallelVariableNumber; k++) {
                        combinations[count][k + inputNumber + stateBits] = parallelVariables[k] + ":" + pBinary[k];
                        binaryCombinations[count][k + inputNumber + stateBits] = pBinary[k];
                    }
                    combinations[count].reverse();
                    binaryCombinations[count].reverse();
                    count++;
                }
            }
        }
        return combinations;
    };

    return{
        copyDatatype:copyDatatype,
        createArray: createArray,
        createBinaryCombinationsXZA : createBinaryCombinationsXZA
    };
})();