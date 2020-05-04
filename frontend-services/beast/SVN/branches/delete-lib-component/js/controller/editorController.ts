/**
 * Created by maximilian on 30.05.17.
 */


const TABCONTENT_CODE = `
<div class="tab-pane active flex-child col-flex-container" id="editor" role="tabpanel">
                    <!--editortoolbar-->

<div class="btn-toolbar" role="toolbar"
    <form class="form">
        <div class="btn-group btn-toggle" data-toggle="toggle">
            <label class="btn btn-primary active">
            <input type="radio" name="options" id="pan"> Panning <br> On
            </label>
            <label class="btn btn-default">
            <input type="radio" name="options" id="select" checked=""> Selection <br> On
            </label>
        </div>
    </form>
    <form class="form">
        <div class="btn-group btn-toggle" data-toggle="toggle">
            <label class="btn btn-primary active">
            <input type="radio" name="options" id="simulation on" > Simulation <br> On
            </label>
            <label class="btn btn-default">
            <input type="radio" name="options" id="simulation off" checked=""> Simulation <br> Off
            </label>
        </div>
    </form>
    <form class="form">
    <div class="btn-group btn-group-lg" role="group">
        <button type="button" class="btn btn-default btn-zoomin" data-toggle="tooltip" data-placement="top" title="Zoom In"><span class="glyphicon glyphicon-zoom-in"></span></button>
        <button type="button" class="btn btn-default btn-zoomout" data-toggle="tooltip" data-placement="top" title="Zoom Out"><span class="glyphicon glyphicon-zoom-out"></span></button>
        <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Rotate Left"><span class="glyphicon glyphicon-arrow-left"></span></button>
        <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Rotate Right"><span class="glyphicon glyphicon-arrow-right"></span></button>
        <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Save"><span class="glyphicon glyphicon-download-alt"></span></button>
        <button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Extract component"><span class="glyphicon glyphicon-share"></span></button>
        <button type="button" class="btn btn-default btn-parameter" data-toggle="tooltip" data-placement="top" title="Set parameter"><span class="glyphicon glyphicon-cog"></span></button>
        <button type="button" class="btn btn-default btn-delete" data-toggle="tooltip" data-placement="top" title="Delete"><span class="glyphicon glyphicon-trash"></span></button>
    </div>
    </form>
</div>

                    <!--<div class="workspace flex-child">
                    </div>-->
                    
                    <div class="workspace flex-child"></div>
                    
                </div>

                
`;

const TAB_CODE = `
                 <li><a href="#editor" data-toggle="tab" role="tab"><span class="tabtitle">TestKomponente</span>&nbsp&nbsp</a><span
                 class="closetab">x
                 </span> </li>
`;

interface EditorWorkspaceControllerInterface {
    closeEditor(editor: EditorController);
    selectEditor(editor: EditorController);
    
    openComponent(component: ComponentIdentifier);
}

class EditorController {
    protected workspace: Workspace.Workspace;
    protected toolbar: JQuery;
    protected tabPanel: JQuery;
    protected tab: JQuery;
    
    constructor(protected controller: EditorWorkspaceControllerInterface, contentContainer: JQuery, tabContainer: JQuery) {
        this.tabPanel = $($.parseHTML(TABCONTENT_CODE));
        contentContainer.append(this.tabPanel);
        
        const $ws = this.tabPanel.find(".workspace");
        
        this.workspace = new Workspace.Workspace($ws.parent(), this, {showToolbox: false, "devices":[
            {"type":"LED","label":"LED","color":"#0000ff","bgColor":"#000000","id":"dev5","x":0,"y":0},
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
        $ws.remove();
        this.tabPanel.find("svg").addClass("workspace flex-child");
        
        //Bind Toolbar events
        this.tabPanel.find(".btn-delete").click(() => this.workspace.removeSelection());
        this.tabPanel.find(".btn-parameter").click(() => this.workspace.editSelectionParameters());
        this.tabPanel.find(".cb-connsim").change(() => this.workspace.setShowConnectorState((<HTMLInputElement>this.tabPanel.find(".cb-connsim")[0]).checked));
        this.tabPanel.find(".cb-pan").change(() => this.workspace.setDragMode((<HTMLInputElement>this.tabPanel.find(".cb-pan")[0]).checked ? "pan": 'select'));
        this.tabPanel.find(".btn-zoomin").click(() => this.workspace.setRelativeZoom(1.5));
        this.tabPanel.find(".btn-zoomout").click(() => this.workspace.setRelativeZoom(1/1.5));
        
        this.tab = $($.parseHTML(TAB_CODE));
        tabContainer.append(this.tab);
        this.tab.find(".closetab").click((e) => {e.preventDefault(); e.stopPropagation(); this.controller.closeEditor(this)});
        this.tab.click(() => this.controller.selectEditor(this));
    }
    
    getLibraryComponent(identifier: ComponentIdentifier, workspace: Workspace.Workspace): Workspace.Circuit {
    };
    
    circuitModified(workspace: Workspace.Workspace) {
    };
    
    openCompoundComponent(component: ComponentIdentifier, workspace: Workspace.Workspace) {
        this.controller.openComponent(component);
    };
    
    activateTab() {
        this.tabPanel.show();
        this.tab.addClass("active");
    }
    
    deactivateTab() {
        this.tabPanel.hide();
        this.tab.removeClass("active");
    }
    
    remove() {
        this.tab.remove();
        this.tabPanel.remove();
    }
}