/**
 * Created by Lennart on 29.06.2015.
 */

var selectScript = function (suffix,thread){
    var url = location.href;
    url = url.split("").reverse().join("");
    var index = url.search("/");
    var index2 = url.search(/\\/);
    if(index2 > index){
        index = index2;
    }
    url = url.slice(index);
    url = url.split("").reverse().join("");
    index = url.search("file:");
    if(index > -1){
        url = url.slice(index+8);
    }
    thread.require(url+suffix);
};
var getURL = function (){
    var url = location.href;
    url = url.split("").reverse().join("");
    var index = url.search("/");
    var index2 = url.search(/\\/);
    if(index2 > index){
        index = index2;
    }
    url = url.slice(index);
    url = url.split("").reverse().join("");
    index = url.search("file:");
    if(index > -1){
        url = url.slice(index+8);
    }
    return url
};

var init = function(){
    pool = thread({
        evalPath: getURL() + "includes/eval.js"
    }).pool(20);

    selectScript("includes/Datentyp/GiftState.js",pool);
    selectScript("includes/Datentyp/DataType.js",pool);
    selectScript("includes/QMC/EquationNormalizer.js",pool);
    selectScript("includes/QMC/Logic.js",pool);
    selectScript("includes/QMC/qmc.js",pool);
    selectScript("includes/Adapter/DTToAT/DTToAT.js",pool);
    selectScript("includes/Adapter/ATToDT/ATToDT.js",pool);
    selectScript("includes/Adapter/DTToEq/DTToEq.js",pool);
    selectScript("includes/Adapter/EqToDT/EqToDT.js",pool);
    selectScript("includes/Vollstandigkeit/completeness.js",pool);
    selectScript("includes/Widerspruchsfreiheit/consistency.js",pool);
    selectScript("includes/Stabilitat/stability.js",pool);
    selectScript("includes/checkfunctions.js",pool);
    selectScript("includes/util.js",pool);
};
var pool;
init();
var calcResult, interval;
var Worker = (function () {
    var qmcWorkerPool = function(equation,HReduce,i,mode){
        var qmc = new QMC();
        var result = qmc.compute(equation,HReduce);
        pool.run(function(equation,HReduce,i,mode,done){
            var qmc = new QMC();
            var result = qmc.compute(equation,HReduce);
            done(null, result);
        },[equation,HReduce,i,mode]).then(function (result){
            calcResult = result;
            //console.log("result arrived: "+ result);
            if(mode < 4 || mode == 6) {
                Equations.setMinimizedExpressions(result, i, mode);
            }else if (mode == 100 || mode == 101) {
                ecp_export.finish_minimized(result, i, mode);
            }else{
                FlipFlop.setMinimizedExpression(result,i,mode);
            }
            //clearInterval(interval)
        }).catch(function (err) {
            console.log(err)
        })
    };
    var qmcExec = function (equation,HReduce,i,mode,progressbar){
        calcResult = undefined;
        qmcWorkerPool(equation,HReduce,i,mode);
    };
    var DatatypeToMachineTable_transformStates__withSetArrayNextState_Worker = function(editable,machine,inputside,tableName,giftState){
        var json = JSON.stringify(machine);
        var json2= JSON.stringify(giftState);
        pool.run(function(editable,json,json2,inputside,tableName,done){
            var data = JSON.parse(json);
            var data2 = JSON.parse(json2);
            var giftInput = new GiftState();
            giftInput.createOnData(data2);
            var workerMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftInput);
            workerMachine.createOnData(data);
            var result = DatatypToMachineTable.transformStates(editable,workerMachine,inputside);
            done(null,result);
        },[editable,json,json2,inputside,tableName]).then(function (result){
            calcResult = result;
            //console.log("result arrived: "+ result);
            MachineTable.setArrayNextStates(result,machine,tableName);
            changeProgressbarValue("progressbar1","#");
        }).catch(function (err) {
            console.log(err)
        })
    };
    var DatatypToMachineTable_transformStates_withSetArrayNextState = function(editable,machine,inputside,tableName,giftState){
        calcResult = undefined;

        DatatypeToMachineTable_transformStates__withSetArrayNextState_Worker(editable,machine,inputside,tableName,giftState);
    };
    var DatatypeToMachineTable_transformOutput__withSetOutputAssignment_Worker = function(i,machine,tableName,giftState){
        var json = JSON.stringify(machine);
        var json2 = JSON.stringify(giftState);
        pool.run(function(i,json,json2,tableName,done){
            var data = JSON.parse(json);
            var data2 = JSON.parse(json2);
            var giftInput = new GiftState();
            giftInput.createOnData(data2);
            var workerMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftInput);
            workerMachine.createOnData(data);
            var result = DatatypToMachineTable.transformOutput(i,workerMachine);
            done(null,result);
        },[i,json,json2,tableName]).then(function (result){
            //console.log("result arrived: "+ result);
            MachineTable.setOutputAssignment(result,i,machine,tableName);
            if(i == (machine.OutputNumber-1)) {
                calcResult = result;
                changeProgressbarValue("progressbar1", '#');
               // console.log("close modal (I'm DatatypeToMachineTable_transformOutput_withSetOutputAssignmentWorker)[i = " + i );
            }
            //clearInterval(interval);
        }).catch(function (err) {
            console.log(err)
        })
    };
    var DatatypToMachineTable_transformOutput_withSetOutputAssignment = function(i,machine,tableName,giftState){
        calcResult = undefined;

        DatatypeToMachineTable_transformOutput__withSetOutputAssignment_Worker(i,machine,tableName,giftState);
    };
    var DatatypeToMachineTable_all = function(editable,inputside,machine,tableName,giftState){
        calcResult = undefined;
        DatatypeToMachineTable_transformStates__withSetArrayNextState_Worker(editable,machine,inputside,tableName,giftState);
        for(var i = 0 ; i < machine.OutputNumber; i++){
            DatatypeToMachineTable_transformOutput__withSetOutputAssignment_Worker(i,machine,tableName,giftState);
        }
    };
    var MachineTableToDataType_transformStates_Worker = function(array,inputMachine,giftState){
        var json = JSON.stringify(inputMachine);
        var json2 = JSON.stringify(giftState);
        pool.run(function(array,json,json2,done){
            var data = JSON.parse(json);
            var data2 = JSON.parse(json2);
            var giftInput = new GiftState();
            giftInput.createOnData(data2);
            var workerMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftInput);
            workerMachine.createOnData(data);
            workerMachine = MachineTableToDataType.transformStates(array,workerMachine,giftInput);
            var outputJson = JSON.stringify(workerMachine);
            done(null,outputJson);
        },[array,json,json2]).then(function (result){
            var data = JSON.parse(result);
            var newMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftState);
            newMachine.createOnData(data);
            machine = newMachine;
            calcResult = machine;
            //console.log("result arrived: "+ machine);
            changeProgressbarValue("progressbar1",'#');
            MachineTableToDataType_transform_next(machine, giftState);
            //clearInterval(interval)
        }).catch(function (err) {
            console.log(err)
        })
    };
    var MachineTableToDataType_transformStates = function(array,machine,giftState){
        calcResult = undefined;
        MachineTableToDataType_transformStates_Worker(array,machine,giftState);
    };

    var MachineTableToDataType_transformOutput_Worker = function(array,i,inputMachine,giftState){
        var json = JSON.stringify(inputMachine);
        var json2 = JSON.stringify(giftState);
        pool.run(function(array,i,json,json2,done){
            var data = JSON.parse(json);
            var data2 = JSON.parse(json2);
            var giftInput = new GiftState();
            giftInput.createOnData(data2);
            var workerMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftInput);
            workerMachine.createOnData(data);
            workerMachine = MachineTableToDataType.transformOutput(array,i,workerMachine,giftInput);
            var outputJson = JSON.stringify(workerMachine);
            done(null,outputJson);
        },[array,i,json,json2]).then(function (result){
            var data = JSON.parse(result);
            var newMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftState);
            newMachine.createOnData(data);
            machine = newMachine;
            calcResult = machine;
            //console.log("result arrived: "+ machine);
            changeProgressbarValue("progressbar1",'#');
            //clearInterval(interval)
            MachineTableToDataType_transform_next(machine,giftState);
        }).catch(function (err) {
            console.log(err)
        })
    };
    var MachineTableToDataType_transformOutput = function(array,i,machine,giftState){
        calcResult = undefined;

        MachineTableToDataType_transformOutput_Worker(array,i,machine,giftState);
    };
    var fullArray,outputPosition;
    var MachineTableToDataType_transform_init = function(machine,tableName,giftState){
        var i;
        fullArray = [];
        fullArray[0] = MachineTable.getArrayNextStates(machine,tableName);
        for(i = 0; i < machine.OutputNumber; i++){
            fullArray[i+1] = MachineTable.getOutputAssignment(i,machine,tableName);
        }
        outputPosition = 0;
        MachineTableToDataType_transformStates(fullArray[0],machine,giftState);
    };
    var MachineTableToDataType_transform_next = function(machine,giftState){
        if(outputPosition < machine.OutputNumber) {
            MachineTableToDataType_transformOutput(fullArray[outputPosition + 1], outputPosition, machine,giftState);
            outputPosition++;
        }
        else{
            Controller.transformToView(Controller.getTab());
        }
    };

    var transformToOutput_Worker = function(inputMachine, outputMachine1,tab,giftStateInput,giftStateOutput){
        var json = JSON.stringify(inputMachine);
        var json2 = JSON.stringify(outputMachine1);
        var json3 = JSON.stringify(giftStateInput);
        var json4 = JSON.stringify(giftStateOutput);
        pool.run(function(json,json2,json3,json4,done){
            var data = JSON.parse(json);
            var data2 = JSON.parse(json2);
            var data3 = JSON.parse(json3);
            var data4 = JSON.parse(json4);
            var giftInput = new GiftState();
            giftInput.createOnData(data3);
            var giftOutput = new GiftState();
            giftOutput.createOnData(data4);
            var workerMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftInput);
            workerMachine.createOnData(data);
            var workerOutputMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftOutput);
            workerOutputMachine.createOnData(data2);
            workerOutputMachine = Util.copyDatatype(workerMachine, true, workerMachine.StateBits, workerMachine.InputNumber, workerMachine.OutputNumber, workerOutputMachine.GraphStorage);
            workerOutputMachine.Changed = false;
            workerOutputMachine.GiftState = giftOutput;
            var result = DatatypToMachineTable.transformStates(false, workerMachine, false);
            workerOutputMachine = MachineTableToDataType.transformStates(result, workerOutputMachine,giftInput);
            for (var i = 0; i < workerMachine.OutputNumber; i++) {
                workerOutputMachine = MachineTableToDataType.transformOutput(DatatypToMachineTable.transformOutput(i, workerMachine), i, workerOutputMachine,giftInput);
            }
            var outputJson = JSON.stringify(workerOutputMachine);
            done(null,outputJson);
        },[json,json2,json3,json4]).then(function (result){
            //console.log("result arrived: "+ inputMachine);
            var data = JSON.parse(result);
            var newMachine = new TTable(1,1,1,["*:*","+:+","/:/"],giftStateOutput);
            newMachine.createOnData(data);
            outputMachine = newMachine;
            calcResult = machine;
            if(tab < 9) {
                machine.ChangeStruct.Outputs[tab - 5] = false;
            }
            else{
                machine.ChangeStruct.SimFlops[tab - 9] = false;
            }
            Controller.transformToView(tab);
            ecp_export.finish();
            changeProgressbarValue("progressbar1",'#');
        }).catch(function (err) {
            console.log(err);
            ProgressbarRefreshTimer.stop();
        });
        pool.on('message', function (msg) {
            ProgressValue = msg.data;
            if (!(ProgressbarRefreshTimer.isRunning())) {
                ProgressbarRefreshTimer.start();
            }
        })
    };

    var transformToOutput = function(machine,outputMachine1,tab,giftStateInput,giftStateOutput){
        calcResult = undefined;

        transformToOutput_Worker(machine,outputMachine1,tab,giftStateInput,giftStateOutput);
    };

    var transformToECPOutput = function(machine,outputMachine1,tab,giftStateInput,giftStateOutput){
        transformToOutput_Worker(machine,outputMachine1,tab,giftStateInput,giftStateOutput);
    };

    var terminate = function(){
        changeProgressbarValue("progressbar1",'#');
        pool.terminate();
        opened = false;
        Controller.forceTabSwitch(Tab_Alt);
        //console.log("terminated");
        init();
        console.log(pool.idle());
    }


    return{
        qmcExec: qmcExec,
        DatatypToMachineTable_transformStates_withSetArrayNextState: DatatypToMachineTable_transformStates_withSetArrayNextState,
        DatatypToMachineTable_transformOutput_withSetOutputAssignment: DatatypToMachineTable_transformOutput_withSetOutputAssignment,
        MachineTableToDataType_transformStates: MachineTableToDataType_transformStates,
        MachineTableToDataType_transformOutput: MachineTableToDataType_transformOutput,
        MachineTableToDataType_transform_init: MachineTableToDataType_transform_init,
        transformToOutput: transformToOutput,
        transformToECPOutput: transformToECPOutput,
        terminate: terminate,
        DatatypeToMachineTable_all: DatatypeToMachineTable_all
    };
})();
