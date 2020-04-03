/**
 * Created by Dario Götze on 09.05.2017.
 */
const PROJECT_KEY : string      = 'project';
const PROJECT_LIST_KEY : string = 'projectList';
const VERSION : string          = '0.1';
let currentProject : Project    = getSessionProject();

function saveAsFile(fileName : string, data : Project | Library)
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

function loadFromFile(file : File) : any
    {
        const reader : FileReader = new FileReader();
        let data                  = undefined;
        reader.onload             = function(evt : any)
        {
            try
            {
                data = JSON.parse(evt.target.result);
            }
            catch (exception)
            {
                //TODO Call Controller for Error Handling
                alert('Error while loading Data from File');
            }
        };
        reader.readAsBinaryString(file);
        while (data == null)
        {
        }
        return data;
    }

function loadProjectFromFile(file : File) : Project
    {
        //TODO Fehlerprüfung
        return loadFromFile(file);
    }

function loadLibraryFromFile(file : File) : Library
    {
        //TODO Fehlerprüfung
        return loadFromFile(file);
    }

function saveCurrentProjectLocaly() : void
    {
        const list : string[] = getProjects();
        if (getProjects()
                .indexOf(currentProject.name) == -1)
        {
            list.push(currentProject.name);
        }
        sessionStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
        sessionStorage.setItem(currentProject.name, JSON.stringify(currentProject));
    }

function saveCurrentProject() : void
    {
        sessionStorage.setItem(PROJECT_KEY, JSON.stringify(currentProject));
    }

function getSessionProject() : Project
    {
        const data : string = sessionStorage.getItem(PROJECT_KEY);
        return data == null ? null : JSON.parse(data);
    }

function setCurrentProject(project : Project) : void
    {
        currentProject = project;
        saveCurrentProject();
    }

function getCurrentProject() : Project
    {
        let project : Project = getSessionProject();
        if (project == null)
        {
            if (getProjects().length == 0)
            {
                project = new Project('New Project');
            }
            else
            {
                //TODO Call Controller for Project Selection
            }
        }
        return project;
    }

function getProjects() : string[]
    {
        const data : string = sessionStorage.getItem(PROJECT_LIST_KEY);
        return data == null ? [] : JSON.parse(data);
    }

function loadProject(name : string) : void
    {
        if (getProjects()
                .indexOf(name) == -1)
        {
            //TODO Error project doesnt exists
        }
        setCurrentProject(JSON.parse(sessionStorage.getItem(name)));
    }

function getLibraries() : Library[]
    {
        return getCurrentProject().libraries;
    }

class Component
{
    name : string;
    isBasic : boolean;
    components : ComponentInstance[];
    connectors : Connector[];
    
    constructor(name : string, components : ComponentInstance[],
                connectors : Connector[])
        {
            this.name       = name;
            this.components = components;
            this.connectors = connectors;
        }
}


class Project extends Component
{
    version : string;
    libraries : Library[];
    
    constructor(name : string)
        {
            super(name, [], []);
            this.version   = VERSION;
            this.libraries = [];
        }
}

class Library
{
    version : string;
    name : string;
    isBasic : boolean;
    components : Component[];
    
    constructor()
        {
            this.version = VERSION;
        }
}

class Connector
{
    from : string;
    to : string;
    
    constructor(from : string, to : string)
        {
            this.from = from;
            this.to   = to;
        }
}


class ComponentInstance
{
    name : string;
    library : string;
    id : string;
    x : number;
    y : number;
    rotation : string;
    parameters : Parameters;
    
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

interface Parameters
{

}