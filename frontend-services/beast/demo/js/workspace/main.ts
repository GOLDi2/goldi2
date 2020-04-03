/**
 * Created by maximilian on 18.05.17.
 */


namespace Workspace {
    export type Circuit = any;
    export type SubCircuit = Circuit;
    
    export type dragMode = "pan" | "select";
    export interface Abilities {
        removeSelected: boolean;
        editSelectionParameters: boolean;
        rotateSelection: boolean;
    }
    
    export interface SimcirPort extends SimcirDevice<SimcirDeviceDef> {
        setExternalManipulation(value: boolean);
        setManipulationValue(value);
    }
    
    export interface SimcirWorkspace {
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
        getPorts(): {inports: Array<SimcirPort>, outports: Array<SimcirPort>};
    
        markDirty: (stateOnly: boolean) => void,
        openCompound: (identifier: GlobalComponentTypeID) => void
        selectionChanged: (size: number) => void
    }
    
    /**
     * Specifies the expected controller functions - documentation can be found at the WorkspaceController
     */
    export interface WorkspaceControllerInterface{
        getLibraryComponent(identifier: GlobalComponentTypeID): Circuit;
        circuitModified(stateOnly: boolean);
        openCompoundComponent(identifier: GlobalComponentTypeID, workspace: Workspace);
        updateAbilities?(abilities: Abilities);
    }
    
    
    /**
     *
     */
    export class Workspace {
        protected controller: WorkspaceControllerInterface;
        protected simulationInterface: SimulationInterface = null;
        
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
            
            this.simcirWorkspace                  = simcir.createWorkspace(circuit, container, (id: GlobalComponentTypeID) => this.controller.getLibraryComponent(id));
            this.simcirWorkspace.markDirty        =  (stateOnly?: boolean) => (this.controller.circuitModified(stateOnly));
            this.simcirWorkspace.openCompound = (identifier : GlobalComponentTypeID) =>
                    (this.controller.openCompoundComponent(identifier, this));
            this.simcirWorkspace.selectionChanged = (n) => this.selectionChanged(n);
            
            this.selectionChanged(0);
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
        
        getSimulationInterface(): SimulationInterface {
            if (this.simulationInterface == null)
                this.simulationInterface = new SimulationInterface(this.simcirWorkspace)
            return this.simulationInterface
        }
        
        protected selectionChanged(size: number) {
            if (this.controller.updateAbilities != undefined)
                this.controller.updateAbilities(
                    {
                        rotateSelection: size > 0,
                        removeSelected: size > 0,
                        editSelectionParameters: size == 1,
                    })
        }
    }
    
    
}