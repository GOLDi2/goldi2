/**
 * Created by Paul on 22.05.2017.
 */
    
    ///<reference path="../d_ts/jquery.d.ts" />
    ///<reference path="../model/model.ts" />
    ///<reference path="../Dialog.ts" />


class MenubarController
{
    PersistenceController : PersistenceController;
    BeastController : BeastController;
    
    /**
     * creates new BeastController and PersistenceController
     * defines onclick-methods of Menubar-Buttons
     * @param BeastController - corresponding BeastController instance
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
            $('#importProject')
                .on('click', {persist : this.PersistenceController}, this.importProject);
            $('#saveProject')
                .on('click', {persist : this.PersistenceController}, this.saveProject);
            $('#deleteProject')
                .on('click', {persist : this.PersistenceController}, this.deleteProject);
            $('#createLibrary')
                .on('click', {persist : this.PersistenceController, tree : this.BeastController.treeController}, this.createLibrary);
            $('#importLibrary')
                .on('click', {persist : this.PersistenceController}, this.importLibrary);
            $('#exportLibrary')
                .on('click', {persist : this.PersistenceController}, this.exportLibrary);
            
        }
    
    /**
     * opens a warning dialog, when the the current project in the session storage is not saved
     * calls "saveProject"-method or creates new project by use of PersistenceController accordingly to user's input
     * @param event - event parameter
     */
    private createProject(event) : void
        {
            const persist                 = event.data.persist;
            const warning : WarningDialog = new WarningDialog(() =>
                                                              {
                                                                  persist.createNewProject();
                                                              }, () =>
                                                              {
                                                                  $('#saveProject')
                                                                      .click();
                                                              });
            if (persist.isDirty())
            {
                warning.show();
            }
            else
            {
                warning.callbackContinue();
            }
        }
    
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    private importProject(event) : void
        {
            const persist                 = event.data.persist;
            const warning : WarningDialog = new WarningDialog(() =>
                                                              {
                                                                  const fileInput : HTMLInputElement = document.createElement('input');
                                                                  fileInput.type                     = 'file';
                                                                  fileInput.id                       = 'files';
                                                                  fileInput.accept                   = '.beast,' +
                                                                                                       ' application/json';
                                                                  $(fileInput)
                                                                      .change(function()
                                                                              {
                                                                                  const file : File = fileInput.files[0];
                                                                                  if (file.name.endsWith('.beast'))
                                                                                  {
                                                                                      persist.loadProjectFromFile(file, (project : Project) =>
                                                                                      {
                                                                                          if (project == null)
                                                                                          {
                                                                                              alert('This file is not valid!');
                                                                                          }
                                                                                          else
                                                                                          {
                                                                                              persist.setCurrentProject(project);
                                                                                              $(fileInput)
                                                                                                  .remove();
                                                                                          }
                                                                                      });
                                                                                  }
                                                                                  else
                                                                                  {
                                                                                      alert('Choose a ".beast"-file!');
                                                                                  }
                                                                              });
                                                                  fileInput.click();
                                                              }, () =>
                                                              {
                                                                  $('#saveProject')
                                                                      .click();
                                                              });
            if (persist.isDirty())
            {
                warning.show();
            }
            else
            {
                warning.callbackContinue();
            }
        };
    
    /**
     * opens dialog with a list of all projects in the local storage
     * after selection and confirmation by the user the project is load by use of the PersistenceController
     * @param event - event parameter
     */
    private openProject(event) : void
        {
            const persist = event.data.persist;
            
            const warning : WarningDialog = new WarningDialog(() =>
                                                              {
                                                                  const dialog : ProjectListDialog = new ProjectListDialog(() =>
                                                                                                                           {
                                                                                                                               if (dialog.selectedItems.length != 0)
                                                                                                                               {
                                                                                                                                   dialog.selectedItems
                                                                                                                                         .forEach((value) =>
                                                                                                                                                  {
                                                                                                                                                      persist.loadProject(value);
                                                                                                                                                  });
                                                                                                                                   dialog.close();
                                                                                                                               }
                                                                                                                           }, true, persist.getProjects());
                                                                  dialog.show();
                                                              }, () =>
                                                              {
                                                                  $('#saveProject')
                                                                      .click();
                                                              });
            if (persist.isDirty())
            {
                warning.show();
            }
            else
            {
                warning.callbackContinue();
            }
        }
    
    
    /**
     * opens dialog for name input and saves project in browser's local storage by use of the PersistenceController
     * @param event - event parameter
     */
    private saveProject(event) : void
        {
            const persist = event.data.persist;
            
            const saveDialog : ProjectSaveDialog = new ProjectSaveDialog(() =>
                                                                         {
                                                                             const name = saveDialog.inputValue;
                                                                             if (name === '')
                                                                             {
                                                                                 alert('Input any name!');
                                                                             }
                                                                             else
                                                                             {
                                                                                 if (persist.getProjects()
                                                                                            .indexOf(name) == -1)
                                                                                 {
                                                                                     const p : Project = persist.getCurrentProject();
                                                                                     p.setName(name);
                                                                                     persist.saveCurrentProjectLocaly();
                                                                                     saveDialog.close();
                                                                                 }
                                                                                 else
                                                                                 {
                                                                                     alert('A project with this name already exists!');
                                                                                 }
                                                                             }
                                                                         }, persist.getCurrentProject().name, false);
            saveDialog.show();
        }
    
    /**
     * opens dialog with a list of all projects in the local storage
     * after selection and confirmation by the user the selected projects are deleted from the local storage by use
     * of the PersistenceController
     * @param event - event parameter
     */
    private deleteProject(event) : void
        {
            const persist = event.data.persist;
            
            const dialog : ProjectListDialog = new ProjectListDialog(() =>
                                                                     {
                                                                         if (dialog.selectedItems.length != 0)
                                                                         {
                                                                             dialog.selectedItems
                                                                                   .forEach((value) =>
                                                                                            {
                                                                                                persist.deleteLocalProject(value);
                                                                                            });
                                                                             dialog.close();
                                                                         }
                                                                     }, false, persist.getProjects());
            dialog.show();
        }
    
    /**
     * opens dialog for name input and downloads project by use of the PersistenceController
     * @param event - event param
     */
    private exportProject(event) : void
        {
            const persist = event.data.persist;
            
            const saveDialog : ProjectSaveDialog = new ProjectSaveDialog(() =>
                                                                         {
                                                                             const name : string = saveDialog.inputValue;
                                                                             if (name == '')
                                                                             {
                                                                                 alert('Input any name!');
                                                                             }
                                                                             else
                                                                             {
                                                                                 const p : Project = persist.getCurrentProject();
                                                                                 p.setName(name);
                                                                                 persist.downloadCurrentProject();
                                                                                 saveDialog.close();
                                                                             }
                                                                         }, persist.getCurrentProject().name, true);
            saveDialog.show();
        }
    
    /**
     * opens name input dialog, creates new Library-object and adds it to the current project
     * @param event - event parameter
     */
    private createLibrary(event) : void
        {
            const persist = event.data.persist;
            const tree    = event.data.tree;
            
            const dialog : LibraryCreateDialog = new LibraryCreateDialog(function()
                                                                         {
                                                                             const name : string = dialog.inputValue;
                                                                             if (name == '')
                                                                             {
                                                                                 alert('Input any name!');
                                                                             }
                                                                             else
                                                                             {
                                                                                 //TODO: check if library with this
                                                                                 // name already exists
                                                                                 if (persist.getCurrentProject()
                                                                                            .libraries
                                                                                            .indexOf(name) == -1)
                                                                                 {
                                                                                     //FIXME for now, we use teh new
                                                                                     // name as ID but this has to
                                                                                     // change TODO move resposibility
                                                                                     // of creating libs to the
                                                                                     // BeastController
                                                                                     let newLibrary : Library = new Library(name, name);
                                                                                     let p : Project          = persist.getCurrentProject();
                                                                                     p.libraries.push(newLibrary);
                                                                                     persist.markDirty(DataType.Libraries);
                                                                                     tree.addLibrary(newLibrary);
                                                                                     dialog.close();
                                                                                 }
                                                                                 else
                                                                                 {
                                                                                     alert('A library with this name already exists!');
                                                                                 }
                                                                             }
                                                                         });
            dialog.show();
        }
    
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    private importLibrary(event) : void
        {
            //TODO: check if library with this name already exists
            const persist = event.data.persist;
            
            const fileInput : HTMLInputElement = document.createElement('input');
            fileInput.type                     = 'file';
            fileInput.id                       = 'files';
            fileInput.multiple                 = true;
            fileInput.accept                   = '.bdcl,' +
                                                 ' application/json';
            $(fileInput)
                .change(function()
                        {
                            const files : FileList = fileInput.files;
                    
                            for (let i = 0; i < files.length; i++)
                            {
                                if (files[i].name.endsWith('.bdcl'))
                                {
                                    console.log(files[i].name);
                                    persist.loadLibraryFromFile(files[i], function(lib : Library)
                                    {
                                        if (lib != null)
                                        {
                                            persist.getLibraries()
                                                   .push(lib);
                                            persist.markDirty(DataType.Libraries);
                                            $(fileInput)
                                                .remove();
                                        }
                                    });
                                }
                            }
                        });
            
            //TODO: warning if files are not valid
            
            fileInput.click();
        }
    
    /**
     * opens dialog for choosing libraries and starts download of chosen libraries by use of the PersistenceController
     * @param event - event parameter
     */
    private exportLibrary(event) : void
        {
            const persist = event.data.persist;
            
            const dialog : LibraryExportDialog = new LibraryExportDialog(function()
                                                                         {
                                                                             dialog.selectedItems
                                                                                   .forEach((value) =>
                                                                                            {
                                                                                                persist.saveAsFile(value.name + '.bdcl', value);
                                                                                            });
                                                                             dialog.close();
                                                                         }, persist.getLibraries());
            dialog.show();
        }
}

class WarningDialog extends Dialog
{
    public callbackContinue : () => void;
    protected callbackSave : () => void;
    
    constructor(callbackFunctionContinue : () => void, callbackFunctionSave : () => void)
        {
            super();
            this.callbackContinue = callbackFunctionContinue;
            this.callbackSave     = callbackFunctionSave;
        }
    
    protected getTitle() : string
        {
            return 'Warning';
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery       = $('<div><p>The open project is not saved!</p></div>');
            const notSaveButton : JQuery = $('<button>Don\'t Save</button>');
            notSaveButton.click(() =>
                                {
                                    this.callbackContinue();
                                    this.close();
                                });
            content.append(notSaveButton);
            const saveButton : JQuery = $('<button>Save</button>');
            saveButton.click(() =>
                             {
                                 this.callbackSave();
                                 this.close();
                             });
            content.append(saveButton);
            
            return content;
        }
}

class ProjectSaveDialog extends Dialog
{
    private callbackSave : () => void;
    private defaultText : string;
    public inputValue : string;
    private exportDialog : boolean;
    
    constructor(callbackFunctionSave : () => void, defaultText : string, exportDialog : boolean)
        {
            super();
            this.callbackSave = callbackFunctionSave;
            this.defaultText  = defaultText;
            this.exportDialog = exportDialog;
        }
    
    protected getTitle() : string
        {
            if (this.exportDialog)
            {
                return 'Export project as...';
            }
            else
            {
                return 'Save project as...';
            }
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery    = $('<div></div>');
            const inputField : JQuery = $('<input/>');
            inputField.val(this.defaultText);
            $(inputField)
                .attr('type', 'text');
            content.append(inputField);
            let saveButton : JQuery;
            if (this.exportDialog)
            {
                saveButton = $('<button>Export</button>');
            }
            else
            {
                saveButton = $('<button>Save</button>');
            }
            saveButton.click(() =>
                             {
                                 this.inputValue = inputField.prop('value');
                                 this.callbackSave();
                             });
            content.append(saveButton);
            const cancelButton : JQuery = $('<button>Cancel</button>');
            cancelButton.click(() =>
                               {
                                   this.close();
                               });
            content.append(cancelButton);
            
            return $(content);
        }
}

class ProjectListDialog extends Dialog
{
    private callback : () => void;
    private openDialog : boolean;
    private list : string[];
    public selectedItems : string[];
    
    constructor(callbackFunction : () => void, openDialog : boolean, valueList : string[])
        {
            super();
            this.callback      = callbackFunction;
            this.list          = valueList;
            this.openDialog    = openDialog;
            this.selectedItems = [];
        }
    
    protected getTitle() : string
        {
            if (this.openDialog)
            {
                return 'Open project...';
            }
            else
            {
                return 'Delete...';
            }
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery  = $('<div></div>');
            const itemList : JQuery = $('<table></table>');
            
            if (this.list.length == 0)
            {
                const p : JQuery = $('<p><br/><i>no projects in the local storage</i></br></br></p>');
                content.append(p);
            }
            else
            {
                this.list
                    .forEach((value) =>
                             {
                                 const input : JQuery = $('<input/>');
                                 if (this.openDialog)
                                 {
                                     input.attr('type', 'radio');
                                 }
                                 else
                                 {
                                     input.attr('type', 'checkbox');
                                 }
                                 input.attr('name', 'projectList');
                                 const label : JQuery = $('<label></label>');
                                 label.prop('innerText', value);
                                 const tr : JQuery = $('<tr></tr>');
                                 tr.append(input);
                                 tr.append(label);
                                 itemList.append(tr);
                             });
                content.append(itemList);
                
                let button : JQuery;
                if (this.openDialog)
                {
                    button = $('<button>Open</button>');
                }
                else
                {
                    button = $('<button>Delete</button>');
                }
                button.click(() =>
                             {
                                 this.list
                                     .forEach((value, index) =>
                                              {
                                                  if ((<HTMLInputElement>itemList.children()
                                                                                 .children('input')[index]).checked)
                                                  {
                                                      this.selectedItems.push(value);
                                                  }
                                              });
                                 this.callback();
                             });
                content.append(button);
            }
            
            
            const cancelButton : JQuery = $('<button>Cancel</button>');
            cancelButton.click(() =>
                               {
                                   this.close();
                               });
            content.append(cancelButton);
            
            return (content);
        }
}

class LibraryCreateDialog extends Dialog
{
    private callback : () => void;
    public inputValue : string;
    
    constructor(callbackFunction : () => void)
        {
            super();
            this.callback = callbackFunction;
        }
    
    protected getTitle() : string
        {
            return 'Create new library...';
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery    = $('<div></div>');
            const inputField : JQuery = $('<input/>');
            inputField.val('New Library');
            $(inputField)
                .attr('type', 'text');
            content.append(inputField);
            
            const createButton : JQuery = $('<button>Create</button>');
            createButton.click(() =>
                               {
                                   this.inputValue = inputField.prop('value');
                                   this.callback();
                               });
            content.append(createButton);
            const cancelButton : JQuery = $('<button>Cancel</button>');
            cancelButton.click(() =>
                               {
                                   this.close();
                               });
            content.append(cancelButton);
            
            return $(content);
        }
}

class LibraryExportDialog extends Dialog
{
    private callback : () => void;
    private list : Library[];
    public selectedItems : Library[];
    
    constructor(callbackFunction : () => void, valueList : Library[])
        {
            super();
            this.callback      = callbackFunction;
            this.list          = valueList;
            this.selectedItems = [];
        }
    
    protected getTitle() : string
        {
            return 'Export libraries...';
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery = $('<div></div>');
            
            const itemList : JQuery = $('<table></table>');
            this.list
                .forEach((value) =>
                         {
                             const input : JQuery = $('<input/>');
                             input.attr('type', 'checkbox');
                             input.attr('name', 'libraryList');
                             const label : JQuery = $('<label></label>');
                             label.prop('innerText', value.name);
                             const tr : JQuery = $('<tr></tr>');
                             tr.append(input);
                             tr.append(label);
                             itemList.append(tr);
                         });
            content.append(itemList);
            
            const button : JQuery = $('<button>Export</button>');
            
            button.click(() =>
                         {
                             this.list
                                 .forEach((value, index) =>
                                          {
                                              if ((<HTMLInputElement>itemList.children()
                                                                             .children('input')[index]).checked)
                                              {
                                                  this.selectedItems.push(value);
                                              }
                                          });
                             this.callback();
                         });
            content.append(button);
            const cancelButton : JQuery = $('<button>Cancel</button>');
            cancelButton.click(() =>
                               {
                                   this.close();
                               });
            content.append(cancelButton);
            
            return (content);
        }
}