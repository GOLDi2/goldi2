/**
 * Created by maximilian on 18.05.17.
 */
var Workspace;
(function (Workspace_1) {
    class Workspace {
        constructor(container, controller, circuit) {
            this.controller = controller;
            //this.ui = new WorkspaceUI(container);
            this.simcirWorkspace = simcir.createWorkspace(circuit, container);
            this.simcirWorkspace.markDirty = () => (this.controller.circuitModified(this));
            this.simcirWorkspace.openCompound = (identifer) => (this.controller.openCompoundComponent(identifer, this));
        }
        removeSelection() {
            this.simcirWorkspace.removeSelected();
        }
        ;
        editSelectionParameters() {
            this.simcirWorkspace.editSelectionParameters();
        }
        getCircuit() {
            return this.simcirWorkspace.data();
        }
        getSelectedSubcircuit() {
            return this.simcirWorkspace.selectedData();
        }
        pasteSubcircuit(subcircuit) {
            this.simcirWorkspace.pasteSubcircuit(subcircuit);
        }
        setShowParameterTooltips(show) {
            this.simcirWorkspace.setShowParameterTooltips(show);
        }
        setDragMode(mode) {
            this.simcirWorkspace.setDragMode(mode === 'pan');
        }
        setShowConnectorState(showState) {
            this.simcirWorkspace.setShowConnectorState(showState);
        }
        setRelativeZoom(factor) {
        }
        resetZoom() {
        }
        rotateSelection(angle) {
            this.simcirWorkspace.rotateSelection(angle);
        }
    }
    Workspace_1.Workspace = Workspace;
})(Workspace || (Workspace = {}));
//# sourceMappingURL=main.js.map