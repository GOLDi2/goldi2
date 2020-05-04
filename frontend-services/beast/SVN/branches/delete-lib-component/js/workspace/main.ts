/**
 * Created by maximilian on 18.05.17.
 */


namespace Workspace {
    export type Circuit = any;
    export type SubCircuit = Circuit;
    
    export type dragMode = "pan" | "select";
    
    interface SimcirWorkspace {
        ui: JQuery,
        data(): Circuit,
        selectedData(): SubCircuit,
        pasteSubcircuit(subcircuit: SubCircuit): void;
        removeSelected(): void,
        editSelectionParameters(): void,
        setShowParameterTooltips(show: boolean): void,
        setDragMode(pan: boolean);
        rotateSelection(angle: number);
        setShowConnectorState(showState: boolean);
        zoomRelative(zoomfactor:number);
    
        markDirty: () => void,
        openCompound: (identifier: ComponentIdentifier) => void
    }
    
    /**
     * Specifies the expected controller functions - documentation can be found at the WorkspaceController
     */
    export interface WorkspaceControllerInterface{
        getLibraryComponent(identifier: ComponentIdentifier, workspace: Workspace): Circuit;
        circuitModified(workspace: Workspace); //TODO: connections or components changed?
        openCompoundComponent(identifier: ComponentIdentifier, workspace: Workspace);
    }
    
    
    /**
     *
     */
    export class Workspace {
        protected controller: WorkspaceControllerInterface;
        
        protected simcirWorkspace: SimcirWorkspace;
    
        /**
         * Initializes the Workspace
         * @param container - The DOM object in with to create the workspace. It has to be connected to the document
         * @param controller - The workspace controller providing the callbacks specified in WorkspaceControllerInterface
         * @param circuit - the circuit to be opened in this Workspace
         */
        constructor(container : JQuery, controller : WorkspaceControllerInterface, circuit : Circuit)
            {
                this.controller = controller;
            //this.ui = new WorkspaceUI(container);
            
            this.simcirWorkspace                  = simcir.createWorkspace(circuit, container);
            this.simcirWorkspace.markDirty        =  () => (this.controller.circuitModified(this));
            this.simcirWorkspace.openCompound = (identifier : ComponentIdentifier) =>
                    (this.controller.openCompoundComponent(identifier, this));
        }
    
        /**
         * removes the selected devices from the workspace
         */
        removeSelection() {
            this.simcirWorkspace.removeSelected();
        };
    
        /**
         * opens the parameter editing dialog for the selected device
         */
        editSelectionParameters() {
            this.simcirWorkspace.editSelectionParameters();
        }
    
        /**
         * Gets the current state of the circuit opened in the workspace.
         * @returns {Circuit}
         */
        getCircuit(): Circuit {
            return this.simcirWorkspace.data();
        }
    
        /**
         * Gets the current state of the selected subcircuit.
         * @returns {SubCircuit}
         */
        getSelectedSubcircuit(): SubCircuit {
            return this.simcirWorkspace.selectedData();
        }
    
        /**
         * Adds the subcircuit to the current workspace.
         * @param subcircuit - Subcircuit to be pasted
         */
        pasteSubcircuit(subcircuit: SubCircuit) {
            this.simcirWorkspace.pasteSubcircuit(subcircuit);
        }
    
        /**
         * Enables or disables the display of parameter tooltips.
         * @param show
         */
        setShowParameterTooltips(show: boolean) {
            this.simcirWorkspace.setShowParameterTooltips(show)
        }
    
        /**
         * Sets whether dragging on the workspace background begins a range selection or pans it.
         * @param mode
         */
        setDragMode(mode: dragMode) {
            this.simcirWorkspace.setDragMode(mode === 'pan');
        }
    
        /**
         * Sets whether connectors are animated to display their state
         * @param showState
         */
        setShowConnectorState(showState: boolean) {
            this.simcirWorkspace.setShowConnectorState(showState);
        }
    
        /**
         * Zooms the workspace relatively to current zoom factor
         * @param factor
         */
        setRelativeZoom(factor: number) {
            this.simcirWorkspace.zoomRelative(factor);
        }
    
        /**
         * Resets the zoom to the default
         */
        resetZoom() {
        }
    
        /**
         * Rotates the selected devices
         * @param angle - angle of rotation in degree - negative numbers mean left. Is supposed to be a multiple of
         * 90°.
         */
        rotateSelection(angle: number) {
            this.simcirWorkspace.rotateSelection(angle);
        }
    }
    
    
}