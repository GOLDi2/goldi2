/**
 * Created by Dario Götze on 09.05.2017.
 */
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
const VERSION = '0.1';
/**
 * Descriptes the type of data
 */
var DataType;
(function (DataType) {
    DataType[DataType["Project"] = 0] = "Project";
    DataType[DataType["Libraries"] = 1] = "Libraries";
    DataType[DataType["Connectors"] = 2] = "Connectors";
    DataType[DataType["Components"] = 3] = "Components";
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
        switch (type) {
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
        //TODO fix dirtys
        //FIXME remove any and find error
        const project = this.getCurrentProject;
        this.saveAsFile(project.name + '.beast', project);
        this.dirty = false;
    }
    static comparePropertyKeys(obj1, obj2) {
        return Object.keys(obj1)
            .sort()
            .toString() === Object.keys(obj2)
            .sort()
            .toString();
    }
    reviver(key, value) {
    }
    loadProjectFromFile(file, callback) {
        PersistenceController.createFileReader(file, (data) => {
            callback(PersistenceController.comparePropertyKeys(data, this.currentProject) ? Object.assign(new Project(''), data) : null);
        });
    }
    loadLibraryFromFile(file, callback) {
        PersistenceController.createFileReader(file, (data) => {
            const lib = new Library();
            callback(PersistenceController.comparePropertyKeys(data, lib) ? Object.assign(lib, data) : null);
        });
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
                dataCallback(JSON.parse(evt.target.result));
            }
            catch (exception) {
                dataCallback({});
            }
        };
        reader.readAsBinaryString(file);
    }
    /**
     * Saves the current project state into the localStorage
     */
    saveCurrentProjectLocaly() {
        const list = this.getProjects();
        if (this.getProjects()
            .indexOf(this.currentProject.name) == -1) {
            list.push(this.currentProject.name);
        }
        sessionStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
        sessionStorage.setItem(this.currentProject.name, JSON.stringify(this.currentProject));
        this.dirty = false;
    }
    /**
     * Saves the current project state into the sessionStorage
     */
    saveCurrentProject() {
        sessionStorage.setItem(PROJECT_KEY, JSON.stringify(this.currentProject));
        this.dirty = true;
    }
    getSessionProject() {
        const data = sessionStorage.getItem(PROJECT_KEY);
        return data == null ? new Project('New Project') : JSON.parse(data);
    }
    /**
     * Sets the current project
     * @param project project to set
     */
    setCurrentProject(project) {
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
    getCurrentProject() {
        return this.currentProject;
    }
    /**
     * Creates a new project and set it as current project
     */
    createNewProject() {
        //TODO Check for current Project, ask for name, ...
        this.setCurrentProject(new Project('New Project'));
    }
    ;
    /**
     *
     * @returns {Array} Array with all names of local saved projects
     */
    getProjects() {
        const data = sessionStorage.getItem(PROJECT_LIST_KEY);
        return data == null ? [] : JSON.parse(data);
    }
    /**
     * Loads a local saved project
     * @param name name of the project to be load
     */
    loadProject(name) {
        this.setCurrentProject(Object.assign(new Project(''), JSON.parse(sessionStorage.getItem(name))));
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
     * @param name component name
     * @param components components for simulation
     * @param connectors connectors for simulation
     */
    constructor(name, components, connectors) {
        this.name = name;
        this.components = components;
        this.connectors = connectors;
    }
}
/**
 * Project
 */
class Project extends Component {
    /**
     *
     * @param name project name
     */
    constructor(name) {
        super(name, [], []);
        this.version = VERSION;
        this.libraries = [];
    }
}
/**
 * Library
 */
class Library {
    /**
     * Creates an empty Library
     */
    constructor(name = '') {
        this.version = VERSION;
        this.name = name;
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