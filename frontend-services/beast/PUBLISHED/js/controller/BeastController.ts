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
    /**
     * BEAST-Version
     * @type {string}
     */
    public static readonly BEAST_VERSION : string = '1.0.0';
    
    public static readonly BASIC_LIB_ID          = 'beast-basic';
    public static readonly BASIC_COMPOUND_LIB_ID = 'beast-basic-compound';
    public static readonly DEPOSIT_LIB_ID        = 'beast-deposit';
    
    
    public static readonly READ_ONLY_LIB_IDS            = [BeastController.BASIC_LIB_ID, BeastController.BASIC_COMPOUND_LIB_ID];
    protected static basicComponents : Array<Component> = [];
    
    public persistenceController : PersistenceController;
    public treeController : TreeController;
    public workspaceController : WorkspaceController;
    public menubarController;
    public basicComponentsLib : Library;
    public basicComplexComponentsLib : Library;
    
    
    constructor(Callback: Function, localStoragePrefix: string = "")
        {
            this.persistenceController = new PersistenceController(this, localStoragePrefix);
            this.initDefaultProject(() => {
                this.treeController      = new TreeController(this);
                this.workspaceController = new WorkspaceController(this);
                this.menubarController   = new MenubarController(this);

                this.workspaceController.resetEditors();

                if(Callback !== undefined)
                    Callback();
            });

            if(window.location.href.search("loadBeastFile") !== -1){
                $.getJSON(window.location.href.match(/[^?]*\?[^=]*=(.*)/)[1],(data)=> {
                    if(data !== null)
                        this.persistenceController.setCurrentProject(this.persistenceController.loadProjectFromJSON(JSON.stringify(data)));
                });
            }
        }
    
    /**
     * Adds the version number as content to all HTML elements with the version-label class.
     */
    public initVersion()
        {
            //TODO maybe move into editor Controller or menubar controller?
            $('.version-label')
                .append(BeastController.BEAST_VERSION);
        }
    
    public invalidBEASTSession() : void
        {
            InfoDialog.showDialog('Multiple instances of BEAST are not allowed!');
        }
    
    /**
     * returns true if the current project is dirty (retains unsaved state)
     * @returns {boolean}
     */
    public isDirty() : boolean
        {
            return this.persistenceController.isDirty();
        }
    
    /**
     * Creates a new project and switches to it
     */
    public createNewProject()
        {
            this.persistenceController.createNewProject();
        }
    
    public listProjects() : string[]
        {
            return this.persistenceController.getProjects();
        }
    
    /**
     * Loads project of the specified name
     */
    public loadProject(name : string)
        {
            this.persistenceController.loadProject(name);
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
            switch (id)
            {
                //handle the special libs
                case this.basicComponentsLib.ID:
                    return this.basicComponentsLib;
                case this.basicComplexComponentsLib.ID:
                    return this.basicComplexComponentsLib;
                //handle the user libs
                default:
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
            //in case an invalid lib ID is delivered
            if (null == lib)
            {
                return null;
            }
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
     */
    modelChanged()
        {
        
        }
    
    /**
     * projectChanged() is called when the project is changed.
     */
    projectChanged()
        {
            const oldSI = this.getSimulationInterface();
            this.checkForDepositLibrary();
            this.treeController.reloadTree();
            this.workspaceController.resetEditors();

            const newSI = this.getSimulationInterface();
            oldSI.transferCallbacks(newSI);
        }
    
    private checkForDepositLibrary()
        {
            let userLibraries = this.persistenceController.getLibraries();
            for (const lib of userLibraries)
            {
                if (lib.ID === BeastController.DEPOSIT_LIB_ID)
                {
                    return;
                }
            }
            userLibraries.push(new Library(BeastController.DEPOSIT_LIB_ID, 'Deposit'));
        }
    
    /**
     * This loads the default project and initializes also the basic libraries.
     * If the default project is a new empty project, the deposit gets added to the projects
     * persistent libraries.
     */
    public initDefaultProject(Callback : Function)
        {
            this.basicComponentsLib            = new Library(BeastController.BASIC_LIB_ID, 'Basic Components');
            this.basicComponentsLib.components = BeastController.basicComponents;
            this.persistenceController.loadStaticLibrary('BEAST/assets/beast-basic-compound.bdcl', (result) => {
                this.basicComplexComponentsLib = result;
                this.checkForDepositLibrary();
                Callback();
            });
        }
    
    /**
     * Checks if the specified Library is a basic read only Library
     *
     * @param library
     */
    public static isReadOnlyLibrary(libraryID : string) : boolean
        {
            //is there a match in the list?
            return (BeastController.READ_ONLY_LIB_IDS.indexOf(libraryID) > -1);
        }
    
    /**
     * FIXME comment
     * TODO is this still used by the Workspace interface?
     * @param component
     * @param id
     */
    public componentModified(component : CompoundComponent, id : GlobalComponentTypeID)
        {
            console.assert(component.ID === id.componentID);
            if (id.componentID == 'project')
            {
                this.persistenceController.getCurrentProject().circuit = component;
            }
            else
            {
                const lib = this.resolveLibrary(id.libraryID);
                console.assert(lib !== null);
                for (let i in lib.components)
                {
                    if (lib.components[i].ID == id.componentID)
                    {
                        lib.components[i] = component;
                    }
                }
            }
            this.persistenceController.markDirty();
        }
    
    /**
     * Checks if the given LibraryID equals one of the basic libraries
     * @param libraryID ID to check
     * @returns {boolean} true, if ID equals one of the basic libraries
     */
    public static isBasicLibrary(libraryID : string) : boolean
        {
            return libraryID === BeastController.BASIC_LIB_ID || libraryID === BeastController.BASIC_COMPOUND_LIB_ID || libraryID === BeastController.DEPOSIT_LIB_ID;
        }
    
    /**
     * Checks if the given global id refers to a basic component.
     * //TODO deprecated by the fact, that we use separate classes now
     * @param id
     * @returns {boolean}
     */
    public isBasicComponentType(id : GlobalComponentTypeID) : boolean
        {
            let lib = this.resolveLibrary(id.libraryID);
            //There is only one basic lib with basic omponents
            //All other libs contain Compound Components
            return (lib.ID == BeastController.BASIC_LIB_ID);
        }
    
    /**
     * Puts a new component with the desired Name into the deposit of the current project
     * and returns the component.
     *
     * On Failure, null is returned and no Component is inserted ino the deposit
     *
     * @return {}
     */
    public createComponent(component : CompoundComponent | string) : GlobalComponentTypeID
        {
            //TODO maybe better handling?
            const name = (component instanceof CompoundComponent) ? component.name : component;
            const id   = PersistenceController.generateComponentId(name);
            if (component instanceof CompoundComponent) //Cannot check for instanceof string
            {
                component = new CompoundComponent(id, component.name, component.devices, component.connectors);
            }
            else
            {
                component = new CompoundComponent(id, component, [], []);
            }
            const globalId = new GlobalComponentTypeID(BeastController.DEPOSIT_LIB_ID, id);
            
            const lib = this.resolveLibrary(globalId.libraryID);
            console.assert(lib !== null);
            lib.addComponent(component);
            
            this.treeController.addComponent(globalId);
            this.persistenceController.markDirty();
            return globalId;
        }
    
    public createAndOpenComponent(component : CompoundComponent | string)
        {
            this.workspaceController.openComponent(this.createComponent(component));
        }

    /**
     * Creates a new component and puts it into library with given Name
     * if the library not exists it will be created
     * Returns null if component was not created
     * @return {}
     */
    public createComponentAndPutInLibrary(component: CompoundComponent, name: string) : GlobalComponentTypeID
        {

            let componentGlobalID = this.createComponent(component);
            if (!componentGlobalID)
            {
                return null;
            }

            let library: Library = this.createOrGetLibraryByName(name);
            library.addComponent(component);

            let globalID = new GlobalComponentTypeID(library.ID, component.ID);
            this.treeController.addComponent(globalID);
            this.persistenceController.markDirty();
            return componentGlobalID;
        }

    public reorderComponentAfter(startComponentID : GlobalComponentTypeID, insertComponentID : GlobalComponentTypeID) : boolean
        {
            const libArr     = this.resolveLibrary(startComponentID.libraryID).components;
            const startComp  = this.resolveComponentType(startComponentID);
            const insertComp = this.resolveComponentType(insertComponentID);
            if (startComp && insertComp)
            {
                arrayRemoveElementOnce(libArr, insertComp);
                libArr.splice(libArr.indexOf(startComp) + 1, 0, insertComp);
                this.persistenceController.markDirty();
                return true;
            }
            return false;
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
            if (null == containingLib)
            {
                return false;
            }
            if (BeastController.isReadOnlyLibrary(containingLib.ID))
            {
                return false;
            }
            
            let component = this.resolveComponentType(key);
            if (component == null)
            {
                //component not found
                return false;
            }
            
            let blockingDependencies = [];
            const currentProject = this.getPersistenceController().getCurrentProject();

            // check if any other component in any other library depends on this component
            for (let lib of currentProject.libraries)
            {
                if (lib.ID === BeastController.DEPOSIT_LIB_ID)
                {
                    continue;
                }

                for(let c of lib.components)
                {
                    //Cast is safe because we know it is a user lib at this point
                    let comp : CompoundComponent = <CompoundComponent> c;
                    if(comp.directlyDependsOn(key))
                    {
                        blockingDependencies.push({
                            componentID: comp.ID,
                            libraryName: lib.name
                        });
                    }
                }
            }

            // check if project page depends on this component
            let comp : CompoundComponent = <CompoundComponent> currentProject.circuit;
            if(comp.directlyDependsOn(key))
            {
                blockingDependencies.push({
                    componentID: comp.ID,
                });
            }

            if(blockingDependencies.length == 0)
            {
                containingLib.removeComponent(component);
                this.persistenceController.markDirty();
                return true;
            }
            else
            {
                let msg = 'Can not delete Component "' + component.name +
                          '" from Library "' + containingLib.name +
                          '" since following components depend on it: <br>';
                for(let dependency of blockingDependencies)
                {
                    if (!dependency.libraryName)
                    {
                        msg = msg.concat('<br> -').concat(' Main project page');
                    }
                    else
                    {
                        msg = msg.concat('<br> -').concat(' In library "' + dependency.libraryName + '" ');
                        msg = msg.concat('component - "').concat(dependency.componentID).concat('"');
                    }
                }
                InfoDialog.showDialog(msg);
                return false;
            }
        }
    
    /**
     * Creates a copy of the Component behind the specified Global Component ID
     * in the Library specified by the targetLibraryID.
     *
     * This operation may fail due to overlapping IDs
     * @param componentID
     * @param targetLibraryID
     * @return {GlobalComponentTypeID | null}
     */
    public copyComponent(componentID : GlobalComponentTypeID, targetLibraryID : string) : GlobalComponentTypeID
        {
            //check if component is not moved over library boundary
            if(componentID.libraryID == targetLibraryID)
            {
                //do nothing
                return null;
            }
            //TODO change error signaling
            let targetLibrary = this.resolveLibrary(targetLibraryID);
            if (BeastController.isReadOnlyLibrary(targetLibrary.ID))
            {
                InfoDialog.showDialog('Library: '.concat(targetLibrary.name)
                                                 .concat(' is read only.'));
                return null;
            }
            if (this.isBasicComponentType(componentID))
            {
                InfoDialog.showDialog('Basic components can not be copied into other libraries.');
                return null
            }
            
            //check if ID collides in target library
            let newTargetComponentID = new GlobalComponentTypeID(targetLibraryID, componentID.componentID);
            {
                let testTarget = this.resolveComponentType(newTargetComponentID);
                
                if(null != testTarget) {
                    InfoDialog.showDialog('The component: '.concat(testTarget.name)
                                                           .concat(' already exists in Library: ').concat(targetLibrary.name));
                    return null;
                }
            }
            
            let sourceComponent : CompoundComponent = <CompoundComponent> this.resolveComponentType(componentID);
            
            //all dependencies are resolved now, so conflicts and problems can be detected before
            //actually copying anything
            
            //extract all dependecies that need to be copied
            let copyDependencies : GlobalComponentTypeID[] = [];
            for (let d of sourceComponent.listAllDependencies(this))
            {
                //exclude all the read only components
                if (!BeastController.isReadOnlyLibrary(d.libraryID))
                {
                    copyDependencies.push(d);
                }
            }
    
            if(copyDependencies.length != 0)
            {
                let msg = 'The source component '+ sourceComponent.name + ' dependes on the following components.';
    
                for(let d of copyDependencies)
                {
                    msg = msg.concat('<br>').concat(d.libraryID + ' ' + d.componentID);
                }
                InfoDialog.showDialog(msg);
            }
            
            //also copy all dependencies that must be copied
            for(let d of copyDependencies)
            {
                this.copyComponent(d, targetLibraryID);
            }
    
            let newComponent = sourceComponent.copy();
            targetLibrary.components.push(newComponent);
            this.treeController.addComponent(newTargetComponentID);
            this.persistenceController.markDirty();
            return newTargetComponentID;
        }
    
    /**
     * Deletes a user defined Library from the current project if there are
     * no dependencies in the main circuit.
     *
     * @param libID
     * @returns {boolean}
     */
    public deleteLibrary(libID : string) : boolean
        {
            let lib = this.resolveLibrary(libID);
            //check if lib is read only and valid
            if (null == lib)
            {
                return false;
            }
            if (BeastController.isBasicLibrary(lib.ID))
            {
                return false;
            }
            //FIXME check for dependencies in the work area
            let projectLibs = this.persistenceController.getLibraries();
            arrayRemoveElementOnce(projectLibs, lib);
            this.persistenceController.markDirty();
            return true;
        }
    
    public reorderLibraryAfter(startLibID : string, insertLibID : string) : boolean
        {
            const startLib  = this.resolveLibrary(startLibID);
            const insertLib = this.resolveLibrary(insertLibID);
            if (startLib && insertLib)
            {
                const libs = this.persistenceController.getLibraries();
                arrayRemoveElementOnce(libs, insertLib);
                libs.splice(libs.indexOf(startLib) + 1, 0, insertLib);
                this.persistenceController.markDirty();
                return true;
            }
            return false;
        }
    
    /**
     * Adds the specified library to the current project,
     * checking for name collisions.
     *
     * @param newLib the specified library
     * @returns {any} null on faulure, the specified lib on succes
     */
    private addLibrary(newLib : Library) : Library
        {
            let libs = this.getLibraries();
            
            // verify that the new Library does not collide in name or ID
            // with any of the existing libs
            for (let lib of libs)
            {
                if (lib.name == newLib.name || lib.ID == newLib.ID)
                {
                    //TODO rather throw an exception?
                    //indicate error by returning null
                    return null;
                }
            }
            
            this.persistenceController.getCurrentProject()
                .pushLibrary(newLib);
            this.treeController.addLibrary(newLib);
            this.persistenceController.markDirty();
            
            return newLib;
        }

    /**
     * Creates a new Library in the current project with the given Name and assigns an ID to it.
     * Currently no sanity checks made, but IDs should hav fairly low probability of collision.
     * //TODO assure unique IDs
     * A reference on the newly created Instance is returned or null in case of failure.
     *
     * @param name
     * @returns {Library}
     */
    public createLibrary(name : string) : Library
        {
            let newID : string = PersistenceController.generateComponentId(name);
            let newLib         = new Library(newID, name);

            if (this.addLibrary(newLib) == null)
            {
                //could not add Library due to name collision
                return null;
            }

            return newLib;
        }

    /**
     * Creates a new Library in the current project with the given Name and assigns an ID to it.
     * Or returns library with given name if it's already exists
     *
     * @param name
     * @returns {Library}
     */
    public createOrGetLibraryByName(name: string) : Library
    {
        let library: Library = null;
        for (let lib of this.getLibraries()) {
            if (lib.name === name) {
                library = lib;
                break;
            }
        }
        if (!library) {
            library = this.createLibrary(name);
        }
        return library;
    }


    /**
     * Imports the specified file as a new library
     * @param file
     */
    public importLibrary(file : File) : void
        {
            const controller = this;
            
            this.persistenceController.loadLibraryFromFile(file, function(lib : Library)
            {
                if (lib != null)
                {
                    if (controller.addLibrary(lib) == null)
                    {
                        InfoDialog.showDialog('Can\'t import this library: a library with this name already exists!');
                    }
                }
                else
                {
                    InfoDialog.showDialog('Can\'t import this library: invalid file content!');
                }
            });
        }
    
    /**
     * Initiates a Download for the given Library to a File with the given fileName.
     * @param fileName
     * @param lib
     */
    public downloadLibrary(fileName : string, lib : Library)
        {
            PersistenceController.downloadAsFile(fileName, lib);
        }
    
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
    
    /**
     * Returns a list of Libraries which can be exported.
     * Changes to this list are not carried over to the persistence layer,
     * chenges to the containing libs are carried over though.
     *
     * @returns {Array}
     */
    public getExportableLibraries() : Library[]
        {
            //create a new list and do not include the deposit
            let libraries = [];
            for (let lib of this.persistenceController.getLibraries())
            {
                if (lib.ID != BeastController.DEPOSIT_LIB_ID)
                {
                    libraries.push(lib);
                }
            }
            return libraries;
        }
    
    public getSimulationInterface() : SimulationInterface
        {
            return this.workspaceController.getSimulationInterface();
        }

    public reinitUI() {
        this.workspaceController.reinitUI();
    }
}