/**
 * Created by maximilian on 30.05.17.
 */
class EditorController {
    constructor(controller, component, originalComponentID, componentID, contentContainer, tabContainer, closeable) {
        this.controller = controller;
        this.originalComponentID = originalComponentID;
        this.componentID = componentID;
        this.SHORTCUTS = {
            delete: () => this.workspace.removeSelection()
        };
        this.CTRL_SHORTCUTS = {
            arrowleft: () => this.workspace.rotateSelection(-90),
            arrowright: () => this.workspace.rotateSelection(90)
        };
        this.SHIFT_CTRL_SHORTCUTS = {
            e: () => this.extractComponent()
        };
        this.clipboardAction = (event) => {
            /*TODO: Find better solution to only act when the workspace is selected
             * This cannot be done by binding the event to the tabContainer only,
             * because then the event does not fire in Chrome! */
            if (!this.tabPane.is(':focus')) {
                return;
            }
            const e = event.originalEvent;
            if (e.type === 'paste') {
                this.workspace.pasteSubcircuit(JSON.parse(e.clipboardData.getData('text/json')));
            }
            if (e.type === 'cut' || e.type === 'copy') {
                e.clipboardData.setData('text/json', JSON.stringify(this.workspace.getSelectedSubcircuit()));
            }
            if (e.type === 'cut') {
                this.workspace.removeSelection();
            }
            e.preventDefault();
            e.stopPropagation();
        };
        this.keyUpHandler = (event) => {
            const key = event.key.toLowerCase();
            let handler = this.SHORTCUTS[key];
            if (event.ctrlKey) {
                handler = this.CTRL_SHORTCUTS[key] || handler;
            }
            if (event.ctrlKey && event.shiftKey) {
                handler = this.SHIFT_CTRL_SHORTCUTS[key] || handler;
            }
            if (handler !== undefined) {
                event.preventDefault();
                event.stopPropagation();
                handler();
            }
        };
        this.tabPane = $('.tab-pane.template')
            .clone()
            .removeClass('template');
        contentContainer.append(this.tabPane);
        const $ws = this.tabPane.find('.workspace');
        this.workspace = new Workspace.Workspace($ws.parent(), this, component);
        $ws.remove();
        const workspace = this.tabPane.find('svg');
        workspace.addClass('workspace flex-grow-equal');
        //Bind Toolbar events
        this.tabPane.find('.btn-delete')
            .click(() => this.workspace.removeSelection());
        this.tabPane.find('.btn-parameter')
            .click(() => this.workspace.editSelectionParameters());
        this.tabPane.find('.cb-connsim')
            .change(() => this.workspace.setShowConnectorState(this.tabPane.find('.cb-connsim')[0].checked));
        this.tabPane.find('.cb-pan')
            .change(() => this.workspace.setDragMode(this.tabPane.find('.cb-pan')[0].checked ? 'pan' : 'select'));
        this.tabPane.find('.cb-tooltip')
            .change(() => this.workspace.setShowParameterTooltips(this.tabPane.find('.cb-tooltip')[0].checked));
        this.tabPane.find('.btn-zoomin')
            .click(() => this.workspace.setRelativeZoom(1.5));
        this.tabPane.find('.btn-zoomout')
            .click(() => this.workspace.setRelativeZoom(1 / 1.5));
        this.tabPane.find('.btn-rotateleft')
            .click(() => this.workspace.rotateSelection(-90));
        this.tabPane.find('.btn-rotateright')
            .click(() => this.workspace.rotateSelection(90));
        this.tabPane.find('.btn-extract')
            .click(() => this.extractComponent());
        this.tabPane.find('input:checkbox')
            .bootstrapToggle();
        this.tabPane.attr('tabindex', '0');
        this.tabPane.keyup(this.keyUpHandler);
        $('body')
            .bind('paste cut copy', this.clipboardAction);
        this.tab = $('.tabbarelement.template')
            .clone()
            .removeClass('template');
        tabContainer.append(this.tab);
        this.tab.find('.tabtitle')
            .text(component.name);
        this.componentName = component.name;
        const closeLink = this.tab.find('.closetab');
        if (closeable) {
            closeLink.click((e) => {
                e.preventDefault();
                e.stopPropagation();
                this.controller.closeEditor(this);
            });
        }
        else {
            closeLink.remove();
        }
        this.tab.click(() => this.controller.selectEditor(this));
    }
    getLibraryComponent(identifier) {
        return this.controller.resolveComponentType(identifier);
    }
    ;
    circuitModified(stateOnly) {
        if (this.componentID == null) {
            if (!stateOnly) {
                new ComponentCreationDialog((name) => {
                    const component = this.workspace.getCircuit();
                    this.componentID = this.controller.createComponent(new CompoundComponent(null, name, component.devices, component.connectors));
                    this.originalComponentID = this.componentID;
                    this.tab.find('.tabtitle')
                        .text(name);
                }, false).show();
            }
        }
        else {
            const circuit = this.workspace.getCircuit();
            this.controller.componentModified(new CompoundComponent(this.componentID.componentID, this.componentName, circuit.devices, circuit.connectors), this.componentID);
        }
    }
    ;
    openCompoundComponent(component, workspace) {
        this.controller.openComponent(component);
    }
    ;
    updateAbilities(abilities) {
        this.tabPane.find('.btn-delete')
            .prop('disabled', !abilities.removeSelected);
        this.tabPane.find('.btn-rotateleft')
            .prop('disabled', !abilities.rotateSelection);
        this.tabPane.find('.btn-rotateright')
            .prop('disabled', !abilities.rotateSelection);
        this.tabPane.find('.btn-parameter')
            .prop('disabled', !abilities.editSelectionParameters);
    }
    getSimulationInterface() {
        return this.workspace.getSimulationInterface();
    }
    activateTab() {
        this.tabPane.attr('style', '');
        this.tabPane.addClass('active');
        this.tab.addClass('active');
    }
    deactivateTab() {
        this.tabPane.attr('style', 'display: none !important');
        this.tabPane.removeClass('active');
        this.tab.removeClass('active');
    }
    remove() {
        this.tab.remove();
        this.tabPane.remove();
    }
    extractComponent() {
        new ComponentCreationDialog((name) => {
            const component = this.workspace.getCircuit();
            this.controller.createAndOpenComponent(new CompoundComponent(null, name, component.devices, component.connectors));
        }, true).show();
    }
}
class ComponentCreationDialog extends Dialog {
    constructor(callbackFunction, extracting) {
        super();
        this.callbackFunction = callbackFunction;
        this.extracting = extracting;
        this.confimedEvent = () => {
            this.callbackFunction(this.input.val());
            this.close();
        };
    }
    getTitle() {
        return this.extracting ? 'Extract Component' : 'Save as new Component?';
    }
    getContent() {
        //TODO change use
        const text = this.extracting ? '<p><b>Please choose a name for the extracted component:</b></p>' :
            '<p>To save your modifications to this circuit,<br>it has to be saved as a new' +
                ' component!</p>' +
                '<p><b>Please choose a name:</b></p>';
        const content = $('<div></div>')
            .append(text);
        this.input = $('<input type="text"/>');
        this.input.val('New Component');
        this.input.addClass('beast-horizontal-fill');
        content.append(this.input);
        this.addButton(this.extracting ? 'Extract' : 'Save', this.extracting ? 'glyphicon glyphicon-share' : 'glyphicon ' +
            'glyphicon-floppy-disk', this.confimedEvent);
        this.addButton('Cancel', 'glyphicon glyphicon-remove', () => this.close());
        return content;
    }
}
//# sourceMappingURL=editorController.js.map