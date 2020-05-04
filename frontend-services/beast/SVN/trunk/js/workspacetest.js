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
        this.workspace = new Workspace.Workspace($("#workspacecontainer"), this, { height: 700, width: 700,
            "devices": [
                { "type": "OSC", "id": "dev0", "x": 64, "y": 152 },
                { "type": "NOT", "id": "dev1", "x": 176, "y": 104 },
                { "type": "LED", "label": "LED", "color": "#0000ff", "bgColor": "#000000", "id": "dev2", "x": 280, "y": 96 },
                { "type": "LED", "id": "dev3", "x": 280, "y": 168 },
                { "type": "Joint", "id": "dev4", "x": 216, "y": 208, "state": { "direction": 0 } }
            ],
            "connectors": [
                { "from": "dev1.in0", "to": "dev0.out0" },
                { "from": "dev2.in0", "to": "dev1.out0" },
                { "from": "dev3.in0", "to": "dev4.out0" },
                { "from": "dev4.in0", "to": "dev0.out0" }
            ]
        });
    }
    getLibraryComponent(identifier, workspace) {
        throw new Error('not implemented');
    }
    ;
    circuitModified(workspace) {
        setDirty(true);
    }
    ;
    openCompoundComponent(identifier, workspace) {
        alert("Open " + identifier + " in new Tab!");
    }
    ;
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
    setDirty(false);
}
$(document).ready(init);
//# sourceMappingURL=workspacetest.js.map