/**
 * Created by Paul on 22.05.2017.
 */
    
    ///<reference path="../d_ts/jquery.d.ts" />
    ///<reference path="../model/model.ts" />


class menubarController
{
    PersistenceController : PersistenceController;
    BeastController : BeastController;
    
    /**
     * creates new BeastController and PersistenceController
     * defines onclick-methods of Menubar-Buttons
     * @param BeastController corresponding BeastController instance
     */
    constructor(BeastController)
        {
            this.BeastController       = BeastController;
            this.PersistenceController = this.BeastController.getPersistenceController();
            $('#createProject')
                .on('click', {persist : this.PersistenceController}, this.createProject);
            $('#openProject')
                .on('click', {persist : this.PersistenceController}, this.openProject);
            $('#exportProject')
                .on('click', {persist : this.PersistenceController}, this.exportProject);
            $('#saveProject')
                .on('click', {persist : this.PersistenceController}, this.saveProject);
            $('#createLibrary')
                .on('click', {persist : this.PersistenceController}, this.createLibrary);
            $('#importLibrary')
                .on('click', {persist : this.PersistenceController}, this.importLibrary);
            $('#exportLibrary')
                .on('click', {persist : this.PersistenceController}, this.exportLibrary);
    
        }
    
    /**
     * opens a warning dialog, when the the current project in the session storage is not saved
     * calls "saveProject"-method or creates new project by use of PersistenceController accordingly to user's input
     * @param event event parameter
     */
    public createProject(event) : void
        {
            let persist = event.data.persist;
            //TODO: open warning dialog if current project is not save
            persist.createNewProject();
            alert('Created project: "' + persist.getCurrentProject().name + '"');
        }
    
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event event parameter
     */
    public openProject = (event) : void =>
    {
        let persist = event.data.persist;
        //TODO: open warning dialog if current project is not saved
        let file : File;
        let content = $('<div><input type=\'file\' id=\'files\' name=\'File\'' +
                        ' accept=".beast, application/json" /><output' +
                        ' id=\'list\'></output></div>');
        $(content)
            .dialog({
                        title   : 'Choose a .beast-file:',
                        modal   : true,
                        buttons : [
                            {
                                text : 'Import', click : function()
                            {
                                file = (<HTMLInputElement> document.getElementById('files')).files[0];
                                if (file.name.substr(file.name.length - 6, 6) == '.beast')
                                {
                                    persist.loadProjectFromFile(file, (project : Project) =>
                                    {
                                        alert('Loaded project: "' + project.name + '"');
                                        persist.setCurrentProject(project);
                                        $(this)
                                            .dialog('destroy');
                                    });
                                }
                                else
                                {
                                    alert('Wrong file format! Choose a ".beast"-file!');
                                }
                            }
                            }, {
                                text : 'Cancel', click : function()
                                {
                                    $(this)
                                        .dialog('destroy');
                                }
                            }]
                    });
    };
    
    /**
     * opens dialog for name input and saves project in browser's local storage by use of the PersistenceController
     * @param event event parameter
     */
    public saveProject(event) : void
        {
            let persist = event.data.persist;
            let name : string;
            $('<div><input type="text" id="input1" value="Project X"/></div>')
                .dialog({
                            title   : 'Input the name of the project:',
                            modal   : true,
                            buttons : [
                                {
                                    text : 'Ok', click : function()
                                {
                                    name = (<HTMLInputElement> document.getElementById('input1')).value;
                                    if (name == '')
                                    {
                                        alert('Input any name!');
                                    }
                                    else
                                    {
                                        let p : Project = persist.getCurrentProject();
                                        p.name          = name;
                                        persist.setCurrentProject(p);
                                        persist.saveCurrentProjectLocaly();
                                        alert('Saved project "' + persist.getCurrentProject().name + '" locally.');
                                        $(this)
                                            .dialog('destroy');
                                    }
                                }
                                },
                                {
                                    text : 'Cancel', click : function()
                                {
                                    $(this)
                                        .dialog('destroy');
                                }
                                }
                            ]
                        });
        }
    
    /**
     * opens dialog for name input and downloads project by use of the PersistenceController
     * @param event event param
     */
    public exportProject(event) : void
        {
            let persist = event.data.persist;
            let name : string;
            $('<div><input type="text" id="input2" value="Project X" /></div>')
                .dialog({
                            title   : 'Input the name of the project:',
                            modal   : true,
                            buttons : [
                                {
                                    text : 'Ok', click : function()
                                {
                                    name = (<HTMLInputElement>document.getElementById('input2')).value;
                                    if (name == '')
                                    {
                                        alert('Input any name!');
                                    }
                                    else
                                    {
                                        persist.getCurrentProject().name = name;
                                        persist.downloadCurrentProject();
                                        $(this)
                                            .dialog('destroy');
                                    }
                                }
                                },
                                {
                                    text : 'Cancel', click : function()
                                {
                                    $(this)
                                        .dialog('destroy');
                                }
                                }
                            ]
                        });
        }
    
    /**
     * opens name input dialog, creates new Library-object and adds it to the current project
     * @param event event parameter
     */
    public createLibrary(event) : void
        {
            let persist = event.data.persist;
            let name : string;
            $('<div><input type="text" id="input3" value="New Library"/></div>')
                .dialog({
                            title   : 'Input the name of the new library:',
                            modal   : true,
                            buttons : [
                                {
                                    text : 'Ok', click : function()
                                {
                                    name = (<HTMLInputElement>document.getElementById('input3')).value;
                                    if (name == '')
                                    {
                                        alert('Input any name!');
                                    }
                                    else
                                    {
                                        let newLibrary : Library = new Library(name);
                                        persist.getLibraries()
                                               .push(newLibrary);
                                        persist.markDirty(DataType.Libraries);
                                        alert('Add new library "' + name + '" to the current project.');
                                        $(this)
                                            .dialog('destroy');
                                    }
                                }
                                },
                                {
                                    text : 'Cancel', click : function()
                                {
                                    $(this)
                                        .dialog('destroy');
                                }
                                }
                            ]
                        });
        }
    
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event event parameter
     */
    public importLibrary(event) : void
        {
            let persist = event.data.persist;
            let content = $('<div><input type=\'file\' id=\'files2\' name=\'File\' accept=".bdcl,' +
                            ' application/json"/><output' +
                            ' id=\'list\'></output></div>');
            $(content)
                .dialog({
                            title   : 'Choose a .bdcl-file:',
                            modal   : true,
                            buttons : [
                                {
                                    text : 'Import', click : function()
                                {
                                    const files : FileList = (<HTMLInputElement> document.getElementById('files2')).files;
                                    const libs : Library[] = [];
                                    if (files[0].name.endsWith('.bdcl'))
                                    {
                                        persist.loadLibraryFromFile(files, function(lib : Library)
                                        {
                                            persist.loadLibraryFromFile(files[0], this);
                                            alert('Loaded library: "' + lib.name + '"');
                                        });
                                        $(this)
                                            .dialog('destroy');
                                    }
                                    else
                                    {
                                        alert('Wrong file format! Choose a ".bdcl"- file!');
                                    }
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
    
    /**
     * opens dialog for choosing libraries and starts download of chosen libraries by use of the PersistenceController
     * @param event event parameter
     */
    public exportLibrary(event) : void
        {
            //TODO
            let persist = event.data.persist;
        }
}