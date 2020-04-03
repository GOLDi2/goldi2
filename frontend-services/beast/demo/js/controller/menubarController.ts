/**
 * Created by Paul on 22.05.2017.
 */
    
    ///<reference path="../d_ts/jquery.d.ts" />
    ///<reference path="../model/model.ts" />
    ///<reference path="../Dialog.ts" />


class MenubarController
{
    beastController : BeastController;
    public static createAfterWarning : boolean;
    public static openAfterWarning : boolean;
    public static importAfterWarning : boolean;
    
    /**
     * creates new BeastController and PersistenceController
     * defines onclick-methods of Menubar-Buttons
     * @param beastController - corresponding BeastController instance
     */
    constructor(beastController)
        {
            this.beastController = beastController;
            $('#createProject')
                .on('click', {controller : this.beastController}, this.createProject);
            $('#openProject')
                .on('click', {controller : this.beastController}, this.openProject);
            $('#exportProject')
                .on('click', {controller : this.beastController}, this.exportProject);
            $('#importProject')
                .on('click', {controller : this.beastController}, this.importProject);
            $('#saveProject')
                .on('click', {controller : this.beastController}, this.saveProject);
            $('#deleteProject')
                .on('click', {controller : this.beastController}, this.deleteProject);
            $('#createLibrary')
                .on('click', {controller : this.beastController}, this.createLibrary);
            $('#importLibrary')
                .on('click', {controller : this.beastController}, this.importLibrary);
            $('#exportLibrary')
                .on('click', {controller : this.beastController}, this.exportLibrary);
            $('#createComponent')
                .on('click', {controller : this.beastController}, this.createComponent);
            MenubarController.createAfterWarning = false;
            MenubarController.openAfterWarning   = false;
            MenubarController.importAfterWarning = false;
            
        }
    
    /**
     * opens a warning dialog, when the the current project in the session storage is not saved
     * calls "saveProject"-method or creates new project by use of PersistenceController accordingly to user's input
     * @param event - event parameter
     */
    private createProject(event) : void
        {
            const controller : BeastController = event.data.controller;
            const warning : WarningDialog      = new WarningDialog(() =>
                                                                   {
                                                                       controller.createNewProject();
                                                                   }, () =>
                                                                   {
                                                                       MenubarController.createAfterWarning = true;
                                                                       $('#saveProject')
                                                                           .click();
                                                                   }, () =>
                                                                   {
                                                                       MenubarController.createAfterWarning = true;
                                                                       $('#exportProject')
                                                                           .click();
                                                                   }, null);
            if (controller.isDirty())
            {
                warning.show();
            }
            else
            {
                warning.callbackContinue();
            }
            MenubarController.createAfterWarning = false;
        }
    
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    private importProject(event) : void
        {
            const controller : BeastController = event.data.controller;
            const warning : WarningDialog      = new WarningDialog(() =>
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
                                                                                           controller.persistenceController.loadProjectFromFile(file, (project : Project) =>
                                                                                           {
                                                                                               if (project == null)
                                                                                               {
                                                                                                   InfoDialog.showDialog('This file is not valid!');
                                                                                               }
                                                                                               else
                                                                                               {
                                                                                                   controller.persistenceController.setCurrentProject(project);
                                                                                                   $(fileInput)
                                                                                                       .remove();
                                                                                               }
                                                                                           });
                                                                                       }
                                                                                       else
                                                                                       {
                                                                                           InfoDialog.showDialog('Choose a .beast-file!');
                                                                                       }
                                                                                   });
                                                                       fileInput.click();
                                                                   }, () =>
                                                                   {
                                                                       MenubarController.importAfterWarning = true;
                                                                       $('#saveProject')
                                                                           .click();
                                                                   }, () =>
                                                                   {
                                                                       MenubarController.importAfterWarning = true;
                                                                       $('#exportProject')
                                                                           .click();
                                                                   }, null);
            if (controller.isDirty())
            {
                warning.show();
            }
            else
            {
                warning.callbackContinue();
            }
            MenubarController.importAfterWarning = false;
        };
    
    /**
     * opens dialog with a list of all projects in the local storage
     * after selection and confirmation by the user the project is load by use of the PersistenceController
     * @param event - event parameter
     */
    private openProject(event) : void
        {
            const controller : BeastController = event.data.controller;
            
            ListDialog.type               = 'openProject';
            const warning : WarningDialog = new WarningDialog(() =>
                                                              {
                                                                  const dialog : ListDialog = new ListDialog(() =>
                                                                                                             {
                                                                                                                 if (dialog.selectedItems.length != 0)
                                                                                                                 {
                                                                                                                     dialog.selectedItems
                                                                                                                           .forEach((value) =>
                                                                                                                                    {
                                                                                                                                        controller.loadProject(value);
                                                                                                                                    });
                                                                                                                 }
                                                                                                             }, controller.listProjects());
                                                                  dialog.show();
                                                              }, () =>
                                                              {
                                                                  MenubarController.openAfterWarning = true;
                                                                  $('#saveProject')
                                                                      .click();
                                                              }, () =>
                                                              {
                                                                  MenubarController.openAfterWarning = true;
                                                                  $('#exportProject')
                                                                      .click();
                                                              }, null);
            if (controller.isDirty())
            {
                warning.show();
            }
            else
            {
                warning.callbackContinue();
            }
            MenubarController.openAfterWarning = false;
        }
    
    
    /**
     * opens dialog for name input and saves project in browser's local storage by use of the PersistenceController
     * @param event - event parameter
     */
    private saveProject(event) : void
        {
            const controller : BeastController = event.data.controller;
            InputDialog.type                   = 'saveProject';
            const saveDialog : InputDialog     = new InputDialog((input : string) =>
                                                                 {
                                                                     const p : Project = controller.persistenceController.getCurrentProject();
                                                                     p.setName(input);
                                                                     controller.persistenceController.saveCurrentProjectInLocalStorage();
                                                                     if (MenubarController.createAfterWarning)
                                                                     {
                                                                         $('#createProject')
                                                                             .click();
                                                                     }
                                                                     if (MenubarController.importAfterWarning)
                                                                     {
                                                                         $('#importProject')
                                                                             .click();
                                                                     }
                                                                     if (MenubarController.openAfterWarning)
                                                                     {
                                                                         $('#openProject')
                                                                             .click();
                                                                     }
                                                                 }, controller.persistenceController.getCurrentProject()
                                                                              .getName(), controller.listProjects());
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
            const controller : BeastController = event.data.controller;
            
            ListDialog.type           = 'deleteProject';
            const dialog : ListDialog = new ListDialog(() =>
                                                       {
                                                           if (dialog.selectedItems.length != 0)
                                                           {
                                                               dialog.selectedItems
                                                                     .forEach((value) =>
                                                                              {
                                                                                  PersistenceController.deleteLocalProject(value);
                                                                              });
                                                           }
                                                       }, controller.listProjects());
            dialog.show();
        }
    
    /**
     * opens dialog for name input and downloads project by use of the PersistenceController
     * @param event - event param
     */
    private exportProject(event) : void
        {
            const controller : BeastController = event.data.controller;
            InputDialog.type                   = 'exportProject';
            const exportDialog : InputDialog   = new InputDialog((input : string) =>
                                                                 {
                                                                     const p : Project = controller.persistenceController.getCurrentProject();
                                                                     p.setName(input);
                                                                     controller.persistenceController.downloadCurrentProject();
                                                                     if (MenubarController.createAfterWarning)
                                                                     {
                                                                         $('#createProject')
                                                                             .click();
                                                                     }
                                                                     if (MenubarController.importAfterWarning)
                                                                     {
                                                                         $('#importProject')
                                                                             .click();
                                                                     }
                                                                     if (MenubarController.openAfterWarning)
                                                                     {
                                                                         $('#openProject')
                                                                             .click();
                                                                     }
                                                                 }, controller.persistenceController.getCurrentProject()
                                                                              .getName(), null);
            exportDialog.show();
        }
    
    /**
     * opens name input dialog, creates new Library-object and adds it to the current project
     * @param event - event parameter
     */
    private createLibrary(event) : void
        {
            const controller           = event.data.controller;
            InputDialog.type           = 'createLibrary';
            const dialog : InputDialog = new InputDialog((input : string) =>
                                                         {
                                                             if (null == controller.createLibrary(input))
                                                             {
                                                                 InfoDialog.showDialog('A library' +
                                                                                       ' with this name already exists!');
                                                             }
                                                         }, 'New Library', null);
            dialog.show();
        }
    
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    private importLibrary(event) : void
        {
            const controller = event.data.controller;
            
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
                                    controller.importLibrary(files[i]);
                                }
                            }
                    
                            $(fileInput)
                                .remove();
                        });
            
            fileInput.click();
        }
    
    /**
     * opens dialog for choosing libraries and starts download of chosen libraries by use of the PersistenceController
     * @param event - event parameter
     */
    private exportLibrary(event) : void
        {
            const controller          = event.data.controller;
            ListDialog.type           = 'exportLibrary';
            const dialog : ListDialog = new ListDialog(function()
                                                       {
                                                           dialog.selectedItems
                                                                 .forEach((value) =>
                                                                          {
                                                                              controller.downloadLibrary(value.name + '.bdcl', value);
                                                                          });
                                                       }, controller.getExportableLibraries());
            dialog.show();
        }
    
    private createComponent(event) : void
        {
            const controller           = <BeastController>event.data.controller;
            InputDialog.type           = 'createComponent';
            const dialog : InputDialog = new InputDialog((input : string) =>
                                                         {
                                                             controller.createAndOpenComponent(input);
                                                         }, 'New Component', null);
            dialog.show();
        }
}

class WarningDialog extends Dialog
{
    public callbackContinue : () => void;
    protected callbackSave : () => void;
    protected callBackExport : () => void;
    private name : string;
    
    constructor(callbackFunctionContinue : () => void, callbackFunctionSave : () => void, callbackFunctionExport : () => void, projectName : string)
        {
            super();
            this.callbackContinue = callbackFunctionContinue;
            this.callbackSave     = callbackFunctionSave;
            this.callBackExport   = callbackFunctionExport;
            this.name             = projectName;
        }
    
    protected getTitle() : string
        {
            return 'Warning';
        }
    
    protected getContent() : JQuery
        {
            let content : JQuery;
            if (this.name == null)
            {
                content = $('<div><p>The open project is not saved!</p></div>');
                this.addButton('Save', 'glyphicon glyphicon-floppy-disk', () =>
                {
                    this.callbackSave();
                    this.close();
                });
                this.addButton('Export', 'glyphicon glyphicon-export', () =>
                {
                    this.callBackExport();
                    this.close();
                });
                this.addButton('Don\'t Save', 'glyphicon glyphicon-remove', () =>
                {
                    this.callbackContinue();
                    this.close();
                });
            }
            else
            {
                content = $('<p></p>');
                content.prop('innerText', 'Do you want to overwrite the project "' + this.name + '"?');
                this.addButton('Overwrite', 'glyphicon glyphicon-edit', () =>
                {
                    this.callbackContinue();
                    this.close();
                });
                this.addButton('Cancel', 'glyphicon glyphicon-remove', () =>
                {
                    this.close();
                });
            }
            return content;
        }
}

class InputDialog extends Dialog
{
    private callback : (inputValue : string) => void;
    private defaultText : string;
    private projectList : string[];
    public static type : string;
    private buttonFunction : () => void;
    
    constructor(callbackFunction : (inputValue) => void, defaultText : string, projectList : string[])
        {
            super();
            this.callback    = callbackFunction;
            this.defaultText = defaultText;
            this.projectList = projectList;
        }
    
    protected getTitle() : string
        {
            let s : string;
            switch (InputDialog.type)
            {
                case 'saveProject':
                    s = 'Save project...';
                    break;
                case 'exportProject':
                    s = 'Export project as...';
                    break;
                case 'createLibrary':
                    s = 'Create new library...';
                    break;
                case 'createComponent':
                    s = 'Create new Component...';
                    break;
            }
            return s;
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery = $('<div></div>');
            const inputField       = $('<input/>')
                .addClass('beast-horizontal-fill');
            if (InputDialog.type == 'saveProject')
            {
                content.append($('<p>Current projects in the local storage:</p>'));
                
                if (this.projectList.length == 0)
                {
                    content.append($('<p><br/><i>There are no saved projects.</i></p><br>'));
                }
                else
                {
                    const selectList : JQuery = $('<select></select>');
                    selectList.attr('size', this.projectList.length > 1 ? this.projectList.length : 2);
                    selectList.addClass('beast-horizontal-fill');
                    this.projectList.forEach((value) =>
                                             {
                                                 const option : JQuery = $('<option></option>');
                                                 option.prop('innerText', value);
                                                 selectList.append(option);
                                             });
                    selectList.on('change', () =>
                    {
                        console.log(selectList.prop('selectedIndex'));
                        inputField.val(this.projectList[selectList.prop('selectedIndex')]);
                    });
                    content.append(selectList);
                    content.append($('<br><br>'));
                }
                content.append('<p><b>Save as...</b></p>');
            }
            
            this.buttonFunction = () =>
            {
                const val : string = inputField.prop('value');
                if (val != '')
                {
                    if (InputDialog.type == 'saveProject')
                    {
                        if (this.projectList.indexOf(val) == -1)
                        {
                            this.callback(val);
                        }
                        else
                        {
                            const warning = new WarningDialog(() =>
                                                              {
                                                                  this.callback(val);
                                                              }, null, null, val);
                            warning.show();
                        }
                    }
                    else
                    {
                        this.callback(val);
                    }
                    this.close();
                }
            };
            
            let buttonName : string;
            inputField.val(this.defaultText);
            inputField.prop('autofocus', 'true');
            inputField.on('input', () =>
            {
                if (inputField.val().length == 0)
                {
                    this.setButtonDisabled(buttonName, true);
                }
                else
                {
                    this.setButtonDisabled(buttonName, false);
                }
            });
            inputField
                .attr('type', 'text');
            content.append(inputField);
            
            let icon : string;
            switch (InputDialog.type)
            {
                case 'saveProject':
                    buttonName = 'Save';
                    icon       = 'glyphicon glyphicon-floppy-disk';
                    break;
                case 'exportProject':
                    buttonName = 'Export';
                    icon       = 'glyphicon glyphicon-export';
                    break;
                case 'createLibrary':
                    buttonName = 'Create';
                    icon       = 'glyphicon glyphicon-file';
                    break;
                case 'createComponent':
                    buttonName = 'Create';
                    icon       = 'glyphicon glyphicon-file';
                    break;
            }
            this.addButton(buttonName, icon, this.buttonFunction);
            
            this.addButton('Cancel', 'glyphicon glyphicon-remove', () =>
            {
                this.close();
            });
            
            this.registerKeyListener((key : number) =>
                                     {
                                         if (key == 13)
                                         {
                                             this.buttonFunction();
                                         }
                                     });
            
            return content;
        }
}

class ListDialog extends Dialog
{
    private callback : () => void;
    private list : any[];
    public selectedItems : any[];
    public static type : string;
    private buttonFunction : () => void;
    
    constructor(callBackFunction : () => void, list : string[] | Library[])
        {
            super();
            this.callback      = callBackFunction;
            this.list          = list;
            this.selectedItems = [];
        }
    
    protected getTitle() : string
        {
            let s : string;
            switch (ListDialog.type)
            {
                case 'openProject':
                    s = 'Open project...';
                    break;
                case 'deleteProject':
                    s = 'Delete project...';
                    break;
                case 'exportLibrary':
                    s = 'Export library...';
                    break;
            }
            return s;
        }
    
    protected getContent() : JQuery
        {
            const content : JQuery = $('<form></form>');
            
            if (this.list.length == 0)
            {
                content.append(ListDialog.type == 'exportLibrary' ? '<p><br/><i>There are no libraries you can' +
                                                                    ' export.</i></p>' : '<p><br/><i>There are no saved' +
                                                                                         ' projects.</i></p>');
            }
            else
            {
                const itemList : JQuery = $('<fieldset></fieldset>');
                this.list.forEach((value) =>
                                  {
                                      const val : string   = ListDialog.type == 'exportLibrary' ? value.name : value;
                                      const input : JQuery = $('<input>');
                                      if (ListDialog.type == 'openProject')
                                      {
                                          input.attr('type', 'radio');
                                      }
                                      else
                                      {
                                          input.attr('type', 'checkbox');
                                      }
                                      input.attr('name', 'list');
                                      input.attr('id', val);
                                      const label : JQuery = $('<label></label>');
                                      label.prop('innerText', val);
                                      label.attr('for', val);
                                      itemList.append(input);
                                      itemList.append(label);
                                      itemList.append($('<br>'));
                                  }
                );
                content.append(itemList);
                
                let buttonName : string;
                let icon : string;
                switch (ListDialog.type)
                {
                    case 'openProject':
                        buttonName = 'Open';
                        icon       = 'glyphicon glyphicon-folder-open';
                        break;
                    case 'deleteProject':
                        buttonName = 'Delete';
                        icon       = 'glyphicon glyphicon-trash';
                        break;
                    case 'exportLibrary':
                        buttonName = 'Export';
                        icon       = 'glyphicon glyphicon-export';
                        break;
                }
                
                this.buttonFunction = () =>
                {
                    let n = 0;
                    this.list
                        .forEach((value, index) =>
                                 {
                                     if ((<HTMLInputElement>itemList.find('input')[index - n]).checked)
                                     {
                                         this.selectedItems.push(value);
                                         if (ListDialog.type == 'deleteProject')
                                         {
                                             itemList.find('input')[index - n].remove();
                                             itemList.find('label')[index - n].remove();
                                             itemList.find('br')[index - n].remove();
                                             n++;
                                             if (itemList.find('input').length == 0)
                                             {
                                                 const p : JQuery = $('<p><br/><i>There are no' +
                                                                      ' saved projects.</i></p>');
                                                 content.append(p);
                                                 this.setButtonDisabled(buttonName, true);
                                             }
                                         }
                                     }
                                 });
                    this.callback();
                    if (ListDialog.type != 'deleteProject')
                    {
                        this.close();
                    }
                };
                
                
                this.addButton(buttonName, icon, this.buttonFunction);
                
                this.registerKeyListener((key : number) =>
                                         {
                                             if (key == 13)
                                             {
                                                 this.buttonFunction();
                                             }
                                         });
            }
            
            
            this.addButton('Cancel', 'glyphicon glyphicon-remove', () =>
            {
                this.close();
            });
            
            
            return content;
        }
}