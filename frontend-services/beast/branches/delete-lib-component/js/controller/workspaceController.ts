/**
 * Created by maximilian on 30.05.17.
 */

class WorkspaceController {
    protected editorControllers: Array<EditorController>;
    protected currentEditor: EditorController;
    
    constructor() {
        this.editorControllers = [];
        
        //this.openEditor();
        this.openEditor();
    }
    
    openEditor() {
        const editor = new EditorController(this, $(".tab-content"), $("#tabBar"));
    
        this.editorControllers.push(editor);
        this.selectEditor(editor);
    }
    
    closeEditor(editor: EditorController){
        //Save in prodiction as main tab cannot be closed
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
    
    openComponent(component: ComponentIdentifier) {
        //TODO: Open component in new tab
    }
}