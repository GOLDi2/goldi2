/**
 * Created by maximilian on 18.05.17.
 */

var tester: WorkspaceTester;

function setDirty(dirty: boolean) {
    let marker = $("#dirtymarker");
    if (dirty)
        marker.text("dirty").css({"backgroundColor": "red"});
    else
        marker.text("clean").css({"backgroundColor": "green"});
}

class WorkspaceTester{
    public workspace: Workspace.Workspace;
    constructor () {
        this.workspace = new Workspace.Workspace($("#workspacecontainer"),this, {height: 700, width: 700,
            "devices":[
                {"type":"OSC","id":"dev0","x":64,"y":152},
                {"type":"NOT","id":"dev1","x":176,"y":104},
                {"type":"LED","label":"LED","color":"#0000ff","bgColor":"#000000","id":"dev2","x":280,"y":96},
                {"type":"LED","id":"dev3","x":280,"y":168},
                {"type":"Joint","id":"dev4","x":216,"y":208,"state":{"direction":0}}
                ],
            "connectors":[
                {"from":"dev1.in0","to":"dev0.out0"},
                {"from":"dev2.in0","to":"dev1.out0"},
                {"from":"dev3.in0","to":"dev4.out0"},
                {"from":"dev4.in0","to":"dev0.out0"}
                ]
        });
    }
    
    getLibraryComponent(identifier: string, workspace: Workspace.Workspace): Workspace.Circuit {
        throw new Error('not implemented');
    };
    circuitModified(workspace: Workspace.Workspace) {
        setDirty(true);
    };
    openCompoundComponent(identifier: string, workspace: Workspace.Workspace) {
        alert("Open " + identifier + " in new Tab!");
    };
}

function init() {
    tester = new WorkspaceTester();
    $("#removeSelection").click(() => tester.workspace.removeSelection());
    $("#parameterDialog").click(() => tester.workspace.editSelectionParameters());
    $("#exportButton").click(() => $("#outdata").text(JSON.stringify(tester.workspace.getCircuit(), null, 2)));
    $("#exportSubcircuit").click(() => $("#outdata").text(JSON.stringify(tester.workspace.getSelectedSubcircuit(), null, 2)));
    $("#pasteSubcircuit").click(() => tester.workspace.pasteSubcircuit(JSON.parse($("#outdata").text())));
    $("#dirtymarker").click(() => setDirty(false));
    $("#setshowTooltip").change(() => tester.workspace.setShowParameterTooltips((<HTMLInputElement>$("#setshowTooltip")[0]).checked));
    $("#setPan").change(() => tester.workspace.setDragMode((<HTMLInputElement>$("#setPan")[0]).checked ? "pan": "select"));
    $("#setDisplayState").change(() => tester.workspace.setShowParameterTooltips((<HTMLInputElement>$("#setDisplayState")[0]).checked));
    setDirty(false);
}

$(document).ready(init);