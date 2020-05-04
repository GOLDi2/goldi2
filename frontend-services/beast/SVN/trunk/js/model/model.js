/**
 * Created by Dario Götze on 09.05.2017.
 */
const PROJECT_KEY = 'project';
const PROJECT_LIST_KEY = 'projectList';
const VERSION = '0.1';
let loadedProject = null;
function saveAsFile(fileName, data) {
    const a = document.createElement('a');
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' }), url = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
function loadFromFile(file) {
    const reader = new FileReader();
    let data = null;
    reader.onload = function (evt) {
        try {
            data = JSON.parse(evt.target.result);
        }
        catch (exception) {
            //TODO Call Controller for Error Handling
        }
    };
    reader.readAsBinaryString(file);
    while (data == null) {
    }
    return data;
}
function loadProjectFromFile(file) {
    //TODO Fehlerprüfung
    return loadFromFile(file);
}
function loadLibraryFromFile(file) {
    //TODO Fehlerprüfung
    return loadFromFile(file);
}
function saveCurrentProject() {
    sessionStorage.setItem(PROJECT_KEY, JSON.stringify(loadedProject));
}
function getSessionProject() {
    const data = sessionStorage.getItem(PROJECT_KEY);
    return data == null ? null : JSON.parse(data);
}
function setCurrentProject(project) {
    loadedProject = project;
    saveCurrentProject();
}
function getCurrentProject() {
    return loadedProject;
}
function saveProjectLocaly() {
    const list = getProjects();
    if (getProjects()
        .indexOf(loadedProject.name) == -1) {
        list.push(loadedProject.name);
    }
    sessionStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
    sessionStorage.setItem(loadedProject.name, JSON.stringify(loadedProject));
}
function getProjects() {
    const data = sessionStorage.getItem(PROJECT_LIST_KEY);
    return data == null ? [] : JSON.parse(data);
}
function loadProject(name) {
    if (getProjects()
        .indexOf(name) == -1) {
        //TODO Error project doesnt exists
    }
    setCurrentProject(JSON.parse(sessionStorage.getItem(name)));
}
class Component {
    constructor(name, components, connectors) {
        this.name = name;
        this.components = components;
        this.connectors = connectors;
    }
}
class Project extends Component {
    constructor(name) {
        super(name, [], []);
        this.version = VERSION;
    }
}
class Library {
    constructor() {
        this.version = VERSION;
    }
}
class Connector {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
class ComponentInstance {
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