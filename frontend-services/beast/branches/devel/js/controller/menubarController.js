/**
 * Created by Paul on 22.05.2017.
 */
///<reference path="../d_ts/jquery.d.ts" />
///<reference path="../d_ts/jqueryui.d.ts" />
///<reference path="../model/model.ts" />
///<reference path="../Dialog.ts" />
class MenubarController {
    /**
     * creates new BeastController and PersistenceController
     * defines onclick-methods of Menubar-Buttons
     * @param beastController - corresponding BeastController instance
     */
    constructor(beastController) {
        this.beastController = beastController;
        $('#createProject')
            .on('click', { controller: this.beastController }, this.createProject);
        $('#openProject')
            .on('click', { controller: this.beastController }, this.openProject);
        $('#exportProject')
            .on('click', { controller: this.beastController }, this.exportProject);
        $('#importProject')
            .on('click', { controller: this.beastController }, this.importProject);
        $('#saveProject')
            .on('click', { controller: this.beastController }, this.saveProject);
        $('#deleteProject')
            .on('click', { controller: this.beastController }, this.deleteProject);
        $('#createLibrary')
            .on('click', { controller: this.beastController }, this.createLibrary);
        $('#importLibrary')
            .on('click', { controller: this.beastController }, this.importLibrary);
        $('#exportLibrary')
            .on('click', { controller: this.beastController }, this.exportLibrary);
        $('#createComponent')
            .on('click', { controller: this.beastController }, this.createComponent);
        MenubarController.createAfterWarning = false;
        MenubarController.openAfterWarning = false;
        MenubarController.importAfterWarning = false;
    }
    /**
     * opens a warning dialog, when the the current project in the session storage is not saved
     * calls "saveProject"-method or creates new project by use of PersistenceController accordingly to user's input
     * @param event - event parameter
     */
    createProject(event) {
        const controller = event.data.controller;
        const warning = new WarningDialog(() => {
            controller.createNewProject();
        }, () => {
            MenubarController.createAfterWarning = true;
            $('#saveProject')
                .click();
        }, () => {
            MenubarController.createAfterWarning = true;
            $('#exportProject')
                .click();
        }, null);
        if (controller.isDirty()) {
            warning.show();
        }
        else {
            warning.callbackContinue();
        }
        MenubarController.createAfterWarning = false;
    }
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    importProject(event) {
        const controller = event.data.controller;
        const warning = new WarningDialog(() => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'files';
            fileInput.accept = '.beast,' +
                ' application/json';
            $(fileInput)
                .change(function () {
                const file = fileInput.files[0];
                if (file.name.endsWith('.beast')) {
                    controller.persistenceController.loadProjectFromFile(file, (project) => {
                        if (project == null) {
                            InfoDialog.showDialog('This file is not valid!');
                        }
                        else {
                            if (project.version > BeastController.BEAST_VERSION) {
                                InfoDialog.showDialog('This BEAST-version is older than the version this project was created with!<br>Some of of the components may be incompatible with this version.');
                            }
                            controller.persistenceController.setCurrentProject(project);
                            $(fileInput)
                                .remove();
                        }
                    });
                }
                else {
                    InfoDialog.showDialog('Choose a .beast-file!');
                }
            });
            fileInput.click();
        }, () => {
            MenubarController.importAfterWarning = true;
            $('#saveProject')
                .click();
        }, () => {
            MenubarController.importAfterWarning = true;
            $('#exportProject')
                .click();
        }, null);
        if (controller.isDirty()) {
            warning.show();
        }
        else {
            warning.callbackContinue();
        }
        MenubarController.importAfterWarning = false;
    }
    ;
    /**
     * opens dialog with a list of all projects in the local storage
     * after selection and confirmation by the user the project is load by use of the PersistenceController
     * @param event - event parameter
     */
    openProject(event) {
        const controller = event.data.controller;
        ListDialog.type = 'openProject';
        const warning = new WarningDialog(() => {
            const dialog = new ListDialog(() => {
                if (dialog.selectedItems.length != 0) {
                    dialog.selectedItems
                        .forEach((value) => {
                        controller.loadProject(value);
                    });
                    if (controller.persistenceController.getCurrentProject().version > BeastController.BEAST_VERSION) {
                        InfoDialog.showDialog('This BEAST-version is older than the version this project was created with!<br>Some of of the components may be incompatible with this version.');
                    }
                }
            }, controller.listProjects());
            dialog.show();
        }, () => {
            MenubarController.openAfterWarning = true;
            $('#saveProject')
                .click();
        }, () => {
            MenubarController.openAfterWarning = true;
            $('#exportProject')
                .click();
        }, null);
        if (controller.isDirty()) {
            warning.show();
        }
        else {
            warning.callbackContinue();
        }
        MenubarController.openAfterWarning = false;
    }
    /**
     * opens dialog for name input and saves project in browser's local storage by use of the PersistenceController
     * @param event - event parameter
     */
    saveProject(event) {
        const controller = event.data.controller;
        InputDialog.type = 'saveProject';
        const saveDialog = new InputDialog((input) => {
            const p = controller.persistenceController.getCurrentProject();
            p.setName(input);
            controller.persistenceController.saveCurrentProjectInLocalStorage();
            if (MenubarController.createAfterWarning) {
                $('#createProject')
                    .click();
            }
            if (MenubarController.importAfterWarning) {
                $('#importProject')
                    .click();
            }
            if (MenubarController.openAfterWarning) {
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
    deleteProject(event) {
        const controller = event.data.controller;
        ListDialog.type = 'deleteProject';
        const dialog = new ListDialog(() => {
            if (dialog.selectedItems.length != 0) {
                dialog.selectedItems
                    .forEach((value) => {
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
    exportProject(event) {
        const controller = event.data.controller;
        InputDialog.type = 'exportProject';
        const exportDialog = new InputDialog((input) => {
            const p = controller.persistenceController.getCurrentProject();
            p.setName(input);
            controller.persistenceController.downloadCurrentProject();
            if (MenubarController.createAfterWarning) {
                $('#createProject')
                    .click();
            }
            if (MenubarController.importAfterWarning) {
                $('#importProject')
                    .click();
            }
            if (MenubarController.openAfterWarning) {
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
    createLibrary(event) {
        const controller = event.data.controller;
        InputDialog.type = 'createLibrary';
        const dialog = new InputDialog((input) => {
            if (null == controller.createLibrary(input)) {
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
    importLibrary(event) {
        const controller = event.data.controller;
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'files';
        fileInput.multiple = true;
        fileInput.accept = '.bdcl,' +
            ' application/json';
        $(fileInput)
            .change(function () {
            const files = fileInput.files;
            let invalidFiles = [];
            let nameCollisionFiles = [];
            let unequalVersionFiles = [];
            for (let i = 0; i < files.length; i++) {
                if (files[i].name.endsWith('.bdcl')) {
                    controller.persistenceController.loadLibraryFromFile(files[i], (lib) => {
                        if (lib == null) {
                            invalidFiles[invalidFiles.length] = files[i].name;
                        }
                        else {
                            if (controller.addLibrary(lib) == null) {
                                nameCollisionFiles[nameCollisionFiles.length] = files[i].name;
                            }
                            else if (lib.version > BeastController.BEAST_VERSION) {
                                unequalVersionFiles[unequalVersionFiles.length] = files[i].name;
                            }
                        }
                        if (i == files.length - 1) {
                            let message = '';
                            if (invalidFiles.length > 0) {
                                message += invalidFiles.length == 1 ? 'Can\'t import' +
                                    ' library from file:<br>"' : 'Can\'t' +
                                    ' import' +
                                    ' libraries from' +
                                    ' files:<br>"';
                                invalidFiles.forEach((value) => {
                                    message += value + '"<br>';
                                });
                                message += '<br>Invalid file content!<br>';
                            }
                            if (nameCollisionFiles.length > 0) {
                                message += message == '' ? '' : '<br>';
                                message += nameCollisionFiles.length == 1 ? 'Can\'t import library' +
                                    ' from' +
                                    ' file:<br>"' : 'Can\'t' +
                                    ' import' +
                                    ' libraries from' +
                                    ' files:<br>"';
                                nameCollisionFiles.forEach((value) => {
                                    message += value + '"<br>';
                                });
                                message += nameCollisionFiles.length == 1 ? '<br>A library with this name already' +
                                    ' exists!<br>' : '<br>Libraries with this name already exist!<br>';
                            }
                            if (unequalVersionFiles.length > 0) {
                                message += message == '' ? '' : '<br>';
                                message += unequalVersionFiles.length == 1 ? 'This BEAST-version is older than' +
                                    ' the version the' +
                                    ' library from' +
                                    ' file:<br>"' : 'This' +
                                    ' BEAST-version is older than' +
                                    ' the version the libraries from files:<br>"';
                                unequalVersionFiles.forEach((value) => {
                                    message += value + '"<br>';
                                });
                                message += unequalVersionFiles.length == 1 ? 'was created with!<br>' : 'were' +
                                    ' created' +
                                    ' with!<br>';
                                message += '<br>Some of the components may be incompatible with this version.';
                            }
                            if (message.length > 0) {
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
    exportLibrary(event) {
        const controller = event.data.controller;
        ListDialog.type = 'exportLibrary';
        const dialog = new ListDialog(function () {
            dialog.selectedItems
                .forEach((value) => {
                controller.downloadLibrary(value.name + '.bdcl', value);
            });
        }, controller.getExportableLibraries());
        dialog.show();
    }
    createComponent(event) {
        const controller = event.data.controller;
        InputDialog.type = 'createComponent';
        const dialog = new InputDialog((input) => {
            controller.createAndOpenComponent(input);
        }, 'New Component', null);
        dialog.show();
    }
}
class WarningDialog extends Dialog {
    constructor(callbackFunctionContinue, callbackFunctionSave, callbackFunctionExport, projectName) {
        super();
        this.callbackContinue = callbackFunctionContinue;
        this.callbackSave = callbackFunctionSave;
        this.callBackExport = callbackFunctionExport;
        this.name = projectName;
    }
    getTitle() {
        return 'Warning';
    }
    getContent() {
        let content;
        if (this.name == null) {
            content = $('<div><p>The open project is not saved!</p></div>');
            this.addButton('Save', 'glyphicon glyphicon-floppy-disk', () => {
                this.callbackSave();
                this.close();
            });
            this.addButton('Export', 'glyphicon glyphicon-export', () => {
                this.callBackExport();
                this.close();
            });
            this.addButton('Don\'t Save', 'glyphicon glyphicon-remove', () => {
                this.callbackContinue();
                this.close();
            });
        }
        else {
            content = $('<p></p>');
            content.prop('innerText', 'Do you want to overwrite the project "' + this.name + '"?');
            this.addButton('Overwrite', 'glyphicon glyphicon-edit', () => {
                this.callbackContinue();
                this.close();
            });
            this.addButton('Cancel', 'glyphicon glyphicon-remove', () => {
                this.close();
            });
        }
        return content;
    }
}
class InputDialog extends Dialog {
    constructor(callbackFunction, defaultText, projectList) {
        super();
        this.callback = callbackFunction;
        this.defaultText = defaultText;
        this.projectList = projectList;
    }
    getTitle() {
        let s;
        switch (InputDialog.type) {
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
    getContent() {
        const content = $('<div></div>');
        const inputField = $('<input/>')
            .addClass('beast-horizontal-fill');
        if (InputDialog.type == 'saveProject') {
            content.append($('<p>Current projects in the local storage:</p>'));
            if (this.projectList.length == 0) {
                content.append($('<p><br/><i>There are no saved projects.</i></p><br>'));
            }
            else {
                const selectList = $('<select></select>');
                selectList.attr('size', this.projectList.length > 1 ? this.projectList.length : 2);
                selectList.addClass('beast-horizontal-fill');
                this.projectList.forEach((value) => {
                    const option = $('<option></option>');
                    option.prop('innerText', value);
                    selectList.append(option);
                });
                selectList.on('change', () => {
                    console.log(selectList.prop('selectedIndex'));
                    inputField.val(this.projectList[selectList.prop('selectedIndex')]);
                });
                content.append(selectList);
                content.append($('<br><br>'));
            }
            content.append('<p><b>Save as...</b></p>');
        }
        this.buttonFunction = () => {
            const val = inputField.prop('value');
            if (val != '') {
                if (InputDialog.type == 'saveProject') {
                    if (this.projectList.indexOf(val) == -1) {
                        this.callback(val);
                    }
                    else {
                        const warning = new WarningDialog(() => {
                            this.callback(val);
                        }, null, null, val);
                        warning.show();
                    }
                }
                else {
                    this.callback(val);
                }
                this.close();
            }
        };
        let buttonName;
        inputField.val(this.defaultText);
        inputField.prop('autofocus', 'true');
        inputField.on('input', () => {
            if (inputField.val().length == 0) {
                this.setButtonDisabled(buttonName, true);
            }
            else {
                this.setButtonDisabled(buttonName, false);
            }
        });
        inputField
            .attr('type', 'text');
        content.append(inputField);
        let icon;
        switch (InputDialog.type) {
            case 'saveProject':
                buttonName = 'Save';
                icon = 'glyphicon glyphicon-floppy-disk';
                break;
            case 'exportProject':
                buttonName = 'Export';
                icon = 'glyphicon glyphicon-export';
                break;
            case 'createLibrary':
                buttonName = 'Create';
                icon = 'glyphicon glyphicon-file';
                break;
            case 'createComponent':
                buttonName = 'Create';
                icon = 'glyphicon glyphicon-file';
                break;
        }
        this.addButton(buttonName, icon, this.buttonFunction);
        this.addButton('Cancel', 'glyphicon glyphicon-remove', () => {
            this.close();
        });
        this.registerKeyListener((key) => {
            if (key == 13) {
                this.buttonFunction();
            }
        });
        return content;
    }
}
class ListDialog extends Dialog {
    constructor(callBackFunction, list) {
        super();
        this.callback = callBackFunction;
        this.list = list;
        this.selectedItems = [];
    }
    getTitle() {
        let s;
        switch (ListDialog.type) {
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
    getContent() {
        const content = $('<form></form>');
        if (this.list.length == 0) {
            content.append(ListDialog.type == 'exportLibrary' ? '<p><br/><i>There are no libraries you can' +
                ' export.</i></p>' : '<p><br/><i>There are no saved' +
                ' projects.</i></p>');
        }
        else {
            const itemList = $('<fieldset></fieldset>');
            this.list.forEach((value) => {
                const val = ListDialog.type == 'exportLibrary' ? value.name : value;
                const input = $('<input>');
                input.prop('type', ListDialog.type == 'openProject' ? 'radio' : 'checkbox');
                input.prop('name', 'list');
                input.attr('id', val);
                const label = $('<label></label>');
                label.prop('innerText', val);
                label.attr('for', val);
                itemList.append(input);
                itemList.append(label);
                itemList.append('<br>');
            });
            itemList.find('input')[0].click();
            if (ListDialog.type == 'deleteProject') {
                itemList.on('click', () => {
                    let itemSelected = false;
                    itemList.children('input')
                        .each((index, value) => {
                        if (value.checked) {
                            itemSelected = true;
                        }
                    });
                    this.setButtonDisabled('Delete', !itemSelected);
                });
            }
            content.append(itemList);
            let buttonName;
            let icon;
            switch (ListDialog.type) {
                case 'openProject':
                    buttonName = 'Open';
                    icon = 'glyphicon glyphicon-folder-open';
                    break;
                case 'deleteProject':
                    buttonName = 'Delete';
                    icon = 'glyphicon glyphicon-trash';
                    break;
                case 'exportLibrary':
                    buttonName = 'Export';
                    icon = 'glyphicon glyphicon-export';
                    break;
            }
            this.buttonFunction = () => {
                let n = 0;
                this.list
                    .forEach((value, index) => {
                    if (itemList.find('input')[index - n].checked) {
                        this.selectedItems.push(value);
                        if (ListDialog.type == 'deleteProject') {
                            itemList.find('input')[index - n].remove();
                            itemList.find('label')[index - n].remove();
                            itemList.find('br')[index - n].remove();
                            n++;
                            if (itemList.find('input').length == 0) {
                                const p = $('<p><br/><i>There are no' +
                                    ' saved projects.</i></p>');
                                content.append(p);
                                this.setButtonDisabled(buttonName, true);
                            }
                        }
                    }
                });
                this.callback();
                if (ListDialog.type != 'deleteProject') {
                    this.close();
                }
            };
            this.addButton(buttonName, icon, this.buttonFunction);
            this.registerKeyListener((key) => {
                if (key == 13) {
                    this.buttonFunction();
                }
            });
        }
        this.addButton('Cancel', 'glyphicon glyphicon-remove', () => {
            this.close();
        });
        return content;
    }
}
//# sourceMappingURL=menubarController.js.map