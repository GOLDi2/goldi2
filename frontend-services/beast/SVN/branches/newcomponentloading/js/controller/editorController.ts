/**
 * Created by maximilian on 30.05.17.
 */

interface EditorWorkspaceControllerInterface {
    closeEditor(editor: EditorController);
    selectEditor(editor: EditorController);
    
    openComponent(component: GlobalComponentTypeID);
    resolveComponentType(id : GlobalComponentTypeID) : Component
}

class EditorController {
    protected readonly SHORTCUTS = {
        delete: () => this.workspace.removeSelection(),
    };
    protected readonly SHIFT_SHORTCUTS = {
        arrowleft: () => this.workspace.rotateSelection(-90),
        arrowright: () => this.workspace.rotateSelection(90),
    }
    
    protected workspace: Workspace.Workspace;
    protected toolbar: JQuery;
    protected tabPane: JQuery;
    protected tab: JQuery;
    
    constructor(protected controller: EditorWorkspaceControllerInterface, component: CompoundComponent, private saveCallback: (component: CompoundComponent) => (void), contentContainer: JQuery, tabContainer: JQuery, closeable: boolean) {
        this.tabPane = $(".tab-pane.template").clone().removeClass("template");
        contentContainer.append(this.tabPane);
        
        const $ws = this.tabPane.find(".workspace");
        
        this.workspace = new Workspace.Workspace($ws.parent(), this, component);
        $ws.remove();
        const workspace = this.tabPane.find("svg");
        workspace.addClass("workspace flex-grow-equal");
        
        //Bind Toolbar events
        this.tabPane.find(".btn-delete").click(() => this.workspace.removeSelection());
        this.tabPane.find(".btn-parameter").click(() => this.workspace.editSelectionParameters());
        this.tabPane.find(".cb-connsim").change(() => this.workspace.setShowConnectorState((<HTMLInputElement>this.tabPane.find(".cb-connsim")[0]).checked));
        this.tabPane.find(".cb-pan").change(() => this.workspace.setDragMode((<HTMLInputElement>this.tabPane.find(".cb-pan")[0]).checked ? "pan": 'select'));
        this.tabPane.find(".cb-tooltip").change(() => this.workspace.setShowParameterTooltips((<HTMLInputElement>this.tabPane.find(".cb-tooltip")[0]).checked));
        this.tabPane.find(".btn-zoomin").click(() => this.workspace.setRelativeZoom(1.5));
        this.tabPane.find(".btn-zoomout").click(() => this.workspace.setRelativeZoom(1 / 1.5));
        this.tabPane.find(".btn-rotateleft").click(() => this.workspace.rotateSelection(-90));
        this.tabPane.find(".btn-rotateright").click(() => this.workspace.rotateSelection(90));
    
        this.tabPane.attr("tabindex", "0");
        this.tabPane.keyup(this.keyUpHandler);
        $( 'body' ).bind("paste cut copy", this.clipboardAction);
        
        this.tab = $(".tabbarelement.template").clone().removeClass("template");
        tabContainer.append(this.tab);
        this.tab.find(".tabtitle").text(component.name);
        const closeLink = this.tab.find(".closetab");
        if (closeable)
            closeLink.click((e) => {e.preventDefault(); e.stopPropagation(); this.controller.closeEditor(this)});
        else
            closeLink.remove();
        this.tab.click(() => this.controller.selectEditor(this));
    }
    
    clipboardAction = (event: JQueryEventObject) => {
        /*TODO: Find better solution to only act when the workspace is selected
        * This cannot be done by binding the event to the tabContainer only,
        * because then the event does not fire in Chrome! */
        if (!this.tabPane.is(":focus"))
            return;
        
        const e = <ClipboardEvent>event.originalEvent;
        if (e.type === "paste")
            this.workspace.pasteSubcircuit(JSON.parse(e.clipboardData.getData("text/json")));
        if (e.type === "cut" || e.type === "copy")
            e.clipboardData.setData("text/json", JSON.stringify(this.workspace.getSelectedSubcircuit()));
        if (e.type === "cut")
            this.workspace.removeSelection();
        e.preventDefault();
        e.stopPropagation();
    };
    
    keyUpHandler = (event) => {
        const key = event.key.toLowerCase();
        let handler = this.SHORTCUTS[key];
        if (event.ctrlKey)
            handler = this.SHIFT_SHORTCUTS[key] || handler;
        if (handler !== undefined){
            event.preventDefault();
            event.stopPropagation();
            handler();
        }
    };
    
    getLibraryComponent(identifier: GlobalComponentTypeID): Workspace.Circuit {
        return this.controller.resolveComponentType(identifier)
    };
    
    circuitModified() {
        this.saveCallback(<CompoundComponent>this.workspace.getCircuit());
    };
    
    openCompoundComponent(component: GlobalComponentTypeID, workspace: Workspace.Workspace) {
        this.controller.openComponent(component);
    };
    
    updateAbilities(abilities: Workspace.Abilities) {
        this.tabPane.find(".btn-delete").prop('disabled', !abilities.removeSelected);
        this.tabPane.find(".btn-rotateleft").prop('disabled', !abilities.rotateSelection);
        this.tabPane.find(".btn-rotateright").prop('disabled', !abilities.rotateSelection);
        this.tabPane.find(".btn-parameter").prop('disabled', !abilities.editSelectionParameters);
    }
    
    activateTab() {
        this.tabPane.attr('style', '');
        this.tabPane.addClass("active");
        this.tab.addClass("active");
    }
    
    deactivateTab() {
        this.tabPane.attr('style', 'display: none !important');
        this.tabPane.removeClass("active");
        this.tab.removeClass("active");
    }
    
    remove() {
        this.tab.remove();
        this.tabPane.remove();
    }
}