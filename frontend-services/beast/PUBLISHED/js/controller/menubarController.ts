/**
 * Created by Paul on 22.05.2017.
 */

    ///<reference path="../d_ts/jquery.d.ts" />
    ///<reference path="../d_ts/jqueryui.d.ts" />
    ///<reference path="../model/model.ts" />
    ///<reference path="../Dialog.ts" />
    ///<reference path="../equation_converters/CreateSequenceController.ts" />
    ///<reference path="../equation_converters/converter.js" />
    ///<reference path="../equation_converters/fsm_beast.js" />


class MenubarController
{
    beastController : BeastController;
    createSequenceController: CreateSequenceController;
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
            this.createSequenceController = new CreateSequenceController();
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
            $('#createComponentFromEquation')
                .on('click', {controller : this.beastController}, this.createComponentFromEquation);
            $('#createComponentFromSequence')
                .on('click',
                    {sequenceController : this.createSequenceController, beastController: this.beastController},
                    this.createComponentFromSequence);
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
                                                                                                   if (project.version > BeastController.BEAST_VERSION)
                                                                                                   {
                                                                                                       InfoDialog.showDialog('This BEAST-version is older than the version this project was created with!<br>Some of of the components may be incompatible with this version.');
                                                                                                   }
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
                                                                                                                     if (controller.persistenceController.getCurrentProject().version > BeastController.BEAST_VERSION)
                                                                                                                     {
                                                                                                                         InfoDialog.showDialog('This BEAST-version is older than the version this project was created with!<br>Some of of the components may be incompatible with this version.');
                                                                                                                     }
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
                                                                                  controller.persistenceController.deleteLocalProject(value);
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

                            let invalidFiles : string[]        = [];
                            let nameCollisionFiles : string[]  = [];
                            let unequalVersionFiles : string[] = [];

                            for (let i = 0; i < files.length; i++)
                            {
                                if (files[i].name.endsWith('.bdcl'))
                                {
                                    controller.persistenceController.loadLibraryFromFile(files[i], (lib : Library) =>
                                    {
                                        if (lib == null)
                                        {
                                            invalidFiles[invalidFiles.length] = files[i].name;
                                        }
                                        else
                                        {
                                            if (controller.addLibrary(lib) == null)
                                            {
                                                nameCollisionFiles[nameCollisionFiles.length] = files[i].name;
                                            }
                                            else if (lib.version > BeastController.BEAST_VERSION)
                                            {
                                                unequalVersionFiles[unequalVersionFiles.length] = files[i].name;
                                            }
                                        }

                                        if (i == files.length - 1)
                                        {
                                            let message : string = '';
                                            if (invalidFiles.length > 0)
                                            {
                                                message += invalidFiles.length == 1 ? 'Can\'t import' +
                                                                                      ' library from file:<br>"' : 'Can\'t' +
                                                                                                                   ' import' +
                                                                                                                   ' libraries from' +
                                                                                                                   ' files:<br>"';
                                                invalidFiles.forEach((value) =>
                                                                     {
                                                                         message += value + '"<br>';
                                                                     });
                                                message += '<br>Invalid file content!<br>';
                                            }
                                            if (nameCollisionFiles.length > 0)
                                            {
                                                message += message == '' ? '' : '<br>';
                                                message += nameCollisionFiles.length == 1 ? 'Can\'t import library' +
                                                                                            ' from' +
                                                                                            ' file:<br>"' : 'Can\'t' +
                                                                                                            ' import' +
                                                                                                            ' libraries from' +
                                                                                                            ' files:<br>"';
                                                nameCollisionFiles.forEach((value) =>
                                                                           {
                                                                               message += value + '"<br>';
                                                                           });
                                                message += nameCollisionFiles.length == 1 ? '<br>A library with this name already' +
                                                                                            ' exists!<br>' : '<br>Libraries with this name already exist!<br>';
                                            }
                                            if (unequalVersionFiles.length > 0)
                                            {
                                                message += message == '' ? '' : '<br>';
                                                message += unequalVersionFiles.length == 1 ? 'This BEAST-version is older than' +
                                                                                             ' the version the' +
                                                                                             ' library from' +
                                                                                             ' file:<br>"' : 'This' +
                                                                                                             ' BEAST-version is older than' +
                                                                                                             ' the version the libraries from files:<br>"';
                                                unequalVersionFiles.forEach((value) =>
                                                                            {
                                                                                message += value + '"<br>';
                                                                            });
                                                message += unequalVersionFiles.length == 1 ? 'was created with!<br>' : 'were' +
                                                                                                                       ' created' +
                                                                                                                       ' with!<br>';
                                                message += '<br>Some of the components may be incompatible with this version.';
                                            }
                                            if (message.length > 0)
                                            {
                                                InfoDialog.showDialog(message);
                                            }
                                        }
                                    });
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

    private createComponentFromEquation(event) : void
        {
            const controller           = <BeastController>event.data.controller;
            InputDialog.type           = 'createComponent';
            const dialog : EquationComponentCreationDialog = new EquationComponentCreationDialog((input : string, expression: string) =>
                                                        {
                                                            try {
                                                                const id = PersistenceController.generateComponentId(input);
                                                                const circuit = new Equation_BEAST_Converter().convert(id, expression);
                                                                const component = new CompoundComponent(id, input, circuit.devices, circuit.connectors);

                                                                controller.createComponentAndPutInLibrary(component, 'Generated components');

                                                            } catch (error) {
                                                                InfoDialog.showDialog('Error occured: ' + error.message);
                                                            }

                                                        }, 'x1 + x2');
            dialog.show();
        }

    private createComponentFromSequence(event) : void
        {
            const sequenceController : CreateSequenceController = event.data.sequenceController;
            const beastController : BeastController = event.data.beastController;
            sequenceController.onSubmit = function (componentName, equations) {
                try {
                    const id = PersistenceController.generateComponentId(componentName);
                    let circuit = new FSM_Equation_BEAST_Converter().convert(componentName, equations);
                    const component = new CompoundComponent(id, componentName, circuit.devices, circuit.connectors);

                    beastController.createComponentAndPutInLibrary(component, 'Generated components');
                    sequenceController.close();
                } catch (error) {
                    InfoDialog.showDialog('Error occured: ' + error.message);
                }
            };
            sequenceController.onError = function (errors) {
                InfoDialog.showDialog('Error occured: ' + errors[0]);
            };
            sequenceController.show();
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
                                      input.prop('type', ListDialog.type == 'openProject' ? 'radio' : 'checkbox');
                                      input.prop('name', 'list');
                                      input.attr('id', val);
                                      const label : JQuery = $('<label></label>');
                                      label.prop('innerText', val);
                                      label.attr('for', val);
                                      itemList.append(input);
                                      itemList.append(label);
                                      itemList.append('<br>');
                                  }
                );
                itemList.find('input')[0].click();
                if (ListDialog.type == 'deleteProject')
                {
                    itemList.on('click', () =>
                    {
                        let itemSelected : boolean = false;
                        itemList.children('input')
                                .each((index, value) =>
                                      {
                                          if ((<HTMLInputElement>value).checked)
                                          {
                                              itemSelected = true;
                                          }
                                      });
                        this.setButtonDisabled('Delete', !itemSelected);
                    });
                }
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

class EquationComponentCreationDialog extends Dialog {
    protected nameInput: JQuery;
    protected expressionInput: JQuery;

    constructor(protected callbackFunction: (name: string, expression: string) => void, protected defaultExpression: string) {
        super({
            width: '700px'
        });
    }

    protected getTitle(): string {
        return 'Create new component';
    }

    protected getContent(): JQuery {
        const text = '<p><b>Please choose a name for new component:</b></p>'

        const content: JQuery = $('<div></div>')
            .append(text);
        this.nameInput = $('<input type="text"/>');
        this.nameInput.val('New Component');
        this.nameInput.addClass('beast-horizontal-fill');
        content.append(this.nameInput);

        content.append('<p><b>Please type an expression</b></p>')
        this.expressionInput = $('<input type="text"/>');
        this.expressionInput .val(this.defaultExpression);
        this.expressionInput.addClass('beast-horizontal-fill');
        content.append(this.expressionInput);

        this.addButton('Save', 'glyphicon glyphicon-floppy-disk', this.confimedEvent);
        this.addButton('Cancel', 'glyphicon glyphicon-remove', () => this.close());

        this.registerKeyListener((key: number) => {
            //enter
            if (key == 13) {
                this.confimedEvent();
            }
        });

        return content;
    }

    confimedEvent = () => {
        const val: string = this.nameInput.val();
        if (val.length != 0) {
            this.callbackFunction(this.nameInput.val(), this.expressionInput.val());
            this.close();
        }
    };
}


