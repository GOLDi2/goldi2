import { LitElement, html, property } from '@polymer/lit-element';
import ResizeObserver from 'resize-observer-polyfill';
import {IFileContent} from './../compiler'
import * as monaco from 'monaco-editor';

import {ILanguage, IModel} from '../model'
import * as util from "../os-files";

class File {
    path: string;
    fileModel: monaco.editor.ITextModel;
    language: ILanguage;

    dispose(){
        this.fileModel.onDidChangeContent(() => {});
        this.fileModel.dispose();
    }

    /**
     * Generates the monaco-editor with predefined language
     * @param path
     * @param value
     * @param language
     */
    constructor(path: string, value: string,language: ILanguage ) {
        this.path = path;
        this.language = language;
        this.fileModel = monaco.editor.createModel(value, language.editorLanguage, monaco.Uri.file(path));
    }
}

// throttle function calls. Credit: https://remysharp.com/2010/07/21/throttling-function-calls
function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

export class Editor extends LitElement {
    private standaloneEditor: monaco.editor.IStandaloneCodeEditor;
    private files: Array<File>=[];

    @property()
    model: IModel;

    @property()
    language: ILanguage; //variable for programming-language

    @property()
    update_requested: boolean;

    private minimizeAction;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    render() {
        return html`<div></div>`;
    }

    firstUpdated() {
        (<any>self).MonacoEnvironment = {
            getWorkerUrl: ()=> {
              return 'monaco/base/worker/workerMain.js';
            }
          };

        this.standaloneEditor = monaco.editor.create(this.firstElementChild as HTMLElement, {
            minimap: { enabled: false },
            //scrollBeyondLastLine: false,
        });

        new ResizeObserver(entries=>{
            let rect=this.getBoundingClientRect();
            this.standaloneEditor.layout({height:rect.height, width:rect.width});
        }).observe(this);

        this.selectFile('');
    }

    updated(){
        this.update_requested?this.update_requested=false:"";
        if(this.model){
            this.syncWithModel();
            this.selectFile(this.model.selectedFile);
        }
    }

    syncWithModel(){
        //console.log(this.language);
        // Delete files that are not in the model:
        this.files=this.files.filter((file)=>{
            let modelFile=this.model.files.find((modelFile)=> modelFile.name==file.path)
            // remove file if modelFile is not present or if it is marked for reload
            if ((!modelFile) || (<any>modelFile).reload){
                //console.log(`delete ${file.path}`)
                file.dispose();
                if(modelFile) (<any>modelFile).reload=false;
                return false;
            }
            return true;
        });

        // Add new files from model:
        for( let modelFile of this.model.files){
            if(!this.files.find((file)=> file.path==modelFile.name)){
                // and add it
                let file=new File(modelFile.name, modelFile.content, this.language);
                file.fileModel.onDidChangeContent(debounce(() => {
                    modelFile.content=file.fileModel.getValue();
                    let event = new CustomEvent('wide-file-content-changed', { detail: { filename: file.path }, bubbles: true });
                    this.dispatchEvent(event);
                },300));
                this.files.push(file);
            }
        }

        // Set markers:
        for( let modelFile of this.model.files){
            let file=this.files.find((file)=> file.path==modelFile.name)
            if(file){
                monaco.editor.setModelMarkers(file.fileModel, '', modelFile.markers);
            }else{
                console.log('Did not find editor file for model file: '+modelFile.name)
            }
        }
    }

    selectFile(path: string){
        this.minimizeAction?this.minimizeAction.dispose():"";
        for (let file of this.files){
            if(file.path==path){
                if(file.language.name == 'LogIC'){
                    let event = new CustomEvent('wide-editor-add-minimize', { detail: { caller: this, standaloneEditor: this.standaloneEditor, path: file.path }, bubbles: true });
                    this.dispatchEvent(event);
                }
                this.standaloneEditor.setModel(file.fileModel);
                this.language = file.language;
                this.style.display='block';
                return;
            }
        }
        this.style.display='none';
    }
}
customElements.define('wide-editor', Editor);