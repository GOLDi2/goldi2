/**
 * Created by maximilian on 18.05.17.
 */
var Workspace;
(function (Workspace_1) {
    /**
     *
     */
    class Workspace {
        /**
         * Initializes the Workspace
         * @param container - The DOM object in with to create the workspace. It has to be connected to the document
         * @param controller - The workspace controller providing the callbacks specified in WorkspaceControllerInterface
         * @param circuit - the circuit to be opened in this Workspace
         */
        constructor(container, controller, circuit) {
            this.simulationInterface = null;
            this.controller = controller;
            //this.ui = new WorkspaceUI(container);
            this.simcirWorkspace = simcir.createWorkspace(circuit, container, (id) => this.controller.getLibraryComponent(id));
            this.simcirWorkspace.markDirty = () => (this.controller.circuitModified(this));
            this.simcirWorkspace.openCompound = (identifier) => (this.controller.openCompoundComponent(identifier, this));
            this.simcirWorkspace.selectionChanged = (n) => this.selectionChanged(n);
            this.selectionChanged(0);
        }
        /**
         * removes the selected devices from the workspace
         */
        removeSelection() {
            this.simcirWorkspace.removeSelected();
        }
        ;
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
        getCircuit() {
            return this.simcirWorkspace.data();
        }
        /**
         * Gets the current state of the selected subcircuit.
         * @returns {SubCircuit}
         */
        getSelectedSubcircuit() {
            return this.simcirWorkspace.selectedData();
        }
        /**
         * Adds the subcircuit to the current workspace.
         * @param subcircuit - Subcircuit to be pasted
         */
        pasteSubcircuit(subcircuit) {
            this.simcirWorkspace.pasteSubcircuit(subcircuit);
        }
        /**
         * Enables or disables the display of parameter tooltips.
         * @param show
         */
        setShowParameterTooltips(show) {
            this.simcirWorkspace.setShowParameterTooltips(show);
        }
        /**
         * Sets whether dragging on the workspace background begins a range selection or pans it.
         * @param mode
         */
        setDragMode(mode) {
            this.simcirWorkspace.setDragMode(mode === 'pan');
        }
        /**
         * Sets whether connectors are animated to display their state
         * @param showState
         */
        setShowConnectorState(showState) {
            this.simcirWorkspace.setShowConnectorState(showState);
        }
        /**
         * Zooms the workspace relatively to current zoom factor
         * @param factor
         */
        setRelativeZoom(factor) {
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
        rotateSelection(angle) {
            this.simcirWorkspace.rotateSelection(angle);
        }
        getSimulationInterface() {
            if (this.simulationInterface == null)
                this.simulationInterface = new Workspace_1.SimulationInterface(this.simcirWorkspace);
            return this.simulationInterface;
        }
        selectionChanged(size) {
            if (this.controller.updateAbilities != undefined)
                this.controller.updateAbilities({
                    rotateSelection: size > 0,
                    removeSelected: size > 0,
                    editSelectionParameters: size == 1,
                });
        }
    }
    Workspace_1.Workspace = Workspace;
})(Workspace || (Workspace = {}));
//# sourceMappingURL=main.js.map