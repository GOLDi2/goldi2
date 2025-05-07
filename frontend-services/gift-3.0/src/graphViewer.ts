import "@material/mwc-button";
import { Dialog } from '@material/mwc-dialog';
import "@material/mwc-formfield";
import "@material/mwc-icon-button";
import "@material/mwc-switch";
import "@material/mwc-textfield";
import { css, customElement, html, LitElement, property } from 'lit-element';
import { translate } from 'lit-translate';
import Mousetrap from "mousetrap";
import { connect } from 'pwa-helpers';
import { AddGlobalOutput, AddTransition, ChangeNodeName, ChangeNodeNumber, RemoveControlSignal, RemoveGlobalOutput, ResetControlSignal, Resetoutput, SetControlSignal, SetDerivedViewStateCords, SetInitialState, SetNodeCords, SetOutput } from './actioncreator/editorState';
import { getNodeIndex } from './actioncreator/helperfunctions';
import { BezierSVGElement } from './bezierSVG';
import { BTest } from './bTest';
import { ErrorWindow } from './errorWindow';
import { GenericTableElement, TableBaseEntry, TableInteractionEntry, TableMeta } from './GeneralTableElement';
import { MainRouterElement } from "./mainRouterElement";
import { ApiAutomatonSelector, ApiHardwareautomatonSelector, ApiMergedautomatonSelector } from './selectors/normalizedEditorStateSelectors';
import { store } from './store/configureStore';
import { TopBarElement } from "./top-bar";
import { ApiAutomaton } from './types/ApiClasses/GraphRepresentation/Automaton';
import { ApiTransitions } from './types/ApiClasses/GraphRepresentation/Transitions';
import { ControlSignalExpressionVariableError, DuplicateNameError, ExpressionSyntaxError, NameError, NameSyntaxError, NumberError, OutputVariableInExpressionError, OwnControlSignalsExpressionError, TransitionExpressionVariableError, UnknownVariableInExpressionError } from './types/Error';
import { DEFAULT_NODE_RADIUS } from "./types/Node";
import { MetaState } from './types/NormalizedState/MetaState';
import { calculateAngle, createPoint } from './types/Points';
import { DerivedAutomatonViews } from "./types/view";



// Mousetrap.bind('shift+h', function (e, combo) {
//   e.preventDefault();
//   console.log(window.querySelector(".svg .circle"));
// });


@customElement('graph-viewer')
export class GraphViewer extends connect(store)(LitElement) {
    static styles = css`
  :host {
    display: block;
    max-width: 100%;
    max-height: 100%;
    position: relative;
    background-color: white;
  }
    #drag{
    height: 100px;
    width: 100px;
    position: absolute;
    /* background-color: lightblue; */
    border-radius: 50%;
    /* text-align: center; */
    z-index: 3;
    /* opacity: 0.5; */
    /* border:1px solid blue; */
    /* font-size: 12px; */
  }#oberElement{
      height: 2000px;
  }.nodeGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 250px 250px;
  grid-auto-rows: 56px 40px 56px 40px 56px 80px 40px 40px 56px 40px;
}mwc-button {
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
mwc-textfield{
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
canvas{
    pointer-events:none;
    width:1000;
    height:1000;
} 

.mdc-fab {
    /* @alternate */
    position: relative;
    display: inline-flex;
    position: relative;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 50px;
    height: 50px;
    padding: 0;
    border: none;
    fill: currentColor;
    text-decoration: none;
    cursor: pointer;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    overflow: visible;
    transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 15ms linear 30ms, -webkit-transform 270ms 0ms cubic-bezier(0, 0, 0.2, 1);
    transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 15ms linear 30ms, transform 270ms 0ms cubic-bezier(0, 0, 0.2, 1);
    transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 15ms linear 30ms, transform 270ms 0ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 270ms 0ms cubic-bezier(0, 0, 0.2, 1);
  }
  .mdc-fab:hover {
    /* @alternate */
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
  }
  .mdc-fab.mdc-ripple-upgraded--background-focused, .mdc-fab:not(.mdc-ripple-upgraded):focus {
    /* @alternate */
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
  }
  .mdc-fab:active, .mdc-fab:focus:active {
    /* @alternate */
    box-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12);
  }
  .mdc-fab:active, .mdc-fab:focus {
    outline: none;
  }
  .mdc-fab:hover {
    cursor: pointer;
  }
  .mdc-fab::before {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border: 1px solid transparent;
    border-radius: inherit;
    content: "";
    pointer-events: none;
  }
  .mdc-fab {
    background-color: #343E48;
    /* @alternate */
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  }
  .mdc-fab, .mdc-fab:not(:disabled) .mdc-fab__icon, .mdc-fab:not(:disabled) .mdc-fab__label, .mdc-fab:disabled .mdc-fab__icon, .mdc-fab:disabled .mdc-fab__label {
    color: #fff;
    /* @alternate */
    color: var(--mdc-theme-on-secondary, #fff);
  }
  .mdc-fab:not(.mdc-fab--extended) {
    border-radius: 50%;
  }
  .mdc-fab:not(.mdc-fab--extended) .mdc-fab__ripple {
    border-radius: 50%;
  }
  .mdc-fab:hover .mdc-fab__ripple::before, .mdc-fab.mdc-ripple-surface--hover .mdc-fab__ripple::before {
    opacity: 0.08;
    /* @alternate */
    opacity: var(--mdc-ripple-hover-opacity, 0.08);
  }
  
  @media print {
    .mdc-fab{
      display: none;
    }
    :host{
      background-color: white;
      height: 100vh;
      width: 100vh;
      position: fixed;
      top: 0px;
      left: 0px;
      margin: 0;
      padding: 0px;
      font-size: 14px;
      line-height: 18px;
    }
    // @page {
    //   size: 100%; /* landscape */
    //   /* you can also specify margins here: */
    //   margin: 25mm;
    //   margin-right: 45mm; /* for compatibility with both A4 and Letter */
    // }
}
  
`;

constructor() {
  super();
  Mousetrap.bind('mod+h',  (e, combo) => {
    e.preventDefault();
    ((this as GraphViewer).dotsVisible) = !((this as GraphViewer).dotsVisible)
    // logs 'ctrl+z'
});
this.addEventListener('wheel', function () {(this as GraphViewer).scrolledFunction()})
}

scrolledFunction() {
  let svgs = this.shadowRoot?.querySelectorAll("bezier-svg-element");

    
    setTimeout(
      () => {
        svgs[0].shadowRoot?.getElementById("mid")?.dispatchEvent(new Event('mousedown'));
        svgs[0].dispatchEvent(new Event('mouseup'));
    // currentSVG.dispatchEvent(new Event('resize'));

      }, 200);
    
  
}

    /**
     * Liste der aktiven Automaten
     */
    @property({ type: Array }) activeAutomatonList: Array<ApiAutomaton>;
    /**
     * Dasjenige Element, welches grade gezogen wird
     */
    @property({ type: HTMLElement }) dragNode: HTMLElement;

    @property({ type: Number }) leftSpace: number = 30;

    @property({ type: BTest }) currentNode: BTest;

    @property({ type: String}) currentAutomView: string = "working-automaton";

    @property({ type: Boolean }) dotsVisible: boolean = true;

    stateChanged(state: MetaState) {
      
      if (this.currentAutomView==="working-automaton"){
          this.activeAutomatonList = ApiAutomatonSelector(state.appState);
      }
      else if (this.currentAutomView==="merged-automaton"){
          this.activeAutomatonList =ApiMergedautomatonSelector(state.appState);
      }
      else if (this.currentAutomView==="hardware-automaton"){
          this.activeAutomatonList = ApiHardwareautomatonSelector(state.appState);
      }
      // console.log(this.activeAutomatonList)

      this.fillDropdown();
    }


    render() {
        return html`
        <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentAutomView==="hardware-automaton"? "0.85" : "1"};z-index:2;pointer-events:all; position:fixed; right:10px; top:134px" title="${translate('topBar.statediagram.hardware')}" icon="developer_board" @click=${()=>{this.handleViewChange("hardware-automaton");}}></mwc-icon-button>
        <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentAutomView==="merged-automaton"? "0.85" : "1"};z-index:2;pointer-events:all; position:fixed; right:70px; top:134px" title="${translate('topBar.statediagram.merged')}" icon="merge" @click=${()=>{this.handleViewChange("merged-automaton");}}></mwc-icon-button>
        <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentAutomView==="working-automaton"? "0.85" : "1"};z-index:2;pointer-events:all; position:fixed; right:130px; top:134px" title="${translate('topBar.statediagram.work')}" icon="architecture" @click=${()=>{this.handleViewChange("working-automaton");}}></mwc-icon-button>
        <div class="bezierHolderElement">
        <!-- Beziers -->
        ${this.activeAutomatonList.map((autom, i, arr) => html`
            ${autom.transitions.map((trans, j, transArr) => 
                
                
                html`
                <bezier-svg-element
                .supPointLeftOffset=${this.leftSpace}
                .id=${"trans" + trans.id} 
                automView=${this.currentAutomView}
                .automID=${autom.id}
                .condition=${trans.condition.validExpression}
                .toNodeId=${trans.toNodeId}
                .fromNodeId=${trans.fromNodeId}
                .endNode=${createPoint(autom.nodes[getNodeIndex(autom.nodes, trans.toNodeId)].position.xCord - this.leftSpace, autom.nodes[getNodeIndex(autom.nodes, trans.toNodeId)].position.yCord)}
                .startNode=${createPoint(autom.nodes[getNodeIndex(autom.nodes, trans.fromNodeId)].position.xCord - this.leftSpace, autom.nodes[getNodeIndex(autom.nodes, trans.fromNodeId)].position.yCord)} 
                .endpoint=${createPoint(trans.bezier.endPoint.xCord - this.leftSpace, trans.bezier.endPoint.yCord)} 
                .startpoint=${createPoint(trans.bezier.startPoint.xCord - this.leftSpace, trans.bezier.startPoint.yCord)} 
                .helppoint=${trans.bezier.supportPoint} transID=${trans.id} 
                .angle=${calculateAngle(trans.bezier.startPoint, trans.bezier.endPoint)}
                .dotsVisible=${this.dotsVisible}>
                
            </bezier-svg-element>
            ${this.makeBeziers(trans)}
        `)}
        `)}
        </div>
        <!-- Grundelement, an das alle weiteren Elemente angebunden werden --> 
        <div id="oberElement" @drop = ${(e: MouseEvent) => { this.atDrop(e) }} @dragover = ${(e: MouseEvent) => { e.preventDefault() }}  style = "position: relative;z-index:1">
        <canvas id="testCanvas">
        </canvas>
            ${this.activeAutomatonList.forEach((autom, i, arr) => 
                autom.nodes.map((node, j, nodeArr) =>
                    {if(node.customStateNumber.error && !(node.customStateNumber.error?.invalidNumber === node.customStateNumber.validNumber)){
                        this.openErrorWindow("NodeNameError", node.customStateNumber.error, node.customStateNumber.validNumber, node.id);
                    }}
            ))}
            ${this.activeAutomatonList.map((autom, i, arr) => html`
                <div id="${autom.id}">
                    ${autom.nodes.map((node, j, nodeArr) => 
                        html`
                        <b-test id="drag"
                        .outputs=${node.outputAssignment} 
                        .ctrlSignals=${node.controlSignalAssignment}
                        .nodeId=${node.id} 
                        .nodeName=${node.names[0].validName} 
                        .nodeNumber=${node.customStateNumber.validNumber} 
                        .automatonName=${autom.name.validName} 
                        .nodeList=${autom.nodes} 
                        .automatonId=${autom.id} 
                        .initial=${node.customStateNumber.validNumber===autom.initialStateNumber.validNumber}
                        .complete=${node.completenessInfo?.isComplete}
                        .contradiction=${node.contradictionInfo?.isFreeOfContradictions}
                        .testString=${node.completenessInfo?.incompleteness+" "+node.contradictionInfo?.contradiction}
                        .style="top:${node.position.yCord - 2 * DEFAULT_NODE_RADIUS}px;left:${Math.abs(node.position.xCord - DEFAULT_NODE_RADIUS)- this.leftSpace}px" 
                        @dragstart=${(e: Event) => { this.dragNode = <HTMLElement>e.target }}>
                    </b-test>
                    `
                    )}
                </div>
                `)}
    </div>
        
        <!--<bezier-element id="bezier" style="transform: rotate(10deg);"></bezier-element> -->
        <div id="bezierElements" @drop = ${(e: MouseEvent) => { this.atDrop(e) }} @dragover = ${(e: MouseEvent) => { e.preventDefault() }}></div>
        

        <!-- Fenster zum Knoten bearbeiten -->
  <mwc-dialog id="node-dialog" style="position:absolute; z-index:6;" scrimClickAction="" heading="${translate('pop-ups.node-edit.header')} ${this.currentNode?.nodeName} (${this.currentNode?.nodeNumber})">
<mwc-button
      slot="primaryAction"
      dialogAction="cancel">
      ${translate('pop-ups.close')}
  </mwc-button>
  <br>
  
  <!-- Potentieller Fehlerherd: braucht SetInitialState die Id oder die Nummer des Knoten? -->
  <!-- <mwc-button @click=${() => (store.dispatch(SetInitialState(this.currentNode.automatonId, this.currentNode.nodeId)))} style="margin-left: 29%;">${translate('pop-ups.node-edit.initial')}</mwc-button> -->

  <mwc-formfield label=${translate('pop-ups.node-edit.initial')} style="margin-left: 35%;">
  <mwc-switch .selected=${this.currentNode?.initial? true : false}  .disabled=${this.currentNode?.initial? true : false} @click=${()=>{(store.dispatch(SetInitialState(this.currentNode.automatonId, this.currentNode.nodeId)))}}></mwc-switch>
  </mwc-formfield><br>
  <br>
  <div class="nodeGrid">
  <mwc-textfield id="newNumber" outlined label="${translate('pop-ups.node-edit.number')}" style="border-left:1px solid #343E48; border-top:1px solid #343E48;border-top-left-radius:4px;border-bottom: 1px solid #343E48; border-bottom-left-radius:4px;"></mwc-textfield>
  <mwc-button @click=${() => (this.changeNodeNumber())} style="border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;border-bottom: 1px solid #343E48; border-bottom-right-radius:4px;padding-top:9px;">${translate('pop-ups.node-edit.num-change')}</mwc-button>
  <div></div>
  <div></div>

  <mwc-textfield id="newName" outlined label="${translate('pop-ups.node-edit.name')}" style="border-left:1px solid #343E48; border-top:1px solid #343E48;border-top-left-radius:4px;border-bottom: 1px solid #343E48; border-bottom-left-radius:4px;"></mwc-textfield>
  <mwc-button @click=${() => (this.changeNodeName())} style="border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;border-bottom: 1px solid #343E48; border-bottom-right-radius:4px;padding-top:9px;">${translate('pop-ups.node-edit.name-change')}</mwc-button>
 <div></div>
  <div></div>

 <select style="width:249px;height:101%; border-radius:4px; padding-left:11px;" id="endId" name="endId"></select>
 <!-- </div> -->
  <mwc-button @click=${() => (this.addTransition())} style="border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;border-bottom: 1px solid #343E48; border-bottom-right-radius:4px;padding-top:9px;">${translate('pop-ups.node-edit.transition-add')}</mwc-button>
  <div></div>
      <div></div>
    </div>
    <div style="overflow-x: hidden;overflow-y:auto;max-height:40vh;min-height:340px">
    <generic-table-element id="table"
    headerName="${translate('pop-ups.node-edit.signal')}" 
    headerSignal="${translate('pop-ups.node-edit.equation')}"></generic-table-element>
    </div>
</mwc-dialog>
    `;
    }


    handleViewChange(view:string){
      (<MainRouterElement>(<ShadowRoot>this.parentNode).host).currentView = view;
      this.writeCurrentViewToTop(view);
    }

    writeCurrentViewToTop(view:string){
      (<TopBarElement>(<ShadowRoot>this.parentNode).host.previousElementSibling?.previousElementSibling).currentAutomatonViewTab = view.toLocaleUpperCase();
    }


    openTransitionErrorWindow(type: string, error: UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError, lastValid: string | number, id: number, toId?:number) {
        (<any>(<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.color = "white";
        (<any>(<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).openWindow = true;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).lastValid = lastValid;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorMessage = error.message;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorName = error.name;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorType = type;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorObjectId = id;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).invalidValue = error.invalidExpression;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).freeParameter = <number>toId;
    
      }

      openAssignmentErrorWindow(type: string, error: UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | ControlSignalExpressionVariableError, lastValid: string | number, id: number, toId:number|string) {
        (<any>(<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.color = "white";
        (<any>(<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).openWindow = true;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).lastValid = lastValid;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorMessage = error.message;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorName = error.name;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorType = type;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorObjectId = id;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).invalidValue = error.invalidExpression;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).freeParameter = toId;
    
      }

      openErrorWindow(type: string, error: DuplicateNameError | NameSyntaxError | NumberError, lastValid: string | number, id: number) {
        (<any>(<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.color = "white";
        (<any>(<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).openWindow = true;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).lastValid = lastValid;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorMessage = error.message;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorName = error.name;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorType = type;
        (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorObjectId = id;
        if ((<NameError>error).invalidName) {
            (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).invalidValue = (<NameError>error).invalidName;
        }
        else if ((<NumberError>error).invalidNumber){
            (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).invalidValue = (<NumberError>error).invalidNumber;
        }
    
      }

      



    addTransition() {
        let automatonId = this.currentNode.automatonId;
        let transStart = this.currentNode.nodeId;
        let transEnd: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("endId")).value;
        store.dispatch(AddTransition(automatonId, transStart, transEnd));
    }


    resetControlSignalEquation() {
        let customControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("customControlToSet")).value;
        store.dispatch(ResetControlSignal(this.currentNode.automatonName, this.currentNode.nodeId, customControlSignal));
    }


    setControlSignalEquation() {
        let customControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("customControlToSet")).value;
        let customControlSignalOnNode = (<HTMLInputElement>this.shadowRoot?.getElementById("equationSetControlSignalOnNode")).value;
        store.dispatch(SetControlSignal(this.currentNode.nodeId, customControlSignal, customControlSignalOnNode));
    }

    resetOutputOnNode() {
        let customOutputName = (<HTMLInputElement>this.shadowRoot?.getElementById("customOutToSet")).value;
        store.dispatch(Resetoutput(this.currentNode.nodeId, customOutputName));
    }


    setOutputOnNode() {
        let customOutputName = (<HTMLInputElement>this.shadowRoot?.getElementById("customOutToSet")).value;
        let customOutputOnNode = (<HTMLInputElement>this.shadowRoot?.getElementById("equationOutputOnNode")).value;
        store.dispatch(SetOutput(this.currentNode.nodeId, customOutputName, customOutputOnNode));
    }

    changeNodeNumber() {
        let number = +(<HTMLInputElement>this.shadowRoot?.getElementById("newNumber")).value;
        
        store.dispatch(ChangeNodeNumber(this.currentNode.nodeId, number))
        if(this.currentNode.initial){
          store.dispatch(SetInitialState(this.currentNode.automatonId,number))
        }
        
    }

    changeNodeName() {
      let name = (<HTMLInputElement>this.shadowRoot?.getElementById("newName")).value;
      store.dispatch(ChangeNodeName(this.currentNode.nodeId, name))
  }






    fillDropdown() {
        setTimeout(
            () => {
                let drop = this.shadowRoot?.getElementById("endId");
                if (drop) {
                    while (drop.firstChild) {
                        drop.removeChild(drop.firstChild)
                    }
                    this.currentNode.nodeList.forEach(currentNode => {
                        let node = document.createElement("option")
                        node.value = "" + currentNode.id
                        node.innerText = currentNode.names[0].validName;
                        node.style.fontSize = "15px";
                        drop?.appendChild(node);
                    });
                }
            }, 0);
    }



    openCustomizeWindow() {

        (<any>this.shadowRoot?.getElementById("node-dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
        (<any>this.shadowRoot?.getElementById("node-dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
        this.fillDropdown();


        this.fillTable();


        (<Dialog>this.shadowRoot?.getElementById("node-dialog")).open = true;

    }
    fillTable() {
        setTimeout(()=>{
        let table = this.shadowRoot?.getElementById("table");
        // (<GenericTableElement>table).topRow = ["Signal", "Belegung"];
        let tableList: TableInteractionEntry[] = [];

        this.currentNode.ctrlSignals.forEach((currentAssignment,index) => {
            if (currentAssignment.equation.error && !(currentAssignment.equation.error?.invalidExpression === currentAssignment.equation.validExpression)) {
                this.openAssignmentErrorWindow("CtrlAssignmentError", currentAssignment.equation.error, currentAssignment.equation.validExpression, this.currentNode.nodeId, currentAssignment.name);
              }
            let tableRowVals: TableBaseEntry = { id: this.currentNode.nodeId, name: currentAssignment.name, equation: currentAssignment.equation.validExpression }
            let tableRow: TableInteractionEntry = {
                id: tableRowVals.id,
                name: tableRowVals.name,
                equation: tableRowVals.equation,
                onCommitCb: (entry) => {
                     store.dispatch(SetControlSignal(entry.id, entry.name, entry.equation)); 
                    },
                onRejectCb: (entry) => { this.fillTable() },
                subLine: (entry) => {store.dispatch(RemoveControlSignal(this.currentNode.automatonId,entry.name)),this.fillTable()}
            };
            tableList.push(tableRow);
        });

        this.currentNode.outputs.forEach((currentAssignment,index) => {
            if (currentAssignment.equation.error && !(currentAssignment.equation.error?.invalidExpression === currentAssignment.equation.validExpression)) {
                this.openAssignmentErrorWindow("OutputAssignmentError", currentAssignment.equation.error, currentAssignment.equation.validExpression, this.currentNode.nodeId, currentAssignment.name);
              }
            let tableRowVals: TableBaseEntry = { 
                id: this.currentNode.nodeId, 
                name: currentAssignment.name, 
                equation: currentAssignment.equation.validExpression }
            let tableRow: TableInteractionEntry = {
                id: tableRowVals.id,
                name: tableRowVals.name,
                equation: tableRowVals.equation,
                onCommitCb: (entry) => {
                     store.dispatch(SetOutput(entry.id, entry.name, entry.equation)); 
                    },
                onRejectCb: (entry) => { this.fillTable() },
                subLine: (entry) => {store.dispatch(RemoveGlobalOutput(entry.name)),this.fillTable()}
            };
            tableList.push(tableRow);
        });

        

        let tableMeta: TableMeta = {
            addLine: () => {store.dispatch(AddGlobalOutput()), this.fillTable()}
          };
          
        (<GenericTableElement>table).entryList = tableList;
        (<GenericTableElement>table).metaFunctions = tableMeta;
    },10);
    }


    /**
     * Methode, die ein Bezier Element erzeugtund dieses dem HTML hinzufuegt
     */
    makeBeziers(trans: ApiTransitions) {
        if (trans.condition.error && !(trans.condition.error?.invalidExpression === trans.condition.validExpression)) {
            this.openTransitionErrorWindow("TransitionError",trans.condition.error, trans.condition.validExpression, trans.fromNodeId, trans.toNodeId);
          }
        setTimeout(
            () => {
                let bezierElement = this.shadowRoot?.getElementById("trans" + trans.id);
                (<BezierSVGElement>bezierElement).initMouseevents();
                (<BezierSVGElement>bezierElement).initValues();
                (<BezierSVGElement>bezierElement).initSVGCanvas();
                (<BezierSVGElement>bezierElement).initDemo();
            }, 0);

    }

    ////////////////////////////////////////////////////////////////////


    /**
     * Funktion, die beim ablegen eines Elements die Koordinaten eines Zustands anpasst
     * @param e Event, dass beim ablegen eines Elements ausgeloest wird
     */
    atDrop(e: MouseEvent) {
        //Entnehmen des aktiven Elements
        const draggableElement = this.dragNode;
        //Falls dieses ein drag Zustand ist...
        if (draggableElement.id === "drag") {
            //...Anpassen der Koordinaten im State
            let ycord = e.clientY - this.offsetTop + window.scrollY - DEFAULT_NODE_RADIUS;
            let xcord = e.clientX - DEFAULT_NODE_RADIUS;
            let stateID = Number((<BTest>draggableElement).nodeId);
            let position = createPoint(xcord, ycord)
            // console.log(draggableElement.parentElement)
            let automId:number = + String(draggableElement.parentElement?.id);
            if(this.currentAutomView==="working-automaton"){
              // console.log(1)
              store.dispatch(SetNodeCords(stateID, position));
            }
            else if(this.currentAutomView==="merged-automaton"){
              // console.log(automId)
              store.dispatch(SetDerivedViewStateCords(DerivedAutomatonViews.MergedAutomaton,automId, stateID, position));
            }
            else if(this.currentAutomView==="hardware-automaton"){
              // console.log(automId)
              store.dispatch(SetDerivedViewStateCords(DerivedAutomatonViews.HardwareAutomaton,automId, stateID, position));
            }
        }

    }
}
declare global {
    interface HTMLElementTagNameMap {
        'graph-viewer': GraphViewer;
    }
}













// scrolledFunction() {
//   console.log(this.shadowRoot?.querySelectorAll("bezier-svg-element"));
//   let svgs = this.shadowRoot?.querySelectorAll("bezier-svg-element");
//   svgs?.forEach((currentSVG) => {
//     currentSVG.shadowRoot?.getElementById("mid")?.dispatchEvent(new Event('mousedown'));
//     currentSVG.dispatchEvent(new Event('mouseup'));
//     // currentSVG.dispatchEvent(new Event('resize'));
    
//   });
  
// }