/**
 * Created by Dario Götze on 09.05.2017.
 */
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
const VERSION : string          = '0.1';
/**
 * Descriptes the type of data
 */
enum DataType{
    Project,
    Libraries,
    Connectors,
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
            switch (type)
            {
                case DataType.Project:
                case DataType.Libraries:
                case DataType.Components:
                case DataType.Connectors:
                    this.saveCurrentProject();
            }
            this.controller.modelChanged(type);
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
            //TODO fix dirtys
            //FIXME remove any and find error
            const project : any = this.getCurrentProject;
            this.saveAsFile(project.name + '.beast', project);
            this.dirty = false;
        }
    
    static comparePropertyKeys(obj1 : any, obj2 : any) : boolean
        {
            return Object.keys(obj1)
                         .sort()
                         .toString() === Object.keys(obj2)
                                               .sort()
                                               .toString();
        }
    
    reviver(key : string, value : any)
        {
        }
    
    loadProjectFromFile(file : File, callback : (loadedProject : Project) => void) : void
        {
            PersistenceController.createFileReader(file, (data : any) =>
            {
                callback(PersistenceController.comparePropertyKeys(data, this.currentProject) ? Object.assign(new Project(''), data) : null);
            });
        }
    
    loadLibraryFromFile(file : File, callback : (loadedProject : Library) => void) : void
        {
            PersistenceController.createFileReader(file, (data : any) =>
            {
                const lib : Library = new Library();
                callback(PersistenceController.comparePropertyKeys(data, lib) ? Object.assign(lib, data) : null);
            });
        }
    
    /**
     * Loads the data from given file
     * @param file file to load
     * @param dataCallback Callback with loaded data
     */
    static createFileReader(file : File, dataCallback : (data : any) => void) : void
        {
            const reader : FileReader = new FileReader();
            reader.onload             = (evt : any) =>
            {
                try
                {
                    dataCallback(JSON.parse(evt.target.result));
                }
                catch (exception)
                {
                    dataCallback({});
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
            if (this.getProjects()
                    .indexOf(this.currentProject.name) == -1)
            {
                list.push(this.currentProject.name);
            }
            sessionStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
            sessionStorage.setItem(this.currentProject.name, JSON.stringify(this.currentProject));
            this.dirty = false;
        }
    
    /**
     * Saves the current project state into the sessionStorage
     */
    saveCurrentProject() : void
        {
            sessionStorage.setItem(PROJECT_KEY, JSON.stringify(this.currentProject));
            this.dirty = true;
        }
    
    private getSessionProject() : Project
        {
            const data : string = sessionStorage.getItem(PROJECT_KEY);
            return data == null ? new Project('New Project') : JSON.parse(data);
        }
    
    /**
     * Sets the current project
     * @param project project to set
     */
    setCurrentProject(project : Project) : void
        {
            console.log(project.name);
            this.currentProject = project;
            this.saveCurrentProject();
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
    
    /**
     * Creates a new project and set it as current project
     */
    public createNewProject() : void
        {
            //TODO Check for current Project, ask for name, ...
            this.setCurrentProject(new Project('New Project'));
        };
    
    /**
     *
     * @returns {Array} Array with all names of local saved projects
     */
    getProjects() : string[]
        {
            const data : string = sessionStorage.getItem(PROJECT_LIST_KEY);
            return data == null ? [] : JSON.parse(data);
        }
    
    /**
     * Loads a local saved project
     * @param name name of the project to be load
     */
    loadProject(name : string) : void
        {
            this.setCurrentProject(Object.assign(new Project(''), JSON.parse(sessionStorage.getItem(name))));
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
class Component
{
    /**
     * name
     */
    name : string;
    /**
     * components
     */
    components : ComponentInstance[];
    /**
     * connectors
     */
    connectors : Connector[];
    
    /**
     *
     * @param name component name
     * @param components components for simulation
     * @param connectors connectors for simulation
     */
    constructor(name : string, components : ComponentInstance[],
                connectors : Connector[])
        {
            this.name       = name;
            this.components = components;
            this.connectors = connectors;
        }
}

/**
 * Project
 */
class Project extends Component
{
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
    constructor(name : string)
        {
            super(name, [], []);
            this.version   = VERSION;
            this.libraries = [];
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
     * saved components
     */
    components : Component[];
    
    /**
     * Creates an empty Library
     */
    constructor(name : string = '')
        {
            this.version = VERSION;
            this.name    = name;
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
     */w;
    library : string;
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
    /**
     * device parameters
     */
    parameters : Parameters;
    
    /**
     *
     * @param name name of the responding library
     * @param library name of the responding library
     * @param id unique device id
     * @param x x position
     * @param y y position
     * @param rotation the device rotation
     * @param parameters device parameters
     */
    constructor(name : string, library : string, id : string, x : number, y : number, rotation? : string, parameters? : Parameters)
        {
            this.name       = name;
            this.library    = library;
            this.id         = id;
            this.x          = x;
            this.y          = y;
            this.rotation   = rotation;
            this.parameters = parameters;
        }
}
/**
 * Interface for parameters
 */
interface Parameters
{

}