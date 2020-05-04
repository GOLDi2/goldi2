/**
 * Created by maximilian on 30.05.17.
 */
class EditorController {
    constructor(controller, contentContainer, tabContainer) {
        this.controller = controller;
        this.SHORTCUTS = {
            delete: () => this.workspace.removeSelection(),
        };
        this.SHIFT_SHORTCUTS = {
            arrowleft: () => this.workspace.rotateSelection(-90),
            arrowright: () => this.workspace.rotateSelection(90),
        };
        this.clippboardAction = (event) => {
            /*TODO: Find better solution to only act when the workspace is selected
            * This cannot be done by binding the event to the tabContainer only,
            * because then the event does not fire in Chrome! */
            if (!this.tabPane.is(":focus"))
                return;
            const e = event.originalEvent;
            if (e.type === "paste")
                this.workspace.pasteSubcircuit(JSON.parse(e.clipboardData.getData("text/json")));
            if (e.type === "cut" || e.type === "copy")
                e.clipboardData.setData("text/json", JSON.stringify(this.workspace.getSelectedSubcircuit()));
            if (e.type === "cut")
                this.workspace.removeSelection();
            e.preventDefault();
            e.stopPropagation();
        };
        this.keyUpHandler = (event) => {
            const key = event.key.toLowerCase();
            let handler = this.SHORTCUTS[key];
            if (event.ctrlKey)
                handler = this.SHIFT_SHORTCUTS[key] || handler;
            if (handler !== undefined) {
                event.preventDefault();
                event.stopPropagation();
                handler();
            }
        };
        this.tabPane = $(".tab-pane.template").clone().removeClass("template");
        contentContainer.append(this.tabPane);
        const $ws = this.tabPane.find(".workspace");
        this.workspace = new Workspace.Workspace($ws.parent(), this, { showToolbox: false, "devices": [
                { "type": "LED", "label": "LED", "color": "#0000ff", "bgColor": "#000000", "id": "dev5", "x": 0, "y": 0 },
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
        $ws.remove();
        const workspace = this.tabPane.find("svg");
        workspace.addClass("workspace flex-grow-equal");
        //FIXME: Tollbar default state and workspace default state differ!
        //Bind Toolbar events
        this.tabPane.find(".btn-delete").click(() => this.workspace.removeSelection());
        this.tabPane.find(".btn-parameter").click(() => this.workspace.editSelectionParameters());
        this.tabPane.find(".cb-connsim").change(() => this.workspace.setShowConnectorState(this.tabPane.find(".cb-connsim")[0].checked));
        this.tabPane.find(".cb-pan").change(() => this.workspace.setDragMode(this.tabPane.find(".cb-pan")[0].checked ? "pan" : 'select'));
        this.tabPane.find(".cb-tooltip").change(() => this.workspace.setShowParameterTooltips(this.tabPane.find(".cb-tooltip")[0].checked));
        this.tabPane.find(".btn-zoomin").click(() => this.workspace.setRelativeZoom(1.5));
        this.tabPane.find(".btn-zoomout").click(() => this.workspace.setRelativeZoom(1 / 1.5));
        this.tabPane.find(".btn-rotateleft").click(() => this.workspace.rotateSelection(-90));
        this.tabPane.find(".btn-rotateright").click(() => this.workspace.rotateSelection(90));
        this.tabPane.attr("tabindex", "0");
        this.tabPane.keyup(this.keyUpHandler);
        $('body').bind("paste cut copy", this.clippboardAction);
        this.tab = $(".tabbarelement.template").clone().removeClass("template");
        tabContainer.append(this.tab);
        this.tab.find(".closetab").click((e) => { e.preventDefault(); e.stopPropagation(); this.controller.closeEditor(this); });
        this.tab.click(() => this.controller.selectEditor(this));
    }
    getLibraryComponent(identifier) {
        return this.controller.resolveComponentType(identifier);
    }
    ;
    circuitModified(workspace) {
    }
    ;
    openCompoundComponent(component, workspace) {
        this.controller.openComponent(component);
    }
    ;
    updateAbilities(abilities) {
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
//# sourceMappingURL=editorController.js.map