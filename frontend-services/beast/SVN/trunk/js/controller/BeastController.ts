/**
 * Created by mseeber on 5/10/17.
 */
    
    ///<reference path="../model/model.ts" />
    ///<reference path="../d_ts/jquery.d.ts" />
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
}

/**
 * This class contains all startup logic for BEAST and thus marks the entry point
 * when using beast.
 */
class BeastController
{
    
    private model : BeastPersistence;
    //private view : BeastUI;
    private treeController;
    private workspaceController : WorkspaceController;
    private externalControl : BeastExternalInterface;
    
    constructor()
        {
            this.model               = new BeastPersistence();
            //this.view            = new BeastUI();
            this.treeController      = new Tree.TreeController(this);
            this.workspaceController = new WorkspaceController();
            this.externalControl     = new BeastExternalInterface();
        }
    
    treeModified()
        {
            //Called when tree is modified
        }
    
    //example method for adding Javascript
    public static registerDefaultComponent(circuit : any) : void
        {
        
        }
}

$(document)
    .ready(function()
           {
               new BeastController();
           }
    );