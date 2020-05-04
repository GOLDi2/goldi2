/**
 * Created by maximilian on 30.05.17.
 */
class WorkspaceController {
    constructor(controller) {
        this.controller = controller;
        this.editorControllers = [];
    }
    /*
     * resets the Editors to their basic state - only the main circuit of the project opened
     */
    resetEditors() {
        for (let editor of this.editorControllers) {
            this.closeEditor(editor);
        }
        const maincircuit = this.controller.getPersistenceController()
            .getCurrentProject().circuit;
        this.openEditor(maincircuit, null, new GlobalComponentTypeID(null, maincircuit.ID), false);
    }
    openEditor(component, originalID, id, closeable) {
        const editor = new EditorController(this, component, originalID, id, $('.tab-content'), $('#tabBar'), closeable);
        this.editorControllers.push(editor);
        this.selectEditor(editor);
    }
    closeEditor(editor) {
        //Save in production as main tab cannot be closed
        editor.remove();
        this.editorControllers.splice(this.editorControllers.indexOf(editor), 1);
        if (editor === this.currentEditor) {
            this.selectEditor(this.editorControllers[0]);
        }
    }
    selectEditor(editor) {
        if (this.currentEditor !== undefined) {
            this.currentEditor.deactivateTab();
        }
        this.currentEditor = editor;
        this.currentEditor.activateTab();
    }
    openComponent(componentID) {
        let component = this.resolveComponentType(componentID);
        if (Component.isCompound(component)) {
            const openEditor = this.editorControllers.find((ec) => {
                return ec.originalComponentID && componentID &&
                    ec.originalComponentID.componentID === componentID.componentID &&
                    ec.originalComponentID.libraryID === componentID.libraryID;
            });
            if (openEditor !== undefined)
                this.selectEditor(openEditor);
            else
                this.openEditor(component, componentID, (componentID.libraryID == BeastController.DEPOSIT_LIB_ID) ? componentID : null, true);
        }
        else {
            InfoDialog.showDialog('Basic components cannot be edited!');
        }
    }
    resolveComponentType(id) {
        return this.controller.resolveComponentType(id);
    }
    getSimulationInterface() {
        return this.editorControllers[0].getSimulationInterface();
    }
    componentModified(component, id) {
        this.controller.componentModified(component, id);
    }
    createComponent(component) {
        return this.controller.createComponent(component);
    }
    createAndOpenComponent(component) {
        this.controller.createAndOpenComponent(component);
    }
}
//# sourceMappingURL=workspaceController.js.map