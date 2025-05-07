import { TextField } from '@material/mwc-textfield';
import { LitElement, html, customElement, css, property } from 'lit-element';
import { connect } from 'pwa-helpers';
import { ChangeTransitionMatrixEntry, ExpandTransitionMatrix, SetControlSignal, SetOutput, ShrinkTransitionMatrix } from './actioncreator/editorState';
import { ApiAutomatonSelector, AutomatonSelector, FullApiSystemAssignmentSelector } from './selectors/normalizedEditorStateSelectors';
import { store } from './store/configureStore';
import { ApiAutomaton } from './types/ApiClasses/GraphRepresentation/Automaton';
import { ApiTransitions } from './types/ApiClasses/GraphRepresentation/Transitions';
import { ApiNode } from './types/Node';
import { AppState } from './types/NormalizedState/AppState';
import { MetaState } from './types/NormalizedState/MetaState';
import "@material/mwc-icon-button";

import { LanguageIdentifier, registerTranslateConfig, Strings, use,translate } from 'lit-translate';
import {get as translateGet} from 'lit-translate';
import { ErrorWindow } from './errorWindow';
import { UnknownVariableInExpressionError, OutputVariableInExpressionError, ExpressionSyntaxError, TransitionExpressionVariableError, OwnControlSignalsExpressionError, NameError, NumberError } from './types/Error';
import { doChangeLanguage } from './actioncreator/viewConfig';
import { ApiFullSystemAssignment } from './types/ApiClasses/SystemAssignment';
import { Automaton } from './types/Automaton';

@customElement('transition-matrix')
export class transitionMatrixElement extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      padding-top:20px;
      max-width: 100%;
      max-height: 100%;
      background-color: white;
    }
    * {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
}

body {
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
}

table {
  display: grid;
  border-collapse: collapse;
  min-width: 97%;
  /* grid-template-columns: 
    minmax(150px, 1fr)
    minmax(150px, 1.67fr)
    minmax(150px, 1.67fr)
    minmax(150px, 1.67fr)
    minmax(150px, 1.67fr) */
}

thead,
tbody,
tr {
  display: contents;
}

th,
td {
  padding: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

th {
  position: sticky;
  top: 0;
  background: #343E48;
  text-align: center;
  font-weight: normal;
  font-size: 1.1rem;
  color: white;
}


th:last-child {
  border: 0;
}

td {
  padding-top: 10px;
  padding-bottom: 10px;
  color: black;
  background: whitesmoke;
  border-right: solid 2px #343E48;
}

tr:nth-child(even) td {
  background: #4f5d6e;
  color: white;
}


.mdc-elevation-overlay {
  position: absolute;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  /* @alternate */
  opacity: var(--mdc-elevation-overlay-opacity, 0);
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #fff;
  /* @alternate */
  background-color: var(--mdc-elevation-overlay-color, #fff);
}

.mdc-card {
  border-radius: 4px;
  /* @alternate */
  border-radius: var(--mdc-shape-medium, 4px);
  background-color: #fff;
  /* @alternate */
  background-color: var(--mdc-theme-surface, #fff);
  /* @alternate */
  position: relative;
  /* @alternate */
  box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.mdc-card .mdc-elevation-overlay {
  width: 100%;
  height: 100%;
  top: 0;
  /* @noflip */
  left: 0;
}
.mdc-card::after {
  border-radius: 4px;
  /* @alternate */
  border-radius: var(--mdc-shape-medium, 4px);
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
  pointer-events: none;
}
.autom-name-card{
    padding: 16px;
    margin-top: 32px;
    margin-right: 32px;
    background-color: #343E48;
    color: white;
}
.card-body{
    padding-left:32px;
    margin-top:32px;
    margin-right:1.25%;
    margin-left:1.25%;
    background-color: #4f5d6e;
    float:left; 
}


.table-card{
    padding: 2px;
    padding-right:0px;
    background-color: #343E48;
    color: white;
    margin-top: 16px;
    margin-right: 32px;
    margin-bottom: 32px;
}

input[type=text]{
  border:0px;
  background:inherit;
  color:inherit;
  padding:0px;
  font-size:inherit;
  size:inherit;
}

input[type=text]:focus {
  border:0px;
  color:inherit;
  background:inherit;
  outline: none;
  width:100%;
  height:100%;
}


mwc-button[raised] {
  --mdc-theme-primary: #black;
  --mdc-theme-on-primary: #white;
}

mwc-button, /* don't forget about flat */
mwc-button[outlined] {
  --mdc-theme-primary: #black;
}


.bottom-block {
  margin-left: 51%;
  opacity: 0.4;
  bottom: 34px;
  border-radius: 50%;
  position:relative;
  border: none;
  background-color: #4f5d6e;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  display:inline-block;
  transform: translate(17.5px, -50px);
}
.bottom-block:hover {
  opacity:0.7;
}

.top-block {
  margin-left: 51%;
  opacity: 0.4;
  position:relative;
  border-radius: 50%;
  border: none;
  background-color: #4f5d6e;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  display:inline-block;
  transform: translate(17.5px, -387px);
}
.top-block:hover {
  opacity:0.7;
}

.right-block {
  opacity: 0.4;
  right: 34px;
  position:relative;
  border-radius: 50%;
  border: none;
  background-color: #4f5d6e;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  display:inline-block;
  transform: translate(750px, -260px);
}
.right-block:hover {
  opacity:0.7;
}

.left-block {
  opacity: 0.4;
  border-radius: 50%;
  position:relative;
  border: none;
  background-color: #4f5d6e;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  display:inline-block;
  transform: translate(-835px, -260px);
}
.left-block:hover {
  opacity:0.7;
}
.autom{
  text-align: center;
  display:none;
}



.active, .collapsible:hover {
  background-color: #ccc;
}

.content {
  padding: 0 18px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;

.collapsible {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}
`;


  /**
       * Liste der aktiven Automaten
       */
  @property({ type: Array }) activeAutomatonList: Array<ApiAutomaton>;

  @property({ type: Array }) automatons: Array<Automaton>;

  @property({ type: Array }) xScroll: Array<number> = [];

  @property({ type: Array }) yScroll: Array<number> = [];

  @property({ type: Array }) xOutScroll: Array<number> = [];

  @property({ type: Array }) yOutScroll: Array<number> = [];

  @property({ type: Array }) xControlScroll: Array<number> = [];

  @property({ type: Array }) yControlScroll: Array<number> = [];

  @property({ type: Boolean}) changed: boolean = false;

  @property({ type: ApiFullSystemAssignment }) assignments: ApiFullSystemAssignment;

  stateChanged(state: MetaState) {
    this.activeAutomatonList = ApiAutomatonSelector(state.appState);
    // console.log(this.activeAutomatonList);
    this.prepareScroll();
    this.createTable()
    this.assignments = FullApiSystemAssignmentSelector(state.appState.normalizedEditorState);

    this.automatons = AutomatonSelector(state.appState.normalizedEditorState);
  }



  prepareScroll() {
    length=this.activeAutomatonList.length;
    if(this.xScroll != undefined){
      if(this.xScroll.length != length){
        this.xScroll = new Array(length).fill(0)
      }
    }
    
    if(this.yScroll != undefined){
      if(this.yScroll.length != length){
        this.yScroll = new Array(length).fill(0)
      }
    }

    if(this.xOutScroll != undefined){
      if(this.xOutScroll.length != length){
        this.xOutScroll = new Array(length).fill(0)
      }
    }
    
    if(this.yOutScroll != undefined){
      if(this.yOutScroll.length != length){
        this.yOutScroll = new Array(length).fill(0)
      }
    }

    if(this.xControlScroll != undefined){
      if(this.xControlScroll.length != length){
        this.xControlScroll = new Array(length).fill(0)
      }
    }
    
    if(this.yControlScroll != undefined){
      if(this.yControlScroll.length != length){
        this.yControlScroll = new Array(length).fill(0)
      }
    }
  }


  render() {
    return html`
    <div id="tableholder">
       ${this.activeAutomatonList.map((autom,i,arr)=>
        html`
        <br>
        <div class="mdc-card card-body" style="min-width:98.5%;max-width:98.5%">
        <div class="mdc-card autom-name-card" style="display:grid;border-collapse:collapse;grid-template-columns:5fr 50px 50px;min-width:97%">
        <h2 style="margin:0px">${autom.name.validName}</h2>
        <mwc-icon-button title=${translate("matrix.add")} icon="add" style="width:25px;margin-top:-30%" @click=${()=>{store.dispatch(ExpandTransitionMatrix(autom.id))}}></mwc-icon-button>
        <mwc-icon-button title=${translate("matrix.sub")} icon="remove" style="width:25px;margin-top:-30%" @click=${()=>{store.dispatch(ShrinkTransitionMatrix(autom.nodes[autom.nodes.length-1].id))}}></mwc-icon-button>
      </div>

      <!-- Erste Matrix -->
      <button type="button" class="mdc-card autom-name-card collapsible" @click=${(e)=>(((e.target).nextElementSibling.style.maxHeight)?(e.target).nextElementSibling.style.maxHeight = null : (e.target).nextElementSibling.style.maxHeight =  "440px")}>
      <h2 style="margin-top:4px; margin-bottom:4px">${translate('matrix.tmatrix')}</h2></button>
<div class="content">

          
        <div class="mdc-card table-card" style="max-width:90.5vw;max-height:55vh">
        <table @wheel=${(e)=>(this.scrollMatrixByWheel(i,e,autom))}
        id=${"autom"+autom.id} style="grid-template-columns:minmax(150px, 150px) repeat(${autom.nodes.slice(this.xScroll[i], this.xScroll[i]+6).length},minmax(150px, 1.67fr)); width:100%">
        
        <!-- TopRow -->
        <thead>
          <tr><th>${translate('matrix.from')}${"\\"}${translate('matrix.to')}</th>
          ${autom.nodes.slice(this.xScroll[i], this.xScroll[i]+6).map((node,j,nodeArr)=>
            html`
            <th @mouseover=${(e)=>((e.target).firstElementChild.style.display="block")} @mouseout=${(e)=>((e.target).firstElementChild.style.display="none")}>
            ${node.names[0].validName}
            <div class="autom" id="autom">
              <br style="display:none">
            ${node.customStateNumber.validNumber}
            <br>
            ${"0x"+node.customStateNumber.validNumber.toString(16)}
            <br>
            ${"0b"+node.customStateNumber.validNumber.toString(2)}
            </div>
              
          </th>`
            )}
        </tr></thead>

        <!-- Table Body -->
        ${autom.nodes.slice(this.yScroll[i],this.yScroll[i]+6).map((node,j,nodeArr)=>html`
          <tr id=${node.id}>
            <th @mouseover=${(e)=>((e.target).firstElementChild.style.display="block")} @mouseout=${(e)=>((e.target).firstElementChild.style.display="none")}>
            ${node.names[0].validName}
            <div class="autom" id="autom">
              <br style="display:none">
              ${node.customStateNumber.validNumber}
              <br>
              ${"0x"+node.customStateNumber.validNumber.toString(16)}
              <br>
              ${"0b"+node.customStateNumber.validNumber.toString(2)}
              </div>
              
            </th>
            ${autom.nodes.slice(this.xScroll[i],this.xScroll[i]+6).map((nextNode,k,nextNodeArr)=>html`
              <td id=${nextNode.id}><input title="" style="width:100%; height:100%;text-overflow: ellipsis;" type="text" @change=${(e:Event)=>this.changeEntry(node.id,nextNode.id,(<HTMLInputElement>e.target).value)}></td>
            `)}
        </tr>
        `)}
        
       </table>
       
          </div>
          <mwc-icon-button icon="expand_more" style="visibility:${(autom.nodes.length>6 && !(this.yScroll[i]==autom.nodes.length-6))? "visible" : "hidden"}" class="bottom-block" @click=${()=>{this.yScroll[i]>=autom.nodes.length-6? this.yScroll[i]=this.yScroll[i] : this.yScroll[i]++; this.createTable();this.doChange()}}></mwc-icon-button>
          <mwc-icon-button icon="expand_less" type="button" style="visibility:${(autom.nodes.length>6 && !(this.yScroll[i]==0))? "visible" : "hidden"}" class="top-block" @click=${()=>{this.yScroll[i]==0? this.yScroll[i]=0 : this.yScroll[i]--; this.createTable();this.doChange()}}></mwc-icon-button>

          <mwc-icon-button icon="navigate_next" type="button" style="visibility:${(autom.nodes.length>6 && !(this.xScroll[i]==autom.nodes.length-6))? "visible" : "hidden"}" class="right-block" @click=${()=>{this.xScroll[i]>=autom.nodes.length-6? this.xScroll[i]=this.xScroll[i] : this.xScroll[i]++; this.createTable();this.doChange()}}></mwc-icon-button>
          <mwc-icon-button icon="chevron_left" type="button" style="visibility:${(autom.nodes.length>6 && !(this.xScroll[i]==0))? "visible" : "hidden"}" class="left-block" @click=${()=>{this.xScroll[i]==0? this.xScroll[i]=0 : this.xScroll[i]--; this.createTable();this.doChange()}}></mwc-icon-button>

       </div>
       


       <!-- Zweite Matrix -->

       <button type="button" class="mdc-card autom-name-card collapsible" @click=${(e)=>(((e.target).nextElementSibling.style.maxHeight)?(e.target).nextElementSibling.style.maxHeight = null : (e.target).nextElementSibling.style.maxHeight =  "440px")}>
       <h2 style="margin-top:4px; margin-bottom:4px">${translate('matrix.omatrix')}</h2></button>
        <div class="content">

        <div class="mdc-card table-card" style="max-width:90.5vw;max-height:55vh">
        <table @wheel=${(e)=>(this.scrollOutMatrixByWheel(i,e,autom))} id=${"automoutputs"+autom.id} style="grid-template-columns:minmax(150px, 150px) repeat(${this.assignments.outputAssignment.slice(this.xOutScroll[i], this.xOutScroll[i]+6).length},minmax(150px, 1.67fr)); width:100%">
        
        <!-- TopRow -->
        <thead id="head"><tr><th>${"Zustände"}${"\\"}${"Outputs"}</th>
          ${this.assignments.outputAssignment.slice(this.xOutScroll[i], this.xOutScroll[i]+6).map((out,j,nodeArr)=>
            html`
            <th>
            ${out.name}
          </th>`
            )}
        </tr></thead>

        <!-- Table Body -->
        ${autom.nodes.slice(this.yOutScroll[i],this.yOutScroll[i]+6).map((node,j,nodeArr)=>html`
          <tr id=${node.id}>
            <th @mouseover=${(e)=>((e.target).firstElementChild.style.display="block")} @mouseout=${(e)=>((e.target).firstElementChild.style.display="none")}>
            ${node.names[0].validName}
            <div class="autom" id="autom">
              <br style="display:none">
              ${node.customStateNumber.validNumber}
              <br>
              ${"0x"+node.customStateNumber.validNumber.toString(16)}
              <br>
              ${"0b"+node.customStateNumber.validNumber.toString(2)}
              </div>
              
            </th>
            ${this.assignments.outputAssignment.slice(this.xOutScroll[i],this.xOutScroll[i]+6).map((out,k,nextNodeArr)=>html`
              <td id=${out.name}><input title="" style="width:100%; height:100%;text-overflow: ellipsis;" type="text" @change=${(e:Event)=>store.dispatch(SetOutput(node.id,out.name,(<HTMLInputElement>(e.target)).value))}></td>
            `)}
        </tr>
        `)}
       </table>
          </div>

          <mwc-icon-button icon="expand_more" style="visibility:${(autom.nodes.length>6 && !(this.yOutScroll[i]==autom.nodes.length-6))? "visible" : "hidden"}" class="bottom-block" @click=${()=>{this.yOutScroll[i]>=autom.nodes.length-6? this.yOutScroll[i]=this.yOutScroll[i] : this.yOutScroll[i]++; this.createTable();this.doChange()}}></mwc-icon-button>
          <mwc-icon-button icon="expand_less" type="button" style="visibility:${(autom.nodes.length>6 && !(this.yOutScroll[i]==0))? "visible" : "hidden"}" class="top-block" @click=${()=>{this.yOutScroll[i]==0? this.yOutScroll[i]=0 : this.yOutScroll[i]--; this.createTable();this.doChange()}}></mwc-icon-button>

          <mwc-icon-button icon="navigate_next" type="button" style="visibility:${(this.assignments.outputAssignment.length>6 && !(this.xOutScroll[i]==this.assignments.outputAssignment.length-6))? "visible" : "hidden"}" class="right-block" @click=${()=>{this.xOutScroll[i]>=this.assignments.outputAssignment.length-6? this.xOutScroll[i]=this.xOutScroll[i] : this.xOutScroll[i]++; this.createTable();this.doChange()}}></mwc-icon-button>
          <mwc-icon-button icon="chevron_left" type="button" style="visibility:${(this.assignments.outputAssignment.length>6 && !(this.xOutScroll[i]==0))? "visible" : "hidden"}" class="left-block" @click=${()=>{this.xOutScroll[i]==0? this.xOutScroll[i]=0 : this.xOutScroll[i]--; this.createTable();this.doChange()}}></mwc-icon-button>
       </div>





       <!-- Dritte Matrix -->

       <button type="button" class="mdc-card autom-name-card collapsible" @click=${(e)=>(((e.target).nextElementSibling.style.maxHeight)?(e.target).nextElementSibling.style.maxHeight = null : (e.target).nextElementSibling.style.maxHeight = "440px")}>
       <h2 style="margin-top:4px; margin-bottom:4px">${translate('matrix.cmatrix')}</h2></button>
        <div class="content">

        <div class="mdc-card table-card" style="max-width:90.5vw;max-height:55vh">
        <table id=${"automcontrols"+autom.id} style="grid-template-columns:minmax(150px, 150px) repeat(${this.automatons[i].controlSignals.slice(this.xControlScroll[i], this.xControlScroll[i]+6).length},minmax(150px, 1.67fr)); width:100%">
        
        <!-- TopRow -->
        <thead id="head"><tr><th>${"Zustände"}${"\\"}${"Kontrollsignale"}</th>
          ${this.automatons[i].controlSignals.slice(this.xControlScroll[i], this.xControlScroll[i]+6).map((out,j,nodeArr)=>
            html`
            <th>
            ${out.customName.validName}
          </th>`
            )}
        </tr></thead>

        <!-- Table Body -->
        ${autom.nodes.slice(this.yControlScroll[i],this.yControlScroll[i]+6).map((node,j,nodeArr)=>html`
          <tr id=${node.id}>
            <th @mouseover=${(e)=>((e.target).firstElementChild.style.display="block")} @mouseout=${(e)=>((e.target).firstElementChild.style.display="none")}>
            ${node.names[0].validName}
            <div class="autom" id="autom">
              <br style="display:none">
              ${node.customStateNumber.validNumber}
              <br>
              ${"0x"+node.customStateNumber.validNumber.toString(16)}
              <br>
              ${"0b"+node.customStateNumber.validNumber.toString(2)}
              </div>
              
            </th>
            ${this.automatons[i].controlSignals.slice(this.xControlScroll[i],this.xControlScroll[i]+6).map((out,k,nextNodeArr)=>html`
              <td id=${out.customName.validName}><input title="" style="width:100%; height:100%;text-overflow: ellipsis;" type="text" @change=${(e:Event)=>store.dispatch(SetControlSignal(node.id,out.customName.validName,(<HTMLInputElement>(e.target)).value))}></td> 
            `)}
        </tr>
        `)}
       </table>
          </div>

          <mwc-icon-button icon="expand_more" style="visibility:${(autom.nodes.length>6 && !(this.yControlScroll[i]==autom.nodes.length-6))? "visible" : "hidden"}" class="bottom-block" @click=${()=>{this.yControlScroll[i]>=autom.nodes.length-6? this.yControlScroll[i]=this.yControlScroll[i] : this.yControlScroll[i]++; this.createTable();this.doChange()}}></mwc-icon-button>
          <mwc-icon-button icon="expand_less" type="button" style="visibility:${(autom.nodes.length>6 && !(this.yControlScroll[i]==0))? "visible" : "hidden"}" class="top-block" @click=${()=>{this.yControlScroll[i]==0? this.yControlScroll[i]=0 : this.yControlScroll[i]--; this.createTable();this.doChange()}}></mwc-icon-button>

          <mwc-icon-button icon="navigate_next" type="button" style="visibility:${(this.automatons[i].controlSignals.length>6 && !(this.xControlScroll[i]==this.automatons[i].controlSignals.length-6))? "visible" : "hidden"}" class="right-block" @click=${()=>{this.xControlScroll[i]>=this.automatons[i].controlSignals.length-6? this.xControlScroll[i]=this.xControlScroll[i] : this.xControlScroll[i]++; this.createTable();this.doChange()}}></mwc-icon-button>
          <mwc-icon-button icon="chevron_left" type="button" style="visibility:${(this.automatons[i].controlSignals.length>6 && !(this.xControlScroll[i]==0))? "visible" : "hidden"}" class="left-block" @click=${()=>{this.xControlScroll[i]==0? this.xControlScroll[i]=0 : this.xControlScroll[i]--; this.createTable();this.doChange()}}></mwc-icon-button>
       </div>





       <div style="height:32px"></div>
       </div>
       
       </div>

       `)}
       
</div>
<script>this.createTable()</script>
    `;
  }



  scrollOutMatrixByWheel(automId: number, event: WheelEvent, autom:any) {
    event.preventDefault();
    // console.log(event)
    if(!event.ctrlKey){
      if(event.deltaY<0){
        this.yOutScroll[automId]==0? this.yOutScroll[automId]=0 : this.yOutScroll[automId]--;
      }else{
        this.yOutScroll[automId]>=autom.nodes.length-6? this.yOutScroll[automId]=this.yOutScroll[automId] : this.yOutScroll[automId]++;
      }
    }
    else{
      if(event.deltaY<0){
        this.xOutScroll[automId]==0? this.xOutScroll[automId]=0 : this.xOutScroll[automId]--;
      }else{
        this.xOutScroll[automId]>=this.assignments.outputAssignment.length-6? this.xOutScroll[automId]=this.xOutScroll[automId] : this.xOutScroll[automId]++;
      }
    }
    this.createTable();
    this.doChange()
  }

  scrollControlMatrixByWheel(automId: number, event: WheelEvent, autom:any) {
    event.preventDefault();
    //console.log(event)
    if(!event.ctrlKey){
      if(event.deltaY<0){
        this.yControlScroll[automId]==0? this.yControlScroll[automId]=0 : this.yControlScroll[automId]--;
      }else{
        this.yControlScroll[automId]>=autom.nodes.length-6? this.yControlScroll[automId]=this.yControlScroll[automId] : this.yControlScroll[automId]++;
      }
    }
    else{
      if(event.deltaY<0){
        this.xControlScroll[automId]==0? this.xControlScroll[automId]=0 : this.xControlScroll[automId]--;
      }else{
        this.xControlScroll[automId]>=this.automatons[automId].controlSignals.length-6? this.xControlScroll[automId]=this.xControlScroll[automId] : this.xControlScroll[automId]++;
      }
    }
    this.createTable();
    this.doChange()
  }

  scrollMatrixByWheel(automId: number, event: WheelEvent, autom:any) {
    event.preventDefault();
    if(!event.ctrlKey){
      if(event.deltaY<0){
        this.yScroll[automId]==0? this.yScroll[automId]=0 : this.yScroll[automId]--;
      }else{
        this.yScroll[automId]>=autom.nodes.length-6? this.yScroll[automId]=this.yScroll[automId] : this.yScroll[automId]++;
      }
    }
    else{
      if(event.deltaY<0){
        this.xScroll[automId]==0? this.xScroll[automId]=0 : this.xScroll[automId]--;
      }else{
        this.xScroll[automId]>=autom.nodes.length-6? this.xScroll[automId]=this.xScroll[automId] : this.xScroll[automId]++;
      }
    }
    this.createTable();
    this.doChange()
  }



  doChange(){
    this.changed = !this.changed;
  }
    

  createTable() {
    
    setTimeout(
      () => {

        let allCells=this.shadowRoot?.querySelectorAll("td");
        allCells?.forEach((currentCell: HTMLElement)=>{
          (<HTMLInputElement>currentCell.firstChild).value="";
        });



        //Aufbauen der Grundtabelle mit dem Kopf fuer jeden aktiven Automaten
        this.activeAutomatonList.forEach((currentAutomaton: ApiAutomaton) => {
          //Fuellen der Tabelle mit den Transitionskonditionen

          let table:HTMLElement=<HTMLElement>this.shadowRoot?.getElementById("autom"+currentAutomaton.id);

          let transitions = currentAutomaton.transitions;
          transitions.forEach((currentTransition: ApiTransitions) => {
            let currentStartId = currentTransition.fromNodeId;
            let currentEndId = currentTransition.toNodeId;
            if (currentTransition.condition.error && !(currentTransition.condition.error?.invalidExpression === currentTransition.condition.validExpression)) {
              this.openErrorWindow("TransitionError",currentTransition.condition.error, currentTransition.condition.validExpression, currentTransition.fromNodeId, currentTransition.toNodeId);
            }

            //
            let currentCondition = currentTransition.condition.validExpression;
            let tableRow;
            for(let i= 0; i<table.children.length ; i++){
              let Id:number = +<String>table.children.item(i)?.id;
              if(Id === currentStartId){
                tableRow = table.children.item(i);
              }
            }
            let childElements = tableRow?.children;
            if (childElements) {
              let matrixCell;
              for(let i= 0; i<childElements.length ; i++){
                let Id:number = +<String>childElements.item(i)?.id;
                if(Id === currentEndId){
                  matrixCell = childElements[i];
                }
              }
              
              if((<TextField>matrixCell?.firstChild)){
                (<TextField>(<any><unknown>matrixCell).firstChild).title = currentCondition;
                (<TextField>(<any><unknown>matrixCell).firstChild).value = currentCondition;
              }
            }
          });

          

          //Zweite Tabelle fuellen

          table=<HTMLElement>this.shadowRoot?.getElementById("automoutputs"+currentAutomaton.id);

          currentAutomaton.nodes.forEach((currentNode:ApiNode)=>{
            let tableRow:HTMLTableRowElement;
            for(let i= 0; i<table.children.length ; i++){
              let Id:number = +<String>table.children.item(i)?.id;
              if(Id === currentNode.id){
                tableRow = <HTMLTableRowElement>table.children.item(i);
                currentNode.outputAssignment.forEach((currentOut)=>{
                  let outname = currentOut.name
                  for(let k=0; k<tableRow.children.length; k++){
                    let currentCell = tableRow.children[k];
                    if(currentCell.id === outname){
                      (<TextField>(<any><unknown>currentCell).firstChild).title = currentOut.equation.validExpression;
                      (<TextField>(<any><unknown>currentCell).firstChild).value = currentOut.equation.validExpression;
                    }
                  }
                })
              }
            }

          })


          //Dritte Tabelle fuellen

          table=<HTMLElement>this.shadowRoot?.getElementById("automcontrols"+currentAutomaton.id);

          currentAutomaton.nodes.forEach((currentNode:ApiNode)=>{
            let tableRow:HTMLTableRowElement;
            for(let i= 0; i<table.children.length ; i++){
              let Id:number = +<String>table.children.item(i)?.id;
              if(Id === currentNode.id){
                tableRow = <HTMLTableRowElement>table.children.item(i);
                currentNode.controlSignalAssignment.forEach((currentOut)=>{
                  let outname = currentOut.name
                  for(let k=0; k<tableRow.children.length; k++){
                    let currentCell = tableRow.children[k];
                    if(currentCell.id === outname){
                      (<TextField>(<any><unknown>currentCell).firstChild).title = currentOut.equation.validExpression;
                      (<TextField>(<any><unknown>currentCell).firstChild).value = currentOut.equation.validExpression;
                    }
                  }
                })
              }
            }

          })


        });





      }, 10);




  }



  openErrorWindow(type: string, error: UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError, lastValid: string | number, id: number, toId:number) {
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).openWindow = true;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).lastValid = lastValid;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorMessage = error.message;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorName = error.name;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorType = type;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).errorObjectId = id;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).invalidValue = error.invalidExpression;
    (<ErrorWindow>(<any>this.parentNode).host.shadowRoot?.querySelector(".errorWindow")).freeParameter = toId;

  }



  changeEntry(fromId:number,toId:number,condition:string){
    store.dispatch(ChangeTransitionMatrixEntry(fromId,toId,condition));
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'transition-matrix': transitionMatrixElement;
  }
}