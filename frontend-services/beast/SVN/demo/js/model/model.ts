/**
 * Created by Dario Götze on 09.05.2017.
 */

/**
 * Controller for persistence handling
 */
class PersistenceController
{
    /**
     * Key for the dirty value of the project
     * @type {string}
     */
    public static readonly SESSION_DIRTY_KEY : string    = 'beast.dirty';
    /**
     * Project prefix for saved projects
     * @type {string}
     */
    public static readonly LOCAL_PROJECT_PREFIX : string = 'beast.project.';
    
    /**
     * Project-key for sessionStorage
     * @type {string}
     */
    public static readonly LOCAL_LAST_PROJECT_KEY : string = 'beast.lastProject';
    
    /**
     * Key for the localStorage which includes all saved projectnames
     * @type {string}
     */
    public static readonly LOCAL_PROJECT_LIST_KEY : string = 'beast.projectList';
    
    /**
     * Key to prevent multiple instances of BEAST
     * @type {string}
     */
    public static readonly LOCAL_SESSION_LOCK_KEY : string = 'beast.session-lock';
    
    private currentProject : Project;
    
    private dirty : boolean;
    
    private controller : BeastController;
    
    /**
     * Creates a new PersistenceController
     * @param controller the corresponding Beast Controller instance
     */
    constructor(controller : BeastController)
        {
            this.controller = controller;
            if (localStorage.getItem(PersistenceController.LOCAL_SESSION_LOCK_KEY) === null)
            {
                localStorage.setItem(PersistenceController.LOCAL_SESSION_LOCK_KEY, '');
                this.dirty          = false;
                this.currentProject = this.getLastSessionProject();
                window.addEventListener('beforeunload', () =>
                {
                    this.saveSessionProject();
                });
            }
            else
            {
                this.controller.invalidBEASTSession();
            }
        }
    
    /**
     * Indicates if the model data was saved locally
     * @returns {boolean} true, if the model is dirty
     */
    isDirty() : boolean
        {
            return this.dirty;
        }
    
    /**
     * Marks a change of model data and calls the BeastController
     */
    markDirty() : void
        {
            this.dirty = true;
            this.controller.modelChanged();
        }
    
    /**
     * Saves the current project to the sessionStorage
     */
    private saveSessionProject() : void
        {
            const data : string = JSON.stringify(this.currentProject);
            sessionStorage.setItem(PersistenceController.LOCAL_LAST_PROJECT_KEY, data);
            sessionStorage.setItem(PersistenceController.SESSION_DIRTY_KEY, JSON.stringify(this.dirty));
            if (this.dirty)
            {
                localStorage.setItem(PersistenceController.LOCAL_LAST_PROJECT_KEY, data);
            }
            localStorage.removeItem(PersistenceController.LOCAL_SESSION_LOCK_KEY);
        }
    
    /**
     * Loads the saved project from the sessionStorage
     * @returns {Project} the loaded project or a new project if none exists
     */
    private getLastSessionProject() : Project
        {
            let data = sessionStorage.getItem(PersistenceController.LOCAL_LAST_PROJECT_KEY);
            if (data === null)
            {
                data = localStorage.getItem(PersistenceController.LOCAL_LAST_PROJECT_KEY);
            }
            localStorage.removeItem(PersistenceController.LOCAL_LAST_PROJECT_KEY);
            if (data === null)
            {
                return new Project();
            }
            else
            {
                const dirtyMarker : string = sessionStorage.getItem(PersistenceController.SESSION_DIRTY_KEY);
                if (dirtyMarker === null)
                {
                    InfoDialog.showDialog('You didn\'t save your last session!');
                    this.dirty = true;
                }
                else
                {
                    this.dirty = JSON.parse(dirtyMarker);
                }
                return this.loadProjectFromJSON(data);
            }
        }
    
    /**
     * Downloads the given data as local file
     * @param fileName name for the downloaded file
     * @param data Data to download
     */
    static downloadAsFile(fileName : string, data : Project | Library) : void
        {
            const a    = document.createElement('a');
            const blob = new Blob([JSON.stringify(data, null, 4)], {type : 'application/json'}),
                  url  = window.URL.createObjectURL(blob);
            document.body.appendChild(a);
            a.href     = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    
    /**
     * Download the current project as a file with current project name and file extension .beast
     */
    downloadCurrentProject() : void
        {
            PersistenceController.downloadAsFile(this.currentProject.getName() + '.beast', this.currentProject);
            this.dirty = false;
        }
    
    /**
     * Compares the property keys of both objects
     * @param obj1 object one
     * @param obj2 object two
     * @returns {boolean} true, if both objects contains the same property keys in the same order
     */
    static comparePropertyKeys(obj1 : any, obj2 : any) : boolean
        {
            return Object.keys(obj1)
                         .sort()
                         .toString() === Object.keys(obj2)
                                               .sort()
                                               .toString();
        }
    
    /**
     * Rebuilds the given property with its correct prototype. (Is used for JSON.parse())
     * @param key property key
     * @param value property value
     * @returns {object} the correct property
     */
    reviver(key : string, value : any) : object
        {
            switch (key)
            {
                case 'libraries':
                    value.forEach((value, index, arr) =>
                                  {
                                      arr[index] = new Library(value.ID, value.name, value.version, value.components);
                                  });
                    break;
                case 'components':
                    value.forEach((value, index, arr) =>
                                  {
                                      arr[index] = new CompoundComponent(value.ID, value.name, value.devices, value.connectors);
                                  });
                    break;
                case 'devices':
                    value.forEach((value, index, arr) =>
                                  {
                                      arr[index] = new ComponentInstance(value.name, new GlobalComponentTypeID(value.type.libraryID, value.type.componentID), value.id, value.x, value.y, value.rotation, value.state);
                                      delete value.name, value.type, value.id, value.x, value.y, value.rotation, value.state;
                                      Object.assign(arr[index], value);
                                  });
                    break;
                case 'connectors':
                    value.forEach((value, index, arr) =>
                                  {
                                      arr[index] = new Connector(value.from, value.to);
                                  });
                    break;
                case 'circuit':
                    return new CompoundComponent(value.ID, value.name, value.devices, value.connectors);
                default :
                    break;
            }
            return value;
        }
    
    /**
     * Loads the project from given file
     * @param file File to load
     * @param callback Function which is called after loading
     */
    loadProjectFromFile(file : File, callback : (loadedProject : Project) => void) : void
        {
            PersistenceController.createFileReader(file, (data : string) =>
            {
                callback(this.loadProjectFromJSON(data));
            });
        }
    
    /**
     * Loads the library from given file
     * @param file File to load
     * @param callback Function which is called after loading
     */
    loadLibraryFromFile(file : File, callback : (loadedProject : Library) => void) : void
        {
            PersistenceController.createFileReader(file, (data : string) =>
            {
                callback(this.loadLibraryFromJSON(data));
            });
        }
    
    /**
     * Converts a JSON string into a project
     * @param json JSON string
     * @returns {Project} the project
     */
    loadProjectFromJSON(json : string) : Project
        {
            try
            {
                const project : Project = new Project();
                const data              = JSON.parse(json, this.reviver);
                if (PersistenceController.comparePropertyKeys(project, data))
                {
                    project.circuit   = data.circuit;
                    project.libraries = data.libraries;
                    project.version   = data.version;
                    return project;
                }
                return null;
            }
            catch (err)
            {
                console.log(err.message);
                return null;
            }
        }
    
    /**
     * Converts a JSON string into a library
     * @param json JSON string
     * @returns {Library} the library
     */
    loadLibraryFromJSON(json : string) : Library
        {
            try
            {
                const lib : Library = new Library(''); //key left empty intentionally
                const data          = JSON.parse(json, this.reviver);
                if (PersistenceController.comparePropertyKeys(lib, data))
                {
                    lib.ID         = data.ID;
                    lib.name       = data.name;
                    lib.components = data.components;
                    lib.version    = data.version;
                    return lib;
                }
                return null;
            }
            catch (err)
            {
                return null;
            }
        }
    
    /**
     * Loads a static Library from the server
     * @param path Path from which is loaded
     * @returns {Library} the library
     */
    loadStaticLibrary(path : string) : Library
        {
            let libjson = null;
            jQuery.ajax({
                            url     : path,
                            success : function(result)
                            {
                                libjson = result;
                            },
                            async   : false
                        });
            return this.loadLibraryFromJSON(libjson);
        }
    
    /**
     * Loads the data from given file
     * @param file File to load
     * @param dataCallback Function which is called after loading with the loaded data
     */
    static createFileReader(file : File, dataCallback : (data : string) => void) : void
        {
            const reader : FileReader = new FileReader();
            reader.onload             = (evt : any) =>
            {
                try
                {
                    dataCallback(evt.target.result);
                }
                catch (exception)
                {
                    dataCallback('');
                }
            };
            reader.readAsText(file);
        }
    
    /**
     * Saves the current project into the localStorage and overrides existing one
     */
    saveCurrentProjectInLocalStorage() : void
        {
            const list : string[] = PersistenceController.getProjects();
            const name            = this.currentProject.getName();
            if (list.indexOf(name) == -1)
            {
                list.push(name);
            }
            localStorage.setItem(PersistenceController.LOCAL_PROJECT_LIST_KEY, JSON.stringify(list));
            localStorage.setItem(PersistenceController.LOCAL_PROJECT_PREFIX + name, JSON.stringify(this.currentProject));
            this.dirty = false;
        }
    
    /**
     * Creates a new project and set it as current project
     */
    public createNewProject() : void
        {
            this.setCurrentProject(new Project());
        };
    
    /**
     * Sets the current project
     * @param project Project which is to be set
     */
    setCurrentProject(project : Project) : void
        {
            this.currentProject = project;
            this.dirty          = false;
            this.controller.projectChanged();
        }
    
    /**
     * @returns {Project} the current project
     */
    getCurrentProject() : Project
        {
            return this.currentProject;
        }
    
    /**
     * Deletes the given project from localStorage
     * @param name Name of the project
     */
    static deleteLocalProject(name : string) : void
        {
            const arr : string[] = PersistenceController.getProjects();
            const idx : number   = arr.indexOf(name);
            if (idx > -1)
            {
                arr.splice(idx, 1);
                localStorage.setItem(PersistenceController.LOCAL_PROJECT_LIST_KEY, JSON.stringify(arr));
                localStorage.removeItem(PersistenceController.LOCAL_PROJECT_PREFIX + name);
            }
        }
    
    /**
     * @returns {Array} Array with the names of the projects in the localStorage
     */
    static getProjects() : string[]
        {
            const data : string = localStorage.getItem(PersistenceController.LOCAL_PROJECT_LIST_KEY);
            return data === null ? [] : JSON.parse(data);
        }
    
    /**
     * Loads a project from the localStorage
     * @param name Name of the project to be load
     */
    loadProject(name : string) : void
        {
            this.setCurrentProject(this.loadProjectFromJSON(localStorage.getItem(PersistenceController.LOCAL_PROJECT_PREFIX + name)));
        }
    
    /**
     * @returns {Library[]} all custom libraries from the current project
     */
    getLibraries() : Library[]
        {
            return this.getCurrentProject().libraries;
        }
    
    /**
     * Uses random number to generate a human-readable component id.
     * Minute chance of collisions remains
     * @param name - name of the component the id is to be used for
     * @returns {string}
     */
    static generateComponentId(name : string) : string
        {
            return name + '-' + (Math.random() * 0xFFFFFFFF << 0).toString(16);
        }
}

/**
 * Component
 */
abstract class Component
{
    /**
     * name
     */
    name : string;
    /**
     * The local component ID (unique inside a library)
     */
    readonly ID : string;
    
    /**
     *
     * @param id local identifier of the component
     * @param name component name
     */
    constructor(id : string, name : string)
        {
            this.ID   = id;
            this.name = name;
        }
    
    /**
     * returns true if the specified component (type) is a basic component
     * @param component
     * @returns {boolean}
     */
    static isBasic(component : any) : component is BasicComponent
        {
            return component.factory != null;
        }
    
    /**
     * returns true if the specified component (type) is a compound component
     * @param component
     * @returns {boolean}
     */
    static isCompound(component : any) : component is CompoundComponent
        {
            return component.devices != null && component.connectors != null;
        }

}

class BasicComponent extends Component
{
    /**
     * The factory to create the Component, and define drawing functions etc.
     */
    factory : any;
    
    constructor(id : string, name : string, factory = null)
        {
            super(id, name);
            this.factory = factory;
        }
}

class CompoundComponent extends Component
{
    /**
     * Contains instances of other components
     */
    readonly devices : ComponentInstance[];
    /**
     * connectors
     */
    readonly connectors : Connector[];
    
    constructor(id : string, name : string, devices : ComponentInstance[],
                connectors : Connector[])
        {
            super(id, name);
            this.devices    = devices;
            this.connectors = connectors;
        }
    
    public copy() : CompoundComponent
        {
            //deep copy of device list and the instance objects are needed to prevent
            //instances to be bound to multiple components
            //FIXME bug sometimes Object instances are passed to this that miss the
            //CompoundComponent prototype, therefor we construct a new Object as workaround
            let copyDevices : Array<ComponentInstance> = [];
            for (let dev of this.devices)
            {
                let newDev : ComponentInstance;
                if(dev instanceof ComponentInstance)
                {
                    newDev = dev.copy();
                }
                else if (dev instanceof Object)
                {
                    newDev = Object.assign(new ComponentInstance('', null, '', 0, 0), dev);
                    newDev = dev;
                }
                copyDevices.push(newDev);
            }
            let copyConnectors : Array<Connector> = [];
            for (let conn of this.connectors)
            {
                let newConn : Connector;
                if(conn instanceof Connector)
                {
                    newConn = conn.copy();
                }
                else if (conn instanceof Object)
                {
                    newConn = Object.assign(new Connector('', ''), conn);
                }
                copyConnectors.push(newConn);
            }
            return new CompoundComponent(this.ID, this.name, copyDevices, copyConnectors);
        }
    
    public listAllDependencies(controller : BeastController) : GlobalComponentTypeID[]
        {
            let dependencies = new Set<GlobalComponentTypeID>();
            for(let d of this.devices)
            {
                let typeID : GlobalComponentTypeID = d.type;
                dependencies.add(typeID);
                if(Component.isBasic(controller.resolveComponentType(typeID)))
                {
                    continue;
                }
                //for compounds also add their dependencies
                let type : CompoundComponent = <CompoundComponent> controller.resolveComponentType(typeID);
                //recursion happens here
                let rDeps = type.listAllDependencies(controller);
                //aggregate results from recursion
                for(let d of rDeps) {
                    dependencies.add(d);
                }
            }
            return Array.from(dependencies);
            
        }
    
    /**
     * returns a list of all Compoent Types that depend on
     * the given global Type ID used by this component.
     * @param targetID the type ID to list dependencies for
     * @param controller
     * @returns {GlobalComponentTypeID[]}
     */
    public listDependenciesOn(targetID : GlobalComponentTypeID, controller : BeastController) : GlobalComponentTypeID[]
        {
            let dependencies = Array<GlobalComponentTypeID>();
            if (Component.isCompound(this))
            {
                for (let cInstance of this.devices)
                {
                    let cType = <CompoundComponent> controller.resolveComponentType(cInstance.type);
                    if (cType.directlyDependsOn(targetID))
                    {
                        dependencies.push(cInstance.type);
                        //do not recurse further, components can not recursively contain themselves
                        continue;
                    }
                    let cDependencies = cType.listDependenciesOn(targetID, controller);
                    // if the instance has dependencies, add it to the list of dependencies
                    // and also add it's own dependencies to the list of dependencies
                    if (cDependencies.length != 0)
                    {
                        dependencies = dependencies.concat(cDependencies);
                        dependencies.push(cInstance.type);
                    }
                }
            }
            return dependencies;
        }
    
    /**
     * returns true if the component directly uses components of the specified component type
     * @param targetID the type to check for
     * @returns {boolean}
     */
    public directlyDependsOn(targetID : GlobalComponentTypeID) : boolean
        {
            for (let cInstance of this.devices)
            {
                let t = new GlobalComponentTypeID(cInstance.type.libraryID, cInstance.type.componentID);
                if (t.equals(targetID))
                {
                    return true;
                }
            }
            
            //no direct dependencies found
            return false;
        }
}

/**
 * Project
 */
class Project
{
    /**
     * The circuit data of the project
     */
    circuit : CompoundComponent;
    /**
     * BEAST version at project creation
     */
    version : string;
    /**
     * libraries
     */
    libraries : Library[];
    
    /**
     * @param name Project name, 'New Project' if empty
     */
    constructor(name : string = 'New Project')
        {
            this.circuit   = new CompoundComponent('project', name, [], []);
            this.version   = BeastController.BEAST_VERSION;
            this.libraries = [];
        }
    
    getName() : string
        {
            return this.circuit.name;
        }
    
    setName(name : string) : void
        {
            this.circuit.name = name;
        }
    
    /**
     * Adds the specified Library to the Project without any checks.
     * @param lib
     */
    public pushLibrary(lib : Library)
        {
            this.libraries.push(lib);
        }
}
/**
 * Library
 */
class Library
{
    /**
     * BEAST version at library creation
     */
    version : string;
    /**
     * library name
     */
    name : string;
    /**
     * Project wide library ID, unique inside a project
     */
    ID : string;
    /**
     * saved devices
     */
    components : Component[];
    
    /**
     * Creates an empty Library
     */
    constructor(id : string, name : string = '', version : string = BeastController.BEAST_VERSION, components : Component[] = [])
        {
            this.ID         = id;
            this.name       = name;
            this.version    = version;
            this.components = components;
        }
    
    /**
     * Removes the specified component with the specified id from the library
     * without dependency checks. Does not modify the Library if the component
     * was not found.
     *
     * @param component
     */
    public removeComponent(component : Component) : void
        {
            arrayRemoveElementOnce(this.components, component);
        }
    
    /**
     * Adds the specified component to the library without any checks.
     * @param component
     */
    public addComponent(component : Component) : void
        {
            //FIXME check for duplicates
            this.components.push(component);
        }
}
/**
 * Connector
 */
class Connector
{
    private from : string;
    private to : string;
    
    /**
     * @param from start device port
     * @param to end device port
     */
    constructor(from : string, to : string)
        {
            this.from = from;
            this.to   = to;
        }
    
    public copy() : Connector
        {
            return new Connector(this.from, this.to);
        }
}

/**
 * ComponentInstance
 * //TODO struktur anpassen auf simcir
 */
class ComponentInstance
{
    /**
     * name of the responding component
     */
    label : string;
    /**
     * name of the responding library
     */
    type : GlobalComponentTypeID;
    /**
     * unique device id
     */
    id : string;
    /**
     * x position
     */
    x : number;
    /**
     * y position
     */
    y : number;
    /**
     * the device rotation
     */
    rotation : string;
    
    state : {[name : string] : any};
    /**
     * device parameters
     */
    [parameterName : string] : any;
    
    /**
     *
     * @param name ???
     * @param type identifies the component type
     * @param id unique device id
     * @param x x position
     * @param y y position
     * @param rotation the device rotation
     * @param state object that describes the state of the component
     */
    constructor(name : string, type : GlobalComponentTypeID, id : string, x : number, y : number, rotation? : string, state? : {[name : string] : any})
        {
            this.label    = name;
            this.type     = type;
            this.id       = id;
            this.x        = x;
            this.y        = y;
            this.rotation = rotation;
            this.state    = state;
        }
    
    public copy() : ComponentInstance
        {
            return new ComponentInstance(this.label, this.type, this.id, this.x, this.y, this.rotation, this.state);
        }
}