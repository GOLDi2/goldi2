/**
 * Created by Lennart on 03.06.2015.
 */


var giftInput = new GiftState(true,["+:+", "*:*", "/:/"]);
var giftOutput = new GiftState(false,["+:+", "*:*", "/:/"]);

var machine;
var outputMachine;

if(JSON.parse(localStorage.getItem("gift")).resetSystem){
    localStorage.setItem("gift","{}");
    sessionStorage.clear();
    location.reload(true);
}

var Controller = (function () {
    var tab = 1;
    var previousMode = 0;
    var toDataTypeMode;
    var MAX_Input = 6;
    var MAX_Output = 6;
    var MAX_Statebit = 4;
    var MIN_Input = 0;
    var MIN_Output = 0;
    var MIN_Statebit = 1;
    var graph = new GraphConverter();
    var machine0 = new TTable(2,2,1,["+:+", "*:*", "/:/"],giftInput);
    var outputMachine0 = new TTable(2,2,1,["+:+", "*:*", "/:/"],giftOutput);

    var init = function(){
        giftInput.pushMachine(machine0);
        giftOutput.pushMachine(outputMachine0);
        if(machine == undefined){
            machine = giftInput.getMachine(0);
        }
        if(outputMachine  == undefined){
            outputMachine = giftOutput.getMachine(0);
        }
    };

    var addMachine = function(){
        giftInput.pushMachine(machine0);
        giftOutput.pushMachine(outputMachine0);

        machine = giftInput.getMachine(giftInput.getHighestMachineNumber());
        outputMachine = giftOutput.getMachine(giftOutput.getHighestMachineNumber());
        GUI_paraMachines.refreshMachineTable();
        refresh();
    };

    var deleteHighestMachine = function(){
        giftInput.popMachine();
        giftOutput.popMachine();
        checkDatatype();
        //machine = giftInput.getMachine(giftInput.getHighestMachineNumber());
        //outputMachine = giftOutput.getMachine(giftOutput.getHighestMachineNumber());

        if(machine.MachineNumber > giftInput.getHighestMachineNumber()){
            GUI_paraMachines.swapToParaNumber(giftInput.getHighestMachineNumber());
        }
        GUI_paraMachines.refreshMachineTable();
        refresh();
    };

    var checkDatatype = function(){
        var yEquation, zEquation;
        for(var l = 0; l < giftInput.getHighestMachineNumber(); l++) {
            var tmpMachine = giftInput.getMachine(l);
            var newMachine = Util.copyDatatype(tmpMachine, false, tmpMachine.StateBits, tmpMachine.InputNumber, tmpMachine.OutputNumber, tmpMachine.GraphStorage);
            for (i = 0; i < newMachine.StateNumber; i++) {
                for (j = 0; j < newMachine.StateNumber; j++) {
                    try {
                        newMachine.setTransition(tmpMachine.getTransition(i, j), i, j);
                    }
                    catch (err) {
                    }
                }
                for (k = 0; k < newMachine.OutputNumber; k++) {
                    try {
                        newMachine.setOutputEquation(i, tmpMachine.getOutputEquation(i, "y" + k));
                    }
                    catch (err) {
                    }
                }
            }
            for (i = 0; i < newMachine.StateBits; i++) {
                zEquation = tmpMachine.getZEquation("z" + i);
                if (zEquation == undefined) {
                    zEquation = "z" + i + "=0";
                }
                if (zEquation.search("z" + tmpMachine.StateBits - 1) === -1) {
                    try {
                        newMachine.setZEquation(zEquation);
                    }
                    catch (err) {
                    }
                }
            }
            for (k = 0; k < newMachine.OutputNumber; k++) {
                yEquation = tmpMachine.getYEquation("y" + k);
                if (yEquation == undefined) {
                    yEquation = "y" + k + "=0";
                }
                if (yEquation.search("z" + tmpMachine.StateBits - 1) === -1) {
                    try {
                        newMachine.setYEquation(yEquation);
                    }
                    catch (err) {
                    }
                }
            }
            giftInput.setMachine(newMachine,newMachine.MachineNumber);
        }
    };

    var clear = function (){
        //transformToView(tab);
        //graph.repositionGraphStates();
    };


    var switchMachine = function(newMachine){
        if(Controller.getTab() != 1 && Controller.getTab() != 5 ){
            giftInput.setMachine(machine, machine.MachineNumber);
            giftOutput.setMachine(outputMachine,outputMachine.MachineNumber);
        }
        machine = giftInput.getMachine(newMachine);
        outputMachine = giftOutput.getMachine(newMachine);
        refresh();
    };
    var copyMatrice = function (matrice) {
        var output = [];
            for (var e = 0; e < matrice.length; e++) {
                output[e] = matrice[e];
            }
        return output;
    };
    var refresh = function () {
        changeStructSetAll(true,machine);
        if(tab == 1){
            var converter = new GraphConverter();
            converter.convertToGraph(machine, checkCompleteness.createOutputForStateGraph(machine), checkConsistency.createOutputForStateGraph(machine), undefined);
            converter.drawGraph();

        }else if (tab == 5){
            var converter = new GraphConverter();
            converter.convertToGraph(outputMachine, checkStability.createOutputForStateGraph(outputMachine), undefined, undefined, undefined, Simulator.getStates());
            converter.drawGraph();
        }
        L_refresh_values(tab,Tab_Alt);
    };
    var toOutput = function (){
        var i;
        var calc = true;
        for(i = 0; i < 3; i++){
            if(!(machine.ChangeStruct.Outputs[i])){
                calc = false;
            }
        }
        for(i = 0; i < 1; i++){
            if(!(machine.ChangeStruct.SimFlops[i])){
                calc = false;
            }
        }
        if(calc) {
            //firstTimeToOutput = false;
            Worker.transformToOutput(machine, outputMachine, tab,giftInput,giftOutput);
        }
        else{
            transformToView(tab);
            if(tab < 9) {
                machine.ChangeStruct.Outputs[tab - 5] = false;
            }
            else{
                machine.ChangeStruct.SimFlops[tab - 9] = false;
            }
        }
    };

    var toECPOutput = function (){
        Worker.transformToECPOutput(machine, outputMachine, tab,giftInput,giftOutput);
    /* TODO Export funktionierte nur, wenn man in den vorderen Tabs war, deswegen wurde dieser Bereich zu Testzwecken auskommentiert
        var i;
        var calc = true;
        for(i = 0; i < 3; i++){
            if(!(machine.ChangeStruct.Outputs[i])){
                calc = false;
            }
        }
        for(i = 0; i < 1; i++){
            if(!(machine.ChangeStruct.SimFlops[i])){
                calc = false;
            }
        }
        if(calc) {
            //firstTimeToOutput = false;
            Worker.transformToECPOutput(machine, outputMachine, tab,giftInput,giftOutput);
        }
        else{
            transformToView(tab);
            if(tab < 9) {
                machine.ChangeStruct.Outputs[tab - 5] = false;
            }
            else{
                machine.ChangeStruct.SimFlops[tab - 9] = false;
            }
        }
        */
    };

    var modifyMachine = function(type){
        switch(type) {
            case 0 :
                addStateBit();
                break;
            case 1:
                deleteStateBit()
                break;
            case 2:
                addInput();
                break;
            case 3:
                deleteInput();
                break;
            case 4:
                addOutput();
                break;
            case 5:
                deleteOutput();
                break;
        }
    };
    var changeStructSetAll = function(bool,machine){
        machine.ChangeStruct.Inputs[0] = bool;
        machine.ChangeStruct.Inputs[1] = bool;
        machine.ChangeStruct.Inputs[2] = bool;
        machine.ChangeStruct.Inputs[3] = bool;
        machine.ChangeStruct.Outputs[0] = bool;
        machine.ChangeStruct.Outputs[1] = bool;
        machine.ChangeStruct.Outputs[2] = bool;
        machine.ChangeStruct.Outputs[3] = bool;
        machine.ChangeStruct.SimFlops[0] = bool;
        machine.ChangeStruct.SimFlops[1] = bool;
    };
    var addStateBit = function(){
        if(machine.StateBits < MAX_Statebit) {
            changeStructSetAll(true,machine);
            machine = Util.copyDatatype(machine, true, machine.StateBits+1, machine.InputNumber, machine.OutputNumber, machine.GraphStorage);
            transformToView(tab);
        }
    };
    var addInput = function(){
        if(machine.InputNumber < MAX_Input) {
            changeStructSetAll(true,machine);
            machine = Util.copyDatatype(machine, true, machine.StateBits, machine.InputNumber+1, machine.OutputNumber, machine.GraphStorage);
            transformToView(tab);
        }
    };
    var addOutput = function(){
        if(machine.OutputNumber < MAX_Output) {
            changeStructSetAll(true,machine);
            machine = Util.copyDatatype(machine, true, machine.StateBits, machine.InputNumber, machine.OutputNumber+1, machine.GraphStorage);
            transformToView(tab);
        }
    };
    var deleteStateBit = function(){
        if(machine.StateBits > MIN_Statebit) {
            changeStructSetAll(true,machine);
            var i, j, k, yEquation, zEquation;
            machine.ReturnWithNames = false;
            var newMachine = Util.copyDatatype(machine, false, machine.StateBits - 1, machine.InputNumber, machine.OutputNumber, machine.GraphStorage);
            for (i = 0; i < newMachine.StateNumber; i++) {
                for (j = 0; j < newMachine.StateNumber; j++) {
                    try {
                        newMachine.setTransition(machine.getTransition(i, j), i, j);
                    }
                    catch (err) {
                    }
                }
                for (k = 0; k < newMachine.OutputNumber; k++) {
                    try {
                        newMachine.setOutputEquation(i, machine.getOutputEquation(i, "y" + k));
                    }
                    catch (err) {
                    }
                }
            }
            for(i = 0; i < newMachine.StateBits; i++){
                zEquation = machine.getZEquation("z" + i);
                if(zEquation == undefined){
                    zEquation = "z" + i + "=0";
                }
                if (zEquation.search("z" + machine.StateBits - 1) === -1) {
                    try {
                        newMachine.setZEquation(zEquation);
                    }
                    catch (err) {
                    }
                }
            }
            for (k = 0; k < newMachine.OutputNumber; k++) {
                yEquation = machine.getYEquation("y" + k);
                if(yEquation == undefined){
                    yEquation = "y" + k + "=0";
                }
                if (yEquation.search("z" + machine.StateBits - 1) === -1) {
                    try {
                        newMachine.setYEquation(yEquation);
                    }
                    catch (err) {
                    }
                }
            }
            machine = newMachine;
            transformToView(tab);
        }
    };
    var deleteInput = function(){
        if(machine.InputNumber > MIN_Input) {
            changeStructSetAll(true,machine);
            var i, j, k, transition, outputEquation, zEquation, yEquation;
            machine.ReturnWithNames = false;
            var newMachine = Util.copyDatatype(machine, false, machine.StateBits, machine.InputNumber-1, machine.OutputNumber, machine.GraphStorage);
            for (i = 0; i < machine.StateNumber; i++) {
                for (j = 0; j < machine.StateNumber; j++) {
                    if (machine.getTransition(i, j) != undefined) {
                        transition = machine.getTransition(i, j);
                    }
                    else {
                        transition = "0";
                    }
                    if (transition.search("x" + machine.InputNumber - 1) === -1) {
                        try {
                            newMachine.setTransition(machine.getTransition(i, j), i, j);
                        }
                        catch (err) {
                        }
                    }
                }
                for (k = 0; k < newMachine.OutputNumber; k++) {
                    try {
                        outputEquation = machine.getOutputEquation(i, "y" + k)
                    }
                    catch (err) {
                        outputEquation = "y" + k + "=0";
                    }
                    if (outputEquation.search("x" + machine.InputNumber - 1) === -1) {
                        try {
                            newMachine.setOutputEquation(i, machine.getOutputEquation(i, "y" + k));
                        }
                        catch (err) {
                        }
                    }
                }
            }
            for(i = 0; i < newMachine.StateBits; i++){
                zEquation = machine.getZEquation("z" + i);
                if(zEquation == undefined) {
                    zEquation = "z" + i + "=0";
                }
                if (zEquation.search("x" + machine.InputNumber - 1) === -1) {
                    try {
                        newMachine.setZEquation(zEquation);
                    }
                    catch (err) {
                    }
                }
            }
            for (k = 0; k < newMachine.OutputNumber; k++) {
                yEquation = machine.getYEquation("y" + k);
                if(yEquation == undefined){
                    yEquation = "y" + k + "=0";
                }
                if (yEquation.search("x" + machine.InputNumber - 1) === -1) {
                    try {
                        newMachine.setYEquation(yEquation);
                    }
                    catch (err) {
                    }
                }
            }
            machine = newMachine;
            transformToView(tab);
        }
    };
    var deleteOutput = function(){
        if(machine.OutputNumber > MIN_Output) {
            changeStructSetAll(true,machine);
            var i, j, k, yEquation, zEquation;
            machine.ReturnWithNames = false;
            var newMachine = Util.copyDatatype(machine, true, machine.StateBits, machine.InputNumber, machine.OutputNumber-1, machine.GraphStorage);
            for (i = 0; i < machine.StateNumber; i++) {
                for (k = 0; k < machine.OutputNumber; k++) {
                    try {
                        newMachine.setOutputEquation(i, machine.getOutputEquation(i, "y" + k));
                    }
                    catch (err) {
                    }
                }
            }
            machine = newMachine;
            transformToView(tab);
        }
    };
    var transformToView = function (tab){
        var editable;
        switch (tab) {
            case 1: //Graph
                graph.convertToGraph(machine, checkCompleteness.createOutputForStateGraph(machine), checkConsistency.createOutputForStateGraph(machine), undefined);
                CheckAndDoResposition();
                break;
            case 2: //TTable
                if (L_Input_mode === 0) { //Automatengraph/Transitionsmatrix
                    editable = true;
                }
                else { //Automatentabelle/Z-Gleichung
                    editable = false;
                }
                TransitionTable.generateTransitionTable(editable, machine, "L_E_Transitionsmatrix", "Input_TTable");
                break;
            case 3: //MTable
                if (L_Input_mode === 0) { //Automatengraph/Transitionsmatrix
                    editable = false;
                }
                else { //Automatentabelle/Z-Gleichung
                    editable = true;
                }
                MachineTable.generateMachineTable(editable, machine, "L_E_Automatentabelle", "Input_MTable");
                /*
                 //MachineTable.setArrayNextStates(DatatypToMachineTable.transformStates(editable,machine,true),machine,"Input_MTable");
                 Worker.DatatypToMachineTable_transformStates_withSetArrayNextState(editable,machine,true,"Input_MTable");
                 for (var i = 0; i < machine.OutputNumber; i++){
                 //MachineTable.setOutputAssignment(DatatypToMachineTable.transformOutput(i,machine),i,machine,"Input_MTable");
                 Worker.DatatypToMachineTable_transformOutput_withSetOutputAssignment(i,machine,"Input_MTable");
                 }*/
                Worker.DatatypeToMachineTable_all(editable, true, machine, "Input_MTable",giftInput);
                break;
            case 4: //Equations
                if (L_Input_mode === 0) { //Automatengraph/Transitionsmatrix
                    editable = false;
                }
                else { //Automatentabelle/Z-Gleichung
                    editable = true;
                }
                if(machine.ChangeStruct.Inputs[3] == true) {
                    var zequations = DatatypToEquation.transformStates(machine);
                    for (i = 0; i < machine.StateBits; i++) {
                        var tmpEq = Logic.evaluateExpression(zequations[i]);
                        tmpEq.sortExp(false);
                        tmpEq.SimpleReduce();
                        machine.setZEquation("z" + i + "=" + tmpEq.toString());
                    }
                    for (var i = 0; i < machine.OutputNumber; i++) {
                        var tmpEq = DatatypToEquation.transformOutput(i, machine);
                        tmpEq = Logic.evaluateExpression(tmpEq);
                        tmpEq.sortExp(false);
                        tmpEq.SimpleReduce();
                        machine.setYEquation("y" + i + "=" + tmpEq.toString());
                    }
                }
                Equations.generateTable(editable, machine, "L_E_EingabeVariablen", "variables");
                Equations.generateTableZ(editable, machine, "L_E_EingabeZGleichungen", "zequations");
                Equations.generateTableY(editable, machine, "L_E_EingabeYGleichungen", "yequations");
                break;
            case 5:
                graph.convertToGraph(outputMachine, checkStability.createOutputForStateGraph(outputMachine), undefined, undefined, undefined, Simulator.getStates());
                try {
                    graph.drawGraph();
                }catch(err){
                    console.log(err);
                }
                CheckAndDoResposition();
                break;
            case 6:
                TransitionTable.generateTransitionTable(false, outputMachine, "L_A_Transitionsmatrix", "Output_TTable");
                break;
            case 7:
                MachineTable.generateMachineTable(false, outputMachine, "L_A_Automatentabelle", "Output_MTable");
                /*
                 //MachineTable.setArrayNextStates(DatatypToMachineTable.transformStates(false,outputMachine,false),outputMachine,"Output_MTable");
                 Worker.DatatypToMachineTable_transformStates_withSetArrayNextState(false,outputMachine,false,"Output_MTable");
                 for (var i = 0; i < outputMachine.OutputNumber; i++){
                 //MachineTable.setOutputAssignment(DatatypToMachineTable.transformOutput(i,outputMachine),i,outputMachine,"Output_MTable");
                 Worker.DatatypToMachineTable_transformOutput_withSetOutputAssignment(i,machine,"Output_MTable");
                 }*/
                Worker.DatatypeToMachineTable_all(false, false, machine, "Output_MTable",giftInput);
                break;
            case 8:
                var zequations = DatatypToEquation.transformStates(outputMachine);
                for (i = 0; i < outputMachine.StateBits; i++) {
                    var tmpEq = Logic.evaluateExpression(zequations[i]);
                    tmpEq.sortExp(false);
                    tmpEq.SimpleReduce();
                    outputMachine.setZEquation("z" + i + "=" + tmpEq.toString());
                }
                for (var i = 0; i < outputMachine.OutputNumber; i++) {
                    var tmpEq = DatatypToEquation.transformOutput(i, outputMachine);
                    tmpEq = Logic.evaluateExpression(tmpEq);
                    tmpEq.sortExp(false);
                    tmpEq.SimpleReduce();
                    outputMachine.setYEquation("y" + i + "=" + tmpEq.toString());
                }
                Equations.generateTableZ(false, outputMachine, "L_A_ZZGleichungen", "zequationsOutput");
                Equations.generateTableY(false, outputMachine, "L_A_YGleichungen", "yequationsoutput");
                break;
            case 9:
                var rWN =  outputMachine.ReturnWithNames;
                outputMachine.ReturnWithNames = false;
                var outputEquation = [];
                for (var i = 0; i < outputMachine.OutputNumber; i++) {
                    outputEquation[i] = DatatypToEquation.transformOutput(i, outputMachine);
                    var tmpEq = Logic.evaluateExpression(outputEquation[i]);
                    tmpEq.sortExp(false);
                    tmpEq.SimpleReduce();
                    outputMachine.setYEquation("y" + i + "=" + tmpEq.toString());
                    outputMachine.ReturnWithNames = false;
                    outputEquation[i] = outputMachine.getYEquation("y" +i).slice(3);
                }
                var stateArray = DatatypToEquation.transformStates(outputMachine);
                for( var i = 0; i < outputMachine.StateBits; i++){
                    var tmpEq = Logic.evaluateExpression(stateArray[i]);
                    tmpEq.sortExp(false);
                    tmpEq.SimpleReduce();
                    outputMachine.setZEquation("z" + i + "=" + tmpEq.toString());
                    outputMachine.ReturnWithNames = false;
                    stateArray[i] = outputMachine.getZEquation("z" + i).slice(3);
                }
                Simulator.init(outputMachine, stateArray, outputEquation);
                outputMachine.ReturnWithNames = rWN;
                break;
            case 10:
                var zequations = DatatypToEquation.transformStates(outputMachine);
                for (i = 0; i < outputMachine.StateBits; i++) {
                    var tmpEq = Logic.evaluateExpression(zequations[i]);
                    tmpEq.sortExp(false);
                    tmpEq.SimpleReduce();
                    outputMachine.setZEquation("z" + i + "=" + tmpEq.toString());
                }
                FlipFlop.generateTableD(false, outputMachine, "L_F_F_Gleichungen_D_FlipFlop", "dflipflop");
                FlipFlop.generateTableJK(false, outputMachine, "L_F_F_Gleichungen_JK_FlipFlop", "jkflipflop");
                break;
        }
    };
    var transformToDataType = function (tab){
        if (previousMode != L_Input_mode) {
            if (L_Input_mode === 0) {
                toDataTypeMode = 1;
            }
            else if (L_Input_mode === 1) {
                toDataTypeMode = 0;
            }
        }
        else {
            toDataTypeMode = L_Input_mode;
        }
        switch (tab) {
            case 1: //Graph
                if (toDataTypeMode === 0) {
                    try {
                        machine = graph.convertToDataTyp(machine);
                    } catch (err) {

                    }
                    break;
                }
            case 2: //TTable
                //Tritt nie ein
                break;
            case 3: //MTable
                if (toDataTypeMode === 0) {
                    break;
                }
                else {
                    /*
                    //machine = MachineTableToDataType.transformStates(MachineTable.getArrayNextStates(machine, "Input_MTable"), machine);
                    Worker.MachineTableToDataType_transformStates(MachineTable.getArrayNextStates(machine, "Input_MTable"), machine);
                    for (var i = 0; i < machine.OutputNumber; i++) {
                        //machine = MachineTableToDataType.transformOutput(MachineTable.getOutputAssignment(i, machine, "Input_MTable"), i, machine);
                        Worker.MachineTableToDataType_transformOutput(MachineTable.getOutputAssignment(i, machine, "Input_MTable"), i, machine);
                    }*/
                    Worker.MachineTableToDataType_transform_init(machine,"Input_MTable",giftInput);
                }
                break;
            case 4: //Equations
                var equations = [];
                var i, ReturnWithNames;
                if (toDataTypeMode === 0) {
                    break;
                }
                else {
                    ReturnWithNames = machine.ReturnWithNames;
                    machine.ReturnWithNames = false;
                    for (i = 0; i < machine.StateBits; i++) {
                        equations[i] = machine.getZEquation("z" + i);
                        if(equations[i] === undefined){
                            equations[i] = "z" + i + "=0";
                        }
                    }
                    machine = EquationToDatatyp.transformStates(equations, machine);
                    for (var i = 0; i < machine.OutputNumber; i++) {
                        machine.ReturnWithNames = false;
                         machine = EquationToDatatyp.transformOutput(machine.getYEquation("y" + i), i, machine);
                    }
                    machine.ReturnWithNames = ReturnWithNames;
                }
                break;
            case 5:
                outputMachine = graph.convertToDataTyp(outputMachine);
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
            case 10:
                break;
        }
        previousMode = L_Input_mode;
    };

    var transformToGraphInputside = function(){
        transformToDataType(tab);
        tab = 1;
        transformToView(tab);
        machine.ChangeStruct.Inputs[0] = true;
    };
    var transformToMTableInputside = function (){
        if(machine.ChangeStruct.Inputs[2] == true) {
            transformToDataType(tab);
        }
        tab = 3;
        transformToView(tab);
        machine.ChangeStruct.Inputs[2] = false;

    };
    var transformToTTableInputside = function (){
        if(machine.ChangeStruct.Inputs[1] == true) {
            firstTimeTTableInputside = false;
            transformToDataType(tab);
        }
        tab = 2;
        transformToView(tab);
        machine.ChangeStruct.Inputs[1] = false;
    };
    var transformToEquationInputside = function (){
        if(machine.ChangeStruct.Inputs[3] == true) {
            var editable, i;
            transformToDataType(tab);
        }
        tab = 4;
        transformToView(tab);
        machine.ChangeStruct.Inputs[3] = false;
    };
    var transformToGraphOutputside = function(){
        if(machine.ChangeStruct.Outputs[0] == true) {
            transformToDataType(tab);
            tab = 5;
            toOutput();
            //transformToView(tab);
        }
        else{
            tab = 5;
            transformToView(tab);
        }
    };
    var transformToTTableOutputside = function (){
        if(machine.ChangeStruct.Outputs[1] == true) {
            transformToDataType(tab);
            tab = 6;
            toOutput();
            //transformToView(tab);
        }
        else{
            tab = 6;
            transformToView(tab);
        }
    };
    var transformToMTableOutputside = function (){
        if(machine.ChangeStruct.Outputs[2] == true) {
            transformToDataType(tab);
            tab = 7;
            toOutput();
            //transformToView(tab);
        }
        else{
            tab = 7;
            transformToView(tab);
        }
    };
    var transformToEquationOutputside = function (){
        if(machine.ChangeStruct.Outputs[3] == true) {
            transformToDataType(tab);
            tab = 8;
            toOutput();
            //transformToView(tab);
        }
        else{
            tab = 8;
            transformToView(tab);
        }
    };

    var prepareECPExport =  function (){
        transformToDataType(1);
        toECPOutput();
    }

    var activateSimulation = function (){
        if(machine.ChangeStruct.SimFlops[0] == true) {
            transformToDataType(tab);
            tab = 9;
            toOutput();
            //transformToView(tab);
        }
        else{
            tab = 9;
            transformToView(tab);
        }
    };
    var activateFlipFlop = function(){
        var tab_alt = tab;
        if(machine.ChangeStruct.SimFlops[1] == true) {
            transformToDataType(tab);
            tab = 10;
            toOutput();
            //transformToView(tab);
        }
        else{
            tab = 10;
            transformToView(tab);
        }
        tab = tab_alt;
    };
    var activateHDot = function(){
        transformToDataType(tab);
        document.getElementById('L_h_punkt_Output').value = HDotZX.getEquation(machine);
    };

    var activateYEquation = function(){
        var i;
        transformToDataType(tab);
        giftInput.setMachine(machine,machine.MachineNumber);
        var machineCounter = giftInput.getHighestMachineNumber();
        for(i = 0; i <= machineCounter; i++) {
            var thisMachine = giftInput.getMachine(i);
            for (var j = 0; j < thisMachine.OutputNumber; j++) {
                var tmpEq = DatatypToEquation.transformOutput(j, thisMachine);
                tmpEq = Logic.evaluateExpression(tmpEq);
                tmpEq.sortExp(false);
                tmpEq.SimpleReduce();
                thisMachine.setYEquation("y" + j + "=" + tmpEq.toString());
            }
            giftInput.setMachine(thisMachine,i);
        }
        Equations.generateTableYPara("L_Para_yEquation_text","yEquationPara");
    };
    var reloadUserdefinedNames = function(){
        UserDefinedInputVariables.generateTable(machine,"User_defined_Inputvariables","userDefinedInputvariables",false, "LabelOne","SettingsResetButtonInputVariables");
        UserDefinedOutputVariables.generateTable(machine,"User_defined_Outputvariables","userDefinedOutputvariables",false, "LabelTwo","SettingsResetButtonOutputVariables");
        UserDefinedOperators.updateOperatorsInputs();
    };
    var getHReduce = function(){
        if(document.getElementById("L_h_stern_input").value == ""){
            machine.HReduce = "0";
        }
        else {
            machine.HReduce = document.getElementById("L_h_stern_input").value;
        }
        changeStructSetAll(true,machine);
        toOutput();
        transformToView(tab);
    };
    var setHReduce = function(){
        document.getElementById("L_h_stern_input").value = machine.HReduce;
    };
    var getTab = function(){
        return tab;
    };
    var setTab = function(input){
        tab = input;
    };
    var setPreviouseMode = function(input){
        previousMode = input;
    };
    var fillModalNewMachine = function(){
        UserDefinedVariablesCreateNew.generateTables("User_defined_Inputvariables_new","User_defined_Outputvariables_new");
    };
    var generateNewMachine = function(){
        var inputMode = L_Input_mode;
        giftInput.InputMode = inputMode;
        giftOutput.InputMode = inputMode;
        if(inputMode === 0){
            $('#L_E_TAB_Automatengraph').tab('show');
            $("#L_E_Automatengraph :input").attr("disabled", false);
            $("#L_E_Transitionsmatrix :input").attr("disabled", false);
            $("#L_E_Automatentabelle :input").attr("disabled", true);
            $("#L_E_ZGleichungen :input").attr("disabled", true);
            var newtab = 1;
            $('#L_Modus_Text').attr('data-i18n','navbar.inputMode_Graph_trans');
        }
        else{
            $('#L_E_ZGleichungen').tab('show');
            $("#L_E_Automatengraph :input").attr("disabled", true);
            $("#L_E_Transitionsmatrix :input").attr("disabled", true);
            $("#L_E_Automatentabelle :input").attr("disabled", false);
            $("#L_E_ZGleichungen :input").attr("disabled", false);
            var newtab = 4;
            $('#L_Modus_Text').attr('data-i18n','navbar.inputMode_Machine_equations');
        }
        $('[data-i18n]').i18n();
        //machine = UserDefinedVariablesCreateNew.getMachine();

        //reset all parallel machines
        var tmp = giftInput.getHighestMachineNumber();
        for(var i = 0; i <= tmp; i++){
            giftInput.popMachine();
            giftOutput.popMachine();
        }
        giftInput.pushMachine(machine0);
        giftOutput.pushMachine(outputMachine0);

        machine = giftInput.getMachine(0);
        outputMachine = giftOutput.getMachine(0);

        GUI_paraMachines.set_number(0);
        GUI_paraMachines.refreshMachineTable();
        changeStructSetAll(true,machine);
        var convert = new GraphConverter();
        convert.convertToGraph(giftInput.getMachine(0));
        forceTabSwitch(newtab);
    };
    var swapInputMode = function(){
        if(L_Input_mode == 1){
            $('#L_E_TAB_Automatengraph').tab('show');
            $("#L_E_Automatengraph :input").attr("disabled", false);
            $("#L_E_Transitionsmatrix :input").attr("disabled", false);
            $("#L_E_Automatentabelle :input").attr("disabled", true);
            $("#L_E_ZGleichungen :input").attr("disabled", true);
            var newtab = 1;
            $('#L_Modus_Text').attr('data-i18n','navbar.inputMode_Graph_trans');
            L_Input_mode = 0;
            editable = true;
        }
        else{
            $('#L_E_ZGleichungen').tab('show');
            $("#L_E_Automatengraph :input").attr("disabled", true);
            $("#L_E_Transitionsmatrix :input").attr("disabled", true);
            $("#L_E_Automatentabelle :input").attr("disabled", false);
            $("#L_E_ZGleichungen :input").attr("disabled", false);
            var newtab = 4;
            $('#L_Modus_Text').attr('data-i18n','navbar.inputMode_Machine_equations');
            L_Input_mode = 1;
            editable = false;
        }
        machine.ChangeStruct.Inputs[0] = true;
        machine.ChangeStruct.Inputs[1] = true;
        machine.ChangeStruct.Inputs[2] = true;
        machine.ChangeStruct.Inputs[3] = true;

        forceTabSwitch(newtab);
        $('[data-i18n]').i18n();
    };
    var forceTabSwitch = function(tab){
        switch(tab){
            case 1:
                document.getElementById("TAB_on_E_Automatengraph").click();
                document.getElementById("L_E_TAB_Automatengraph").click();
                break;
            case 2:
                document.getElementById("TAB_on_E_Transitionsmatrix").click();
                document.getElementById("TAB_on_E_Transitionsmatrix2").click();
                break;
            case 3:
                document.getElementById("TAB_on_E_Automatentabelle").click();
                document.getElementById("L_E_TAB_Automatentabelle").click();
                break;
            case 4:
                document.getElementById("TAB_on_E_ZGleichungen").click();
                document.getElementById("TAB_on_E_ZGleichungen2").click();
                break;
            case 5:
                document.getElementById("TAB_on_A_Automatengraph").click();
                document.getElementById("TAB_on_A_Automatengraph2").click();
                break;
            case 6:
                document.getElementById("TAB_on_A_Transitionsmatrix").click();
                document.getElementById("TAB_on_A_Transtionsmatrix2").click();
                break;
            case 7:
                document.getElementById("TAB_on_A_Automatentabelle").click();
                document.getElementById("TAB_on_A_Automatentabelle2").click();
                break;
            case 8:
                document.getElementById("TAB_on_A_ZGleichungen").click();
                document.getElementById("TAB_on_A_ZGleichungen2").click();
                break;
            case 9:
                document.getElementById("TAB_on_Simulation").click();
                document.getElementById("TAB_on_Simulation2").click();
                break;
            case 10:
                document.getElementById("TAB_on_FF").click();
                document.getElementById("TAB_on_FF2").click();
                break;
        }
    };
    var resetGift = function(){
        const tmp = localStorage.getItem("gift");
        if (tmp !== null) {
            const gift = JSON.parse(tmp);
            if (gift !== undefined) {
                gift.resetSystem = true;
            }
            localStorage.setItem("gift",JSON.stringify(gift));
            location.reload(false);
        }
    };
    return{
        transformToMTableInputside: transformToMTableInputside,
        transformToTTableInputside: transformToTTableInputside,
        transformToEquationInputside: transformToEquationInputside,
        transformToGraphInputside: transformToGraphInputside,
        transformToMTableOutputside: transformToMTableOutputside,
        transformToTTableOutputside: transformToTTableOutputside,
        transformToEquationOutputside: transformToEquationOutputside,
        transformToGraphOutputside: transformToGraphOutputside,
        prepareECPExport: prepareECPExport,
        activateSimulation: activateSimulation,
        activateFlipFlop: activateFlipFlop,
        activateHDot: activateHDot,
        activateYEquation: activateYEquation,
        addStateBit: addStateBit,
        addInput: addInput,
        addOutput: addOutput,
        deleteStateBit: deleteStateBit,
        deleteOutput: deleteOutput,
        deleteInput: deleteInput,
        clear: clear,
        reloadUserdefinedNames:reloadUserdefinedNames,
        modifyMachine: modifyMachine,
        refresh: refresh,
        getHReduce: getHReduce,
        setHReduce: setHReduce,
        getTab: getTab,
        generateNewMachine: generateNewMachine,
        fillModalNewMachine: fillModalNewMachine,
        transformToView: transformToView,
        forceTabSwitch: forceTabSwitch,
        changeStructSetAll: changeStructSetAll,
        swapInputMode: swapInputMode,
        setTab: setTab,
        setPreviousMode: setPreviouseMode,
        switchMachine: switchMachine,
        init: init,
        addMachine: addMachine,
        deleteHighestMachine: deleteHighestMachine,
        resetGift: resetGift
    };
})();
Controller.init();
