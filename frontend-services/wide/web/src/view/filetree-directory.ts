import { html, LitElement, property } from '@polymer/lit-element';
import { MarkerSeverity } from 'monaco-editor';
import {ILanguage, IModel} from "../model";

interface IFileOrDirectory {
    isDirectory: boolean;
    name: string;
    trueName: string;
    severity: MarkerSeverity;
    children: Array<{path: String, severity: MarkerSeverity, trueName: string}>;
}

/**
 * class for struktur in filetree
 */
class FileTreeDirectory extends LitElement {

    @property()
    files: Array<{path: string, severity: MarkerSeverity, trueName: string}> = [];

    @property()
    selectedFile: string;

    @property()
    oldSelectedFile: string;

    @property()
    currentDirectory: string;

    @property()
    selectedinput: HTMLInputElement;

    @property()
    model: IModel;

    @property()
    globalParentDirectory: string;

    @property()
    language: ILanguage;

    path: string;

    private inputs: Array<HTMLInputElement>;
    private subtree: Array<IFileOrDirectory>;
    private directories: Array<string>;
    private update_requested: boolean;
    private time = [0,0];

    uniqBy(a, key) {
        let seen = {};
        return a.filter(function(item) {
            let k = key(item);
            return seen.hasOwnProperty(k) ? false : (seen[k] = true);
        })
    }

    constructor() {
        super();
    }


    createRenderRoot() {
        return this;
    }

    generateSubtree() {
        this.directories = [];
        this.subtree = [];

        if (!this.files) return;

        let singleFiles = this.files.sort((filea, fileb)=>{
            // sort Directorys to top
            let isADir =filea.path.search(/\/|\\/g)>-1?true:false;
            let isBDir =fileb.path.search(/\/|\\/g)>-1?true:false;
            // else sort alphabetic
            return (isADir&&!isBDir)?-1:(!isADir&&isBDir)?1:filea.path.localeCompare(fileb.path)
        }).map((file) => {
            let splitted = file.path.split(/\/|\\/g);
            return { path: file.path, severity:file.severity, leftside: splitted.shift(), rightside: splitted.length > 0 ? splitted.join('/') : undefined, trueName: file.trueName };
        });

        let i = -1;
        for (let file of singleFiles) {
            if (!(this.subtree[i] && this.subtree[i].name == file.leftside)) {
                this.subtree[++i] = { name: file.leftside, isDirectory: false, children: [], trueName: file.trueName, severity: file.severity }
            }
            if (file.rightside) {
                this.subtree[i].isDirectory = true;
                this.subtree[i].children.push({path:file.rightside, severity: file.severity, trueName: file.trueName});
                this.directories = this.directories.concat(this.subtree[i].trueName);
            }
        }
        this.directories = this.uniqBy(this.directories,JSON.stringify);
    }

    update(changedProperties) {
        if (this.selectedFile != this.oldSelectedFile){
            if (document.getElementById(this.oldSelectedFile) != null) {
                document.getElementById(this.oldSelectedFile).classList.remove('mdc-list-item--selected');
            }
            this.oldSelectedFile = this.selectedFile;
        }
        this.generateSubtree();
        this.update_requested = true;
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if(this.update_requested) {
            this.updateInputFields();
            this.update_requested = false;
        }
    }

    render() {
        let list = this.subtree.map((fileOrDirectory) => {
            if (fileOrDirectory.isDirectory) {
                let name = fileOrDirectory.name;
                let trueName = fileOrDirectory.trueName;
                this.path = trueName.substring(0,trueName.lastIndexOf(name) + name.length);
                if (this.path != this.globalParentDirectory) {
                    return html`
                    <li class="mdc-list-static-item mdc-list-item" id=${this.path + '/'} draggable="true" @click="${this.clicked}" @dragstart="${this.drag}" @dragenter="${this.enterDropzone}" @drop="${this.drop}" @dragover="${this.allowDrop}" @dragleave="${this.leaveDropzone}" @focusout="${this.focusout}">
                        <span class="mdc-list-item__graphic" id=${this.path + '*'}>
                            <i class="material-icons" id=${this.path + '*'} @dragenter="${this.enterDropzone}" @dragover="${this.allowDrop}" @dragleave="${this.leaveDropzone}" @dragexit="${this.leaveDropzone}">folder</i>
                        </span>
                        <span class="mdc-list-item__text" id=${this.path + '*'} @keyup="${this.keyup}">
                            <div class="mdc-text-field" id=${this.path + '*'}>
                                <input pattern="^[a-zA-Z0-9]{1,}([ |_|-]{1}[a-zA-Z0-9]{1,}){0,}$" type="text" id=${this.path + '%'} class="mdc-text-field__input_name" value="${name}" readOnly="true" @dragenter="${this.enterDropzone}" @dragover="${this.allowDrop}" @dragleave="${this.leaveDropzone}">
                            </div>
                        </span>
                        <div class="mdc-list-item__meta" id=${this.path + '#'}>
                        <button class="mdc-icon-button" id=${this.path + '*'} @click="${this.delete}">
                            <i class="material-icons" id=${this.path + '*'}>delete</i>
                        </button>
                        </div>
                    </li>
                    <wide-filetree-directory .language="${this.language}" .globalParentDirectory="${this.globalParentDirectory}" .files="${fileOrDirectory.children}" .selectedFile="${this.selectedFile}"></wide-filetree-directory>
                    `
                } else {
                    return html`
                    <li class="mdc-list-static-item mdc-list-item" id=${this.path + '/'} @click="${this.clicked}" @dragstart="${this.drag}" @dragenter="${this.enterDropzone}" @drop="${this.drop}" @dragover="${this.allowDrop}" @dragleave="${this.leaveDropzone}" @focusout="${this.focusout}">
                        <span class="mdc-list-item__graphic" id=${this.path + '*'}>
                            <i class="material-icons" id=${this.path + '*'} @dragenter="${this.enterDropzone}" @dragover="${this.allowDrop}" @dragleave="${this.leaveDropzone}" @dragexit="${this.leaveDropzone}">folder</i>
                        </span>
                        <span class="mdc-list-item__text" id=${this.path + '*'} @keyup="${this.keyup}">
                            <div class="mdc-text-field" id=${this.path + '*'}>
                                <input pattern="^[a-zA-Z0-9]{1,}([ |_|-]{1}[a-zA-Z0-9]{1,}){0,}$" type="text" id=${this.path + '%'} class="mdc-text-field__input_name" value="${name}" readOnly="true" @dragenter="${this.enterDropzone}" @dragover="${this.allowDrop}" @dragleave="${this.leaveDropzone}">
                            </div>
                        </span>
                    </li>
                    <wide-filetree-directory .globalParentDirectory="${this.globalParentDirectory}" .files="${fileOrDirectory.children}" .selectedFile="${this.selectedFile}" .language="${this.language}"> </wide-filetree-directory>
                    `
                }
            } else if (fileOrDirectory.name.indexOf('.') != 0) {
                return html`<wide-filetree-file .fileName="${fileOrDirectory.name}" .severity="${fileOrDirectory.severity}" .path="${fileOrDirectory.trueName}" .selectedFile="${this.selectedFile}" .language="${this.language}"></wide-filetree-file>`
            }
        });
        return html`
        ${list} 
        `;
    }

    /**
     * Checks if enter-button is pressed if so triggers rename()-function
     * @param e
     */
    keyup(e) {
        if (e.keyCode == 13 && this.selectedinput.readOnly == false) {
            this.rename(e);
        }
    }

    clicked(e) {
        let dirname = e.target.id.substring(0,e.target.id.length-1) + '/';
        let inputname = e.target.id.substring(0,e.target.id.length-1) + '%';
        let clickedinput = document.getElementById(inputname) as (HTMLInputElement)
        document.getElementById(dirname).classList.add('mdc-list-item--selected');
        let event = new CustomEvent('wide-file-selected', {detail: {filename: dirname}, bubbles: true});
        this.dispatchEvent(event);
        if (this.selectedinput != clickedinput) {
            this.selectedinput = clickedinput;
            this.selectedinput.readOnly = true;
        } else if (this.selectedFile == dirname) {
            this.selectedinput.readOnly=false;
            this.selectedinput.style.cursor = 'text';
        }
    }

    /**
     * Cancels data transfer
     * @param e
     */
    focusout(e){
        let shortdirname;
        let truedirname;
        if(e.target != undefined) {
            truedirname = e.target.id.substring(0, e.target.id.length - 1);
            shortdirname = truedirname.substring(truedirname.lastIndexOf('/') + 1, truedirname.length);
            this.selectedinput = document.getElementById(truedirname + '%') as (HTMLInputElement);
        } else {
            truedirname = e.substring(0, e.length - 1);
            shortdirname = truedirname.substring(truedirname.lastIndexOf('/') + 1, truedirname.length);
            this.selectedinput = document.getElementById(truedirname + '%') as (HTMLInputElement);
        }
        if (this.selectedinput != undefined) {
            this.selectedinput.readOnly = true;
            this.selectedinput.style.cursor = 'default';
            this.selectedinput.value = shortdirname;
        }
    }

    /**
     * Checks if input is correct and renames directory
     * @param e
     */
    rename(e){
        e.stopPropagation();
        let truedirname = e.target.id.substring(0, e.target.id.length-1);
        let shortdirname = truedirname.substring(truedirname.lastIndexOf('/')+1, truedirname.length);
        this.selectedinput.checkValidity();
        if ((this.path == this.globalParentDirectory) && this.model.projects.find((project) => project.name == this.selectedinput.value) != null ){
            this.showMessage('Project name is aleady used!');
        } else {
            if (this.selectedinput.value.length > 0 && this.selectedinput.validity.patternMismatch == false) {
                let newpath = truedirname.substring(0, truedirname.lastIndexOf('/') + 1) + this.selectedinput.value;
                this.selectedinput.readOnly = true;
                let event = new CustomEvent('wide-directory-renamed', {
                    detail: {
                        oldname: shortdirname,
                        newname: this.selectedinput.value,
                        oldpath: truedirname + '/',
                        newpath: newpath + '/'
                    }, bubbles: true
                });
                this.dispatchEvent(event);
            } else {
                this.selectedinput.value = shortdirname;
                if(this.path == this.globalParentDirectory){
                    this.showMessage('Project name is not allowed!');
                }else{
                    this.showMessage('Directory name is not allowed!');
                }
            }
        }
    }

    /**
     * Deletes directory with files after confirmation by user
     * @param e
     */
    delete(e) {
        e.stopPropagation();
        let path = e.target.id.substring(0, e.target.id.length - 1) + '/';
        let event = new CustomEvent('wide-directory-deleted-help', {detail: {name: path, dir: this}, bubbles: true});
        this.dispatchEvent(event);
    }

    /**
     * Gives file ID to dataTransfer for further processing
     * @param e
     */
    drag(e) {
        let id = e.target.id;
        let inputid = id.substring(0, id.length-1) + '%';
        this.clicked(e);
        if (this.selectedinput != document.getElementById(inputid) as (HTMLInputElement)) {
            this.selectedinput = document.getElementById(inputid) as (HTMLInputElement);
            this.selectedinput.readOnly = true;
        } else {
            this.focusout(e);
        }
        e.dataTransfer.setData("text", id);
    }

    /**
     * Demarked dropzone if cursor leaves one
     * @param e
     */
    leaveDropzone(e) {
        let doc = document;
        let id = e.target.id;
        if(id.indexOf('*') != -1 || id.indexOf('%') != -1 || id.indexOf('#') != -1) {
            let newid = id.substring(0,id.length-1) + '/';
            doc.getElementById(newid).style.backgroundColor = '';
        } else {
            e.target.style.backgroundColor = '';
        }
    }

    /**
     * Marked dropzone if cursor enters one
     * @param e
     */
    enterDropzone(e) {
        let doc = document;
        let id = e.target.id.toString();
        if (id != '') {
            this.currentDirectory = id;
            e.target.style.backgroundcolor = 'orange';
        }
        if(id.indexOf('*') != -1 || id.indexOf('%') != -1 || id.indexOf('#') != -1) {
            let newid = id.substring(0,id.length-1) + '/';
            this.currentDirectory = newid;
            doc.getElementById(newid).style.backgroundColor = 'orange';
        } else {
            this.currentDirectory = id;
            e.target.style.backgroundColor = 'orange';
        }
    }

    /**
     * Allows dropping files/directories here
     * @param e
     */
    allowDrop(e) {
        !this.time[0]?this.time[0] = performance.now():"";

        e.preventDefault();
        if((this.time[1]-this.time[0] > 20)) {
            this.time = [0,0];
            this.enterDropzone(e);
        }

        this.time[1] = performance.now();
    }

    /**
     * Transferes data to target
     * @param e
     */
    drop(e) {
        e.preventDefault();
        let id = e.target.id;
        if(id.indexOf('*') != -1 || id.indexOf('%') != -1 || id.indexOf('#') != -1) {
            id = id.substring(0,id.length-1) + '/';
            document.getElementById(id).style.backgroundColor = '';
        } else {
            e.target.style.backgroundColor = '';
        }
        let dragObjPath = e.dataTransfer.getData("text");
        let dragObjName = dragObjPath;
        // Datei wird in Ordner gezogen
        if (dragObjPath.lastIndexOf('/') != dragObjPath.length - 1 && dragObjPath.length > 0) { // Datei wird in Ordner gezogen
            this.dropFile(dragObjPath,dragObjName);
        } else if (dragObjPath.lastIndexOf('/') == dragObjPath.length - 1 && dragObjPath.length > 0 && id.startsWith(dragObjPath) == false){ // Ordner wird in Ordner gezogen
            this.dropDirectory(dragObjPath,id);
        }
    }

    /**
     * Drops file in path
     * @param path
     * @param name
     */
    dropFile(path,name){
        name = path.substring(path.lastIndexOf('/') + 1, path.length);  // Dateinamen aus Pfad erhalten
        let newname = this.currentDirectory + name;
        let event = new CustomEvent('wide-file-dropped', {detail: {filename: path, newname: newname}, bubbles: true});
        this.dispatchEvent(event);
    }

    /**
     * Drops directory in path
     * @param path
     * @param dest
     */
    dropDirectory(path, dest){
        let name = path.substring(0, path.length-1);                    // lösche letztes '/'
        name = name.substring(name.lastIndexOf('/') + 1, name.length)   // lösche alles vor Ordnernamen
        let event = new CustomEvent('wide-directory-dropped', {detail: {path: path, name: name, dest: dest}, bubbles: true});
        this.dispatchEvent(event);
        this.updateInputFields();
    }

    /**
     * Shows message in snackbar
     * @param message
     */
    showMessage(message){
        let event = new CustomEvent('wide-show-message', {detail: {message: message}, bubbles: true});
        this.dispatchEvent(event);
    }

    updateInputFields(){
        this.inputs = [];
        for(let i = 0; i < this.directories.length; i++) {
            let dir = this.directories[i].substring(0, this.directories[i].length - 2);
            this.inputs[i] = document.getElementById(dir + '%') as (HTMLInputElement);
            if(this.inputs[i] != null) {
                this.inputs[i].value = dir.substring(dir.lastIndexOf('/') + 1, dir.length);
            }
        }
        this.update_requested = true;
    }

}
customElements.define('wide-filetree-directory', FileTreeDirectory);