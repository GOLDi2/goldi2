/**
 * Created by mseeber on 5/10/17.
 */


///<reference path="./common.ts" />
///<reference path="../model/model.ts" />
///<reference path="../fancytree/treeController.ts" />
///<reference path="../d_ts/jquery.d.ts" />
///<reference path="../d_ts/simcir.d.ts" />


/**
 * This class contains all startup logic for BEAST and thus marks the entry point
 * when using beast.
 */
class BeastController
{
    public static readonly BASIC_LIB_ID = 'beast-basic';
    public static readonly BASIC_COMPOUND_LIB_ID = 'beast-basic-compound';
    public static readonly DEPOSIT_LIB_ID = 'beast-deposit';
    
    public static readonly READ_ONLY_LIB_IDS = [BeastController.BASIC_LIB_ID, BeastController.BASIC_COMPOUND_LIB_ID];
    protected static basicComponents: Array<Component> = [];
    
    public persistenceController : PersistenceController;
    public treeController : TreeController;
    public workspaceController : WorkspaceController;
    public menubarController;
    public basicComponentsLib : Library;
    public basicComplexComponentsLib : Library;
    public userLibraries : Array<Library>;
    
    
    constructor()
        {
            this.persistenceController = new PersistenceController(this);
            this.initDefaultProject();
            this.treeController      = new TreeController(this, this);
            this.workspaceController = new WorkspaceController(this);
            this.menubarController   = new MenubarController(this);
            
            this.workspaceController.resetEditors();
        }
    
    public getTreeController()
        {
            return this.treeController;
        }
    
    /**
     * returns the Library of the given key or null if no
     * Library with the given key exists.
     *
     * @param id Project-unique Library ID
     * @returns {any} Library or null
     */
    public resolveLibrary(id : string) : Library
        {
            //handle the special libs
            if (id == this.basicComponentsLib.ID) return this.basicComponentsLib;
            if (id == this.basicComplexComponentsLib.ID) return this.basicComplexComponentsLib;
    
            //handle the user libs
            let userLibraries = this.persistenceController.getLibraries();
            for (let lib of userLibraries)
            {
                if (lib.ID == id)
                {
                    return lib;
                }
            }
            //lib not found
            return null;
        }
    
    /**
     * Returns a Component Type from it's global ID
     *
     * @param id
     * @returns {Component} Component or null if no Component with corresponding key is found
     */
    public resolveComponentType(id : GlobalComponentTypeID) : Component
        {
            let lib = this.resolveLibrary(id.libraryID);
            for (let component of lib.components)
            {
                if (component.ID == id.componentID)
                {
                    return component;
                }
            }
            //component not found
            return null;
        }
    
    /**
     * modelChanged() is called when the model is changed.
     * @param type DataType which changed
     */
    modelChanged(type : DataType)
        {
            //TODO Call the responding controllers for updates
            switch (type)
            {
                case DataType.Info:
                    break;
                case DataType.Connectors:
                    break;
                case DataType.Components:
                    break;
                case DataType.Libraries:
                    break;
                case DataType.Project:
                    if (this.workspaceController) this.workspaceController.resetEditors();
                    break;
                //TODO Call controllers at changing the whole Project
            }
        }
    
    /**
     * This loads the default project and initializes also the basic libraries.
     * If the default project is a new empty project, the deposit gets added to the projects
     * persistent libraries.
     * FIXME correct this comment ad function
     */
    public initDefaultProject()
        {
            let persist = this.persistenceController;
            
            
            this.basicComponentsLib            = new Library('beast-basic', 'Basic Components');
            this.basicComponentsLib.components = BeastController.basicComponents;
            
            this.basicComplexComponentsLib = this.persistenceController.loadStaticLibrary("assets/beast-basic-compound.bdcl");
    
            let userLibraries = this.persistenceController.getLibraries();
            if(userLibraries.length == 0) {
                userLibraries.push(new Library(BeastController.DEPOSIT_LIB_ID, 'Deposit'));
                this.persistenceController.markDirty(DataType.Project);
            }
            
        }
    
    /**
     * Checks if the specified Library is a basic read only Library
     *
     * @param library
     */
    public isReadOnlyLibrary(library : Library) : boolean
        {
            //is there a match in the list?
            return (BeastController.READ_ONLY_LIB_IDS.indexOf(library.ID) >= 0);
        }
    
    public componentModified(component: CompoundComponent, id: GlobalComponentTypeID) {
        if (id.componentID == "project")
            this.persistenceController.getCurrentProject().circuit = component;
        this.persistenceController.markDirty(DataType.Components);
        this.persistenceController.markDirty(DataType.Connectors);
        this.persistenceController.saveCurrentProjectLocaly();
    }
    
    /**
     * Checks if the given global id refers to a basic component.
     * @param id
     * @returns {boolean}
     */
    public isBasicComponentType(id : GlobalComponentTypeID) : boolean
        {
            let lib = this.resolveLibrary(id.libraryID);
            //There is only one basic lib with basic omponents
            //All other libs contain Compound Components
            return (lib.ID == BeastController.BASIC_LIB_ID)
        }
    
    /**
     * Deletes a single Component from the Project, specified by it's key
     * If the component can not be deleted due to dependencies,
     * this method returns false else true.
     *
     * @param key the global key of the component as string TODO new key format
     * @returns {boolean} false if the component can not be deleted.
     */
    public deleteSingleComponent(key : GlobalComponentTypeID) : boolean
        {
            let containingLib = this.resolveLibrary(key.libraryID);
            if(this.isReadOnlyLibrary(containingLib)) {
                return false;
            }
            
            let component = this.resolveComponentType(key);
            if(component == null) {
                //component not found
                return false;
            }
            
            //TODO implement dependecy check
            containingLib.removeComponent(component);
            return true;
        }
    
    /**
     * removeComponent() allows deleting selected elements in the tree, while also deleting it in the data structure.
     *
     * @param event
     */
    public deleteComponent = (event, treeNode) =>
    {
        
        let persist     = this.persistenceController;
        let p : Project = persist.getCurrentProject();
        let lib         = p.libraries;
        
        let key;
        let parent;
        let searchResults;
        let indexLib;
        let indexComp;
        let isBasic;
        
        let mode     = (event == null) ? 'single' : event.data.mode;
        let nodeSize = 0;
        let node;
        if (mode == 'multi')
        {
            node     = $('#tree')
                .fancytree('getTree')
                .getSelectedNodes();
            nodeSize = node.length;
        }
        else if (mode == 'single')
        {
            node     = treeNode;
            nodeSize = 1;
        }
        
        //needed to access tree controller from callback
        let treeController = this.getTreeController();
        
        //TODO move into treecontroller.ts
        if (nodeSize > 0)
        {
            $('<div></div>')
                .dialog({
                            title   : 'Do you really want to delete the selected node?',
                            modal   : true,
                            width   : 450,
                            buttons : [
                                {
                                    text : 'Delete', click : function()
                                {
                            
                            
                                    for (let i = 0; i < nodeSize; i++)
                                    {
                                
                                
                                        if (mode == 'multi')
                                        {
                                            key    = node[i].key;
                                            parent = node[i].parent.key;
                                    
                                        }
                                        else if (mode == 'single')
                                        {
                                            key    = node.key;
                                            parent = node.parent.key;
                                        }
                                
                                        //TODO maybe change to instance method call?
                                        searchResults = treeController.searchTree(lib, key, parent);
                                        isBasic       = searchResults.isBasic;
                                        indexLib      = searchResults.indexLib;
                                        indexComp     = searchResults.indexComp;
                                
                                
                                        if (true /*!isBasic*/)
                                        {
                                            //Component selected.
                                            if (indexComp != -1)
                                            {
                                                lib[indexLib].components.splice(Number(indexComp), 1);
                                            }
                                            //Library selected.
                                            else
                                            {
                                                lib.splice(Number(indexLib), 1);
                                            }
                                    
                                            if (mode == 'multi')
                                            {
                                                node[i].remove();
                                            }
                                            else if (mode == 'single')
                                            {
                                                node.remove();
                                            }
                                        }
                                
                                    }
                            
                                    // Applies the changes to the data structure.
                                    // TODO save the structure change in project and sessionstorage
                                    //this.setLibraries(lib);
                            
                                    $(this)
                                        .dialog('destroy');
                            
                                }
                                }, {
                                    text : 'Cancel', click : function()
                                    {
                                        $(this)
                                            .dialog('destroy');
                                    }
                                }]
                        });
        }
        //TODO is this assignment nescessary? isn't this pass by reference anyway?
        persist.getCurrentProject().libraries = p.libraries;
        persist.markDirty(DataType.Project);
    
        throw("YOU SHALL NOT CALL THIS FUNCTION, it is deprecated");
    };
    
    
    /**
     *
     * @returns {PersistenceController}
     */
    getPersistenceController() : PersistenceController
        {
            return this.persistenceController;
        }
    
    
    /**
     * Registers a component as a basic component to BEAST
     * Registered components can later be referenced in the
     * Library for basic components
     */
    public static registerDefaultComponent(component : Component) : void
        {
         BeastController.basicComponents.push(component);
        }
    
    /**
     * returns a list of all available libraries even read only ones
     *
     * @returns {Array<Library>}
     */
    public getLibraries() : Array<Library>
        {
            let libraries = Array<Library>();
            libraries.push(this.basicComponentsLib);
            libraries.push(this.basicComplexComponentsLib);
            
            //concat does not mutate original array, therefor assignment is needed
            libraries = libraries.concat(this.persistenceController.getLibraries());
            
            return libraries;
        }
    
}


/**
 * creates a new BeastController
 */
$(document)
    .ready(function()
           {
               new BeastController();
           }
    );