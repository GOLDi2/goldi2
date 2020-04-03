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
    
        markDirty: () => void,
        openCompound: (identifier: string) => void
    }
    
    export interface WorkspaceControllerInterface{
        getLibraryComponent(identifier: string, workspace: Workspace): Circuit;
        circuitModified(workspace: Workspace); //TODO: connections or components changed?
        openCompoundComponent(identifier: string, workspace: Workspace);
    }
    
    export class Workspace {
        protected controller: WorkspaceControllerInterface;
        
        protected simcirWorkspace: SimcirWorkspace;
    
        constructor(container : JQuery, controller : WorkspaceControllerInterface, circuit : Circuit)
            {
                this.controller = controller;
            //this.ui = new WorkspaceUI(container);
            
            this.simcirWorkspace                  = simcir.createWorkspace(circuit, container);
            this.simcirWorkspace.markDirty        =  () => (this.controller.circuitModified(this));
                this.simcirWorkspace.openCompound = (identifer : string) =>
                    (this.controller.openCompoundComponent(identifer, this));
        }
    
        removeSelection() {
            this.simcirWorkspace.removeSelected();
        };
    
        editSelectionParameters() {
            this.simcirWorkspace.editSelectionParameters();
        }
    
        getCircuit(): Circuit {
            return this.simcirWorkspace.data();
        }
    
        getSelectedSubcircuit(): SubCircuit {
            return this.simcirWorkspace.selectedData();
        }
    
        pasteSubcircuit(subcircuit: SubCircuit) {
            this.simcirWorkspace.pasteSubcircuit(subcircuit);
        }
        
        setShowParameterTooltips(show: boolean) {
            this.simcirWorkspace.setShowParameterTooltips(show)
        }
    
        setDragMode(mode: dragMode) {
            this.simcirWorkspace.setDragMode(mode === 'pan');
        }
        
        setShowConnectorState(showState: boolean) {
            this.simcirWorkspace.setShowConnectorState(showState);
        }
    
        setRelativeZoom(factor: number) {
        
        }
        
        resetZoom() {
        
        }
        
        rotateSelection(angle: number) {
            this.simcirWorkspace.rotateSelection(angle);
        }
    }
    
    
}