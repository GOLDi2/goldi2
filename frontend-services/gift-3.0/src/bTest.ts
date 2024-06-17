import { Dialog } from '@material/mwc-dialog';
import { LitElement, html, customElement, property, css } from 'lit-element';
import { sortedIndex } from 'lodash';
import { connect } from 'pwa-helpers';
import { createTextChangeRange } from 'typescript';
import { AddTransition, ChangeNodeName, ChangeNodeNumber, ChangeView, ResetControlSignal, Resetoutput, SetControlSignal, SetOutput } from './actioncreator/editorState';
import { SetInitialState } from './actioncreator/editorState';
import { FullApiSystemAssignmentSelector } from './selectors/normalizedEditorStateSelectors';
import { store } from './store/configureStore';
import { ApiControlSignalAssignment } from './types/ApiClasses/SignalAssignments';
import { ApiAutomatonAssignment, ApiFullSystemAssignment } from './types/ApiClasses/SystemAssignment';
import { AppState } from './types/NormalizedState/AppState';
import { MetaState } from './types/NormalizedState/MetaState';
import { Point } from './types/Points';
import { Viewstate } from './types/view';
import "@material/mwc-icon-button"

import { ApiNode } from './types/Node';
import { GraphViewer } from './graphViewer';
import { OutputSignalPair } from './types/OutputSignalPair';
import { ApiOutputSignalPair } from './types/ApiClasses/GraphRepresentation/OutputSiganalPair';
import { ApiControlSignalPair } from './types/ApiClasses/GraphRepresentation/ControlSignalPair';
import { ErrorWindow } from './errorWindow';
import { UnknownVariableInExpressionError, OutputVariableInExpressionError, ExpressionSyntaxError, ControlSignalExpressionVariableError } from './types/Error';


/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('b-test')
export class BTest extends connect(store)(LitElement) {

    constructor() {
        super();
        this.addMouseover()
    }


    static styles = css`
    :host {
      display: block;
      padding: 0px;
      max-width: 100px;
      margin-top: 50px;
      margin-left: -2px;
      min-height: 100px;
      pointer-events:all;
      z-index:5;
    }
    mwc-button {
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
mwc-textfield{
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
// .hover:before{
//     content:"";
//    position: absolute;
//    width: 0;
//    height: 0;
//    border-left: 13px solid 
// transparent;
//    border-right: 13px solid 
// transparent;
//    border-bottom: 26px solid 
//    black;
//    margin: -25px 0 0 4px;
// }
.nodeGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 250px 250px;
  grid-auto-rows: 56px 40px 80px 40px 40px 80px 40px 40px 56px 40px;
}
.automHelper:after{
    content:"";
   position: absolute;
   width: 0;
   height: 0;
   border-left: 13px solid 
transparent;
   border-right: 13px solid 
transparent;
   border-top: 26px solid 
   black;
}
@media print {
    .mdc-fab{
      display: none;
    }
}
    /* svg{
        position: "relative";
    } */
    /* 
    div:after {
  left: 0;
  top: 30px;
  height: 3px;
  background: black;
  content: "";
  width: 100%;
  display: block;
  position: relative;
  border-left:0px; */
  `;

    @property({ type: Number }) nodeId: number;
    @property({ type: Number }) automatonId: number;
    @property({ type: String }) automatonName: string;
    @property({ type: String }) nodeName: string;
    @property({ type: Number }) nodeNumber: number;
    @property({ type: Array }) outputs: Array<ApiOutputSignalPair>;
    @property({ type: Array }) ctrlSignals: Array<ApiControlSignalPair>;
    @property({ type: Array }) nodeList: Array<ApiNode>
    @property({type: Boolean}) initial: boolean;
    @property({type: Boolean}) complete: boolean;
    @property({type: Boolean}) contradiction: boolean;
    @property({ type: String }) testString: string;
    // @property({ type: ApiFullSystemAssignment }) assignments: ApiFullSystemAssignment;

    stateChanged(state: MetaState) {
        // this.assignments = FullApiSystemAssignmentSelector(state.appState.normalizedEditorState);
        this.addHoverCustomizeWindow();
        // this.fillDropdown();
        // console.log("Completeness:"+this.complete)
        // console.log("Contradiction:"+this.contradiction)
        // console.log(this.testString)
    }








    render() {
        return html`
        <div class="autom" id="autom" style="padding-top:10px;text-align: center;height:100px;margin:3px;position:absolute;margin-top:-110px;display:none;background:black;color:white;opacity:0.75; min-width:100px;border-radius:4px;">
        ${this.automatonName}
        <br>
        ${this.nodeName}
        <br>
        ${this.nodeNumber}
        <br>
        ${"0x"+this.nodeNumber.toString(16)}
        <br>
        ${"0b"+this.nodeNumber.toString(2)}
        </div>
            <div draggable="true" style="text-align: center;vertical-align: middle; width: 100px; height:100px;border-radius:50px;">
            <svg height="105px" width="105px" fill="none">
            <circle id="circle" cx="53px" cy="53px" r="50px" stroke=${(this.contradiction===undefined && this.complete===undefined)?"black":(!this.contradiction)? "red":(!this.complete)? "yellow":"black"} stroke-width="3" fill="white"/>
            <text id="automHover" x="50%" y="25%" text-anchor="middle" stroke="black" fill="black" stroke-width="1px" dy=".3em">${this.nodeName.length>=8? this.nodeName.slice(0,7)+"...":this.nodeName}</text> 
  <line x1="3px" y1="53px" x2="103px" y2="53px" style="stroke:black;stroke-width:2" />
  <text id="outputs" x="50%" y="70%" text-anchor="middle" stroke="black" fill="black" stroke-width="1px" dy=".3em" >${this.outputs.length + this.ctrlSignals.length>0? "[y]" : "-"}</text> 
  <circle style="visibility:${this.initial? "visible" : "hidden"}" id="circle" cx="17px" cy="17px" r="10px" stroke="black" stroke-width="3" fill="black"/>
</svg>
<mwc-icon-button id="editButton" icon="edit" style="margin-left:90px;margin-top:-125px;display:none;" @click=${() => (this.openCustomizeWindow())}></mwc-icon-button>

<div class="hover" id="hover" style="position:absolute;margin:3px;margin-top:75px;display:none;background:black;color:white;opacity:0.75;min-width:100px;border-radius:4px;visibility:${this.outputs.length + this.ctrlSignals.length>0? "visible":"hidden"}">
        ${this.outputs.forEach((out,i,arr)=>{
            if(out.equation.error && !(out.equation.error?.invalidExpression === out.equation.validExpression)){
                this.openAssignmentErrorWindow("OutputAssignmentError", out.equation.error, out.equation.validExpression, this.nodeId, out.name)
            };
        })}

        ${this.outputs.map((out,i,arr)=> html`${out.name}=${out.equation.validExpression}<br>`)}

        ${this.ctrlSignals.forEach((ctrl,i,arr)=>{
            if(ctrl.equation.error && !(ctrl.equation.error?.invalidExpression === ctrl.equation.validExpression)){
                this.openAssignmentErrorWindow("OutputAssignmentError", ctrl.equation.error, ctrl.equation.validExpression, this.nodeId, ctrl.name)
            };
        })}

        ${this.ctrlSignals.map((ctrl,i,arr)=> html`${ctrl.name}=${ctrl.equation.validExpression}<br>`)}
    </div>
  </div>
        `;
    }



    openAssignmentErrorWindow(type: string, error: UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | ControlSignalExpressionVariableError, lastValid: string | number, id: number, toId:number|string) {
        // console.log((<any>this.parentElement?.parentElement?.parentNode).host);
        (<any>(<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.color = "white";
        (<any>(<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.background = "var(--beast-primary-color)";
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).openWindow = true;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).lastValid = lastValid;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorMessage = error.message;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorName = error.name;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorType = type;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorObjectId = id;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).invalidValue = error.invalidExpression;
        (<ErrorWindow>(<any>((<any>this.parentElement?.parentElement?.parentNode).host).parentNode).host.shadowRoot?.querySelector(".errorWindow")).freeParameter = toId;
    
      }

    


    addHoverCustomizeWindow() {
        setTimeout(
            () => {
                let elem = this.shadowRoot?.getElementById("circle");
                elem?.addEventListener("mouseover", (e) => {
                    (<HTMLButtonElement>this.shadowRoot?.getElementById("editButton")).style.display = "block";
                });
                elem?.addEventListener("mouseout", (e) => {
                    setTimeout(()=>{
                        (<HTMLButtonElement>this.shadowRoot?.getElementById("editButton")).style.display = "none";
                    },3000);
                });
                
            }, 10);

    }


    openCustomizeWindow() {
        (<GraphViewer>((<ShadowRoot>this.parentElement?.parentNode?.parentNode?.getRootNode()).host)).currentNode = this;
        (<GraphViewer>((<ShadowRoot>this.parentElement?.parentNode?.parentNode?.getRootNode()).host)).openCustomizeWindow();
    }


    addMouseover() {
        setTimeout(
            () => {
                let elem = this.shadowRoot?.getElementById("outputs");
                elem?.addEventListener("mouseover", (e) => {
                    // console.log("[y]");
                    (<HTMLDivElement>this.shadowRoot?.getElementById("hover")).style.display = "block"
                });
                elem?.addEventListener("mouseout", (e) => {
                    (<HTMLDivElement>this.shadowRoot?.getElementById("hover")).style.display = "none"
                });

                let autom = this.shadowRoot?.getElementById("automHover");
                autom?.addEventListener("mouseover", (e) => {
                    // console.log("automaton0");
                    (<HTMLDivElement>this.shadowRoot?.getElementById("autom")).style.display = "inline-block"
                });
                autom?.addEventListener("mouseout", (e) => {
                    (<HTMLDivElement>this.shadowRoot?.getElementById("autom")).style.display = "none"
                });
            }, 10);
    }



    foo(): string {
        return 'foo';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'b-test': BTest;
    }
}