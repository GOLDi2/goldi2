import { App } from './view/wide'
import { ICompilerRequest, Compiler } from './compiler'
import {IFileContent, IProject, supportedLanguages} from './model';
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';

import './css/app.scss'
import './view/wide'

import * as util from './os-files';
import { MDCDialog } from "@material/dialog/component";

let backend_uri='http://iut.goldi-labs.net:8081'

/**
 * Loads Projects from Local Storage, if there any exist
 * @param key
 */
function loadProjectsFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key)) as IProject[];
}

/**
 * Saves all Projects to the Local Storage
 * @param key
 * @param projects
 */
function saveProjectsToLocalStorage(key: string, projects: IProject[]) {
    localStorage.setItem(key, JSON.stringify(projects));
}

async function requestBoardOptions() {
    const response = await fetch(backend_uri+"/boards", {
        method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        redirect: 'follow',
            referrer: 'no-referrer',
            body: ""
    });
    return await response.json();
}

function isQuotaExceeded(projects) {
    let quotaExceeded = false;
    let wideprojects = JSON.stringify(projects);
    let length = wideprojects.length * 2;
    if ((length / (1024 * 1024)) > 2) {
        quotaExceeded = true;
    }
    return quotaExceeded;
}

function addMarkersToFiles(files: IFileContent[], markers: { [filename: string]: editor.IMarkerData[] }) {
    for (let file of files) {
        file.severity = 0;
        file.markers = [];
    }

    for (let markerFile in markers) {
        let file = files.find((file) => file.name == markerFile);
        if (file) {
            file.markers = markers[markerFile];
            file.severity = markers[markerFile].map((marker) => marker.severity).reduce((prev, current) => { return Math.max(prev, current) });
        } else {
            console.error('Cant set marker on file: ' + markerFile)
        }
    }
    return files;
}

function copy(src) {
    return JSON.parse(JSON.stringify(src)) as typeof src;
}

/**
 * Sets a cookie for user
 * @param cname
 * @param cvalue
 */
function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue;
}

/**
 * Reads cookie from user
 * @param cname
 */
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

declare var Settings: any;
document.addEventListener('wide-ready', (event: CustomEvent) => {
    let ExperimentID = '';
    let SessionID = '';
    let createdialog;       //the object used to tell the dialog when to update
    let lsWarningShown;     //indicates if the warning for the full Localstorage was already shown

    let wide = event.detail.wide as App;
    let compiler = new Compiler(backend_uri)
    //versuch die ID beim start von WIDE festzulegen
    fetch(backend_uri+"/getID", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        redirect: 'follow',
        referrer: 'no-referrer',
        body: JSON.stringify({ sessionId: getCookie("WIDE SessionID") }),
    }).then((response) => {
        (response.json()).then((response) => {
            setCookie("WIDE SessionID", response.sessionId);
        })
    });
    // setCookie("WIDE SessionID","");

    /**
     * Updates the current Project in the filetree
     */
    function updateCurrentProject() {
        let project = wide.model.projects.find((project) => project.name == wide.model.parentDirectory);
        if (wide.model.parentDirectory != '' && project != undefined) {
            wide.model.projects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files;
            wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files;
            wide.model.selectedproject = project;
            wide.model.selectedproject.files = wide.model.files;
        }
    }

    function getExamples() {
        let request;
        if (wide.standalone == true) {
            request = { PSPUType: "all" };
        } else {
            request = { PSPUType: wide.PSPUType, language: wide.language };
        }
        fetch(backend_uri+"/examples", {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(request),
        }).then((response) => {
            (response.json()).then((examples) => {
                examples.forEach((example) => {
                    util.unpack_example(example.name, example.PSPUType, supportedLanguages.find((language) => language.name == example.language), wide);
                })
            })
        });
    }

    /**
     * Saves all projects to localStorage
     */
    function saveProjects() {
        if (wide.model.parentDirectory != '') {
            if (isQuotaExceeded(wide.model.projects) == true) {
                // Storage full, maybe notify user or do some clean-up
                if (lsWarningShown == false) {
                    document.getElementById("button%localstorage") ? document.getElementById("button%localstorage").classList.add("overflow") : "";
                    wide.showMessage("LocalStorage is full");
                    lsWarningShown = true;
                }
            } else {
                document.getElementById("button%localstorage") ? document.getElementById("button%localstorage").classList.remove("overflow") : "";
                saveProjectsToLocalStorage("WIDE-local-projects", wide.model.projects);
                lsWarningShown = false;
            }
            if (wide.standalone == false) {
                wide.model.currentprojects = [];
                for (let i = 0; i < wide.model.projects.length; i++) {
                    if (wide.model.projects[i].PSPUType == wide.PSPUType && wide.model.projects[i].BPUType == wide.BPUType) {
                        wide.model.currentprojects = wide.model.currentprojects.concat(copy(wide.model.projects[i]));
                    }
                }
            }
        } else {
            if (isQuotaExceeded(wide.model.projects) == true) {
                // Storage full, maybe notify user or do some clean-up
                document.getElementById("button%localstorage") ? document.getElementById("button%localstorage").classList.add("overflow") : "";
                wide.showMessage("LocalStorage is full");
            } else {
                document.getElementById("button%localstorage") ? document.getElementById("button%localstorage").classList.remove("overflow") : "";
                saveProjectsToLocalStorage("WIDE-local-projects", wide.model.projects);
            }
        }
        wide.model = { ...wide.model };
    }

    function setDefaultGOLDiBoard() {
        if (wide.model.supportedBoards.length > 0 && !!wide.PSPUType) {
            let board = wide.model.supportedBoards.find((board) => board.name == "GOLDi Experiment");
            let configOption = board.config_options[0];
            let configOptionValue = configOption.values.find((value) => value.value == wide.PSPUType);
            wide.model = {
                ...wide.model,
                selected_board: {
                    name: board.name,
                    FQBN: board.FQBN,
                    options: [{
                        option: configOption.option,
                        option_label: configOption.option_label,
                        value: configOptionValue.value,
                        value_label: configOptionValue.value_label
                    }]
                }
            };
        }
    }

    /**
     * Searches for a project with the current parameters
     */
    function searchProject() {
        if (wide.standalone == false) {
            wide.model.currentprojects = [];
            for (let i = 0; i < wide.model.projects.length; i++) {
                if (wide.model.projects[i].PSPUType == wide.PSPUType && wide.model.projects[i].BPUType == wide.BPUType) {
                    wide.model.parentDirectory = wide.model.projects[i].name;
                    wide.model.currentprojects = copy(wide.model.projects.filter((project) => project.PSPUType == wide.PSPUType && project.BPUType == wide.BPUType));
                    wide.model.files = wide.model.projects[i].files;
                    wide.language = wide.model.projects[i].language;
                    wide.editor.language = wide.language;
                    wide.PSPUType = wide.model.projects[i].PSPUType;
                    i = wide.model.projects.length;
                    updateCurrentProject();
                    saveProjects();
                }
            }
        } else {
            if (wide.model.projects.length > 0) {
                wide.model.parentDirectory = wide.model.projects[0].name;
                wide.model.files = wide.model.projects[0].files;
                wide.language = wide.model.projects[0].language;
                wide.editor.language = wide.language;
                wide.PSPUType = wide.model.projects[0].PSPUType;
                setDefaultGOLDiBoard();
                updateCurrentProject();
                saveProjects();
            }
        }
    }

    // Initialize Model and load boards:
    wide.model = { consoleOutput: '', currentprojects: [], selectedproject: undefined, projects: [], examples: [], files: [], loadfiles: [], isCompiling: false, isConsoleVisible: false, isUploading: false, selectedFile: '', parentDirectory: '', selected_board: undefined, supportedBoards: [] };
    requestBoardOptions().then((res) => {
        wide.model.supportedBoards = res;
        setDefaultGOLDiBoard();
    });

    if (loadProjectsFromLocalStorage("WIDE-local-projects") != null) {
        wide.model.projects = loadProjectsFromLocalStorage("WIDE-local-projects");
        wide.model.projects.forEach((project) => {
            project.language = supportedLanguages.find((lang) => lang.name == project.language.name);
        });
        wide.model.currentprojects = copy(wide.model.projects);
        wide.model.currentprojects.forEach((project) => {
            project.language = supportedLanguages.find((lang) => lang.name == project.language.name);
        });
        searchProject();
    }

    if (wide.standalone == true) {
        getExamples();
    }

    util.init();

    wide.addEventListener('wide-file-selected', (event: CustomEvent) => {
        wide.model = { ...wide.model, selectedFile: event.detail.filename };
    });

    /**
     * Makes language specific alerts for file extensions
     */
    wide.addEventListener('wide-language-test', (event: CustomEvent) => {
        if (wide.language.NamesRegex.test(event.detail.name) == false) {
            wide.showMessage(wide.language.wrongNamesError);
        }
    });

    /**
     * Renames file if new filename doesn't exist already
     */
    wide.addEventListener('wide-file-renamed', (event: CustomEvent) => {
        if (wide.model.files.find((file) => file.name == event.detail.newname) != undefined) {
            wide.showMessage('File with the same name already exists!')
        } else {
            wide.model.files.find((file) => file.name == event.detail.filename).name = event.detail.newname;
            wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files;
            wide.model = { ...wide.model, selectedFile: event.detail.input };
        }
        updateCurrentProject();
        saveProjects;
    });

    /**
     * Renames directory if new directoryname doesn't exist already
     */
    wide.addEventListener('wide-directory-renamed', (event: CustomEvent) => {
        if (wide.model.files.find((file) => file.name.startsWith(event.detail.newpath)) && event.detail.oldname != event.detail.newname) {
            wide.showMessage('Directory with the same name already exists!')
        } else {
            wide.model.files.map((file) => {
                if (file.name.startsWith(event.detail.oldpath)) {
                    file.name = file.name.replace(event.detail.oldpath, event.detail.newpath);
                }
            });
            if (event.detail.oldpath == wide.model.parentDirectory + '/') {
                wide.model.projects.find((project) => project.name == wide.model.parentDirectory).name = event.detail.newname;
                wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).name = event.detail.newname;
                wide.model.parentDirectory = event.detail.newname;
            }
            wide.model = { ...wide.model, selectedFile: event.detail.input };
        }
        updateCurrentProject();
        saveProjects();
    });

    /**
     * Moves file into directory
     */
    wide.addEventListener('wide-file-dropped', (event: CustomEvent) => {
        if (wide.model.files.find((file) => file.name == event.detail.newname) != undefined) {
            if (event.detail.filename != event.detail.newname) {
                wide.showMessage('File with the same name already exists in path!');
            }
        } else {
            wide.model.files.find((file) => file.name == event.detail.filename).name = event.detail.newname;
            wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files;
            wide.model = { ...wide.model, selectedFile: event.detail.input };
        }
        updateCurrentProject();
        saveProjects();
    });

    /**
     * Moves directory into directory
     */
    wide.addEventListener('wide-directory-dropped', (event: CustomEvent) => {
        let oldNames = wide.model.files.filter((file) => {
            return file.name.startsWith(event.detail.path) == true;
        });
        let newNames = oldNames.map((file) => {
            let fileName = file.name;
            return { name: event.detail.dest + event.detail.name + '/' + fileName.substring(fileName.lastIndexOf(event.detail.path) + event.detail.path.length, fileName.length) };
        });
        for (let i = 0; i < oldNames.length; i++) {
            wide.model.files.find((file) => file.name == oldNames[i].name).name = newNames[i].name;
        }
        wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files;
        wide.model = { ...wide.model, selectedFile: event.detail.input };
        updateCurrentProject();
        saveProjects();
    });

    wide.addEventListener('wide-choose-board', (event: CustomEvent) => {
        if (event.detail.board != null) {
            wide.model = {...wide.model, selected_board: event.detail.board};
        } else {
            setDefaultGOLDiBoard();
        }
    });

    /**
     * Helpful Event for deleting a file
     */
    wide.addEventListener('wide-file-deleted-help', (event: CustomEvent) => {
        wide.deleteFile(event.detail.name);
    });

    wide.addEventListener('wide-file-deleted', (event: CustomEvent) => {
        wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files.filter((file) => file.name != event.detail.filename);
        wide.model = { ...wide.model, files: wide.model.files.filter((file) => file.name != event.detail.filename) };
        updateCurrentProject();
        saveProjects();
    });

    /**
     * Helpful Event for deleting a directory
     */
    wide.addEventListener('wide-directory-deleted-help', (event: CustomEvent) => {
        wide.deleteDirectory(event.detail.name);
    });

    /**
     * Deletes a directory and his files inside
     */
    wide.addEventListener('wide-directory-deleted', (event: CustomEvent) => {
        wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files.filter((file) => file.name.startsWith(event.detail.path) == false);
        wide.model = { ...wide.model, files: wide.model.files.filter((file) => file.name.startsWith(event.detail.path) == false) };
        updateCurrentProject();
        saveProjects();
    });

    wide.addEventListener('wide-file-added', (event: CustomEvent) => {
        wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files.concat({ name: wide.model.parentDirectory + '/' + event.detail.filename, content: '', reload: true, markers: [], severity: 0 });
        wide.model = { ...wide.model, files: wide.model.files.concat({ name: wide.model.parentDirectory + '/' + event.detail.filename, content: '', reload: true, markers: [], severity: 0 }) };
        updateCurrentProject();
        saveProjects();
    });

    /**
     * Creates a new directory
     */
    wide.addEventListener('wide-directory-added', (event: CustomEvent) => {
        wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files.concat({ name: wide.model.parentDirectory + '/' + event.detail.filename + '/.', content: '', reload: true, markers: [], severity: 0 });
        wide.model = { ...wide.model, files: wide.model.files.concat({ name: wide.model.parentDirectory + '/' + event.detail.filename + '/.', content: '', reload: true, markers: [], severity: 0 }) };
        updateCurrentProject();
        saveProjects();
    });

    /**
     * Creates a new project
     */
    wide.addEventListener('wide-project-added', (event: CustomEvent) => {
        if (createdialog.dialog != undefined && createdialog.dialog.isOpen) {
            createdialog.dialog.close();
        }
        updateCurrentProject();
        wide.language = event.detail.language;
        wide.editor.language = wide.language;
        wide.model.parentDirectory = event.detail.name;
        wide.PSPUType = event.detail.PSPUType;
        setDefaultGOLDiBoard();
        if (wide.model.loadfiles.length == 0) {
            wide.model.files = [{ name: event.detail.name + '/.', content: '', reload: true, markers: [], severity: 0 }];
            if (wide.language.name == 'LogIC') {
                wide.model.files = wide.model.files.concat({ name: event.detail.name + '/' + event.detail.name + '.logic', content: '', reload: true, markers: [], severity: 0 });
            }
            if (wide.language.name == 'VHDL') {
                wide.model.files = wide.model.files.concat({ name: event.detail.name + '/' + 'out.vhd', content: '', reload: true, markers: [], severity: 0 });
            }
            if (wide.language.name == 'Arduino') {
                wide.model.files = wide.model.files.concat({ name: event.detail.name + '/' + event.detail.name + ".ino", content: 'void setup()\n{\n\n}\n\nvoid loop()\n{\n\n}', reload: true, markers: [], severity: 0 });
            }
        } else {
            wide.model.files = wide.model.loadfiles;
            wide.model.files.forEach((file) => {
                file.reload = true;
                file.name = event.detail.name + file.name.substring(file.name.indexOf('/'), file.name.length);
            });
            if (wide.model.files.find((file) => file.name == wide.model.parentDirectory + '/.') == null) {
                wide.model.files = wide.model.files.concat({ name: wide.model.parentDirectory + '/.', content: '', reload: false, markers: [], severity: 0 });
            }
        }
        wide.model.projects = wide.model.projects.concat({ BPUType: event.detail.BPUType, PSPUType: event.detail.PSPUType, language: event.detail.language, name: event.detail.name, files: wide.model.files });
        wide.model.currentprojects = wide.model.currentprojects.concat({ BPUType: event.detail.BPUType, PSPUType: event.detail.PSPUType, language: event.detail.language, name: event.detail.name, files: wide.model.files });
        wide.model.loadfiles = [];
        wide.model.selectedproject = { BPUType: event.detail.BPUType, PSPUType: event.detail.PSPUType, language: event.detail.language, name: event.detail.name, files: wide.model.files };
        createdialog.oldLoadfileCount = 0;
        saveProjects();
    });

    wide.addEventListener('wide-example-selected', (event: CustomEvent) => {
        if (wide.model.projects.find((project) => project.name == event.detail.examplename) == null) {
            updateCurrentProject();
            let example = wide.model.examples.find((example) => example.name == event.detail.examplename) || wide.model.examples[0];
            // mark files for reload:
            example.files.forEach((file: any) => {
                file.reload = true
            });
            wide.model.parentDirectory = example.name;
            wide.language = example.language;
            wide.editor.language = wide.language;
            wide.PSPUType = example.PSPUType;
            wide.model.projects = wide.model.projects.concat(copy(example));
            wide.model.currentprojects = wide.model.currentprojects.concat(copy(example));
            wide.model = { ...wide.model, files: copy(example.files) };
            wide.model.selectedproject = copy(example);
            saveProjects();
        } else {
            wide.showMessage("Example already exists!");
        }
    });

    /**
     * Opens a selected project from local storage in the filetree
     */
    wide.addEventListener('wide-project-selected', (event: CustomEvent) => {
        updateCurrentProject();
        saveProjects();
        if (wide.model.currentprojects.length > 0) {
            let project = wide.model.currentprojects.find((project) => project.name == event.detail.projectname) || wide.model.currentprojects[0];
            wide.language = project.language;
            wide.editor.language = wide.language;
            wide.PSPUType = project.PSPUType;
            project.files.forEach((file: any) => {
                file.reload = true
            });
            wide.model = { ...wide.model,
                files: copy(project.files),
                parentDirectory: project.name,
                selectedproject: project
            };
            setDefaultGOLDiBoard();
            wide.render();
        }
    });

    /**
     * Helpful Event for deleting a directory
     */
    wide.addEventListener('wide-project-deleted-help', (event: CustomEvent) => {
        wide.deleteProject(event.detail.projectname);
    });

    /**
     * Deletes a project from local storage
     */
    wide.addEventListener('wide-project-deleted', (event: CustomEvent) => {
        if (wide.model.currentprojects.length > 1) {
            if (wide.model.parentDirectory == event.detail.projectname) {
                wide.model.projects = wide.model.projects.filter((project) => project.name != event.detail.projectname);
                wide.model.currentprojects = wide.model.currentprojects.filter((project) => project.name != event.detail.projectname);
                searchProject();
            } else {
                wide.model.projects = wide.model.projects.filter((project) => project.name != event.detail.projectname);
                wide.model.currentprojects = wide.model.currentprojects.filter((project) => project.name != event.detail.projectname);
                updateCurrentProject();
                saveProjects();
            }
        } else {
            wide.model.projects = wide.model.projects.filter((project) => project.name != event.detail.projectname);
            wide.model.currentprojects = wide.model.currentprojects.filter((project) => project.name != event.detail.projectname);
            wide.model.parentDirectory = '';
            wide.model.files = [];
            updateCurrentProject();
            saveProjects();
            createdialog.dialog.escapeKeyAction = '';
            createdialog.dialog.scrimClickAction = '';
            createdialog.presetValues();
            createdialog.open();
        }
        wide.requestUpdate();
    });

    wide.addEventListener('wide-save', () => {
        let blob = new Blob([JSON.stringify(wide.model.projects.find((project) => project.name == wide.model.parentDirectory))], { type: "data:attachment/application/json" });
        util.saveBlob(blob, wide.model.parentDirectory + ".wide");
    });

    /**
     * Helpful Event for saving a project as zip-file
     */
    wide.addEventListener('wide-save-zip-help', (event: CustomEvent) => {
        wide.saveZip(event.detail.projectname);
    });

    /**
     * Converts a project to zip-file and offers a download
     */
    wide.addEventListener('wide-save-zip', (event: CustomEvent) => {
        util.pack(wide.model.projects.find((project) => project.name == event.detail.projectname).files, event.detail.name);
    });

    /**
     * Loads a project from a zip-file into the filetree and local storage
     */
    wide.addEventListener('wide-load-zip', () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';

        input.onchange = e => {
            let file = input.files[0];
            util.unpack(file, wide, createdialog);
        };

        input.click();
    });

    /**
     * Opens the dialog-window if existing projects in local storage equals zero
     */
    wide.addEventListener('wide-open-create-menu', (event: CustomEvent) => {
        document.body.hidden = false;
        if (event.detail.first) {
            createdialog = document.querySelector("wide-create-menu");
            if (wide.model.currentprojects.length == 0) {
                createdialog.dialog.escapeKeyAction = '';
                createdialog.dialog.scrimClickAction = '';
                createdialog.open();
            }
        } else {
            createdialog.dialog.escapeKeyAction = 'no';
            createdialog.dialog.scrimClickAction = 'no';
            createdialog.open();
        }
    });

    /**
     * Gets parameters for dialog-window
     */
    wide.addEventListener('wide-create-menu-getparams', (event: CustomEvent) => {
        if (wide.standalone == true && event.detail.menu.selectedBPUType == undefined) {
            event.detail.menu.standalone = wide.standalone;
        } else if (wide.standalone == false) {
            event.detail.menu.selectedBPUType = wide.BPUType;
            event.detail.menu.standalone = wide.standalone;
            event.detail.menu.PSPUType = wide.PSPUType;
        }
    });

    wide.addEventListener('wide-show-message', (event: CustomEvent) => {
        wide.showMessage(event.detail.message);
    });

    wide.addEventListener('wide-open', () => {
        let filenames_allowed = true;
        util.loadFile().then((file) => {
            let loadedproject = JSON.parse(file);
            createdialog.dialog.escapeKeyAction = '';
            createdialog.dialog.scrimClickAction = '';
            if (loadedproject[0] == undefined) {                 // new .wide
                wide.model.loadfiles = loadedproject.files;
                wide.model.loadfiles.forEach((file) => {
                    if (/^(([a-zA-Z0-9]+([ |_|-]{1}[a-zA-Z0-9]+)*[/]{1})+([a-zA-Z0-9]+([_]{1}[a-zA-Z0-9]+)*[.]{1}[a-zA-Z0-9]+|[.])+)$/.test(file.name) == false) {
                        filenames_allowed = false;
                        //console.log(file.name);
                    }
                });
                if (wide.standalone == true && filenames_allowed == true) {
                    (document.getElementById("input%projectname") as HTMLInputElement).value = loadedproject.name;
                    createdialog.openNewWide = true;
                    createdialog.selectedBPUType = loadedproject.BPUType;
                    createdialog.selectedlanguage = loadedproject.language.name;
                    createdialog.selectedPSPUType = loadedproject.PSPUType;
                    createdialog.open();
                } else {
                    if (wide.PSPUType == loadedproject.PSPUType && wide.BPUType == loadedproject.BPUType && filenames_allowed == true) {
                        (document.getElementById("input%projectname") as HTMLInputElement).value = loadedproject.name;
                        createdialog.openNewWide = true;
                        createdialog.selectedBPUType = loadedproject.BPUType;
                        createdialog.selectedlanguage = loadedproject.language.name;
                        createdialog.selectedPSPUType = loadedproject.PSPUType;
                        createdialog.open();
                    } else {
                        wide.showMessage('The uploaded project has an incompatible configuration');
                    }
                }
            } else {                                            // old .wide
                let directories = [];
                loadedproject.forEach((file) => {
                    file.reload = true;
                    file.name = 'WIDE-Project/' + file.name;
                    while (file.name.indexOf("\\") != -1) {
                        file.name = file.name.substring(0, file.name.indexOf("\\")) + '/' + file.name.substring(file.name.indexOf("\\") + 1, file.name.length);
                    }
                    let dir = file.name.substring(0, file.name.lastIndexOf("/") + 1);
                    if (directories.find((directory) => directory == dir) == null) {
                        directories = directories.concat(dir);
                        loadedproject = loadedproject.concat({ name: dir + '.', content: '', reload: false, markers: [], severity: 0 });
                    }
                });
                wide.model = { ...wide.model, loadfiles: loadedproject };
                wide.model.loadfiles.forEach((file) => {
                    /*if (/^(([a-zA-Z0-9]+([ |_|-]{1}[a-zA-Z0-9]+)*[/]{1})+([a-zA-Z0-9]+([_]{1}[a-zA-Z0-9]+)*[.]{1}[a-zA-Z0-9]|[.])+)$/.test(file.name) == false) {
                        filenames_allowed = false;
                        console.log(file.name);
                    }*/
                });
                if (filenames_allowed == true) {
                    (document.getElementById("input%projectname") as HTMLInputElement).value = 'WIDE-Project';
                    createdialog.openOldWide = true;
                    createdialog.open();
                }
            }
            if (filenames_allowed == false) {
                wide.model.loadfiles = [];
                wide.showMessage("The uploaded project contains files with names that are not allowed!");
            }
        });
    });

    wide.addEventListener('wide-editor-add-minimize', (event: CustomEvent) => {
        event.detail.caller.minimizeAction = event.detail.standaloneEditor.addAction({
            // An unique identifier of the contributed action.
            id: 'minimize',

            // A label of the action that will be presented to the user.
            label: 'Minimize Expression',

            // An optional array of keybindings for the action.
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_M
            ],

            // A precondition for this action.
            precondition: null,

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: null,

            contextMenuGroupId: 'menu',

            // Method that will be executed when the action is triggered.
            // @param editor The editor instance is passed in as a convinience
            run: function (ed) {
                let request;
                request = { content: event.detail.standaloneEditor.getModel().getLineContent(event.detail.standaloneEditor.getPosition().lineNumber) };
                fetch(backend_uri+"/minimize", {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    redirect: 'follow',
                    referrer: 'no-referrer',
                    body: JSON.stringify(request),
                }).then((response) => {
                    (response.json()).then((res) => {
                        if(res.success == true) {
                            let lines = event.detail.standaloneEditor.getModel().getLinesContent();
                            lines[event.detail.standaloneEditor.getPosition().lineNumber - 1] = res.output;
                            let content = lines.join('\n');
                            wide.model.files = wide.model.files.map((file) => {
                                if (file.name == event.detail.path) {
                                    file.content = content;
                                    file.reload = true;
                                }
                                return file;
                            });
                            event.detail.caller.update_requested = true;
                        } else {
                            wide.showMessage('minimizing failed: see Console for details');
                            wide.model = { ...wide.model, isCompiling: false, consoleOutput: res.output, isConsoleVisible: true};
                        }
                    })
                });
                return null;
            }
        });
    });

    wide.addEventListener('wide-compile', () => {

        let compilefiles = copy(wide.model.files.filter((file) => {
            return !file.name.endsWith('.');
        }));

        //rename foldername to the name of one of the sketches for arduino compilation to work
        if (wide.language.name == "Arduino") {
            let mainSketchPath = compilefiles[0].name;
            let mainSketchName = mainSketchPath.slice(mainSketchPath.indexOf("/")+1, mainSketchPath.length-4);
            compilefiles = compilefiles.map((file) => {
                file.name = mainSketchName + "/" + file.name.slice(file.name.indexOf("/")+1, file.name.length);
                return file;
            });
            if (wide.model.selected_board.name == "GOLDi Experiment") {
                compilefiles[0].content = '#include "PhysicalSystems/' + wide.model.selected_board.options.find((option) => option.option == "pspu").value_label + '.h" + \n' + compilefiles[0].content;
            }
        }

        wide.model = { ...wide.model, isCompiling: true };
        let request: ICompilerRequest;
        request= {
            makefile: wide.language.makefile, sessionId: getCookie("WIDE SessionID"), files: compilefiles, pspu: "PSPU_" + wide.PSPUType, board: wide.model.selected_board
        };

        compiler.compile(request).then((response) => {
            if (response.success == undefined) {
                throw 'unknow error';
            } else {
                if (wide.language.name == "Arduino") {
                    let files = [];
                    for (let k in response.markers) files.push(k);
                    files.forEach((file, index) => {
                        if(!file.includes("avr\\libraries")) {
                            let oldfile = file;
                            file = file.replace(/\\/gi, "/");

                            while (file.indexOf("/") != -1) {
                                file = file.slice(file.indexOf("/") + 1, file.length);
                            }
                            response.markers[wide.model.parentDirectory + "/" + file] = response.markers[oldfile];
                            delete response.markers[oldfile];
                        }
                    });
                }
            }
            if (response.success) {
                setCookie("WIDE SessionID", response.sessionId);
                wide.showMessage('compilation succeeded');
                wide.model = { ...wide.model, isCompiling: false, consoleOutput: response.output, files: addMarkersToFiles(wide.model.files, response.markers) };
            } else {
                setCookie("WIDE SessionID", response.sessionId);
                wide.showMessage('compilation failed: see Console for details');
                wide.model = { ...wide.model, isCompiling: false, consoleOutput: response.output, isConsoleVisible: true, files: addMarkersToFiles(wide.model.files, response.markers) };
            }
        }).catch(err => {
            wide.showMessage('compilation error: ' + err);
            wide.model = { ...wide.model, isCompiling: false };
        });

    });

    wide.addEventListener('wide-upload', () => {
        wide.model = { ...wide.model, isUploading: true };

        let compilefiles = copy(wide.model.files.filter((file) => {
            return !file.name.endsWith('.');
        }));

        //rename foldername to the name of one of the sketches for arduino compilation to work
        if (wide.language.name == "Arduino") {
            let mainSketchPath = compilefiles[0].name;
            let mainSketchName = mainSketchPath.slice(mainSketchPath.indexOf("/")+1, mainSketchPath.length-4);
            compilefiles = compilefiles.map((file) => {
                file.name = mainSketchName + "/" + file.name.slice(file.name.indexOf("/")+1, file.name.length);
                return file;
            });
            if (wide.model.selected_board.name == "GOLDi Experiment") {
                compilefiles[0].content = '#include "PhysicalSystems/' + wide.model.selected_board.options.find((option) => option.option == "pspu").value_label + '.h" + \n' + compilefiles[0].content;
            }
        }

        let request: ICompilerRequest;
        request = {makefile: wide.language.makefile, files: compilefiles, experimentId: ExperimentID, sessionId: SessionID, uploadServer: document.URL.match(/(.*?\/\/.*?)\//)[1], pspu: "PSPU_" + wide.PSPUType, board: wide.model.selected_board};

        compiler.compile(request).then((response) => {
            let markers = undefined;
            if (response.success == undefined) {
                throw 'unknow error';
            } else {
                if (wide.language.name == "Arduino") {
                    let files = [];
                    for (let k in response.markers) files.push(k);
                    files.forEach((file, index) => {
                        if(!file.includes("avr\\libraries")) {
                            let oldfile = file;
                            file = file.replace(/\\/gi, "/");

                            while (file.indexOf("/") != -1) {
                                file = file.slice(file.indexOf("/") + 1, file.length);
                            }
                            response.markers[wide.model.parentDirectory + "/" + file] = response.markers[oldfile];
                            delete response.markers[oldfile];
                        }
                    });
                }
            }
            if (response.success) {
                window.parent.dispatchEvent(new CustomEvent('wide-upload'));
                wide.model = { ...wide.model, isUploading: false, consoleOutput: response.output, files: addMarkersToFiles(wide.model.files, response.markers) };
            } else {
                wide.showMessage('upload failed: see Console for details');
                wide.model = { ...wide.model, isUploading: false, consoleOutput: response.output, isConsoleVisible: true, files: addMarkersToFiles(wide.model.files, response.markers) };
            }
        }).catch(err => {
            wide.showMessage('uploading error: ' + err);
            wide.model = { ...wide.model, isUploading: false };
        });
    });

    wide.addEventListener('wide-console', () => {
        wide.model = { ...wide.model, isConsoleVisible: !wide.model.isConsoleVisible };
    });

    wide.addEventListener('wide-close', () => {
        window.parent.dispatchEvent(new CustomEvent('wide-close'));
    });

    wide.addEventListener('wide-file-content-changed', () => {
        wide.model.currentprojects.find((project) => project.name == wide.model.parentDirectory).files = wide.model.files;
        updateCurrentProject();
        saveProjects();
    });

    window.addEventListener('beforeunload', () => {
        updateCurrentProject();
        saveProjects();
    });

    window.addEventListener('wide-set-pspu', (event: CustomEvent) => {
        wide.PSPUType = event.detail.PSPUType;
        //console.log(wide.PSPUType);
        getExamples();
    });

    window.addEventListener('wide-set-user-data', (event: CustomEvent) => {
        SessionID = event.detail.SessionID;
        ExperimentID = event.detail.ExperimentID;
        //console.log(SessionID);
        //console.log(ExperimentID);
    });

    /**
     * Sets the variable for standalone-version
     */
    window.addEventListener('wide-set-standalone', (event: CustomEvent) => {
        wide.standalone = event.detail.standalone;
    });

    /**
     * Opens the Project-Creation-Dialog for the experiment-bound variant of WIDE
     */
    window.addEventListener('wide-open-frame', (event: CustomEvent) => {
        document.body.hidden = false;
        createdialog = document.querySelector("wide-create-menu");
        if (wide.model.currentprojects.length == 0) {
            createdialog.dialog.escapeKeyAction = '';
            createdialog.dialog.scrimClickAction = '';
            createdialog.open();
        }
    });

    window.parent.dispatchEvent(new CustomEvent('wide-ready'));
});