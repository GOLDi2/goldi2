/**
 * Created by mseeber on 5/10/17.
 */
    
    ///<reference path="../model/model.ts" />
    //fixme replace with interface description of real modules
    //forward declaration (remove when modules are implemented)
class BeastUI
{
    private controller : BeastController;
}

class BeastExternalInterface
{
    private controller : BeastController;
}
class BeastPersistence
{
    private controller : BeastController;
    private locallySaved : boolean;
    
    public isLocallySaved() : boolean
        {
            return this.locallySaved;
        }
    
    public saveProject() : void
        {
            //TODO inject project
            saveProjectLocaly(null);
            this.locallySaved = true;
        }
    
    public downloadProject() : void
        {
            //TODO inject project
            saveAsFile(null, null);
            this.locallySaved = true;
        }
    
    public loadProject(name : string) : void
        {
            this.locallySaved = true;
            loadProject(name);
        }
    
    public uploadProject(file : File) : void
        {
            this.locallySaved = true;
            loadFromFile(file);
        }
        
    public sessionSave() : void{
        this.locallySaved = false;
        //TODO inject project
        saveProjectLocaly(null);
    }
    
    public sessionLoad() : void{
        this.locallySaved = true;
        getSessionProject();
        //TODO loadProject
    }
}

/**
 * This class contains all startup logic for BEAST and thus marks the entry point
 * when using beast.
 */
export class BeastController
{
    
    private model : BeastPersistence;
    private view : BeastUI;
    private externalControl : BeastExternalInterface;
    
    constructor()
        {
            this.model           = new BeastPersistence();
            this.view            = new BeastUI();
            this.externalControl = new BeastExternalInterface();
        }
}

