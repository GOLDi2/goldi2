import * as JSZip from "jszip";
import * as FileSaver from "file-saver";
import * as JSZipUtils from "jszip-utils";
import {IFileContent} from "./model";

let a: HTMLAnchorElement;
let input: HTMLInputElement;
function init(){
    a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    input = document.createElement('input');
    input.type='file';
    input.style.display = 'hidden';
    input.accept = '.wide';
}

/**
 * Saves a file
 * @param blob
 * @param fileName
 */
function saveBlob(blob: Blob, fileName: string) {
    if (navigator.msSaveBlob)
		return navigator.msSaveBlob(blob, fileName);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Loads a .wide File into the filetree
 */
function loadFile(){
    let promise = new Promise((resolve, reject)=> {
        input.addEventListener('change', resolve);
    }).then((event: Event)=>{
        let file:File=(<any>event.target).files[0];
        let reader = new FileReader();
        let readPromise=new Promise((resolve, reject)=>{
            reader.onload=resolve;
        });
        reader.readAsText(file);
        return readPromise;
    }).then((event: any)=>{
        return event.target.result;
    });
    input.click();
    return promise;
}

/**
 * Creates a zip-file with JSZip and offers it for download
 * @param m
 */
function pack(f, pd){
    let zip = new JSZip();
    let folder = '';
    let name = '';
    let content = '';
    let zipname = '';
    f.forEach(function(element){
        name = element.name;
        content = element.content;
        if(name.indexOf('/') == -1 && name.endsWith('.') == false) {
            zip.file(name, content)
        } else {
            let parentfolder = name.substring(0,name.indexOf('/'));
            folder = parentfolder.substring(0,parentfolder.indexOf('/'));
            if (name.endsWith('.') == false) {
                zip.folder(folder).file(name.substring(name.indexOf('/') + 1, name.length), content);
            } else {
                zip.folder(folder).file(name.substring(name.indexOf('/') + 1, name.length - 1), content);
            }
        }
    });
    zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
                    FileSaver.saveAs(content, pd + ".zip");
        });
}

/**
 * Function to upload a file via JSZip
 * @param zipfile
 * @param wide
 */
function unpack(zipfile,wide,createdialog) {
    let filecount = 0;
    let filenames = [];
    let filecontents = [];
    wide.model.loadfiles = [];
    let filenames_allowed = true;
    let pdirname = zipfile.name.substring(0, zipfile.name.length - 4);
    wide.model = {
        ...wide.model, loadfiles: wide.model.loadfiles.concat({
            name: pdirname + '/.',
            content: '',
            reload: true,
            markers: [],
            severity: 0
        })
    };
    /*JSZipUtils.getBinaryContent('examples/3AxisPortal/C/3AxisPortal_Mealy.zip', function(err, data) {
        if (err) {
            throw err; // or handle err
        }*/


        JSZip.loadAsync(zipfile)                                   // 1) read the Blob
            .then(function (zip) {
                zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
                    if (zipEntry.name.indexOf('__MACOSX') == -1 && zipEntry.name.indexOf(".DS_Store") == -1) {
                        if (zipEntry.name.lastIndexOf('/') != zipEntry.name.length - 1 && zipEntry.name.length > 0) {
                            zip.file(zipEntry.name).async("text").then(function success(content) {
                                filenames[filecount] = pdirname + "/" + zipEntry.name;
                                if (filenames_allowed == true) {
                                    filecontents[filecount] = content;
                                    wide.model = {
                                        ...wide.model, loadfiles: wide.model.loadfiles.concat({
                                            name: filenames[filecount],
                                            content: filecontents[filecount],
                                            reload: true,
                                            markers: [],
                                            severity: 0
                                        })
                                    };
                                    filecount++;
                                }
                            }, function error(e) {
                                filecontents[filecount] = 'funktioniert leider noch nicht';
                            }).then(() => {
                                let badnames = [];
                                wide.model.loadfiles.forEach((file) => {
                                    if (/^(([a-zA-Z0-9]+([ |_|-]{1}[a-zA-Z0-9]+)*[/]{1})+([a-zA-Z0-9]+([_]{1}[a-zA-Z0-9]+)*[.]{1}[a-zA-Z0-9]+|[.])+)$/.test(file.name) == false && file.name.length > 0) {
                                        filenames_allowed = false;
                                        console.log(file.name);
                                    }
                                });
                                if (filenames_allowed == true) {
                                    (document.getElementById("input%projectname") as HTMLInputElement).value = pdirname;
                                    createdialog.open();
                                } else {
                                    (document.getElementById("input%projectname") as HTMLInputElement).value = "";
                                    createdialog.dialog.close();
                                    wide.model.loadfiles = [];
                                    wide.showMessage("The uploaded project contains files with names that are not allowed!");
                                }
                            });
                        } else {
                            wide.model = {
                                ...wide.model, loadfiles: wide.model.loadfiles.concat({
                                    name: pdirname + "/" + zipEntry.name + '.',
                                    content: '',
                                    reload: true,
                                    markers: [],
                                    severity: 0
                                })
                            }
                        }
                    }
                });
            }).then(() => {
            let badnames = [];
            wide.model.loadfiles.forEach((file) => {
                if (/^(([a-zA-Z0-9]+([ |_|-]{1}[a-zA-Z0-9]+)*[/]{1})+([a-zA-Z0-9]+([_]{1}[a-zA-Z0-9]+)*[.]{1}[a-zA-Z0-9]+|[.])+)$/.test(file.name) == false && file.name.length > 0) {
                    filenames_allowed = false;
                    console.log(file.name);
                }
            });
            if (filenames_allowed == true) {
                (document.getElementById("input%projectname") as HTMLInputElement).value = pdirname;
                createdialog.dialog.escapeKeyAction = '';
                createdialog.dialog.scrimClickAction = '';
                createdialog.open();
            } else {
                (document.getElementById("input%projectname") as HTMLInputElement).value = "";
                createdialog.close();
                wide.model.loadfiles = [];
                wide.showMessage("The uploaded project contains files with names that are not allowed!");
            }
        });
    //});
}

/**
 * Function used to load examples
 * @param name
 * @param pspu
 * @param language
 * @param wide
 */
function unpack_example(name,pspu,language,wide) {
    let zipfilename = name.substring(0,name.length-4);
    if (zipfilename != ".DS_S") {
        let files = [{name: zipfilename + '/.', content: '', reload: true, markers: [], severity: 0}];
        let filecount = 1;
        let filenames = [zipfilename + '/.'];
        let filecontents = [''];
        wide.model.examples = wide.model.examples.concat({BPUType: language.BPUType , PSPUType: pspu, language: language, name: zipfilename, files: files});
        JSZipUtils.getBinaryContent('examples/' + pspu + '/' + language.name + '/' + name, function(err, data) {
            if (err) {
                wide.showMessage("Something went wrong while loading the examples please reload the site!")
            }

            JSZip.loadAsync(data)                                   // 1) read the Blob
                .then(function (zip) {
                    zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
                        if (zipEntry.name.indexOf('__MACOSX') == -1) {
                            if (zipEntry.name.lastIndexOf('/') != zipEntry.name.length - 1 && zipEntry.name.length > 0) {
                                zip.file(zipEntry.name).async("text").then(function success(content) {
                                    filenames[filecount] = zipfilename + "/" + zipEntry.name;
                                    filecontents[filecount] = content;
                                    files = files.concat({name: filenames[filecount], content: filecontents[filecount], reload: true, markers: [], severity: 0});
                                    wide.model.examples.find((example) => example.name == zipfilename && example.PSPUType == pspu && example.language == language).files = files;
                                    filecount++;
                                }, function error(e) {
                                    filecontents[filecount] = 'funktioniert leider noch nicht';
                                });
                            } else {
                                filenames[filecount] = zipfilename + "/" + zipEntry.name + '.';
                                files = files.concat({name: filenames[filecount], content: '', reload: true, markers: [], severity: 0});
                                wide.model.examples.find((example) => example.name == zipfilename && example.PSPUType == pspu && example.language == language).files = files;
                                filecount++;
                            }
                        }
                    });
                });
        });
    }
}

/**
 * Arduino Pre-compile functions
 */
function precompile(projectfiles: IFileContent[]){
    let files : IFileContent[] = addLineDirectives(projectfiles);
    let file : IFileContent = concatfiles(files);
    file = generatePrototypes(file);
    file = addInclArduino(file);
    return file;
}

function concatfiles(files: IFileContent[]){
    let content = "";
    files.forEach((file) => {
        if (file.name.endsWith(".ino")) {
            content = content + "\n\n" + file.content;
        }
    });
    let file : IFileContent = {name: "sketch.cpp", content: content, reload: true, markers: [], severity: 0};
    return file;
}

function addInclArduino(file: IFileContent){
    file.content = '#include \"Arduino/Arduino.h\" \n' + file.content;
    return file;
}

function generatePrototypes(file: IFileContent){
    let datatypes = ["int", "bool", "char", "float", "double", "long", "unsigned","void"];
    let prototypes = "";
    datatypes.forEach((type) => {
        let regex = new RegExp("((" + type +  "){1}([ ]{1}[a-zA-Z0-9]+){1})[\(][a-zA-Z0-9 ]*[\)]");
        let content = file.content;
        while (content.search(regex) != -1) {
            content = content.substring(content.search(regex.source), content.length);
            prototypes = prototypes + content.substring(content.search(regex.source), content.indexOf(")")+1) + ";\n";
            content = content.substring(content.indexOf(")") + 1, content.length);
        }
    });
    file.content = prototypes + file.content;
    return file;
}

function addLineDirectives(files: IFileContent[]){
    let newfiles: IFileContent[] = [];
    files.forEach((file) => {
        if (file.name != "." && file.name.endsWith(".ino")) {
            let currentline = 2;
            let newcontent = file.content.substring(0, file.content.indexOf("\n") + 1);
            let oldcontent = file.content.substring(file.content.indexOf("\n") + 1, file.content.length);
            while (oldcontent.length != 0) {
                newcontent = newcontent + "#line " + currentline + " \"" +  file.name + "\"\n" + oldcontent.substring(0, oldcontent.indexOf("\n"));
                if (oldcontent.indexOf("\n") != -1) {
                    oldcontent = oldcontent.substring(oldcontent.indexOf("\n") + 1, oldcontent.length);
                } else {
                    newcontent = newcontent + oldcontent;
                    oldcontent = "";
                }
                currentline++;
            }
            file.content = "#line " + 1 + " \"" + file.name + "\"\n" + newcontent + oldcontent;
            newfiles = newfiles.concat(file);
        }
    });
    return newfiles;
}

export {
    init,
    saveBlob,
    loadFile,
    pack,
    unpack,
    unpack_example,
    precompile
}