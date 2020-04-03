/**
 * Created by maximilian on 30.05.17.
 */

interface WorkspaceBeastControllerInterface
{
    resolveComponentType(id : GlobalComponentTypeID) : Component;
    getPersistenceController() : PersistenceController;
    componentModified(component : CompoundComponent, id : GlobalComponentTypeID);
    createComponent(component : CompoundComponent | string) : GlobalComponentTypeID;
    createAndOpenComponent(component : CompoundComponent | string);
}

class WorkspaceController
{
    protected editorControllers : Array<EditorController>;
    protected currentEditor : EditorController;
    
    constructor(protected readonly controller : WorkspaceBeastControllerInterface)
        {
            this.editorControllers = [];
        }
    
    /*
     * resets the Editors to their basic state - only the main circuit of the project opened
     */
    resetEditors()
        {
            for (let editor of this.editorControllers.slice()) //slice to create new, independent list
            {
                this.closeEditor(editor);
            }
            
            const maincircuit = this.controller.getPersistenceController()
                                    .getCurrentProject().circuit;
            this.openEditor(maincircuit, null, new GlobalComponentTypeID(null, maincircuit.ID), false);
        }
    
    protected openEditor(component : CompoundComponent, originalID: GlobalComponentTypeID, id : GlobalComponentTypeID, closeable : boolean)
        {
            const editor = new EditorController(this, component, originalID, id, $('.tab-content'), $('#tabBar'), closeable);
            
            this.editorControllers.push(editor);
            this.selectEditor(editor);
        }
    
    closeEditor(editor : EditorController)
        {
            editor.remove();
            this.editorControllers.splice(this.editorControllers.indexOf(editor), 1);
            if (editor === this.currentEditor)
            {
                this.selectEditor(this.editorControllers[0]);
            }
        }
    
    selectEditor(editor : EditorController)
        {
            if (this.currentEditor !== undefined)
            {
                this.currentEditor.deactivateTab();
            }
            this.currentEditor = editor;
            if (editor != undefined)
                this.currentEditor.activateTab();
        }
    
    openComponent(componentID : GlobalComponentTypeID)
        {
            let component = this.resolveComponentType(componentID);
            if (Component.isCompound(component))
            {
                const openEditor: EditorController = this.editorControllers.find((ec) =>  {
                    return ec.originalComponentID && componentID &&
                           ec.originalComponentID.componentID === componentID.componentID &&
                           ec.originalComponentID.libraryID === componentID.libraryID;
                });
                if (openEditor !== undefined)
                    this.selectEditor(openEditor)
                else
                    this.openEditor(component, componentID, (componentID.libraryID == BeastController.DEPOSIT_LIB_ID) ? componentID : null, true);
            }
            else
            {
                InfoDialog.showDialog('Basic components cannot be edited!');
            }
        }
    
    resolveComponentType(id : GlobalComponentTypeID) : Component
        {
            return this.controller.resolveComponentType(id);
        }
    
    getSimulationInterface() : SimulationInterface
        {
            return this.editorControllers[0].getSimulationInterface();
        }
    
    componentModified(component : CompoundComponent, id : GlobalComponentTypeID)
        {
            this.controller.componentModified(component, id);
        }
    
    public createComponent(component : CompoundComponent | string) : GlobalComponentTypeID
        {
            return this.controller.createComponent(component);
        }
    
    public createAndOpenComponent(component : CompoundComponent | string)
        {
            this.controller.createAndOpenComponent(component);
        }
}