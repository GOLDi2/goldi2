import { LitElement, html, property, customElement, TemplateResult, css, CSSResult } from "lit-element";

import { connect } from "pwa-helpers";
import { store } from './store/configureStore';
import "@material/mwc-top-app-bar-fixed";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";
import "@material/mwc-button";

import { AddActiveAutomaton, AddControlSignal, AddNode, ChangeAutomatonName, ChangeControlSignalName, ChangeNodeName, ChangeNodeNumber, ChangeView, NewAutomaton, RemoveActiveAutomaton, RemoveAutomaton, RemoveControlSignal, RemoveNode, SetAutomatonInfo } from './actioncreator/editorState';
import { Viewstate } from "./types/view";
import { AppState } from "./types/NormalizedState/AppState";
import { MetaState } from "./types/NormalizedState/MetaState";
import { ApiAutomatonSelector, AutomatonSelector, EquationSetSelector } from "./selectors/normalizedEditorStateSelectors";
import { ApiAutomatonEquationSet } from "./types/ApiClasses/Equation";
import { ControlSignalExpressionVariableError, DuplicateNameError, NameError, NameSyntaxError, NumberError } from "./types/Error";
import { Automaton } from "./types/Automaton";
import { Dialog } from "@material/mwc-dialog";

import { LanguageIdentifier, registerTranslateConfig, Strings, use, translate } from 'lit-translate';
import { ControlSignal } from "./types/ControlSignal";
import { GenericTableElement, TableBaseEntry, TableInteractionEntry, TableMeta } from "./GeneralTableElement";
import { ApiNode, Node } from "./types/Node";
import { ErrorWindow } from "./errorWindow";
import { ApiAutomaton } from "./types/ApiClasses/GraphRepresentation/Automaton";


@customElement("side-bar-element")
export class SideBarElement extends connect(store)(LitElement) {
  

  constructor() {
    super();
  }

  /**
     * Liste der Automatennamen
     */
  @property({ type: Array }) automatonList: Array<[name: string, id: number, active: boolean, info: string, controlSignals: Array<ControlSignal>]>;
  @property({ type: Boolean }) shown: boolean;
  @property({ type: Number }) lastAutomIndex: number;
  @property({ type: Array }) nodeList: Array<[id: number, nodes: ApiNode[]]>;
  @property({ type: Boolean}) currentAutomatonActive: boolean;

  stateChanged(state: MetaState) {

    //Namen der Automaten entnehmen
    let automatons = AutomatonSelector(state.appState.normalizedEditorState);
    let apiAutomatons = ApiAutomatonSelector(state.appState)
    var arr_names: [string, number, boolean, string, Array<ControlSignal>][] = new Array(automatons.length)
    var arrNodes: [number, any][] = new Array(automatons.length)
    automatons.forEach((val: Automaton, index: number) => {
      if (val.name.error && !(val.name.error?.invalidName == "" || val.name.error?.invalidName === val.name.validName)) {
        this.openErrorWindow("AutomatonNameError", val.name.error, val.name.validName, val.id);
      }
      arr_names[index] = [val.name.validName, val.id, val.isActive, val.info, val.controlSignals];
    });



    apiAutomatons.forEach((val: ApiAutomaton, index: number) => {
      arrNodes[index] = [val.id, val.nodes];
    });

    this.nodeList = arrNodes;
    this.automatonList = arr_names;

    //Füllen der linken bar
    // this.fillAutomatons();

    // this.fillTables(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);

  }


  static get styles(): CSSResult {
    return css`
      :host {
        position: fixed;
        left: 0;
        top: 64;
        z-index: 4;
        background:#4f5d6e;
        border-top:solid 1px #343E48;
      }
      @media print {
        :host {
          display:none
        }
    }
      mwc-top-app-bar-fixed {
        --mdc-theme-primary: #4f5d6e;
      }
      mwc-tab {
        --mdc-theme-primary: white;
      }  
      #left-bar-holder{
        display: grid;
  border-collapse: collapse;
  grid-template-columns: 
    50px
    90px
    40px
    40px;
    grid-auto-rows: 50px;
    padding-left:0px;
      }
      mwc-button {
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
  padding-top:10px;
}
mwc-textfield{
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
  max-width: 200px
}
mwc-dialog{
  --mdc-dialog-max-width:100%;
}
.automGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 50px 50px 50px 40px;
}
.signalGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 250px 250px;
  grid-auto-rows: 40px 40px 30px 40px 50px 40px 30px 40px;
}
    /* mwc-button .mdc-button:not(:disabled) {
    background-color: red;
    height: 30px; */
/* } */

.tableGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 1fr 1fr;
}
    `;
  }



  @property({ type: Number }) currentAutomatonId: number;


  render(): TemplateResult {
    if (this.shown) {
      // this.fillAutomatons();
      return html` <style></style>
        <mwc-dialog id="automaton-dialog" style="min-width: 75%" scrimClickAction="" heading="${translate('pop-ups.automaton.header-edit')}">
<mwc-button
      slot="primaryAction"
      @click=${() => (this.currentAutomatonActive? this.closeAutomWindow() : (store.dispatch(RemoveActiveAutomaton(this.currentAutomatonId)), this.closeAutomWindow()))}>
      ${translate('pop-ups.close')}
  </mwc-button>
  <br>
  <div class="automGrid">
  <label style="padding-top:8px;">${translate('pop-ups.automaton.name')}</label>
<mwc-textfield style="max-width:200px; height:40px" outlined id="customName"></mwc-textfield>
  

</div>

<div class="tableGrid">
<div style="overflow-x: hidden;overflow-y:auto;max-height:40vh;min-height:340px">
<generic-table-element id="signalTable" headerSignal="${translate('sideBar.matrix.newSignalName')}" headerName="${translate('sideBar.matrix.signalName')}" buttonOffset=176></generic-table-element>
</div>

<div style="overflow-x: hidden;overflow-y:auto;max-height:40vh;min-height:340px">
<generic-table-element  id="nodeNameTable" headerName="${translate('sideBar.matrix.name')}" headerSignal="${translate('sideBar.matrix.newName')}" buttonOffset=176></generic-table-element> 
</div>

<div style="overflow-x: hidden;overflow-y:auto;max-height:40vh;min-height:340px">
<generic-table-element  id="nodeTable" headerName="${translate('sideBar.matrix.number')}" headerSignal="${translate('sideBar.matrix.newNumber')}" buttonOffset=176></generic-table-element> 
</div>

<div style="overflow-x: hidden;overflow-y:auto;max-height:40vh;min-height:340px">
<generic-table-element  id="nodeMixedTable" headerName="${translate('sideBar.matrix.name')}" headerSignal="${translate('sideBar.matrix.newNumber')}" buttonOffset=176></generic-table-element> 
</div>

</div>
</mwc-dialog>


<mwc-dialog id="new-automaton-dialog" scrimClickAction="" heading="${translate('pop-ups.automaton.header-add')}">
<mwc-button
      slot="secondaryAction"
      @click=${() => (this.newAutomaton())}>
      ${translate('pop-ups.accept')}
  </mwc-button>
<mwc-button
      slot="primaryAction"
      dialogAction="cancel">
      ${translate('pop-ups.close')}
  </mwc-button>
  <br>
  <div class="automGrid">
  <label style="padding-top:8px;">${translate('pop-ups.automaton.name')}</label>
<mwc-textfield style="max-width:200px; height:40px" outlined id="newCustomName"></mwc-textfield>
  

</div>
</mwc-dialog>

<mwc-button style="width:100%;--mdc-theme-primary: white;" @click=${() => (this.openAutomatonDialog())}>${translate('sideBar.addButton')}</mwc-button>

  <div id="left-bar-holder" style="overflow-y:auto;background:#4f5d6e; height:89vh; width:230px;padding-top:20px; padding-left:10px;" >
      ${this.automatonList.map((autom, i, arr) => html`
        <mwc-checkbox style="width:20px;height:20px" ?checked=${autom[2]} @change=${(e: Event) => (<HTMLInputElement>e.target).checked ? store.dispatch(AddActiveAutomaton(autom[1])) : store.dispatch(RemoveActiveAutomaton(autom[1]))}></mwc-checkbox>
        <p style="padding-top:4px;margin-top:12px;color:white">${autom[0]}</p>
        <mwc-icon-button icon="edit" style="color:white" @click=${() => {
          this.lastAutomIndex = i;
          this.currentAutomatonActive = autom[2];
          this.editAutomaton(autom[0], autom[1], autom[3], autom[4])
        }}></mwc-icon-button>
        <mwc-icon-button icon="delete" style="color:white" @click=${() => store.dispatch(RemoveAutomaton(autom[1]))}></mwc-icon-button>
      `)}
  </div>`}
    else {
      return html` 

</mwc-dialog>
<div
  style="overflow-y:auto;background:#4f5d6e; height:92vh; width:64px;padding-top:20px; padding-left:10px;">

</div>`};
  }




  closeAutomWindow() {
    (<Dialog>this.shadowRoot?.getElementById("automaton-dialog")).open = false;
  }



  openAutomatonDialog() {
    (<any>this.shadowRoot?.getElementById("new-automaton-dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("new-automaton-dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<Dialog>this.shadowRoot?.getElementById("new-automaton-dialog")).open = true;


  }


  fillTables(name: string, id: number, info: string, controlSignal: Array<ControlSignal>) {
    setTimeout(() => {





      let table = this.shadowRoot?.getElementById("signalTable");
      let tableList: TableInteractionEntry[] = [];
      controlSignal.forEach((currentSignal, index) => {
        if (currentSignal.customName.error && !(currentSignal.customName.error?.invalidName == "" || currentSignal.customName.error?.invalidName === currentSignal.customName.validName)) {
          this.openErrorWindow("SignalNameError", currentSignal.customName.error, currentSignal.customName.validName, id);
        }
        let tableRowVals: TableBaseEntry = { id: id, name: currentSignal.customName.validName, equation: currentSignal.customName.validName }
        let tableRow: TableInteractionEntry = {
          id: tableRowVals.id,
          name: tableRowVals.name,
          equation: tableRowVals.equation,
          onCommitCb: (entry) => {
            store.dispatch(ChangeControlSignalName(entry.id, entry.name, entry.equation)), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4])
          },
          onRejectCb: (entry) => { this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]) },
          subLine: (entry) => {
            store.dispatch(RemoveControlSignal(entry.id, entry.equation)), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
            ;
          }
        };

        tableList.push(tableRow);
      });

      let tableMeta: TableMeta = {
        addLine: () => { this.addControlSignal() }

      };
      (<GenericTableElement>table).entryList = tableList;
      (<GenericTableElement>table).metaFunctions = tableMeta;




      let node: ApiNode[] = [];
      this.nodeList.forEach(currentAutomaton => {
        if (currentAutomaton[0] === id) { node = currentAutomaton[1] }
      });
      let nodeTable = this.shadowRoot?.getElementById("nodeTable");
      let nodeTableList: TableInteractionEntry[] = [];
      node.forEach((currentNode, index) => {
        if (currentNode.customStateNumber.error && !(currentNode.customStateNumber.error?.invalidNumber === currentNode.customStateNumber.validNumber)) {
          this.openErrorWindow("NodeNameError", currentNode.customStateNumber.error, currentNode.customStateNumber.validNumber, id);
        }
        let tableRowVals: TableBaseEntry = { id: currentNode.id, name: "" + currentNode.customStateNumber.validNumber, equation: "" + currentNode.customStateNumber.validNumber }
        let tableRow: TableInteractionEntry = {
          id: tableRowVals.id,
          name: tableRowVals.name,
          equation: tableRowVals.equation,
          onCommitCb: (entry) => {
            store.dispatch(ChangeNodeNumber(entry.id, <number>+(entry.equation))), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4])
          },
          onRejectCb: (entry) => { this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]); },
          subLine: (entry) => {
            store.dispatch(RemoveNode(entry.id)), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
            ;
          }
        };
        nodeTableList.push(tableRow);
      });


      let nodeTableMeta: TableMeta = {
        addLine: () => { this.newNode() }

      };
      (<GenericTableElement>nodeTable).entryList = nodeTableList;
      (<GenericTableElement>nodeTable).metaFunctions = nodeTableMeta;



      
      let nodeNameTable = this.shadowRoot?.getElementById("nodeNameTable");
      let nodeNameTableList: TableInteractionEntry[] = [];
      node.forEach((currentNode, index) => {
        if (currentNode.customStateNumber.error && !(currentNode.customStateNumber.error?.invalidNumber === currentNode.customStateNumber.validNumber)) {
          this.openErrorWindow("NodeNameError", currentNode.customStateNumber.error, currentNode.customStateNumber.validNumber, id);
        }
        let tableRowVals: TableBaseEntry = { id: currentNode.id, name: currentNode.names[0].validName, equation: currentNode.names[0].validName }
        let tableRow: TableInteractionEntry = {
          id: tableRowVals.id,
          name: tableRowVals.name,
          equation: tableRowVals.equation,
          onCommitCb: (entry) => {
            store.dispatch(ChangeNodeName(entry.id, entry.equation)), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4])
          },
          onRejectCb: (entry) => { this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]); },
          subLine: (entry) => {
            store.dispatch(RemoveNode(entry.id)), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
            ;
          }
        };
        nodeNameTableList.push(tableRow);
      });


      let nodeNameTableMeta: TableMeta = {
        addLine: () => { this.newNode() }

      };
      (<GenericTableElement>nodeNameTable).entryList = nodeNameTableList;
      (<GenericTableElement>nodeNameTable).metaFunctions = nodeNameTableMeta;



      let nodeMixedTable = this.shadowRoot?.getElementById("nodeMixedTable");
      let nodeMixedTableList: TableInteractionEntry[] = [];
      node.forEach((currentNode, index) => {
        if (currentNode.customStateNumber.error && !(currentNode.customStateNumber.error?.invalidNumber === currentNode.customStateNumber.validNumber)) {
          this.openErrorWindow("NodeNameError", currentNode.customStateNumber.error, currentNode.customStateNumber.validNumber, id);
        }
        let tableRowVals: TableBaseEntry = { id: currentNode.id, name: currentNode.names[0].validName, equation: "" + currentNode.customStateNumber.validNumber }
        let tableRow: TableInteractionEntry = {
          id: tableRowVals.id,
          name: tableRowVals.name,
          equation: tableRowVals.equation,
          onCommitCb: (entry) => {
            store.dispatch(ChangeNodeNumber(entry.id, <number>+(entry.equation))), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4])
          },
          onRejectCb: (entry) => { this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]); },
          subLine: (entry) => {
            store.dispatch(RemoveNode(entry.id)), this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
            ;
          }
        };
        nodeMixedTableList.push(tableRow);
      });


      let nodeMixedTableMeta: TableMeta = {
        addLine: () => { this.newNode() }

      };
      (<GenericTableElement>nodeMixedTable).entryList = nodeMixedTableList;
      (<GenericTableElement>nodeMixedTable).metaFunctions = nodeMixedTableMeta;




    }, 10);
  }







  openErrorWindow(type: string, error: DuplicateNameError | NameSyntaxError | NumberError, lastValid: string | number, id: number) {
    (<any>(<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>(<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).shadowRoot?.firstElementChild?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).openWindow = true;
    (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).lastValid = lastValid;
    (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).errorMessage = error.message;
    (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).errorName = error.name;
    (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).errorType = type;
    (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).errorObjectId = id;
    if ((<NameError>error).invalidName) {
      (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).invalidValue = (<NameError>error).invalidName;
    }
    else if ((<NumberError>error).invalidNumber) {
      (<ErrorWindow>this.parentElement?.querySelector(".main-router")?.shadowRoot?.querySelector(".errorWindow")).invalidValue = (<NumberError>error).invalidNumber;
    }

  }







  newAutomaton() {
    let customName = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomName")).value;
    // console.log(automatonId)
    if (customName === "") {
      store.dispatch(NewAutomaton());
    }
    else {
      store.dispatch(NewAutomaton(customName));
    }
  }

  fillAutomatons() {

    setTimeout(
      () => {
        let holder = this.shadowRoot?.getElementById("left-bar-holder");
        while (holder?.firstChild) {
          holder.removeChild(holder.firstChild);
        }

        // if(holder){
        // holder.style.gridTemplateRows = "repeat("+this.automatonList.length+",50px);"}

        this.automatonList.forEach((currentAutomaton: [name: string, id: number, active: boolean, info: string, controlSignals: Array<ControlSignal>], index: number) => {
          // let automaton = document.createElement("div");
          // automaton.style.width = "250px";
          // automaton.id = "" + currentAutomaton[1];
          // automaton.style.paddingTop = "1px";
          let checkbox = document.createElement("mwc-checkbox");
          // checkbox.type = "checkbox"
          checkbox.style.height = "20px"
          checkbox.style.width = "20px"
          checkbox.checked = currentAutomaton[2];

          checkbox.addEventListener('change', () => {
            // console.log(`checkbox changed to ${checkbox.checked}`);
            if (checkbox.checked) {
              store.dispatch(AddActiveAutomaton(currentAutomaton[1]));
            } else {
              store.dispatch(RemoveActiveAutomaton(currentAutomaton[1]));
            }
          });


          holder?.appendChild(checkbox);


          let name = document.createElement("p");
          name.innerText = currentAutomaton[0];

          name.style.paddingTop = "4px"
          name.style.marginTop = "12px";
          name.style.color = "white";

          let del = document.createElement("mwc-icon-button");
          del.icon = "delete";
          del.style.color = "red";
          del.addEventListener('click', (e) => {
            store.dispatch(RemoveAutomaton(currentAutomaton[1]));
          });

          let edit = document.createElement("mwc-icon-button");
          edit.icon = "edit";
          edit.style.color = "white";
          edit.addEventListener('click', (e) => {
            this.lastAutomIndex = index;
            this.editAutomaton(currentAutomaton[0], currentAutomaton[1], currentAutomaton[3], currentAutomaton[4]);

          });
          // setTimeout(
          //   () => {
          //     if (del.shadowRoot?.getElementById("button")) {
          //       (<HTMLButtonElement>del.shadowRoot?.getElementById("button")).style.backgroundColor = "red";
          //       (<HTMLButtonElement>del.shadowRoot?.getElementById("button")).style.height = "30px";
          //     }
          //   }, 0);


          holder?.appendChild(name);

          holder?.appendChild(edit);
          holder?.appendChild(del);

          // holder?.appendChild(automaton);
        });



      }, 10);

  }


  editAutomaton(name: string, id: number, info: string, controlSignal: Array<ControlSignal>) {
    this.currentAutomatonId = id;
    let customName = (<HTMLInputElement>this.shadowRoot?.getElementById("customName"));
    customName.value = name;
    customName.addEventListener("change", (e) => {
      store.dispatch(ChangeAutomatonName(id, customName.value));
    });




    if(!this.currentAutomatonActive){
      store.dispatch(AddActiveAutomaton(id))
    }



    (<any>this.shadowRoot?.getElementById("automaton-dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("automaton-dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<Dialog>this.shadowRoot?.getElementById("automaton-dialog")).open = true;

    this.fillTables(name, id, info, controlSignal);
  }


  renameControlSignal() {
    let oldCustomControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomControlSignal")).value;
    let newCustomControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomControlSignal")).value;
    store.dispatch(ChangeControlSignalName(this.currentAutomatonId, oldCustomControlSignal, newCustomControlSignal));
    this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
  }

  newNode() {
    // let customName: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("customState")).value;
    // console.log(automatonId)
    store.dispatch(AddNode(this.automatonList[this.lastAutomIndex][1]));
    this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);

  }


  removeControlSignal() {
    let remControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomControlSignal")).value;
    store.dispatch(RemoveControlSignal(this.currentAutomatonId, remControlSignal));
    this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
  }



  addControlSignal() {
    // let newControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("newControlSignal")).value;
    store.dispatch(AddControlSignal(this.currentAutomatonId));
    this.editAutomaton(this.automatonList[this.lastAutomIndex][0], this.automatonList[this.lastAutomIndex][1], this.automatonList[this.lastAutomIndex][3], this.automatonList[this.lastAutomIndex][4]);
  }



}
declare global {
  interface HTMLElementTagNameMap {
    'side-bar-element': SideBarElement;
  }
}
