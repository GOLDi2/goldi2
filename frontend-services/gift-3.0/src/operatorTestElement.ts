import { LitElement, html, customElement, property, css, query } from 'lit-element';
import { connect } from 'pwa-helpers';
import { AddControlSignal, AddGlobalInput, AddGlobalOutput, AddNode, ChangeControlSignalName, ChangeCustomOperator, ChangeGlobalInputName, ChangeGlobalOutputName, NewAutomaton, RemoveControlSignal, RemoveGlobalInput, RemoveGlobalOutput } from './actioncreator/editorState';
import { SetEquationMinimizationLevel, SetZeroOutputVisibility, SetZeroTransitionsVisibility } from './actioncreator/viewConfig';
import { AutomatonSelector, FullApiSystemAssignmentSelector, getOperators } from './selectors/normalizedEditorStateSelectors';
import { store } from './store/configureStore';
import { AppState } from './types/NormalizedState/AppState';
import { MetaState } from './types/NormalizedState/MetaState';
import { OperatorEnum, Operators } from './types/Operators';
import { MinimizationLevel } from './types/NormalizedState/ViewConfig';

import "@material/mwc-dialog"
import "@material/mwc-top-app-bar-fixed";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";
import "@material/mwc-icon-button"
// import '@material/mwc-textarea';
import { Dialog } from '@material/mwc-dialog';
import { MainRouterElement } from './mainRouterElement';
import { Automaton } from './types/Automaton';
import { ApiAutomaton } from './types/ApiClasses/GraphRepresentation/Automaton';
import { updateSourceFile } from 'typescript';

import { LanguageIdentifier, registerTranslateConfig, Strings, use,translate } from 'lit-translate';
import { ApiFullSystemAssignment } from './types/ApiClasses/SystemAssignment';
import { BrowserInteractor } from './browserinteractor';
import { LoadStateFromFile } from './actioncreator/metaState';



/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('operator-test-element')
export class OperatorTestElement extends connect(store)(LitElement) {

  constructor() {
    super();

  }
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 100%;
      margin-top: 64px;
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

.grid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: repeat(4,250px);
  grid-auto-rows: 50px;
}
.nodeGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 200px 250px;
  grid-auto-rows: 50px;
}
.automGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 250px 250px;
  grid-auto-rows: 50px;
}
mwc-top-app-bar-fixed {
        --mdc-theme-primary: #4f5d6e;
      }
      mwc-tab {
        --mdc-theme-primary: white;
        background: #4f5d6e;
      }  
      .signalGrid{
  display: grid;
  border-collapse: collapse;
  grid-template-columns: 250px 250px;
  grid-auto-rows: 40px 40px 40px 40px 50px 40px;
  padding-left:24px;
  padding-bottom:20px;
  padding-right:24px
}
  `;




  @property({ type: Array }) customOperators: Operators;
  @property({ type: Array }) internalOperators: Array<string>;
  @property({ type: String }) lastAutomaton: string;
  @property({ type: String }) currentSignalTab: string = "input";
  @property({type: Number }) currentAutomatonId: number;

  /**
       * Liste der Automatennamen
       */
  @property({ type: Array }) automatonList: Array<[name: string, id: number, active: boolean]>;

  @property({ type: ApiFullSystemAssignment }) assignments: ApiFullSystemAssignment;

  stateChanged(state: MetaState) {
    this.customOperators = getOperators(state.appState.normalizedEditorState);
    //Namen der Automaten entnehmen
    let automatons = AutomatonSelector(state.appState.normalizedEditorState);
    var arr_names: [string, number, boolean][] = new Array(automatons.length)
    automatons.forEach((val: Automaton, index: number) => {
      arr_names[index] = [val.name.validName, val.id, val.isActive];
    });
    this.automatonList = arr_names;

    this.assignments = FullApiSystemAssignmentSelector(state.appState.normalizedEditorState);
  }

  firstUpdated() {
  }

  render() {
    let signalContent;
    switch (this.currentSignalTab) {
      case "input": {
        signalContent = html`
        
<div class = "signalGrid">
<label>${translate('pop-ups.signals.inputs.add-header')}</label>
<div></div>
           <mwc-textfield outlined id="newGlobalIn" label="${translate('pop-ups.signals.inputs.name')}" pattern="[a-zA-Z0-9{}_]+" style="padding-top:1px;padding-left:1px;padding-bottom:1px;max-width:250px; height:40px;border-left:1px solid #343E48; border-top:1px solid #343E48;border-top-left-radius:4px;border-bottom: 1px solid #343E48; border-bottom-left-radius:4px;"></mwc-textfield>
      <mwc-button style="padding-top:1px;padding-bottom:1px;height:40px;border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;border-bottom: 1px solid #343E48; border-bottom-right-radius:4px;" @click=${() => (this.addGlobalIn())}>${translate('pop-ups.signals.inputs.add')}</mwc-button>
      <div></div>
      <div></div>
      
      <!-- Textfelder und Knopf zum Umbenennen eines globalen Inputs -->
      <label>${translate('pop-ups.signals.inputs.edit-header')}</label>
      <div></div>
      <div style="padding-bottom:10px;max-width:250px; height:40px;border-left:1px solid #343E48; border-top:1px solid #343E48;border-top-left-radius:4px;">
      <select id="oldCustomGlobalIn" style="width:249px; height:40px; border-radius:4px; padding-left:11px" >
      ${this.fillInputs()}
      </select>
      </div>
      <div style="border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;">
      <mwc-button style="padding-bottom:1px;height:40px;padding-top:1px;width:249px" @click=${() => (this.removeGlobalIn())}>${translate('pop-ups.signals.inputs.del')}</mwc-button>
      </div>
      <mwc-textfield outlined id="newCustomGlobalIn" label="${translate('pop-ups.signals.inputs.new-name')}" pattern="[a-zA-Z0-9{}_]+" style="max-width:250px; height:40px;border-left:1px solid #343E48; border-bottom:1px solid #343E48;border-bottom-left-radius:4px;"></mwc-textfield>
      <mwc-button style="padding:0px;margin:0px;height:40px;border-right:1px solid #343E48; border-bottom:1px solid #343E48;border-bottom-right-radius:4px;" @click=${() => (this.renameGlobalIn())}>${translate('pop-ups.signals.inputs.rename')}</mwc-button>
      </div>
        `;
        break;
      }
      case "output": {
        signalContent = html`
        
<div class = "signalGrid">
<label>${translate('pop-ups.signals.outputs.add-header')}</label>
<div></div>
          <!-- Textfelder und Knopf zum Hinzufuegen eines globalen Outputs -->
      <mwc-textfield style="padding-top:1px;padding-left:1px;padding-bottom:1px;max-width:250px; height:40px;border-left:1px solid #343E48; border-top:1px solid #343E48;border-top-left-radius:4px;border-bottom: 1px solid #343E48; border-bottom-left-radius:4px;" outlined id="newGlobalOut" label="${translate('pop-ups.signals.outputs.name')}" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button style="padding-top:1px;padding-bottom:1px;height:40px;border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;border-bottom: 1px solid #343E48; border-bottom-right-radius:4px;" @click=${() => (this.addGlobalOut())}>${translate('pop-ups.signals.outputs.add')}</mwc-button>
      <div></div>
      <div></div>
      <!-- Textfelder und Knopf zum Umbenennen eines globalen Outputs -->
      <label>${translate('pop-ups.signals.outputs.edit-header')}</label>
      <div></div>
      <div style="padding-bottom:10px;max-width:250px; height:40px;border-left:1px solid #343E48; border-top:1px solid #343E48;border-top-left-radius:4px;">
      <select id="oldCustomGlobalOut" style="width:249px; height:40px; border-radius:4px; padding-left:11px" >
      ${this.fillOutputs()}
      </select>
      </div>
      <div style="border-right:1px solid #343E48; border-top:1px solid #343E48;border-top-right-radius:4px;">
      <mwc-button style="padding-bottom:1px;height:40px;padding-top:1px;width:249px;" @click=${() => (this.removeGlobalOut())}>${translate('pop-ups.signals.outputs.del')}</mwc-button>
      </div>
      <mwc-textfield style="max-width:250px; height:40px;border-left:1px solid #343E48; border-bottom:1px solid #343E48;border-bottom-left-radius:4px;" outlined id="newCustomGlobalOut" label="${translate('pop-ups.signals.outputs.new-name')}" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button style="padding:0px;margin:0px;height:40px;border-right:1px solid #343E48; border-bottom:1px solid #343E48;border-bottom-right-radius:4px;" @click=${() => (this.renameGlobalOut())}>${translate('pop-ups.signals.outputs.rename')}</mwc-button>
      </div>
        `;
        break;
      }
    }

    return html`

<mwc-dialog id="signal-dialog" scrimClickAction="" heading="${translate('pop-ups.signals.header')}">
<mwc-button
      slot="primaryAction"
      dialogAction="cancel">
      ${translate('pop-ups.close')}
  </mwc-button>

            <mwc-tab-bar>
              <mwc-tab label="${translate('pop-ups.signals.inputs.inputs')}"  @click=${() => (this.currentSignalTab = "input")}></mwc-tab>
              <mwc-tab label="${translate('pop-ups.signals.outputs.outputs')}"  @click=${() => (this.currentSignalTab = "output")}></mwc-tab>
            </mwc-tab-bar>
            <br>
            
            ${signalContent}
  
  
</mwc-dialog>




<mwc-dialog id="automaton-dialog" scrimClickAction="" heading="${translate('pop-ups.automaton.header-add')}">
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
<mwc-textfield style="max-width:200px; height:40px" outlined id="customName"></mwc-textfield>
  
<label style="padding-top:8px;">${translate('pop-ups.automaton.description')}</label>
<textarea id="description" name="description"
  rows="5" cols="33">
</textarea>

</div>
</mwc-dialog>


<mwc-dialog id="node-dialog" scrimClickAction="" heading="${translate('pop-ups.nodes.header')}">
<mwc-button
      slot="secondaryAction"
      @click=${() => (this.newNode())}>
      ${translate('pop-ups.accept')}
  </mwc-button>
<mwc-button
      slot="primaryAction"
      dialogAction="cancel">
      ${translate('pop-ups.close')}
  </mwc-button>
  <br>
  <div class="nodeGrid">
  <label style="padding-top:8px;">${translate('pop-ups.nodes.automaton')}</label>
  <select style="width:200px; height:40px" id="automatons" name="automatons">
  ${this.addAutomatons()}
  
</select>
<label style="padding-top:8px;">${translate('pop-ups.nodes.number')}</label>
<mwc-textfield style="max-width:200px; height:40px" outlined id="customState" pattern="[0-9]+"></mwc-textfield>
</div>
</mwc-dialog>

    <mwc-dialog id="dialog" scrimClickAction="" heading="${translate('pop-ups.operators.header')}">
  <mwc-button
      slot="secondaryAction"
      @click=${() => (this.dispatchActions())}>
      ${translate('pop-ups.accept')}
  </mwc-button>
  <mwc-button
      slot="primaryAction"
      dialogAction="cancel">
      ${translate('pop-ups.close')}
  </mwc-button>
  <br>
  <div class="grid">
        
        <h4 style="padding-left: 18%;">${translate('pop-ups.operators.and-op')}</h4>
        <h4 style="padding-left: 18%;">${translate('pop-ups.operators.or-op')}</h4>
        <h4 style="padding-left: 18%;">${translate('pop-ups.operators.not-op')}</h4>
        <h4>${translate('pop-ups.operators.xor-op')}</h4>
        <mwc-textfield value="${this.customOperators.customAndOperator.validName}"  outlined id="customAnd" label="${translate('pop-ups.operators.and-op')}"></mwc-textfield>
        
        
        <mwc-textfield value="${this.customOperators.customOrOperator.validName}" outlined id="customOr" label="${translate('pop-ups.operators.or-op')}"></mwc-textfield>
        
        
        <mwc-textfield value="${this.customOperators.customNotOperator.validName}" outlined id="customNot" label="${translate('pop-ups.operators.not-op')}"></mwc-textfield>
       
        <mwc-textfield value="${this.customOperators.customExclusivOrOperator.validName}" outlined id="customXOR" label="${translate('pop-ups.operators.xor-op')}"></mwc-textfield></mwc-button>
        
  </div>
</mwc-dialog>

<!-- Tatsaechlich zu sehende Knoepfe -->
<mwc-icon-button icon="settings" @click=${() => (this.openSettingsDialog())}></mwc-icon-button>
<mwc-icon-button icon="file_download" @click=${() =>
                BrowserInteractor.downloadFile(
                  'test.json',
                  store.getState()
                )}
></mwc-icon-button>
<mwc-icon-button icon="file_upload" @click=${() =>(
                BrowserInteractor.storeToLocalStorage(
                  'project',
                  store.getState()
                ))}
></mwc-icon-button>
<mwc-icon-button icon="file_upload" @click=${() =>(console.log(window.localStorage["project"]))}
></mwc-icon-button>
<!-- <mwc-icon-button icon="file_download" @click=${() => store.dispatch(LoadStateFromFile(window.localStorage["project"]))}
></mwc-icon-button> -->



<mwc-dialog style="z-Index:0" id="settingsDialog" scrimClickAction="" heading="${translate('pop-ups.settings.header')}">
  <mwc-button
      slot="primaryAction"
      dialogAction="cancel">
      ${translate('pop-ups.close')}
  </mwc-button>
<mwc-button @click=${() => (use('ger'))}>Ger</mwc-button>
<mwc-button @click=${() => (use('eng'))}>Eng</mwc-button>
<br>
<br>

<mwc-button @click=${() => (this.openDialog())}>Operatoren bearbeiten</mwc-button>
<!-- <mwc-button @click=${() => (this.openNodeDialog())}>Knoten hinzufuegen</mwc-button> -->
<!-- <mwc-button @click=${() => (this.openAutomatonDialog())}>Automaten hinzufuegen</mwc-button> -->
<mwc-button @click=${() => (this.openSignalDialog())}>Signal hinzufuegen</mwc-button>


        <br>
        <br>
        <mwc-button @click=${() => store.dispatch(SetEquationMinimizationLevel(MinimizationLevel.Minimized))}> Minimierte Gleichungen
        </mwc-button>
        <mwc-button @click=${() => store.dispatch(SetEquationMinimizationLevel(MinimizationLevel.Unminimized))}> Unminimierte Gleichungen
        </mwc-button>
        <mwc-button @click=${() => store.dispatch(SetEquationMinimizationLevel(MinimizationLevel.HStarMinimized))}> H-Stern-minimierte Gleichungen
        </mwc-button>
        <br>
        <br>
        <mwc-button @click=${() => store.dispatch(SetZeroOutputVisibility(false))}>Nullausgaben verbergen
        </mwc-button>
        <mwc-button @click=${() => store.dispatch(SetZeroTransitionsVisibility(false))}>Nullkanten verbergen
        </mwc-button>
</mwc-dialog>
    `;
  }



  openSettingsDialog() {
    (<any>this.shadowRoot?.getElementById("settingsDialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("settingsDialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<any>this.shadowRoot?.getElementById("settingsDialog")?.shadowRoot?.getElementById("title")).style.margin = "0px";
    (<any>this.shadowRoot?.getElementById("settingsDialog")?.shadowRoot?.getElementById("content")).style.padding = "0px";
    (<Dialog>this.shadowRoot?.getElementById("settingsDialog")).open = true;
  }




  fillInputs() {
    setTimeout(
            () => {

              let select = this.shadowRoot?.getElementById("oldCustomGlobalIn")
              
              while(select?.firstChild){
                select.removeChild(select.firstChild);
              }

              this.assignments.inputAssignment.forEach((input) => {
                let option = document.createElement("option")
                option.innerText = input.name
                select?.appendChild(option)
            });

            }, 10);

  }


  fillOutputs() {
    setTimeout(
            () => {

              let select = this.shadowRoot?.getElementById("oldCustomGlobalOut")
              
              while(select?.firstChild){
                select.removeChild(select.firstChild);
              }


              this.assignments.outputAssignment.forEach((output) => {
                let option = document.createElement("option")
                option.innerText = output.name
                // console.log(option)
                select?.appendChild(option)
            });
            }, 10);

  }


 



  renameGlobalOut() {
    let oldCustomGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomGlobalOut")).value;
    let newCustomGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomGlobalOut")).value;
    store.dispatch(ChangeGlobalOutputName(oldCustomGlobalOut, newCustomGlobalOut));
  }



  removeGlobalOut() {
    let remGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomGlobalOut")).value;
    store.dispatch(RemoveGlobalOutput(remGlobalOut));
  }



  addGlobalOut() {
    let newGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("newGlobalOut")).value;
    store.dispatch(AddGlobalOutput(newGlobalOut));
  }



  renameGlobalIn() {
    let oldCustomGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomGlobalIn")).value;
    let newCustomGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomGlobalIn")).value;
    store.dispatch(ChangeGlobalInputName(oldCustomGlobalIn, newCustomGlobalIn));
  }




  removeGlobalIn() {
    let remGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomGlobalIn")).value;
    store.dispatch(RemoveGlobalInput(remGlobalIn));
  }


  addGlobalIn() {
    let newGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("newGlobalIn")).value;
    store.dispatch(AddGlobalInput(newGlobalIn));

  }




  openSignalDialog() {
    (<any>this.shadowRoot?.getElementById("signal-dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("signal-dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<any>this.shadowRoot?.getElementById("signal-dialog")?.shadowRoot?.getElementById("title")).style.margin = "0px";
    (<any>this.shadowRoot?.getElementById("signal-dialog")?.shadowRoot?.getElementById("content")).style.padding = "0px";
    (<Dialog>this.shadowRoot?.getElementById("signal-dialog")).open = true;
    (<Dialog>this.shadowRoot?.getElementById("settingsDialog")).open = false;
  }




  newAutomaton() {
    let customName = (<HTMLInputElement>this.shadowRoot?.getElementById("customName")).value;
    let automatonInfo = (<HTMLSelectElement>this.shadowRoot?.getElementById("description")).value;
    // console.log(automatonId)
    store.dispatch(NewAutomaton(customName, automatonInfo));
  }



  newNode() {
    this.lastAutomaton = "" + (<HTMLSelectElement>this.shadowRoot?.getElementById("automatons")).value
    let customName: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("customState")).value;
    let automatonId: number = +(<HTMLSelectElement>this.shadowRoot?.getElementById("automatons")).selectedOptions[0].id;
    // console.log(automatonId)
    store.dispatch(AddNode(automatonId, customName));
  }


  addAutomatons() {
    setTimeout(
      () => {
        let drop = this.shadowRoot?.getElementById("automatons");
        while (drop?.firstChild) {
          drop.removeChild(drop.firstChild);
        }
        if (drop) {
          this.automatonList.forEach((currentAutomaton: [name: string, id: number, active: boolean], index: number) => {
            let autom = document.createElement("option")
            if (currentAutomaton[0] === this.lastAutomaton) {
              autom.selected = true;
            }
            autom.id = "" + currentAutomaton[1]
            autom.innerText = currentAutomaton[0];
            autom.style.fontSize = "15px";
            drop?.appendChild(autom);
          });
        }
      }, 10);
  }



  openNodeDialog() {
    (<any>this.shadowRoot?.getElementById("node-dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("node-dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<Dialog>this.shadowRoot?.getElementById("node-dialog")).open = true;
    (<Dialog>this.shadowRoot?.getElementById("settingsDialog")).open = false;
  }

  openAutomatonDialog() {
    (<any>this.shadowRoot?.getElementById("automaton-dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("automaton-dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<Dialog>this.shadowRoot?.getElementById("automaton-dialog")).open = true;
    (<Dialog>this.shadowRoot?.getElementById("settingsDialog")).open = false;
  }

  dispatchActions() {
    this.customiseAnd();
    this.customiseOr();
    this.customiseNot();
    this.customiseXOR();
  }


  openDialog() {
    (<any>this.shadowRoot?.getElementById("dialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("dialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<Dialog>this.shadowRoot?.getElementById("dialog")).open = true;
    (<Dialog>this.shadowRoot?.getElementById("settingsDialog")).open = false;
  }




  customiseAnd() {
    let newOperator = (<HTMLInputElement>this.shadowRoot?.getElementById("customAnd")).value
    store.dispatch(ChangeCustomOperator(OperatorEnum.AndOperator, newOperator));





  }

  customiseOr() {
    let newOperator = (<HTMLInputElement>this.shadowRoot?.getElementById("customOr")).value
    store.dispatch(ChangeCustomOperator(OperatorEnum.OrOperator, newOperator));

  }

  customiseNot() {
    let newOperator = (<HTMLInputElement>this.shadowRoot?.getElementById("customNot")).value
    store.dispatch(ChangeCustomOperator(OperatorEnum.NotOperator, newOperator));

  }

  customiseXOR() {

    let newOperator = (<HTMLInputElement>this.shadowRoot?.getElementById("customXOR")).value
    store.dispatch(ChangeCustomOperator(OperatorEnum.ExclusicOrOperator, newOperator));

  }

  // operatorListsCreate() {
  //   const customUnsortedListElem = this.shadowRoot?.getElementById("customListe");
  //   while (customUnsortedListElem?.firstChild) {
  //     customUnsortedListElem?.removeChild(customUnsortedListElem?.firstChild);
  //   }
  //   if(customUnsortedListElem){
  //   customUnsortedListElem.innerHTML = "<h4 >Aktueller \"UND\" Operator: </h4><h4 style=\"padding-left:10px;\">"+this.customOperators.customAndOperator.validName +"</h4>";

  //   customUnsortedListElem.innerHTML = customUnsortedListElem.innerHTML + "<h4>Aktueller \"ODER\" Operator: </h4><h4 style=\"padding-left:10px;\">"+this.customOperators.customOrOperator.validName +"</h4>";

  //   customUnsortedListElem.innerHTML = customUnsortedListElem.innerHTML + "<h4>Aktueller \"NICHT\" Operator: </h4><h4 style=\"padding-left:10px;\">"+this.customOperators.customNotOperator.validName +"</h4>";

  //   customUnsortedListElem.innerHTML = customUnsortedListElem.innerHTML + "<h4>Aktueller \"XOR\" Operator: </h4><h4 style=\"padding-left:10px;\">"+this.customOperators.customExclusivOrOperator.validName + "</h4>";

  //   }
  // }






  foo(): string {
    return 'foo';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'operator-test-element': OperatorTestElement;
  }
}