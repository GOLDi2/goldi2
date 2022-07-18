/**
 * Created by Lennart on 01.06.2015.
 */
var MachineTableToDataType = (function () {
    var i, j, k, binary, binaryPrefix, transition, newStateBits, oldStateBits, intOldStateBits, intNewStateBits, output, tableOutput, binaryCombString, andOP, orOP, notOP, qmc, machineCounter, currentMachine,parallelVariableNumber , maxStateBits;
    var result;
    var inputVariables = [];
    var outputVariables = [];
    var parallelVariables = [];
    var ipVariables = [];
    var stateNumber;
    var inputNumber;
    var outputNumber;
    var returnWithNames;
    var machineCounter;

    var init = function (machine){
        inputNumber = machine.InputNumber;
        outputNumber = machine.OutputNumber;
        stateNumber = machine.StateNumber;
        andOP = "*"; //machine.OperatorsList[0];
        orOP = "+"; //machine.OperatorsList[1];
        notOP = "/"; //machine.OperatorsList[2];
        returnWithNames = machine.ReturnWithNames;
        machine.ReturnWithNames = false;
        qmc = new QMC();
        machineCounter = machine.GiftState.getHighestMachineNumber();
        currentMachine = machine.MachineNumber;
        maxStateBits = machine.MaxStateBits;
    };
    var close = function (machine){
        machine.ReturnWithNames = returnWithNames;
    };
    var createNames = function (machine,giftInputExt) {
        inputVariables = [];
        outputVariables = [];
        for (i = 0; i < inputNumber; i++){
            inputVariables[i] = "x" + i;
        }
        for (i = 0; i < outputNumber; i++){
            outputVariables[i] = "y" + i;
        }
        createParallelNames(machine,giftInputExt);
        ipVariables = inputVariables.concat(parallelVariables);
    };
    var createParallelNames = function(machine,giftInputExt){
        var i, j;
        parallelVariables = [];

        for(i = 0; i <= giftInputExt.getHighestMachineNumber(); i++){
            var thisMachine = giftInputExt.getMachine(i);
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
        var l;
        var binary = number.toString(2);
        var binaryPrefix = "";
        for (l = binary.length; l < lengthx; l++){
            binaryPrefix  += "0";
        }
        binary = binaryPrefix + binary;
        return binary;
    };
    var transformStates = function (table, machine,giftInputExt) {
        init(machine);
        createNames(machine,giftInputExt);
        var tmpGiftState = machine.GiftState;
        machine = Util.copyDatatype(machine,false,machine.StateBits,inputNumber,outputNumber);
        machine.GiftState  = tmpGiftState;
        var prototypeTable = [];
        for(i = 0; i < stateNumber; i++){
            prototypeTable[i] = [];
        }
        for(i = 0; i < table.length; i++){
            for(j = 0; j < table[i].length; j++){
                oldStateBits = toBinary(i,machine.StateBits);
                newStateBits = table[i][j];
                intNewStateBits = parseInt(newStateBits,2) ;
                intOldStateBits = parseInt(oldStateBits,2);
                binaryCombString = toBinary(j,(inputNumber + parallelVariableNumber));
                binaryCombString = binaryCombString.split("");
                binaryCombString = binaryCombString.reverse();
                if(typeof(prototypeTable[intOldStateBits][intNewStateBits]) === "string") {
                    transition = prototypeTable[intOldStateBits][intNewStateBits] + orOP;
                }
                else{
                    transition = "";
                }
                for(k = 0; k < (inputNumber + parallelVariableNumber); k++){
                    result = transition.slice(transition.length-1);
                    if(!(result === "") && !(result === orOP)){
                        transition += andOP;
                    }
                    if(binaryCombString[k] === "1"){
                        transition += ipVariables[k];
                    }
                    else if(binaryCombString[k] === "0"){
                        transition += notOP + ipVariables[k];
                    }
                    else{
                        throw("Wrong entry in table");
                    }
                }
                if(inputNumber === 0){
                    transition = "1";
                }
                if(transition === "") {
                    prototypeTable[intOldStateBits][intNewStateBits] = "0";
                    machine.setTransition("0", intOldStateBits, intNewStateBits);
                }
                else{
                    try {
                        self.postMessage(((i / table.length) + ((1 / table.length) * (j / table[i].length))) * 100);
                    }
                    catch(e){}
                    transition = qmc.compute(transition);
                    prototypeTable[intOldStateBits][intNewStateBits] = transition;
                    machine.setTransition(transition, intOldStateBits, intNewStateBits);
                }
            }
        }
        close(machine);
        return machine;
    };
    var transformOutput = function (table,outputVar,machine,giftInput){
        init(machine);
        createNames(machine,giftInput);
        var prototypeTable = [];
        for(i = 0; i < table.length; i++) {
            for (j = 0; j < table[i].length; j++) {
                oldStateBits = toBinary(i,machine.StateBits);
                tableOutput = table[i][j];
                intOldStateBits = parseInt(oldStateBits,2);
                binaryCombString = toBinary(j,inputNumber);
                binaryCombString = binaryCombString.split("");
                if(typeof(prototypeTable[intOldStateBits]) === "string") {
                    if((prototypeTable[intOldStateBits]).length > 0) {
                        output = prototypeTable[intOldStateBits] + orOP;
                    }
                }
                else{
                    output = "";
                }
                for(k = 0; k < inputNumber; k++){
                    result = output.slice(output.length-1);
                    if(!(result === "") && !(result === orOP)){
                        output += andOP;
                    }
                    if(binaryCombString[k] === "1" && tableOutput == "1"){
                        output += inputVariables[k];
                    }
                    else if(binaryCombString[k] === "0" && tableOutput == "1"){
                        output += notOP + inputVariables[k];
                    }
                    else if (tableOutput == "0"){
                        output += "";
                    }
                    else{
                        throw("Wrong entry in table");
                    }
                }
                result = output.slice(output.length-1);
                if((result === orOP) || (result === andOP)){
                    output = output.slice(0,output.length-1);
                }
                if(output === ""){
                    prototypeTable[intOldStateBits] = output;
                    machine.setOutputEquation(intOldStateBits,outputVariables[outputVar] + "=0");
                    output = "";
                }
                else {
                    output = qmc.compute(output);
                    prototypeTable[intOldStateBits] = output;
                    machine.setOutputEquation(intOldStateBits,outputVariables[outputVar] + "=" + output);
                }
            }
        }
        close(machine);
        return machine;
    };

    return{
        transformStates: transformStates,
        transformOutput: transformOutput
    };
})();