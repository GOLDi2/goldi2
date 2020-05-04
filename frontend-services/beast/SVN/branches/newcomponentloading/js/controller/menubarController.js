/**
 * Created by Paul on 22.05.2017.
 */
///<reference path="../d_ts/jquery.d.ts" />
///<reference path="../model/model.ts" />
class menubarController {
    /**
     * creates new BeastController and PersistenceController
     * defines onclick-methods of Menubar-Buttons
     * @param BeastController - corresponding BeastController instance
     */
    constructor(BeastController) {
        this.BeastController = BeastController;
        this.PersistenceController = this.BeastController.getPersistenceController();
        $('#createProject')
            .on('click', { persist: this.PersistenceController }, this.createProject);
        $('#openProject')
            .on('click', { persist: this.PersistenceController }, this.openProject);
        $('#exportProject')
            .on('click', { persist: this.PersistenceController }, this.exportProject);
        $('#importProject')
            .on('click', { persist: this.PersistenceController }, this.importProject);
        $('#saveProject')
            .on('click', { persist: this.PersistenceController }, this.saveProject);
        $('#deleteProject')
            .on('click', { persist: this.PersistenceController }, this.deleteProject);
        $('#createLibrary')
            .on('click', { persist: this.PersistenceController, tree: this.BeastController.treeController }, this.createLibrary);
        $('#importLibrary')
            .on('click', { persist: this.PersistenceController }, this.importLibrary);
        $('#exportLibrary')
            .on('click', { persist: this.PersistenceController }, this.exportLibrary);
    }
    /**
     * opens a warning dialog, when the the current project in the session storage is not saved
     * calls "saveProject"-method or creates new project by use of PersistenceController accordingly to user's input
     * @param event - event parameter
     */
    createProject(event) {
        const persist = event.data.persist;
        const warning = new WarningDialog(() => {
            persist.createNewProject();
        }, () => {
            $('#saveProject')
                .click();
        });
        if (persist.isDirty()) {
            warning.show();
        }
        else {
            warning.callbackContinue();
        }
    }
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    importProject(event) {
        const persist = event.data.persist;
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
                    persist.loadProjectFromFile(file, (project) => {
                        if (project == null) {
                            alert('This file is not valid!');
                        }
                        else {
                            persist.setCurrentProject(project);
                            $(fileInput)
                                .remove();
                        }
                    });
                }
                else {
                    alert('Choose a ".beast"-file!');
                }
            });
            fileInput.click();
        }, () => {
            $('#saveProject')
                .click();
        });
        if (persist.isDirty()) {
            warning.show();
        }
        else {
            warning.callbackContinue();
        }
    }
    ;
    /**
     * opens dialog with a list of all projects in the local storage
     * after selection and confirmation by the user the project is load by use of the PersistenceController
     * @param event - event parameter
     */
    openProject(event) {
        const persist = event.data.persist;
        const warning = new WarningDialog(() => {
            const selectList = document.createElement('select');
            selectList.id = 'selectProjectList';
            selectList.size = persist.getProjects().length;
            persist.getProjects()
                .forEach((value) => {
                const option = document.createElement('option');
                option.value = value;
                option.innerText = value;
                selectList.appendChild(option);
            });
            $(selectList)
                .dialog({
                title: 'Choose a project:',
                modal: true,
                width: 400,
                resizable: false,
                buttons: [
                    {
                        text: 'Load', click: function () {
                            let noSelection = true;
                            persist.getProjects()
                                .forEach((value, index) => {
                                if ((selectList.children[index]).selected) {
                                    persist.loadProject(value);
                                    noSelection = false;
                                }
                            });
                            if (!noSelection) {
                                $(selectList)
                                    .remove();
                            }
                        }
                    }, {
                        text: 'Cancel', click: function () {
                            $(selectList)
                                .remove();
                        }
                    }
                ]
            });
        }, () => {
            $('#saveProject')
                .click();
        });
        if (persist.isDirty()) {
            warning.show();
        }
        else {
            warning.callbackContinue();
        }
    }
    /**
     * opens dialog for name input and saves project in browser's local storage by use of the PersistenceController
     * @param event - event parameter
     */
    saveProject(event) {
        const persist = event.data.persist;
        const content = document.createElement('div');
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'input';
        inputField.value = persist.getCurrentProject().getName();
        content.appendChild(inputField);
        $(content)
            .dialog({
            title: 'Save as...',
            modal: true,
            width: 400,
            resizable: false,
            buttons: [
                {
                    text: 'Save', click: function () {
                        const name = document.getElementById('input').value;
                        if (name === '') {
                            alert('Input any name!');
                        }
                        else {
                            if (persist.getProjects()
                                .indexOf(name) == -1) {
                                persist.getCurrentProject()
                                    .setName(name);
                                persist.saveCurrentProjectLocaly();
                                $(content)
                                    .remove();
                            }
                            else {
                                alert('A project with this name already exists!');
                            }
                        }
                    }
                },
                {
                    text: 'Cancel', click: function () {
                        $(content)
                            .remove();
                    }
                }
            ]
        });
    }
    /**
     * opens dialog with a list of all projects in the local storage
     * after selection and confirmation by the user the selected projects are deleted from the local storage by use
     * of the PersistenceController
     * @param event - event parameter
     */
    deleteProject(event) {
        const persist = event.data.persist;
        const selectList = document.createElement('select');
        selectList.id = 'selectProjectList';
        selectList.size = persist.getProjects().length;
        selectList.multiple = true;
        persist.getProjects()
            .forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.innerText = value;
            selectList.appendChild(option);
        });
        $(selectList)
            .dialog({
            title: 'Choose the projects' +
                ' you want to delete:',
            modal: true,
            width: 400,
            resizable: false,
            buttons: [
                {
                    text: 'Delete', click: function () {
                        let noSelection = true;
                        persist.getProjects()
                            .forEach((value, index) => {
                            if ((selectList.children[index]).selected) {
                                persist.deleteLocalProject(value);
                                noSelection = false;
                            }
                        });
                        if (!noSelection) {
                            $(selectList)
                                .remove();
                        }
                    }
                }, {
                    text: 'Cancel', click: function () {
                        $(selectList)
                            .remove();
                    }
                }
            ]
        });
    }
    /**
     * opens dialog for name input and downloads project by use of the PersistenceController
     * @param event - event param
     */
    exportProject(event) {
        const persist = event.data.persist;
        const content = document.createElement('div');
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'input';
        inputField.value = persist.getCurrentProject().getName();
        content.appendChild(inputField);
        $(content)
            .dialog({
            title: 'Export as...',
            modal: true,
            width: 400,
            resizable: false,
            buttons: [
                {
                    text: 'Export', click: function () {
                        const name = document.getElementById('input').value;
                        if (name == '') {
                            alert('Input any name!');
                        }
                        else {
                            persist.getCurrentProject()
                                .setName(name);
                            persist.downloadCurrentProject();
                            $(content)
                                .remove();
                        }
                    }
                },
                {
                    text: 'Cancel', click: function () {
                        $(content)
                            .remove();
                    }
                }
            ]
        });
    }
    /**
     * opens name input dialog, creates new Library-object and adds it to the current project
     * @param event - event parameter
     */
    createLibrary(event) {
        const persist = event.data.persist;
        const tree = event.data.tree;
        const content = document.createElement('div');
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = 'input';
        inputField.value = 'New Library';
        content.appendChild(inputField);
        $(content)
            .dialog({
            title: 'Input the name of the new library:',
            modal: true,
            width: 400,
            resizable: false,
            buttons: [
                {
                    text: 'Ok', click: function () {
                        const name = document.getElementById('input').value;
                        if (name == '') {
                            alert('Input any name!');
                        }
                        else {
                            //TODO: check if library with this name already exists
                            if (persist.getCurrentProject()
                                .libraries
                                .indexOf(name) == -1) {
                                //FIXME for now, we use teh new name as ID but this has to change
                                //TODO move resposibility of creating libs to the BeastController
                                let newLibrary = new Library(name, name);
                                let p = persist.getCurrentProject();
                                p.libraries.push(newLibrary);
                                persist.markDirty(DataType.Libraries);
                                persist.saveProjectSession();
                                tree.addLibrary(newLibrary);
                                $(content)
                                    .remove();
                            }
                            else {
                                alert('A library with this name already exists!');
                            }
                        }
                    }
                },
                {
                    text: 'Cancel', click: function () {
                        $(content)
                            .remove();
                    }
                }
            ]
        });
    }
    /**
     * opens file-open-dialog
     * checks if filetype is correct and starts upload by use of PersistenceController
     * @param event - event parameter
     */
    importLibrary(event) {
        //TODO: check if library with this name already exists
        const persist = event.data.persist;
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'files';
        fileInput.multiple = true;
        fileInput.accept = '.bdcl,' +
            ' application/json';
        $(fileInput)
            .change(function () {
            const files = fileInput.files;
            for (let i = 0; i < files.length; i++) {
                if (files[i].name.endsWith('.bdcl')) {
                    persist.loadLibraryFromFile(files[i], function (lib) {
                        if (lib != null) {
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
    exportLibrary(event) {
        const persist = event.data.persist;
        const content = document.createElement('table');
        persist.getCurrentProject()
            .libraries
            .forEach((value) => {
            let c = document.createElement('input');
            c.type = 'checkbox';
            c.name = 'exportLibrariesList';
            c.value = value.name;
            let label = document.createElement('label');
            label.innerText = value.name;
            let li = document.createElement('tr');
            li.appendChild(c);
            li.appendChild(label);
            content.appendChild(li);
        });
        $(content)
            .dialog({
            title: 'Choose the libraries you want to export:',
            modal: true,
            width: 400,
            resizable: false,
            buttons: [
                {
                    text: 'Ok', click: function () {
                        persist.getCurrentProject()
                            .libraries
                            .forEach((value, index) => {
                            if (content.children[index].children[0].checked) {
                                persist.saveAsFile(value.name + '.bdcl', value);
                            }
                        });
                        $(content)
                            .remove();
                    }
                },
                {
                    text: 'Cancel', click: function () {
                        $(content)
                            .remove();
                    }
                }
            ]
        });
    }
}
class WarningDialog {
    constructor(callbackFunctionContinue, callbackFunctionSave) {
        this.callbackContinue = callbackFunctionContinue;
        this.callbackSave = callbackFunctionSave;
    }
    show() {
        const continueFunc = this.callbackContinue;
        const saveFunc = this.callbackSave;
        const content = document.createElement('div');
        const p = document.createElement('p');
        p.innerText = 'The open project is not saved!';
        content.appendChild(p);
        $(content)
            .dialog({
            title: 'Warning',
            modal: true,
            width: 400,
            resizable: false,
            buttons: [
                {
                    text: 'Continue',
                    click: function () {
                        continueFunc();
                        $(content)
                            .remove();
                    }
                },
                {
                    text: 'Save',
                    click: function () {
                        saveFunc();
                        $(content)
                            .remove();
                    }
                }
            ]
        });
    }
}
//# sourceMappingURL=menubarController.js.map