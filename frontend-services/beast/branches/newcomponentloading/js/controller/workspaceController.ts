/**
 * Created by maximilian on 30.05.17.
 */

interface WorkspaceBeastControllerInterface {
    resolveComponentType(id : GlobalComponentTypeID) : Component;
    getPersistenceController(): PersistenceController;
    componentModified(component: CompoundComponent, id: GlobalComponentTypeID);
}

class WorkspaceController {
    protected editorControllers: Array<EditorController>;
    protected currentEditor: EditorController;
    
    constructor(protected readonly controller: WorkspaceBeastControllerInterface) {
        this.editorControllers = [];
    }
    
    /*
     * resets the Editors to their basic state - only the main circuit of the project opened
     */
    resetEditors() {
        for (let editor of this.editorControllers)
            this.closeEditor(editor);
        
        const maincircuit = this.controller.getPersistenceController().getCurrentProject().circuit;
        this.openEditor(maincircuit, new GlobalComponentTypeID(null, maincircuit.ID), false);
    }
    
    openEditor(component: CompoundComponent, id: GlobalComponentTypeID, closeable: boolean) {
        let modifiedHandler = (modifiedcomponent: CompoundComponent) => {
            this.controller.componentModified(modifiedcomponent, id)
        }
        const editor = new EditorController(this, component, modifiedHandler , $(".tab-content"), $("#tabBar"), closeable);
    
        this.editorControllers.push(editor);
        this.selectEditor(editor);
    }
    
    closeEditor(editor: EditorController){
        //Save in production as main tab cannot be closed
        editor.remove();
        if (editor === this.currentEditor) {
            this.selectEditor(this.editorControllers[0]);
        }
    }
    
    selectEditor(editor: EditorController){
        if (this.currentEditor !== undefined)
            this.currentEditor.deactivateTab();
        this.currentEditor = editor;
        this.currentEditor.activateTab();
    }
    
    openComponent(componentID: GlobalComponentTypeID) {
        // TODO: Implement a logic for the saving to the Deposit!
        // Currently, test edit can be made to components opened with tis function
        // but are not save because the componentModified function in the BEASTController
        // ignores all changes besides those made to the main circuit of the project!
        let component = this.resolveComponentType(componentID);
        if (Component.isCompound(component))
            this.openEditor(component, componentID, true);
        else
            alert("Basic components cannot be edited!")
    }
    
    resolveComponentType(id : GlobalComponentTypeID) : Component {
        return this.controller.resolveComponentType(id);
    }
}