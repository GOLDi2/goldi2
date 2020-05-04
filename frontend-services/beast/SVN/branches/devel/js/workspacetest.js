var SimulationInterface = Workspace.SimulationInterface;
/**
 * Created by maximilian on 18.05.17.
 */
var tester;
var dirtyCounter = 0;
function setDirty(dirty) {
    let marker = $("#dirtymarker");
    if (dirty) {
        dirtyCounter = dirtyCounter + 1;
        marker.text("dirty (" + dirtyCounter + ")").css({ "backgroundColor": "red" });
    }
    else {
        dirtyCounter = 0;
        marker.text("clean").css({ "backgroundColor": "green" });
    }
}
class WorkspaceTester {
    constructor() {
        this.indicators = {};
        this.changeHandler = (name, value) => {
            this.indicators[name].toggleClass("portindicator-hot", value);
            this.indicators[name].toggleClass("portindicator-cold", !value);
        };
        this.workspace = new Workspace.Workspace($("#workspacecontainer"), this, { height: 700, width: 700,
            "devices": [
                { "type": "In", "label": "A", "id": "dev0", "x": 72, "y": 56 },
                { "type": "In", "label": "B", "id": "dev1", "x": 56, "y": 240 },
                { "type": "Out", "label": "Y", "id": "dev2", "x": 400, "y": 232 },
                { "type": "Out", "label": "X", "id": "dev3", "x": 368, "y": 48 },
                { "type": "AND", "id": "dev4", "x": 232, "y": 48 },
                { "type": "Toggle", "id": "dev5", "x": -8, "y": 240, "state": { "on": false } },
                { "type": "DC", "id": "dev6", "x": -128, "y": 152 },
                { "type": "Toggle", "id": "dev7", "x": -8, "y": 56, "state": { "on": false } },
                { "type": "LED", "label": "LED", "color": "#0000ff", "bgColor": "#000000", "id": "dev8", "x": 464, "y": 40 },
                { "type": "LED", "id": "dev9", "x": 480, "y": 232 },
                { "type": "OR", "id": "dev10", "x": 288, "y": 232 },
                { "type": "OSC", "id": "dev11", "x": 184, "y": 192 }
            ],
            "connectors": [
                { "from": "dev0.in0", "to": "dev7.out0" },
                { "from": "dev1.in0", "to": "dev5.out0" },
                { "from": "dev2.in0", "to": "dev10.out0" },
                { "from": "dev3.in0", "to": "dev4.out0" },
                { "from": "dev4.in0", "to": "dev0.out0" },
                { "from": "dev4.in1", "to": "dev1.out0" },
                { "from": "dev5.in0", "to": "dev6.out0" },
                { "from": "dev7.in0", "to": "dev6.out0" },
                { "from": "dev8.in0", "to": "dev3.out0" },
                { "from": "dev9.in0", "to": "dev2.out0" },
                { "from": "dev10.in0", "to": "dev11.out0" },
                { "from": "dev10.in1", "to": "dev1.out0" }
            ]
        });
        this.simInterface = this.workspace.getSimulationInterface();
    }
    getLibraryComponent(identifier) {
        throw new Error('not implemented');
    }
    ;
    circuitModified() {
        setDirty(true);
    }
    ;
    openCompoundComponent(identifier, workspace) {
        alert("Open " + identifier + " in new Tab!");
    }
    ;
    listPorts() {
        let inlist = $("#inlist");
        inlist.empty();
        for (let inname of this.simInterface.getInputNames()) {
            let setterCB = $('<input type="checkbox" class="settercb">');
            setterCB.change((event) => {
                const value = setterCB[0].checked;
                this.simInterface.setInput(inname, value);
            });
            inlist.append($("<li></li>").text(inname).append(setterCB));
        }
        let outlist = $("#outlist");
        outlist.empty();
        this.indicators = {};
        for (let outname of this.simInterface.getOutputNames()) {
            let indicator = $('<div class="portindicator"></div>');
            this.indicators[outname] = indicator;
            outlist.append($("<li></li>").text(outname).append(indicator));
        }
    }
    setAutoUpdate(value) {
        if (value) {
            this.simInterface.onOutputChange(this.changeHandler);
        }
        else {
            this.simInterface.offOutputChange(this.changeHandler);
        }
    }
    setAll() {
        $(".settercb").trigger("change");
    }
    readValues() {
        let values = this.simInterface.getOutputs();
        for (let outname in this.indicators) {
            this.indicators[outname].toggleClass("portindicator-hot", values[outname]);
            this.indicators[outname].toggleClass("portindicator-cold", !values[outname]);
        }
    }
    zoomChanged(f) { }
}
function init() {
    tester = new WorkspaceTester();
    $("#removeSelection").click(() => tester.workspace.removeSelection());
    $("#parameterDialog").click(() => tester.workspace.editSelectionParameters());
    $("#exportButton").click(() => $("#outdata").val(JSON.stringify(tester.workspace.getCircuit(), null, 2)));
    $("#exportSubcircuit").click(() => $("#outdata").val(JSON.stringify(tester.workspace.getSelectedSubcircuit(), null, 2)));
    $("#pasteSubcircuit").click(() => tester.workspace.pasteSubcircuit(JSON.parse($("#outdata").val())));
    $("#dirtymarker").click(() => setDirty(false));
    $("#setshowTooltip").change(() => tester.workspace.setShowParameterTooltips($("#setshowTooltip")[0].checked));
    $("#setPan").change(() => tester.workspace.setDragMode($("#setPan")[0].checked ? "pan" : "select"));
    $("#setDisplayState").change(() => tester.workspace.setShowConnectorState($("#setDisplayState")[0].checked));
    $("#rotateLeft").click(() => tester.workspace.rotateSelection(-90));
    $("#rotateRight").click(() => tester.workspace.rotateSelection(90));
    $("#listPorts").click(() => tester.listPorts());
    $("#activate").click(() => { tester.simInterface.activate(); tester.setAll(); });
    $("#deactivate").click(() => tester.simInterface.deactivate());
    $("#readvalues").click(() => tester.readValues());
    $("#autoupdate").change(() => tester.setAutoUpdate($("#autoupdate")[0].checked));
    setDirty(false);
}
$(document).ready(init);
//# sourceMappingURL=workspacetest.js.map