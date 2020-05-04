/**
 * Created by Dario Götze on 09.05.2017.
 */
///<reference path="../controller/common.ts" />
/**
 * Project-key for sessionStorage
 * @type {string}
 */
const PROJECT_KEY = 'project';
/**
 * Key for the localStorage which includes all saved projectnames
 * @type {string}
 */
const PROJECT_LIST_KEY = 'projectList';
/**
 * BEAST-Version
 * @type {string}
 */
const VERSION = '0.2.0-alpha';
/**
 * Descriptes the type of data
 */
var DataType;
(function (DataType) {
    /**
     * The whole project
     */
    DataType[DataType["Project"] = 0] = "Project";
    /**
     * Name and version from project
     */
    DataType[DataType["Info"] = 1] = "Info";
    /**
     * Libraries from project
     */
    DataType[DataType["Libraries"] = 2] = "Libraries";
    /**
     * Connectors from project
     */
    DataType[DataType["Connectors"] = 3] = "Connectors";
    /**
     * Components from project
     */
    DataType[DataType["Components"] = 4] = "Components";
})(DataType || (DataType = {}));
/**
 * PersistenceController
 */
class PersistenceController {
    /**
     * Creates a new PersistenceController
     * @param controller the corresponding Beast Controller instance
     */
    constructor(controller) {
        window.addEventListener('beforeunload', (evt) => {
            this.saveProjectSession();
        });
        this.controller = controller;
        this.dirty = false;
        this.currentProject = this.getSessionProject();
    }
    /**
     * Indicates if the model data was saved locally
     * @returns {boolean} true, if the model is dirty
     */
    isDirty() {
        return this.dirty;
    }
    /**
     * Marks a change of model data and calls the BeastController
     * @param type the data which changed
     */
    markDirty(type) {
        this.dirty = true;
        this.controller.modelChanged(type);
    }
    saveProjectSession() {
        sessionStorage.setItem(PROJECT_KEY, JSON.stringify(this.currentProject));
    }
    getSessionProject() {
        let data = sessionStorage.getItem(PROJECT_KEY);
        return data === null ? new Project() : this.loadProjectFromJSON(data);
    }
    /**
     * Downloads the given data as local file
     * @param fileName name for the downloaded file
     * @param data data to download
     */
    saveAsFile(fileName, data) {
        const a = document.createElement('a');
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' }), url = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    /**
     * Download the current project as a file with current project name and file extension .beast
     */
    downloadCurrentProject() {
        this.saveAsFile(this.currentProject.getName() + '.beast', this.currentProject);
        this.dirty = false;
    }
    static comparePropertyKeys(obj1, obj2) {
        return Object.keys(obj1)
            .toString() === Object.keys(obj2)
            .toString();
    }
    reviver(key, value) {
        if (key === 'libraries') {
            value.forEach((value, index, arr) => {
                arr[index] = new Library(value.ID, value.name, value.version);
            });
        }
        if (key === 'components') {
            //TODO: FInd out what this was use for!
            alert("Bad Code called!");
            /*value.forEach((value, index, arr) =>
                          {
                              arr[index] = new Component(value.ID, value.name, value.devices, value.connectors);
                          });*/
        }
        if (key === 'devices') {
            value.forEach((value, index, arr) => {
                //TODO: Missing state
                //TODO: Parameters are handled wrong here!
                arr[index] = new ComponentInstance(value.name, value.library, value.id, value.x, value.y, value.rotation, value.parameters);
            });
        }
        if (key === 'connectors') {
            value.forEach((value, index, arr) => {
                arr[index] = new Connector(value.from, value.to);
            });
        }
        if (key === 'circuit') {
            return new CompoundComponent(value.ID, value.name, value.devices, value.connectors);
        }
        return value;
    }
    loadProjectFromFile(file, callback) {
        PersistenceController.createFileReader(file, (data) => {
            callback(this.loadProjectFromJSON(data));
        });
    }
    loadLibraryFromFile(file, callback) {
        PersistenceController.createFileReader(file, (data) => {
            callback(this.loadLibraryFromJSON(data));
        });
    }
    loadProjectFromJSON(json) {
        try {
            const project = new Project();
            const data = JSON.parse(json, this.reviver);
            if (PersistenceController.comparePropertyKeys(project, data)) {
                project.circuit = data.circuit;
                project.libraries = data.libraries;
                project.version = data.version;
                return project;
            }
            return null;
        }
        catch (err) {
            console.log(err.message);
            return null;
        }
    }
    loadLibraryFromJSON(json) {
        try {
            const lib = new Library(''); //key left empty intentionally
            const data = JSON.parse(json, this.reviver);
            if (PersistenceController.comparePropertyKeys(lib, data)) {
                lib.ID = data.ID;
                lib.name = data.name;
                lib.components = data.components;
                lib.version = data.version;
                return lib;
            }
            return null;
        }
        catch (err) {
            return null;
        }
    }
    /**
     * Loads the data from given file
     * @param file file to load
     * @param dataCallback Callback with loaded data
     */
    static createFileReader(file, dataCallback) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                dataCallback(evt.target.result);
            }
            catch (exception) {
                dataCallback('');
            }
        };
        reader.readAsBinaryString(file);
    }
    /**
     * Saves the current project state into the localStorage
     */
    saveCurrentProjectLocaly() {
        const list = this.getProjects();
        const name = this.currentProject.getName();
        if (list.indexOf(name) == -1) {
            list.push(name);
        }
        localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
        localStorage.setItem(name, JSON.stringify(this.currentProject));
        this.dirty = false;
    }
    /**
     * Creates a new project and set it as current project
     */
    createNewProject() {
        this.setCurrentProject(new Project());
    }
    ;
    /**
     * Sets the current project
     * @param project project to set
     */
    setCurrentProject(project) {
        this.currentProject = project;
        this.saveProjectSession();
        this.dirty = false;
        this.controller.modelChanged(DataType.Project);
    }
    /**
     *
     * @returns {Project} the current project
     */
    getCurrentProject() {
        return this.currentProject;
    }
    deleteLocalProject(name) {
        const arr = this.getProjects();
        const idx = arr.indexOf(name);
        if (idx > -1) {
            arr.splice(idx, 1);
            localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(arr));
            localStorage.removeItem(name);
        }
    }
    /**
     *
     * @returns {Array} Array with all names of local saved projects
     */
    getProjects() {
        const data = localStorage.getItem(PROJECT_LIST_KEY);
        return data === null ? [] : JSON.parse(data);
    }
    /**
     * Loads a local saved project
     * @param name name of the project to be load
     */
    loadProject(name) {
        this.setCurrentProject(this.loadProjectFromJSON(localStorage.getItem(name)));
    }
    /**
     *
     * @returns {Library[]} all libraries from the current project
     */
    getLibraries() {
        return this.getCurrentProject().libraries;
    }
}
/**
 * Component
 */
class Component {
    /**
     *
     * @param id identifier of the component
     * @param name component name
     * @param devices devices for simulation
     * @param connectors connectors for simulation
     */
    constructor(id, name) {
        this.ID = id;
        this.name = name;
    }
}
class BasicComponent extends Component {
    constructor(id, name, factory = null) {
        super(id, name);
        this.factory = factory;
    }
}
class CompoundComponent extends Component {
    constructor(id, name, devices, connectors) {
        super(id, name);
        this.devices = devices;
        this.connectors = connectors;
    }
}
/**
 * Project
 */
class Project {
    /**
     *
     * @param name project name
     */
    constructor(name = 'New Project') {
        this.circuit = new CompoundComponent('project', name, [], []);
        this.version = VERSION;
        this.libraries = [];
    }
    getName() {
        return this.circuit.name;
    }
    setName(name) {
        this.circuit.name = name;
    }
}
/**
 * Library
 */
class Library {
    /**
     * Creates an empty Library
     */
    constructor(id, name = '', version = VERSION, components = []) {
        this.ID = id;
        this.name = name;
        this.version = version;
        this.components = components;
    }
}
/**
 * Connector
 */
class Connector {
    /**
     *
     * @param from start device port
     * @param to end device port
     */
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
/**
 * ComponentInstance
 */
class ComponentInstance {
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
    constructor(name, library, id, x, y, rotation, parameters) {
        this.name = name;
        this.library = library;
        this.id = id;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.parameters = parameters;
    }
}
//# sourceMappingURL=model.js.map