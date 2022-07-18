
var repositionneeded = false;

/*$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
 var activatedTab = e.target; // activated tab
 if (activatedTab.toString().toLowerCase().indexOf("automatengraph") && (Controller.getTab() == 1 || Controller.getTab() == 5)) {

 var converter = new GraphConverter();
 if (repositionneeded) {
 converter.repositionGraphStates();
 converter.drawGraph();
 repositionneeded = false;
 } else {
 converter.drawGraph();
 }
 }
 });*/

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    var activatedTab = e.target; // activated tab
    if (activatedTab.toString().toLowerCase().indexOf("automatengraph") && (Controller.getTab() == 1 || Controller.getTab() == 5)) {
        var converter = new GraphConverter();
        converter.drawGraph();
    }
    GUI_paraMachines.set_number(giftInput.CurrentGraphTab);
    GUI_paraMachines.refresh_GUI();
});


function TabChanging(){
    if (Controller.getTab() == 1) {
        var converter = new GraphConverter();
        if(machine == undefined) {
            machine = new TTable(1, 1, 1, [] , giftInput)
        }else{
            machine = converter.convertToDataTyp(machine);
        }
    } else if (Controller.getTab() == 5) {
        var converter = new GraphConverter();
        if(outputMachine == undefined) {
            outputMachine = new TTable(1, 1, 1, [] , giftOutput)
        }else {
            outputMachine = converter.convertToDataTyp(outputMachine);
        }
    } else if (Controller.getTab() == 9) {
        outputMachine.ChangeStruct.SimFlops[0] = false;
    }

    if(Controller.getTab() == 1){
        giftInput.setMachine(machine, machine.MachineNumber);
    }else if(Controller.getTab() == 5) {
        giftOutput.setMachine(outputMachine, outputMachine.MachineNumber);
    }
}

function SaveOldMachine(oldmachinetab){
        TabChanging();
}

function OutputAdding(outputnumber){
    if(machine.OutputNumber < machine.MaxOutputNumber && machine.OutputNumber <= outputnumber){
        machine = Util.copyDatatype(machine, true, machine.StateBits, machine.InputNumber, machine.OutputNumber + 1, machine.GraphStorage);
    }
    Controller.changeStructSetAll(true, machine);
}


function CheckAndDoResposition(){
    var converter = new GraphConverter();
    if (repositionneeded) {
        converter.repositionGraphStates();
        repositionneeded = false;
    }
    converter.drawGraph();
}

function TransitionChanged() {
    var converter = new GraphConverter();
    var showallstates = true;

    machine = converter.convertToDataTyp(machine);
   // converter.convertToGraph(machine, checkCompleteness.createOutputForStateGraph(machine), checkConsistency.createOutputForStateGraph(machine), undefined, showallstates);
    converter.getColors();
    converter.drawGraph();
    Controller.changeStructSetAll(true,machine);
}
function OutputChanging(outputequation, outputnumber) {
    increaseInputNumber(outputequation);
    machine.checkOutputEquation("y" + outputnumber + "=" + outputequation);
    Controller.changeStructSetAll(true,machine);
}

function OutputRemoving(outputnumber) {
    machine = Util.copyDatatype(machine, true, machine.StateBits, machine.InputNumber, outputnumber, machine.GraphStorage);
    Controller.changeStructSetAll(true,machine);
}

function TransitionChanging(transitioneq) {
    increaseInputNumber(transitioneq);
    machine.checkTransitionEquation(transitioneq);
    Controller.changeStructSetAll(true,machine);
}

function StateChanging(){
    Controller.changeStructSetAll(true,machine);
}

function CheckStateNumber(stateval){
    if(stateval > 15 ){
        ThrowExpInModal("Warnung", "Sie haben die Maximalanzahl an Zust&auml;nden erreicht.");
        return false;
    }
    return true;
}

function increaseInputNumber(transitioneq) {
    var highestinput = extractHighestInputValueOfEquation(transitioneq);
    if (highestinput + 1 > machine.InputNumber && machine.MaxInputNumber > highestinput) {
        machine = Util.copyDatatype(machine, true, machine.StateBits, highestinput + 1, machine.OutputNumber, machine.GraphStorage)
    }
}

function loadAndDrawInputGraph(){
    var graph = new GraphConverter();
    graph.convertToGraph(machine, checkCompleteness.createOutputForStateGraph(machine), checkConsistency.createOutputForStateGraph(machine), undefined);
    graph.drawGraph();
}

function loadAndDrawOutputGraph(){
    var graph = new GraphConverter();
    graph.convertToGraph(outputMachine, checkStability.createOutputForStateGraph(outputMachine), undefined, undefined, undefined, Simulator.getStates());
    graph.drawGraph();
}

function loadWebsite() {
    setTimeout(loadDropDown, 100);
    var backup = Store.readFromLocalStorage("laststate");
    var converter = new GraphConverter();
    if (backup != null) {
        LoadBackup(JSON.stringify(backup));
        converter.drawGraph();
    }
    if (repositionneeded) {
        repositionneeded = false;
        repositionGraphStates();
    }
}

function loadDropDown(){
    GUI_paraMachines.set_number(giftInput.CurrentGraphTab);
}

window.addEventListener('beforeunload', (event) => {
    Store.writeToLocalStorage("laststate",JSON.parse(SaveBackup()));

    // Cancel the event as stated by the standard.
    // event.preventDefault();
    // Chrome requires returnValue to be set.
    // event.returnValue = '';
});

function drawGraph() {
    var converter = new GraphConverter();
    converter.drawGraph();
}
function repositionGraphStates() {
    var converter = new GraphConverter();
    converter.repositionGraphStates();
}


function GraphConverter() {
    var usedfsm = fsm;
    var keepunecessarystates = false;

    Object.defineProperty(this, 'keepuneccessarystates', {
        get: function () {
            return keepunecessarystates;
        },
        set: function (keep) {
            keepunecessarystates = keep;
        }
    });

    this.convertToDataTyp = function (datatyp) {
        var storage = importFromGraph();
        var parser = new GraphParser();
        parser.parse(storage);

        var tempcalc = Math.log(parser.StateNumber) / Math.log(2);


        var statebits = Math.ceil(tempcalc);

        if (parser.StateNumber == 1) {
            statebits = 1;
        }

        var zeroinput = false;
        var inputnumber = 0;
        parser.Transitions.forEach(function (entry) {
            entry = entry.input;
            entry = datatyp.EquationToNormalEquation(entry);
            var numberPattern = /x\d+/g;

            var varnames = entry.match(numberPattern);
            if (varnames != null) {
                varnames = UniqueArrayItems(varnames);
                varnames.forEach(function (entry) {
                    var number = Number(entry.replace("x", ""));
                    if (number >= inputnumber) {
                        inputnumber = number;
                        zeroinput = true;
                    }

                });
            }
        });

        var outputnumber = 0;

        parser.States.forEach(function (entry) {
            var length = entry.output.length;
            if (length > outputnumber) {
                outputnumber = length;
            }


            entry.output.forEach(function (entry) {
                var numberPattern = /x\d+/g;

                var varnames = entry.match(numberPattern);

                if (varnames != null) {
                    varnames = UniqueArrayItems(varnames);
                    varnames.forEach(function (entry) {
                        var number = Number(entry.replace("x", ""));
                        if (number > inputnumber) {
                            inputnumber = number;
                        }

                    });
                }
            });
        });

        if (inputnumber > 0 || zeroinput) {
            inputnumber++;
        }

        if(inputnumber < machine.InputNumber) {
            inputnumber = machine.InputNumber;
        }
        if (statebits <= 0) {
            statebits = 1;
        }
        if (outputnumber <= 0) {
            outputnumber = 1;
        }

        var tempdatatyp = Util.copyDatatype(datatyp, false, statebits, inputnumber, outputnumber, null);

        parser.Transitions.forEach(function (entry) {
            tempdatatyp.setTransition(entry.input, entry.source, entry.target);
        });

        parser.States.forEach(function (entry) {
            var i;
            for (i = 0; i < outputnumber; i++) {
                try {
                    if (entry.output[i] != undefined && StateExists(entry.value, parser.Transitions)) {
                        var outputequation = "y" + i + "=" + entry.output[i];
                        tempdatatyp.setOutputEquation(entry.value, outputequation);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        });


        tempdatatyp.GraphStorage = new Graph(parser.States, parser.Transitions);
        return tempdatatyp;
    };


    this.convertToGraph = function (datatyp, statecolor, transitioncolors, positions, showallstates,simulationstates) {

        machine.ReturnWithNames = true;

        var tempstorage = createStorage(datatyp, statecolor, transitioncolors, positions, showallstates,simulationstates);

        var prestorage = this.createNewStorage(datatyp.GraphStorage, tempstorage, showallstates);

        var storage = (new GraphComposer()).compose(prestorage);
        datatyp.GraphStorage = prestorage;
        exportToGraph(storage);


    };

    this.createNewStorage = function (storageold, storagenew, showallstates) {
        if (storageold == undefined) {
            repositionneeded = true;
            return storagenew;
        }

        var i,e;
        var replaced = false





        var length = Math.min(getHighestStateNumber(16,storageold.transitions), getHighestStateNumber(16,storagenew.transitions)) + 1;

        for (i = 0; i < length; i++) {
            for(e = 0; e < length; e++)
            if(storagenew.states[i] != undefined && storageold.states[e] != undefined && storagenew.states[i].value == storageold.states[e].value) {
                storagenew.states[i].x = storageold.states[e].x;
                storagenew.states[i].y = storageold.states[e].y;
                storagenew.states[i].name = storageold.states[e].name;
                storagenew.states[i].fixed = storageold.states[e].fixed;
                if (storageold.states[e].x != 0 || storageold.states[e].y != 0) {
                    replaced = true;
                }
            }
        }

        //for(i = 0; i < storagenew.states.length; i++){
         //   if(!StateExists(storagenew.states[i].value, storagenew.transitions) && (showallstates != true || storagenew.states[i].x == 0 && storagenew.states[i].y == 0 )) {
          //      storagenew.states = storagenew.states.splice(i,1);
          //  }
        //}

        if (!replaced) {
            repositionneeded = true;
        }

        //if (storagenew.states.length > storageold.states.length && showallstates == true) {
        //    storagenew.states = storagenew.states.splice(0, length);
        //}
        if (storagenew.states.length > storageold.states.length) {
            repositionneeded = true;
        }
        return storagenew;

    };

    function getHighestStateNumber(statenumber, transitions){
        var i;
        var max = 0;
        for(i = 0; i < statenumber; i++){
            if(StateExists(i, transitions)){
                max = i;
            }
        }
        return max;
    }


    function findSufficientBits(statenumber){

    }

    this.getColors = function (input){
        var storage = importFromGraph();
        var parser = new GraphParser();
        parser.parse(storage);

        var convert = new GraphConverter();
        machine = convert.convertToDataTyp(machine);


        var completeness = checkCompleteness.createOutputForStateGraph(machine);
        var consistncy = checkConsistency.createOutputForStateGraph(machine);

        var i, e,j;
        var length = parser.States.length;

        for(i = 0; i < completeness.length; i++){
            for(e = 0; e < length; e++) {
                if (parser.States[e].value == i) {
                    if (completeness[i] == 0) {
                        parser.States[e].color = "#0000FF";
                    } else {
                        parser.States[e].color = "#000000";
                    }
                }
            }
        }

        for(j = 0; j < parser.Transitions.length; j++) {
            if(parser.Transitions[j] != undefined) {
                parser.Transitions[j].color = "#000000";
            }
        }

        length = parser.Transitions.length;

        for(i = 0; i <= length; i++){
            for(e = 0; e <= length; e++) {
               for(j = 0; j <= length; j++) {
                   if (consistncy[i] != undefined && consistncy[i][e] != 0 && parser.Transitions[j] != undefined && parser.Transitions[j].source == i && parser.Transitions[j].target == e) {
                       parser.Transitions[j].color = "#FF0000";
                   }
               }
            }
        }

        var storage = (new GraphComposer()).compose((new Graph(parser.States, parser.Transitions)));
        exportToGraph(storage);

    }

    function StateExists(statenumber, transitions) {
        var exists = false;
        transitions.forEach(function (entry) {
            if (entry.source == statenumber || entry.target == statenumber) {
                exists = true;
            }
        });
        return exists;
    }


    function createStorage(datatyp, statecolors, transitioncolors, positions, showallstates, simulationstates) {
        var transitions = [];
        var states = [];
        var statenumber = datatyp.StateNumber;
        var outputnumber = datatyp.OutputNumber;

        datatyp.ReturnWithNames = true;

        var showstates = false;
        if (showallstates != undefined) {
            showstates = showallstates;
        }

        var i, j;
        for (i = 0; i < statenumber; i++) {
            for (j = 0; j < statenumber; j++) {
                var transition = datatyp.getTransition(i, j);
                if (transition != undefined & transition != "") {
                    if (transitioncolors != undefined && transitioncolors[i][j] != 0) {
                        transitions.push(new GraphTransition(i, j, transition, "#FF0000"));
                    } else {
                        transitions.push(new GraphTransition(i, j, transition, "#000000"));
                    }
                }
            }
        }


        for (i = 0; i < statenumber; i++) {
            if (keepunecessarystates || StateExists(i, transitions) || showstates) {
                var outputequations = [];
                for (j = 0; j < outputnumber; j++) {
                    try {
                        var output = datatyp.getOutputEquation(i, "y" + j).split("=")[1];
                        outputequations.push(output);
                    } catch (e) {
                        outputequations.push("0");
                    }
                }

                if(simulationstates == undefined) {

                    if (statecolors != undefined && statecolors[i] != undefined && positions != undefined && positions[i] != undefined) {
                        states.push(new GraphState(i, outputequations, statecolors[i], positions.x, positions.y));
                    } else if (statecolors != undefined && statecolors[i] == 0) {
                        states.push(new GraphState(i, outputequations, "#0000FF", 0, 0));
                    } else if (statecolors != undefined && statecolors[i] == 2) {
                        states.push(new GraphState(i, outputequations, "#FFA500", 0, 0));
                    } else if (positions != undefined && positions[i] != undefined) {
                        states.push(new GraphState(i, outputequations, "#000000", positions.x, positions.y));
                    } else {
                        states.push(new GraphState(i, outputequations, "#000000", 0, 0));
                    }
                }else{
                    if (statecolors != undefined && statecolors[i] != undefined && positions != undefined && positions[i] != undefined) {
                        states.push(new GraphState(i, outputequations, statecolors[i], positions.x, positions.y));
                    } else if (statecolors != undefined && statecolors[i] == 0) {
                        states.push(new GraphState(i, outputequations, "#0000FF", 0, 0));
                    } else if (statecolors != undefined && statecolors[i] == 2 && simulationstates[0] == i) {
                            states.push(new GraphState(i, outputequations, "#6b8e23", 0, 0));
                    } else if (simulationstates[0] == i) {
                        states.push(new GraphState(i, outputequations, "#006400", 0, 0));
                    } else if (statecolors != undefined && statecolors[i] == 2) {
                        if (simulationstates[1] == i) {
                            states.push(new GraphState(i, outputequations, "#9acd32", 0, 0));
                        }else{
                            states.push(new GraphState(i, outputequations, "#FFA500", 0, 0));
                        }
                    } else if (simulationstates[1] == i) {
                        states.push(new GraphState(i, outputequations, "#7cFc00", 0, 0));
                    } else if (positions != undefined && positions[i] != undefined) {
                        states.push(new GraphState(i, outputequations, "#000000", positions.x, positions.y));
                    } else {
                        states.push(new GraphState(i, outputequations, "#000000", 0, 0));
                    }
                }
            }
        }

        if (transitions.length == 0 && showstates == false) {
            return createStorage(datatyp, statecolors, transitioncolors, positions, true);
        }


        return new Graph(states, transitions);
    }

    function exportToGraph(storage) {
        usedfsm.model.import(storage, function () {
        });
    }

    this.drawGraph = function () {
        var svg = document.getElementById("statediagram");
        var height = svg.offsetHeight, width = svg.offsetWidth;
        var animval = svg.x;
        usedfsm.view.draw(usedfsm.model.getFSM());

    };

    function importFromGraph() {
        return usedfsm.model.getStorage();
    }

    this.repositionGraphStates = function () {
        usedfsm.model.removePositions(function () {
            drawGraph();
        });
    };

    function UniqueArrayItems(a) {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = a[i];
            if (seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }
        return out;
    }
}

function copyArray(array) {
    var teststring = JSON.stringify(array);
    return JSON.parse(teststring);
}

function GraphParser() {
    var graphstorage;
    var that = this;

    this.StateNumber = 0;
    this.States = [];
    this.Transitions = [];

    this.parse = function (storage) {
        graphstorage = storage;

        var graph = storage;

        this.States = graph.states;
        this.Transitions = graph.transitions;

        var statenumber = getHighestStateNumber(MaxStateNumber(this.States), this.Transitions) + 1;

        this.States.forEach(function (entry) {
            if (statenumber < entry.value) {
                statenumber = entry.value;
            }
        });

        this.StateNumber = statenumber;
    };

    function getHighestStateNumber(statenumber, transitions) {
        var i;
        var max = 0;
        for (i = 0; i <= statenumber; i++) {
            if (StateExists(i, transitions)) {
                max = i;
            }
        }
        return max;
    }

    function MaxStateNumber(states){
        var i;
        var max = 0;
        for(i = 0; i < states.length; i++){
            if(states[i].value > max){
                max = states[i].value;
            }
        }
        return max;
    }

    function StateExists(statenumber, transitions) {
        var exists = false;
        transitions.forEach(function (entry) {
            if (entry.source == statenumber || entry.target == statenumber) {
                exists = true;
            }
        });
        return exists;
    }



}

function GraphComposer() {
    this.compose = function (graph) {
        return JSON.stringify(graph);
    };


}

function Graph(states, transitions) {
    this.states = states;
    this.transitions = transitions;
    this.meta = [];
}

function GraphState(number, outputequations, color, xpos, ypos) {
    this.value = Number(number);
    this.output = outputequations;
    this.color = color;
    this.x = Number(xpos);
    this.y = Number(ypos);
    this.fixed = "0";
}

function GraphTransition(source, destination, value, color) {
    this.source = source;
    this.target = destination;
    this.input = value;
    this.color = color;
}

function Point() {
    this.x = 0;
    this.y = 0;
    this.setPoint = function (x, y) {
        this.x = x;
        this.y = y;
    }
}