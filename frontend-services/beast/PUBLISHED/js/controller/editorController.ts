/**
 * Created by maximilian on 30.05.17.
 */
declare var ExpressionExtractor: any;

interface EditorWorkspaceControllerInterface {
    closeEditor(editor: EditorController);

    selectEditor(editor: EditorController);

    openComponent(component: GlobalComponentTypeID);

    resolveComponentType(id: GlobalComponentTypeID): Component

    componentModified(component: CompoundComponent, id: GlobalComponentTypeID)

    createComponent(component: CompoundComponent | string): GlobalComponentTypeID;

    createAndOpenComponent(component: CompoundComponent | string);
}


class EditorController {
    protected readonly SHORTCUTS = {
        delete: () => this.workspace.removeSelection()
    };
    protected readonly CTRL_SHORTCUTS = {
        arrowleft: () => this.workspace.rotateSelection(-90),
        arrowright: () => this.workspace.rotateSelection(90),
        a: () => this.workspace.selectAll(),
    };
    protected readonly SHIFT_CTRL_SHORTCUTS = {
        e: () => this.extractComponent()
    };

    protected workspace: Workspace.Workspace;
    protected toolbar: JQuery;
    protected tabPane: JQuery;
    protected tab: JQuery;

    protected componentName: string;

    constructor(protected controller: EditorWorkspaceControllerInterface, component: CompoundComponent, public originalComponentID: GlobalComponentTypeID, protected componentID: GlobalComponentTypeID, contentContainer: JQuery, tabContainer: JQuery, closeable: boolean) {
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
            .change(() => this.workspace.setShowConnectorState((<HTMLInputElement>this.tabPane.find('.cb-connsim')[0]).checked));
        this.tabPane.find('.cb-pan')
            .change(() => this.workspace.setDragMode((<HTMLInputElement>this.tabPane.find('.cb-pan')[0]).checked ? 'pan' : 'select'));
        this.tabPane.find('.cb-tooltip')
            .change(() => this.workspace.setShowParameterTooltips((<HTMLInputElement>this.tabPane.find('.cb-tooltip')[0]).checked));
        this.tabPane.find('.btn-zoomin')
            .click(() => this.workspace.setRelativeZoom(1.5));
        this.tabPane.find('.btn-zoomout')
            .click(() => this.workspace.setRelativeZoom(1 / 1.5));
        this.tabPane.find('.zoom-group > input')
            .on({
                dblclick: () => {
                    console.info("Zommreset");
                    this.workspace.resetZoom()
                }
            }, "input");
        this.tabPane.find('.btn-rotateleft')
            .click(() => this.workspace.rotateSelection(-90));
        this.tabPane.find('.btn-rotateright')
            .click(() => this.workspace.rotateSelection(90));
        this.tabPane.find('.btn-extract')
            .click(() => this.extractComponent());
        this.tabPane.find('input:checkbox')
            .bootstrapToggle();

        this.tabPane.find('#grabEquations')
            .click(() => this.grabEquations(this.workspace));
        // .click(this.grabEquations);

        if (!(jQuery.contains(document.documentElement, workspace[0]))) {
            console.error("Not visible!")
        }

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
        } else {
            closeLink.remove();
        }
        this.tab.click(() => this.controller.selectEditor(this));
        this.workspace.setShowConnectorState(true);
    }

    clipboardAction = (event: JQueryEventObject) => {
        /*TODO: Find better solution to only act when the workspace is selected
         * This cannot be done by binding the event to the tabContainer only,
         * because then the event does not fire in Chrome! */
        if (!this.tabPane.is(':focus')) {
            return;
        }

        const e = <ClipboardEvent>event.originalEvent;
        if (e.type === 'paste') {
            console.log(JSON.parse(e.clipboardData.getData('text/json')));

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

    keyUpHandler = (event) => {
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

    getLibraryComponent(identifier: GlobalComponentTypeID): Workspace.Circuit {
        return this.controller.resolveComponentType(identifier);
    };

    circuitModified(stateOnly: boolean) {
        if (this.componentID == null) {
            if (!stateOnly) {
                new ComponentCreationDialog((name) => {
                    const component = <CompoundComponent>this.workspace.getCircuit();
                    this.componentID = this.controller.createComponent(new CompoundComponent(null, name, component.devices, component.connectors));
                    this.originalComponentID = this.componentID;
                    this.tab.find('.tabtitle')
                        .text(name);
                }, false).show();
            }

        } else {
            const circuit = this.workspace.getCircuit();
            this.controller.componentModified(new CompoundComponent(this.componentID.componentID, this.componentName, circuit.devices, circuit.connectors), this.componentID);
        }
    };

    openCompoundComponent(component: GlobalComponentTypeID, workspace: Workspace.Workspace) {
        this.controller.openComponent(component);
    };

    updateAbilities(abilities: Workspace.Abilities) {
        this.tabPane.find('.btn-delete')
            .prop('disabled', !abilities.removeSelected);
        this.tabPane.find('.btn-rotateleft')
            .prop('disabled', !abilities.rotateSelection);
        this.tabPane.find('.btn-rotateright')
            .prop('disabled', !abilities.rotateSelection);
        this.tabPane.find('.btn-parameter')
            .prop('disabled', !abilities.editSelectionParameters);
    }

    getSimulationInterface(): SimulationInterface {
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
            const component = <CompoundComponent>this.workspace.getCircuit();
            this.controller.createAndOpenComponent(new CompoundComponent(null, name, component.devices, component.connectors));
        }, true).show();
    }

    grabEquations(workspace) {
        let expressions: any = [];
        try {
            let circuit = this.workspace.getCircuit();
            // @ts-ignore
            expressions = new ExpressionExtractor().extractExpressions(circuit, this.getComponentWrapper.bind(this));
        } catch (e) {

        }
        if (expressions.length > 0) {
            new GrabExpressionsDialog(expressions).show();
        } else {
            InfoDialog.showDialog('No expressions were found');

        }
    }

    getComponentWrapper(libraryId, componentId) {
        return this.getLibraryComponent(new GlobalComponentTypeID(libraryId, componentId));
    }

    zoomChanged(zoomfactor: number) {
        this.tabPane.find(".zoom-group > input").val(parseFloat((zoomfactor * 100).toPrecision(2)) + " %");
    }

    public reinitUI() {
        this.tabPane.find('input:checkbox')
            .bootstrapToggle("destroy").bootstrapToggle();
        this.workspace.updatePositions();
    }
}

class ComponentCreationDialog extends Dialog {
    protected input: JQuery;

    constructor(protected callbackFunction: (name: string) => void, protected extracting: boolean) {
        super();
    }

    protected getTitle(): string {
        return this.extracting ? 'Extract Component' : 'Save as new Component?';
    }

    protected getContent(): JQuery {
        const text = this.extracting ? '<p><b>Please choose a name for the extracted component:</b></p>' :
            '<p>To save your modifications to this circuit,<br>it has to be saved as a new' +
            ' component!</p>' +
            '<p><b>Please choose a name:</b></p>';

        const content: JQuery = $('<div></div>')
            .append(text);
        this.input = $('<input type="text"/>');
        this.input.val('New Component');
        this.input.addClass('beast-horizontal-fill');
        content.append(this.input);

        this.input.on('input', () => {
            this.setButtonDisabled(this.extracting ? 'Extract' : 'Save', this.input.val().length == 0);
        });

        this.addButton(this.extracting ? 'Extract' : 'Save', this.extracting ? 'glyphicon glyphicon-share' : 'glyphicon ' +
            'glyphicon-floppy-disk', this.confimedEvent);
        this.addButton('Cancel', 'glyphicon glyphicon-remove', () => this.close());

        this.registerKeyListener((key: number) => {
            //enter
            if (key == 13) {
                this.confimedEvent();
            }
        });

        return content;
    }

    confimedEvent = () => {
        const val: string = this.input.val();
        if (val.length != 0) {
            this.callbackFunction(this.input.val());
            this.close();
        }
    };
}

class GrabExpressionsDialog extends Dialog {

    constructor(private expressions) {
        super();
    }

    protected getTitle(): string {
        return 'Grab equation';
    }

    protected getContent(): JQuery {
        let text = '<p><b>Expressions that were found:</b></p>';
        this.expressions.forEach((expression, i) => {
            text += '<span class="grabbed-expression">' + expression.output + ' = ' + expression.expression + '</span><br/>'
        });

        const content: JQuery = $('<div></div>')
            .append(text);
        const self = this;
        content.find('.grabbed-expression')
            .on('click', function () {
                self.selectText($(this));
            });

        this.addButton('Ok', 'glyphicon glyphicon-remove', () => this.close());

        this.registerKeyListener((key: number) => {
            //enter
            if (key == 13) {
                this.close();
            }
        });

        return content;
    }

    selectText(element) {
        element.select();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element[0]);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}