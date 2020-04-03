/**
 * Created by maximilian on 30.05.17.
 */
class WorkspaceController {
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
    closeEditor(editor) {
        //Save in prodiction as main tab cannot be closed
        editor.remove();
        if (editor === this.currentEditor) {
            this.selectEditor(this.editorControllers[0]);
        }
    }
    selectEditor(editor) {
        if (this.currentEditor !== undefined)
            this.currentEditor.deactivateTab();
        this.currentEditor = editor;
        this.currentEditor.activateTab();
    }
}
//# sourceMappingURL=workspaceController.js.map