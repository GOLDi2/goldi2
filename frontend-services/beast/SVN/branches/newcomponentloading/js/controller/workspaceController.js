/**
 * Created by maximilian on 30.05.17.
 */
class WorkspaceController {
    constructor(controller) {
        this.controller = controller;
        this.editorControllers = [];
        this.openEditor();
        this.openEditor();
        this.openEditor();
    }
    openEditor() {
        const editor = new EditorController(this, $(".tab-content"), $("#tabBar"));
        this.editorControllers.push(editor);
        this.selectEditor(editor);
    }
    closeEditor(editor) {
        //Save in production as main tab cannot be closed
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
    openComponent(component) {
        //TODO: Open component in new tab
    }
    resolveComponentType(id) {
        return this.controller.resolveComponentType(id);
    }
}
//# sourceMappingURL=workspaceController.js.map