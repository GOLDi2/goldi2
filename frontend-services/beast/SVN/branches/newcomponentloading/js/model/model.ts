/**
 * Created by Dario Götze on 09.05.2017.
 */


///<reference path="../controller/common.ts" />
/**
 * Project-key for sessionStorage
 * @type {string}
 */
const PROJECT_KEY : string      = 'project';
/**
 * Key for the localStorage which includes all saved projectnames
 * @type {string}
 */
const PROJECT_LIST_KEY : string = 'projectList';
/**
 * BEAST-Version
 * @type {string}
 */
const VERSION : string          = '0.2.1';
/**
 * Descriptes the type of data
 */
enum DataType{
    /**
     * The whole project
     */
    Project,
        /**
         * Name and version from project
         */
        Info,
        /**
         * Libraries from project
         */
        Libraries,
        /**
         * Connectors from project
         */
        Connectors,
        /**
         * Components from project
         */
        Components
}
/**
 * PersistenceController
 */
class PersistenceController
{
    private currentProject : Project;
    
    private dirty : boolean;
    
    private controller : BeastController;
    
    /**
     * Creates a new PersistenceController
     * @param controller the corresponding Beast Controller instance
     */
    constructor(controller : BeastController)
        {
            window.addEventListener('beforeunload', (evt) =>
            {
                this.saveProjectSession();
            });
            this.controller     = controller;
            this.dirty          = false;
            this.currentProject = this.getSessionProject();
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
     * @param type the data which changed
     */
    markDirty(type : DataType) : void
        {
            this.dirty = true;
            this.controller.modelChanged(type);
        }
    
    private saveProjectSession() : void
        {
            sessionStorage.setItem(PROJECT_KEY, JSON.stringify(this.currentProject));
        }
    
    private getSessionProject() : Project
        {
            let data : string = sessionStorage.getItem(PROJECT_KEY);
            return data === null ? new Project() : this.loadProjectFromJSON(data);
        }
    
    /**
     * Downloads the given data as local file
     * @param fileName name for the downloaded file
     * @param data data to download
     */
    saveAsFile(fileName : string, data : Project | Library) : void
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
            this.saveAsFile(this.currentProject.getName() + '.beast', this.currentProject);
            this.dirty = false;
        }
    
    static comparePropertyKeys(obj1 : any, obj2 : any) : boolean
        {
            return Object.keys(obj1).sort()
                         .toString() === Object.keys(obj2).sort()
                                               .toString();
        }
    
    reviver(key : string, value : any) : object
        {
            if (key === 'libraries')
            {
                value.forEach((value, index, arr) =>
                              {
                                  arr[index] = new Library(value.ID, value.name, value.version);
                              });
            }
            if (key === 'components')
            {
                value.forEach((value, index, arr) =>
                              {
                                  arr[index] = new CompoundComponent(value.ID, value.name, value.devices, value.connectors);
                              });
            }
            if (key === 'devices')
            {
                value.forEach((value, index, arr) =>
                              {
                                  arr[index] = new ComponentInstance(value.name,new GlobalComponentTypeID(value.type.libraryID, value.type.componentID), value.id, value.x, value.y, value.rotation, value.state);
                                  delete value.name, value.type, value.id, value.x, value.y, value.rotation, value.state;
                                  Object.assign(arr[index], value);
                              });
            }
            if (key === 'connectors')
            {
                value.forEach((value, index, arr) =>
                              {
                                  arr[index] = new Connector(value.from, value.to);
                              });
            }
            if (key === 'circuit')
            {
                return new CompoundComponent(value.ID, value.name, value.devices, value.connectors);
            }
            return value;
        }
    
    loadProjectFromFile(file : File, callback : (loadedProject : Project) => void) : void
        {
            PersistenceController.createFileReader(file, (data : string) =>
            {
                callback(this.loadProjectFromJSON(data));
            });
        }
    
    loadLibraryFromFile(file : File, callback : (loadedProject : Library) => void) : void
        {
            PersistenceController.createFileReader(file, (data : string) =>
            {
                callback(this.loadLibraryFromJSON(data));
            });
        }
    
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
     * @param filename
     */
    loadStaticLibrary(path: string): Library {
        let libjson = null;
        jQuery.ajax({
            url: path,
            success: function (result) {
                libjson = result;
            },
            async: false
        });
        return this.loadLibraryFromJSON(libjson);
    }
    
    /**
     * Loads the data from given file
     * @param file file to load
     * @param dataCallback Callback with loaded data
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
            reader.readAsBinaryString(file);
        }
    
    /**
     * Saves the current project state into the localStorage
     */
    saveCurrentProjectLocaly() : void
        {
            const list : string[] = this.getProjects();
            const name            = this.currentProject.getName();
            if (list.indexOf(name) == -1)
            {
                list.push(name);
            }
            localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
            localStorage.setItem(name, JSON.stringify(this.currentProject));
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
     * @param project project to set
     */
    setCurrentProject(project : Project) : void
        {
            this.currentProject = project;
            this.saveProjectSession();
            this.dirty = false;
            this.controller.modelChanged(DataType.Project);
        }
    
    /**
     *
     * @returns {Project} the current project
     */
    getCurrentProject() : Project
        {
            return this.currentProject;
        }
    
    public deleteLocalProject(name : string) : void
        {
            const arr : string[] = this.getProjects();
            const idx : number   = arr.indexOf(name);
            if (idx > -1)
            {
                arr.splice(idx, 1);
                localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(arr));
                localStorage.removeItem(name);
            }
        }
    
    /**
     *
     * @returns {Array} Array with all names of local saved projects
     */
    getProjects() : string[]
        {
            const data : string = localStorage.getItem(PROJECT_LIST_KEY);
            return data === null ? [] : JSON.parse(data);
        }
    
    /**
     * Loads a local saved project
     * @param name name of the project to be load
     */
    loadProject(name : string) : void
        {
            this.setCurrentProject(this.loadProjectFromJSON(localStorage.getItem(name)));
        }
    
    /**
     *
     * @returns {Library[]} all libraries from the current project
     */
    getLibraries() : Library[]
        {
            return this.getCurrentProject().libraries;
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
     * @param id identifier of the component
     * @param name component name
     * @param devices devices for simulation
     * @param connectors connectors for simulation
     */
    
    constructor(id : string, name : string)
        {
            this.ID         = id;
            this.name       = name;
        }
        
    static isBasic(component : any): component is BasicComponent{
        return component.factory != null;
    }
    static isCompound(component : any): component is CompoundComponent{
        return component.devices != null && component.connectors != null;
    }
    
    
    /**
     * returns a list of all Compoent Types that depend on
     * the given global Type ID used by this component.
     * @param targetID the type ID to list dependencies for
     * @param controller
     * @returns {any[]}
     */
    public listDependenciesOn( targetID : GlobalComponentTypeID, controller : BeastController) : GlobalComponentTypeID[]
        {
            let dependencies = Array<GlobalComponentTypeID>();
            if (Component.isCompound(this))
            {
                for (let cInstance of this.devices)
                {
                    let cType    = controller.resolveComponentType(cInstance.type);
                    if(cType.directlyDependsOn(targetID)) {
                        dependencies.push(cInstance.type);
                        //do not recurse further, components can not recursively contain themselves
                        continue;
                    }
                    let cDependencies = cType.listDependenciesOn(targetID, controller);
                    // if the instance has dependencies, add it to the list of dependencies
                    // and also add it's own dependencies to the list of dependencies
                    if(cDependencies.length != 0) {
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
    private directlyDependsOn(targetID : GlobalComponentTypeID) : boolean
        {
            if (Component.isCompound(this)) {
                for (let cInstance of this.devices) {
                    if(cInstance.type.equals(targetID)) return true;
                }
            }
            
            //no direct dependencies found
            return false
        }
}

class BasicComponent extends  Component{
    /**
     * The factory to create the Component, and define drawing functions etc.
     * TODO this needs to be read by simcir/workspace
     */
    factory : any;
    
    constructor(id : string, name : string, factory = null)
        {
            super(id, name);
            this.factory    = factory;
        }
}

class CompoundComponent extends  Component{
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
}

/**
 * Project
 */
class Project
{
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
     *
     * @param name project name
     */
    constructor(name : string = 'New Project')
        {
            this.circuit   = new CompoundComponent('project', name, [], []);
            this.version   = VERSION;
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
}
/**
 * Library
 */
class Library
{
    /**
     * BEAST version at project creation
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
    constructor(id : string, name : string = '', version : string = VERSION, components : Component[] = [])
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
     * @param id
     */
    public removeComponent(component : Component)
        {
            let index: number = this.components.indexOf(component, 0);
            if (index > -1) {
                this.components.splice(index, 1);
            }
    
        }
    
    /**
     * Adds the specified component to the library without any checks.
     *
     * @param component
     */
    public addComponent(component : Component)
        {
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
     *
     * @param from start device port
     * @param to end device port
     */
    constructor(from : string, to : string)
        {
            this.from = from;
            this.to   = to;
        }
}

/**
 * ComponentInstance
 */
class ComponentInstance
{
    /**
     * name of the responding component
     */
    name : string;
    /**
     * name of the responding library
     */
    type : GlobalComponentTypeID;
    
    /**
     * unique device id
     */
    id: string;
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
    
    
    state: {[name: string]: any};
    /**
     * device parameters
     */
    parameters : Parameters;
    
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
    constructor(name : string, type : GlobalComponentTypeID, id: string, x : number, y : number, rotation? : string, state?: {[name: string]: any})
        {
            this.name       = name;
            this.type       = type;
            this.id         = id;
            this.x          = x;
            this.y          = y;
            this.rotation   = rotation;
            this.state      = state;
        }
}
/**
 * Interface for parameters
 */
interface Parameters
{

}