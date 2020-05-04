/**
 * Created by Dario Götze on 09.05.2017.
 */
const PROJECT_KEY : string      = 'project';
const PROJECT_LIST_KEY : string = 'projectList';
const VERSION : string          = '0.1';

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

function loadFromFile(file : File) : void
    {
        const reader : FileReader = new FileReader();
        reader.onload             = function(evt : any)
        {
            try
            {
                //TODO Call Controller Method and set Projectdata directly
                JSON.parse(evt.target.result);
            }
            catch (exception)
            {
                //TODO Call Controller for Error Handling
            }
        };
        reader.readAsBinaryString(file);
    }

function setSessionProject(project : Project)
    {
        sessionStorage.setItem(PROJECT_KEY, JSON.stringify(project));
    }

function getSessionProject() : Project
    {
        return JSON.parse(sessionStorage.getItem(PROJECT_KEY));
    }

function saveProjectLocaly(project : Project) : void
    {
        const list : string[] = getProjectList();
        list.push(project.name);
        sessionStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
        sessionStorage.setItem(project.name, JSON.stringify(project));
    }

function getProjectList() : string[]
    {
        const data : string = sessionStorage.getItem(PROJECT_LIST_KEY);
        return data == null ? [] : JSON.parse(data);
    }

function loadProject(name : string) : void
    {
        if (getProjectList()
                .indexOf(name) == -1)
        {
            //TODO Error project doesnt exists
        }
        return JSON.parse(sessionStorage.getItem(name));
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
    librarys : Library[];
    
    constructor(name : string)
        {
            super(name, [], []);
            this.version = VERSION;
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