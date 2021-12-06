import './gcc-parser'
import { GccParser } from './gcc-parser';
import * as monaco from 'monaco-editor';
import {IBoard, IBoardConfiguration} from "./model";

export interface IFileContent {
    name: string;
    content: string;
}

export interface ICompilerRequest {
    makefile: string;
    experimentId?: string;
    sessionId?: string;
    uploadServer?: string;
    files: IFileContent[];
    pspu: string;
    board?: IBoardConfiguration;
}

interface ICompilerResponse {
    success: string;
    sessionId: string;
    output: string;
    markers: { [filename: string]: monaco.editor.IMarkerData[] };
}

export interface ICompilerResult {

}

export class Compiler {
    serviceURI: string;
   // timeoutHandle;
    constructor(serviceURI: string) {
        this.serviceURI = serviceURI;
    }//TODO Namen auf english aendern
  setTimeoutHand= function(request:ICompilerRequest) {
      return new Promise<Response>((resolve, reject) => {
          let timeoutHandle = setTimeout(() => {
              reject();
          }, 5000);
          fetch(this.serviceURI + "/compile", {
              method: 'POST',
              mode: 'cors',
              cache: 'no-cache',
              credentials: 'omit',
              headers: {
                  'Content-Type': 'application/json; charset=utf-8',
              },
              redirect: 'follow',
              referrer: 'no-referrer',
              body: JSON.stringify({makefile:"TestProcessRunning",files:[], sessionId:request.sessionId}),
          }).then((response) => {
              (response.json()).then((response) => {
                  if (response.answer === "yes"){
                      clearTimeout(timeoutHandle);
                      resolve()
                  }
                  else  reject();
              })
          });
    })
  };
    /**
     * Sends a request to the NodeServer and recieves response
     * @param request
     * @param timeout
     */
    compile(request: ICompilerRequest, timeout: number = 5000) {
        let stillRunning:boolean;
        stillRunning = true;
        return new Promise<Response>((resolve, reject) => {
            const intervalObj = setInterval(() => {
               this.setTimeoutHand(request).then((response) => {
               }).catch((reject) =>{
                   stillRunning = false;
               });
                if (stillRunning===false){
                    reject(new Error('Compile request times out'));
                    clearInterval(intervalObj);
                }
            }, 10000);
            fetch(this.serviceURI + "/compile", {
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
                clearInterval(intervalObj);// clearTimeout(timeoutHandle);
                return response;
            }).then(resolve);
        }).then(res => res.json()).then((response: ICompilerResponse) => {
            // first normalize line endings:
            response.output = response.output.replace(/\r\n/g, '\n');
            response.markers = {};
            for (let message of GccParser.parseString(response.output)) {
                if (!response.markers[message.filename]) {
                    response.markers[message.filename] = [];
                }
                response.markers[message.filename].push({
                    startLineNumber: message.line,
                    endLineNumber: message.line,
                    startColumn: message.column,
                    endColumn: message.column,
                    message: message.text,
                    severity: message.type == 'error' ? monaco.MarkerSeverity.Error : message.type == 'warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Info
                })
            }
            return response;
        });
    }

}