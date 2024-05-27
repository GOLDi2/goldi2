import { LitElement, html, customElement, property, css } from 'lit-element';
import { connect } from 'pwa-helpers';
import { ChangeAutomatonName, NewAutomaton, RemoveAutomaton, AddNode, SetNodeCords, SetControlSignal, ResetControlSignal, SetGloablInput, ResetGlobalInput, RemoveNode, SetAutomatonInfo, SetInitialState, SetGlobalInputDontCare, ChangeNodeNumber, AddTransition } from './actioncreator/editorState';
import { AddGlobalInput, RemoveGlobalInput, ChangeGlobalInputName, AddGlobalOutput, RemoveGlobalOutput, ChangeGlobalOutputName } from './actioncreator/editorState';
import { AddControlSignal, RemoveControlSignal, ChangeControlSignalName, SetOutput, Resetoutput, AddActiveAutomaton, RemoveActiveAutomaton } from './actioncreator/editorState';
import { store } from './store/configureStore';
import "@material/mwc-textfield";
import "@material/mwc-button";
import { Automaton } from './types/Automaton';
import { ApiAutomaton } from './types/ApiClasses/GraphRepresentation/Automaton';
import { createPoint, Point } from './types/Points';
import { ApiAutomatonSelector, CustomNameSelector} from './selectors/normalizedEditorStateSelectors';
import { AppState } from './types/NormalizedState/AppState';
import { MetaState } from './types/NormalizedState/MetaState';


@customElement('automaton-button')
export class AutomatonButton extends connect(store)(LitElement) {
  static styles = css`
  :host {
    display: block;
    border: solid 1px gray;
    padding: 16px;
    max-width: 100%;
    position:relative;
  }
  ul {
   display:inline-block;
   width:200px;
   vertical-align:top;
} #message{
  display:block;
  border: solid 1px gray;
  position: fixed;
  height:100px;
  width:300px;
  background-color:white;
  margin-left: -150px;
  margin-top: -50px;
  top:50%;
  left:50%;
  text-align:center;
  padding-top:50px;
  visibility:hidden;
} #shadowError{
  height:100%;
  width:100%;
  background-color:grey;
  top:0px;
  left:0px;
  position:fixed;
  opacity:0.3;
  visibility:hidden;
}
mwc-button {
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
  padding-top:10px;
}
mwc-textfield{
  --mdc-theme-primary: black;
  --mdc-theme-on-primary: white;
}
mwc-dialog{
  --mdc-dialog-max-width:100%;
}

`;

  /**
   * Zaehler für die Anzahl an Automaten
   */
  @property({ type: Number }) counter: number;
  /**
   * Liste der Automaten
   */
  @property({ type: Array }) automatonList: Array<ApiAutomaton>;
  /**
   * Name des zuletzt erzeugten Automaten
   */
  @property({ type: String }) initialValueOfText: string;
  /**
   * Liste der aktiven Automaten
   */
  @property({ type: Array }) activeAutomatonList: Array<ApiAutomaton>;

  stateChanged(state: MetaState) {
    this.automatonList = ApiAutomatonSelector(state.appState);
    this.counter = this.automatonList.length;
    this.initialValueOfText = this.getNameOfLatestAutomaton();
    this.activeAutomatonList = ApiAutomatonSelector(state.appState);
    //Nach jeder Veränderung des States werden die Listen geändert
    this.listeAusgeben();
  }


  render() {
    return html`
      
      <h1>Hello, }!</h1><style></style>
      <br>
      <!-- Elemente, die die Fehlernachricht erzeugen -->
      <div id="shadowError"> </div>
      <div id="message">
      
      </div>

      <mwc-textfield id="h*" label="h*" @change=${() => (this.changeHStar())}></mwc-textfield>
      <br>


      <!-- Block zu den Grundlegenden Automatenfunktionen -->
      <p>Automatons</p>
      <br>
      <!-- Knopf zum erstellen der Automaten -->
      <mwc-textfield id="createAutomatonName" label="Name of new Automaton"></mwc-textfield>
      <mwc-button @click=${() => (this.createAutomaton())}>neuer Automat</mwc-button>
        Automaton Count: ${this.counter}
      </mwc-button>
      <br>
      <!-- Textfeld für den alten Namen -->
      <mwc-textfield id="oldName" label="Name of last Automaton" value="${this.initialValueOfText}"></mwc-textfield>
      <br>

      <mwc-textfield id="automatonId" label="Id of Automaton"></mwc-textfield>
      <br>

      <!-- Textfelder und Knopf zum erstellen einer Transition -->
      <mwc-textfield id="automatonInfo" label="Automaton Info"></mwc-textfield>
      <mwc-button @click=${() => (this.setInfo())}>Set Info</mwc-button>
      <br>

      <!-- Textfeld für den neuen Namen -->
      <mwc-textfield id="newName" label="New Name" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <!-- Knopf zum Namen Ändern -->
      <mwc-button @click=${() => (this.changeName())}>change Name</mwc-button>
      <br>
      <!-- Knopf zum entfernen des Automaten -->
      <mwc-button @click=${() => (this.deleteAutomaton())}>Remove Automaton</mwc-button>
      <br>
      <!-- Knopf um den Automaten aktiv zu machen -->
      <mwc-button @click=${() => (this.addToActives())}>Make active</mwc-button>
      <br>
      <!-- Knopf zum deaktivieren des Automaten -->
      <mwc-button @click=${() => (this.removeFromActives())}>Make inactive</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum erstellen einer Transition -->
      <mwc-textfield id="transitionStart" label="ID des Startzustandes" pattern="[0-9]+"></mwc-textfield>
      <mwc-textfield id="transitionEnd" label="ID des Endzustandes" pattern="[0-9]+"></mwc-textfield>
      <mwc-button @click=${() => (this.transitionAdd())}>Add Transition</mwc-button>
      <br>
      <!-- Elemente die die Automaten und aktiven Automaten enthalten -->
      <ul id="namenListe">
        <div></div>
      </ul>
      <ul id="activeListe">
        <div></div>
      </ul>
      <br>


      <!-- Block zu den Knoten -->
      <p>Nodes</p>
      <br>
      <!-- Textfelder und Knopf zum hinzufuegen, loeschen und initial machen eines Zustandes -->
      <mwc-textfield id="customState" label="Custom State Number" pattern="[0-9]+"></mwc-textfield>
      <mwc-textfield id="cordX" label="X cord" pattern="[0-9]+"></mwc-textfield>
      <mwc-textfield id="cordY" label="Y cord" pattern="[0-9]+"></mwc-textfield>
      <mwc-button @click=${() => (this.addState())}>Add Node</mwc-button>
      <mwc-button @click=${() => (this.removeState())}>Delete Node</mwc-button>

      
      <br>
      <mwc-textfield id="stateNumber" label="State Number" pattern="[0-9]+"></mwc-textfield>
      <mwc-button @click=${() => (this.makeStateInitial())}>Set initial State</mwc-button>
      <br>

      <!-- Textfelder und Knopf zum aendern der Koordinaten eines Zustands -->
      <mwc-textfield id="nodeNumber" label="Node ID" pattern="[0-9]+"></mwc-textfield>
      <br>
      
      <mwc-textfield id="newNodeNumber" label="new Node Number" pattern="[0-9]+"></mwc-textfield>
      <mwc-button @click=${() => (this.changeNodeNumber())}>Change Node Number</mwc-button>

      <br>
      <mwc-textfield id="newX" label="New X" pattern="[0-9]+"></mwc-textfield>
      <mwc-textfield id="newY" label="New Y" pattern="[0-9]+"></mwc-textfield>
      <mwc-button @click=${() => (this.nodeCordChange())}>Change Node Cords</mwc-button>
      <br>
      <br>
      <br>
      <!-- Textfelder und Knopf zum Setzen eines Outputs -->
      <mwc-textfield id="customOutToSet" label="Name des zu setzenden Outputs" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-textfield id="equationOutputOnNode" label="Gleichung für den Output"></mwc-textfield>
      <mwc-button @click=${() => (this.setOutputOnNode())}>Set Output</mwc-button>
      <br>      
      <!-- Textfelder und Knopf zum Zuruecksetzen eines Outputs -->
      <mwc-textfield id="customOutToReset" label="Name des zurueckzusetzenden Outputs" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.resetOutputOnNode())}>Reset Output</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Setzen eines Steuersignals -->
      <mwc-textfield id="customControlToSet" label="Name des zu setzenden Control Signals"></mwc-textfield>
      <mwc-textfield id="equationSetControlSignalOnNode" label="Gleichung für das Control Signal"></mwc-textfield>
      <mwc-button @click=${() => (this.setControlSignalEquation())}>Set Control Signal</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Zuruecksetzen eines Steuersignals -->
      <mwc-textfield id="customControlToReset" label="Name des zurueckzusetzenden Control Signals"></mwc-textfield>
      <mwc-button @click=${() => (this.resetControlSignalEquation())}>Reset Control Signal</mwc-button>
      <br>
      


      <!-- Block zu den globalen Inputs -->
      <p>Global Ins</p>
      <br>
      <!-- Textfelder und Knopf zum Hinzufuegen eines globalen Inputs -->
      <mwc-textfield id="newGlobalIn" label="New Global Input Name" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.addGlobalIn())}>Add Global Input</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Entfernen eines globalen Inputs -->
      <mwc-textfield id="removeGlobalIn" label="Name of Input to delete" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.removeGlobalIn())}>Delete Global Input</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Umbenennen eines globalen Inputs -->
      <mwc-textfield id="oldCustomGlobalIn" label="Old Name of Global In" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-textfield id="newCustomGlobalIn" label="New Name of Global In" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.renameGlobalIn())}>Rename Global Input</mwc-button>
      <br>
      <br>
      <br>

      <!-- Textfelder und Knopf setzen eines globalen Inputs -->
      <mwc-textfield id="GlobalInName" label="Name of Input to change" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.setGlobalIn())}>Set Global Input</mwc-button>
      <mwc-button @click=${() => (this.resetGlobalIn())}>Reset Global Input</mwc-button>
      <br>


      <!-- Block zu den globalen Outputs -->
      <p>Global Outs</p>
      <br>
      <!-- Textfelder und Knopf zum Hinzufuegen eines globalen Outputs -->
      <mwc-textfield id="newGlobalOut" label="New Global Output Name" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.addGlobalOut())}>Add Global Output</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Entfernen eines globalen Outputs -->
      <mwc-textfield id="removeGlobalOut" label="Name of Output to delete" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.removeGlobalOut())}>Delete Global Output</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Umbenennen eines globalen Outputs -->
      <mwc-textfield id="oldCustomGlobalOut" label="Old Name of Global Out" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-textfield id="newCustomGlobalOut" label="New Name of Global Out" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.renameGlobalOut())}>Rename Global Output</mwc-button>
      <br>  



      <!-- Block zu den Steuersignalen -->
      <p>Control Signals</p>
      <br>
      <!-- Textfelder und Knopf zum Hinzufuegen eines Steuersignals -->
      <mwc-textfield id="newControlSignal" label="New Control Signal Name" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.addControlSignal())}>Add Control Signal</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Entfernen eines Steuersignals --> 
      <mwc-textfield id="removeControlSignal" label="Name of Signal to delete" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.removeControlSignal())}>Delete Control Signal</mwc-button>
      <br>
      <!-- Textfelder und Knopf zum Umbenennen eines globalen Outputs -->
      <mwc-textfield id="oldCustomControlSignal" label="Old Name of Signal" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-textfield id="newCustomControlSignal" label="New Name of Signal" pattern="[a-zA-Z0-9{}_]+"></mwc-textfield>
      <mwc-button @click=${() => (this.renameControlSignal())}>Rename Control Signal</mwc-button>
      <br>

    
  `;
  }
  changeNodeNumber() {
    let oldID: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    let newNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("newNodeNumber")).value;
    store.dispatch(ChangeNodeNumber(oldID,newNumber));
  }



  changeHStar() {
    let hStar = (<HTMLInputElement>this.shadowRoot?.getElementById("h*")).value;
    store.dispatch(SetGlobalInputDontCare(hStar));
  }
  


  

/**
 * Methode, die die Fehlernachricht entfernt
 */
  closeError() {
    let messageElement = this.shadowRoot?.getElementById("message");
    let shadowElement = this.shadowRoot?.getElementById("shadowError");
    //Verstecken und unterruecken der Fehler Elemente
    if (shadowElement) {
      shadowElement.style.visibility = "hidden";
      shadowElement.style.zIndex = "0"
    }
    if (messageElement) {
      messageElement.style.visibility = "hidden";
      messageElement.style.zIndex = "0";
      messageElement.innerHTML = "";
    }
  }

  //Code zu den Transitions

  transitionAdd() {
    try {
      let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
      let transStart: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("transitionStart")).value;
      let transEnd: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("transitionEnd")).value;
      store.dispatch(AddTransition(automatonId, transStart, transEnd))
    }
    //Abfangen moeglicher Fehler
    catch (e) {
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      //Sichtbar machen der Fehlerelemente
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "transitionAlreadyExists": {
            messageElement.innerHTML = "Diese Transition existiert bereits." + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }


    //transitionAlreadyExists
  }

  //Code zu den aktiven Automaten

  /**
   * Den Automaten aus der Liste der aktiven Automaten loeschen
   */
  removeFromActives() {
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    store.dispatch(RemoveActiveAutomaton(automatonId));
  }

  /**
   * Den Automaten zur Liste der aktiven Automaten hinzufuegen
   */
  addToActives() {
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    store.dispatch(AddActiveAutomaton(automatonId));
  }


  //Setzen und Zuruecksetzen der Outputs von Knoten

  /**
   * Den Output eines Knoten setzen
   */
  setOutputOnNode() {
    let nodeNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    let customOutputName = (<HTMLInputElement>this.shadowRoot?.getElementById("customOutToSet")).value;
    let customOutputOnNode = (<HTMLInputElement>this.shadowRoot?.getElementById("equationOutputOnNode")).value;
    store.dispatch(SetOutput( nodeNumber, customOutputName, customOutputOnNode));
  }


  /**
   * Den Output eines Knoten zuruecksetzen
   */
  resetOutputOnNode() {
    let nodeNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    let CustomOutputName = (<HTMLInputElement>this.shadowRoot?.getElementById("customOutToReset")).value;
    store.dispatch(Resetoutput( nodeNumber, CustomOutputName));
  }

  /**
   * Das Controlsignal auf einem Knoten zurueksetzen
   */
  resetControlSignalEquation() {
    let nodeNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    let automName = (<HTMLInputElement>this.shadowRoot?.getElementById("oldName")).value;
    let customControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("customControlToReset")).value;
    store.dispatch(ResetControlSignal(automName, nodeNumber, customControlSignal));
  }

  /**
   * Das Controlsignal auf einem Knoten setzen
   */
  setControlSignalEquation() {
    let nodeNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    let customControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("customControlToSet")).value;
    let customControlSignalOnNode = (<HTMLInputElement>this.shadowRoot?.getElementById("equationSetControlSignalOnNode")).value;
    store.dispatch(SetControlSignal( nodeNumber, customControlSignal, customControlSignalOnNode));
  }



  //Code zu den Control Signals

  /**
   * Umbenennen eines Steuersignals
   */
  renameControlSignal() {
    try {
      let oldCustomControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomControlSignal")).value;
      let newCustomControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomControlSignal")).value;
      let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
      store.dispatch(ChangeControlSignalName(automatonId, oldCustomControlSignal, newCustomControlSignal));
    } 
    //Abfangen moeglicher Fehler
    catch (e) {
      //Sichtbar machen der Fehlerelemente
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "invalidName": {
            messageElement.innerHTML = "Der ausgewählte Signalname ist ungültig" + "<br><br>";
            break;
          }
          case "nameAlreadyTaken": {
            messageElement.innerHTML = "Der ausgewählte Signalname wird bereits verwendet" + "<br><br>";
            break;
          }
          case "nameContainsOperators": {
            messageElement.innerHTML = "Der ausgewählte Signalname enthält anderweitig verwendete Zeichen" + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }
  }

  /**
   * Entfernen eines Steuersignals
   */
  removeControlSignal() {
    let remControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("removeControlSignal")).value;
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    store.dispatch(RemoveControlSignal(automatonId, remControlSignal));
  }

  /**
   * Hinzufuegen eines Steuersignals
   */
  addControlSignal() {

      let newControlSignal = (<HTMLInputElement>this.shadowRoot?.getElementById("newControlSignal")).value;
      let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
      if (newControlSignal != "") {
        store.dispatch(AddControlSignal(automatonId, newControlSignal));
      }
      else {
        store.dispatch(AddControlSignal(automatonId));
      }
   
  }

  //Code zu den Global Outputs

  /**
   * Umbennenen eines globalen Outputs
   */
  renameGlobalOut() {
    try {
      let oldCustomGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomGlobalOut")).value;
      let newCustomGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomGlobalOut")).value;
      store.dispatch(ChangeGlobalOutputName(oldCustomGlobalOut, newCustomGlobalOut));
    } 
    //Abfangen moeglicher Fehler
    catch (e) {
      //Sichtbar machen der Fehlerelemente
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "invalidName": {
            messageElement.innerHTML = "Der ausgewählte Signalname ist ungültig" + "<br><br>";
            break;
          }
          case "nameAlreadyTaken": {
            messageElement.innerHTML = "Der ausgewählte Signalname wird bereits verwendet" + "<br><br>";
            break;
          }
          case "nameContainsOperators": {
            messageElement.innerHTML = "Der ausgewählte Signalname enthält anderweitig verwendete Zeichen" + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }
  }

  /**
   * Entfernen eines globalen Outputs
   */
  removeGlobalOut() {
    let remGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("removeGlobalOut")).value;
    store.dispatch(RemoveGlobalOutput(remGlobalOut));
  }

  /**
   * Hinzufuegen eines globalen Outputs
   */
  addGlobalOut() {
    try {
      let newGlobalOut = (<HTMLInputElement>this.shadowRoot?.getElementById("newGlobalOut")).value;
      if (newGlobalOut != "") {
        store.dispatch(AddGlobalOutput(newGlobalOut));
      }
      else {
        store.dispatch(AddGlobalOutput());
      }
    } 
    //Abfangen moeglicher Fehler
    catch (e) {
      //Sichtbar machen der Fehlerelemente
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "invalidName": {
            messageElement.innerHTML = "Der ausgewählte Signalname ist ungültig" + "<br><br>";
            break;
          }
          case "nameAlreadyTaken": {
            messageElement.innerHTML = "Der ausgewählte Signalname wird bereits verwendet" + "<br><br>";
            break;
          }
          case "nameContainsOperators": {
            messageElement.innerHTML = "Der ausgewählte Signalname enthält anderweitig verwendete Zeichen" + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }
  }

  //Code zu den Global Inputs


  /**
   * Zuruecksetzen eines globalen Inputs
   */
  resetGlobalIn() {
    let globalInName = (<HTMLInputElement>this.shadowRoot?.getElementById("GlobalInName")).value;
    store.dispatch(ResetGlobalInput(globalInName));
  }

  /**
   * Setzen eines globalen Inputs
   */
  setGlobalIn() {
    let globalInName = (<HTMLInputElement>this.shadowRoot?.getElementById("GlobalInName")).value;
    store.dispatch(SetGloablInput(globalInName));
  }


  /**
   * Umbennen eines globalen Inputs
   */
  renameGlobalIn() {
    try {
      let oldCustomGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("oldCustomGlobalIn")).value;
      let newCustomGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("newCustomGlobalIn")).value;
      store.dispatch(ChangeGlobalInputName(oldCustomGlobalIn, newCustomGlobalIn));
    } 
    //Abfangen moeglicher Fehler
    catch (e) {
      //Sichtbar machen der Fehlerelemente
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "invalidName": {
            messageElement.innerHTML = "Der ausgewählte Signalname ist ungültig" + "<br><br>";
            break;
          }
          case "nameAlreadyTaken": {
            messageElement.innerHTML = "Der ausgewählte Signalname wird bereits verwendet" + "<br><br>";
            break;
          }
          case "nameContainsOperators": {
            messageElement.innerHTML = "Der ausgewählte Signalname enthält anderweitig verwendete Zeichen" + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }
  }

  /**
   * Entfernen eines globalen Inputs
   */
  removeGlobalIn() {
    let remGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("removeGlobalIn")).value;
    store.dispatch(RemoveGlobalInput(remGlobalIn));
  }

  /**
   * Hinzufuegen eines globalen Inputs
   */
  addGlobalIn() {
    try {
      let newGlobalIn = (<HTMLInputElement>this.shadowRoot?.getElementById("newGlobalIn")).value;
      if (newGlobalIn != "") {
        store.dispatch(AddGlobalInput(newGlobalIn));
      }
      else {
        store.dispatch(AddGlobalInput());
      }
    } 
    //Abfangen moeglicher Fehler
    catch (e) {
      //Sichtbar machen der Fehlerelemente
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "invalidName": {
            messageElement.innerHTML = "Der ausgewählte Signalname ist ungültig" + "<br><br>";
            break;
          }
          case "nameAlreadyTaken": {
            messageElement.innerHTML = "Der ausgewählte Signalname wird bereits verwendet" + "<br><br>";
            break;
          }
          case "nameContainsOperators": {
            messageElement.innerHTML = "Der ausgewählte Signalname enthält anderweitig verwendete Zeichen" + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }

  }


  //Code zu den Automaten und Zustaenden

  /**
   * Aendern der Koordinaten eines Zustandes
   */
  nodeCordChange() {
    let nodeNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    let cordX: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("newX")).value;
    let cordY: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("newY")).value;
    let position = createPoint(cordX,cordY)
    store.dispatch(SetNodeCords(nodeNumber, position));
  }


  /**
   * Einen neuen Automaten erzeugen
   */
  createAutomaton() {
    let automName = (<HTMLInputElement>this.shadowRoot?.getElementById("createAutomatonName")).value;
    if (automName != "") {
     store.dispatch(NewAutomaton(automName));
    }
    else {
      store.dispatch(NewAutomaton());
    }
  }

  /**
   * Info eines Automaten setzen
   */
  setInfo() {
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    let automatonInfo = (<HTMLInputElement>this.shadowRoot?.getElementById("automatonInfo")).value;
    store.dispatch(SetAutomatonInfo(automatonId,automatonInfo));
  }
  

  /**
   * Einen bestehenden Automaten loeschen
   */
  deleteAutomaton() {
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    store.dispatch(RemoveAutomaton(automatonId));

  }

  /**
   * Einen neuen Zustand erzeugen
   */
  addState() {
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    let customName: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("customState")).value;
    let xCord: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("cordX")).value;
    let yCord: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("cordY")).value;
    let position = createPoint(xCord,yCord)
    store.dispatch(AddNode(automatonId, customName));

  }

  /**
   * Einen Zustand loeschen
   */
  removeState() {
    let nodeNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("nodeNumber")).value;
    store.dispatch(RemoveNode(nodeNumber));
  }

  /**
   * Einen Knoten zum Initialknoten machen
   */
  makeStateInitial() {
    let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
    let stateNumber: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("stateNumber")).value;
    store.dispatch(SetInitialState(automatonId,stateNumber));
  }
 

  /**
   * Namen eines Automaten aendern
   */
  changeName() {
    try {
      let newName = (<HTMLInputElement>this.shadowRoot?.getElementById("newName")).value;
      let automatonId: number = +(<HTMLInputElement>this.shadowRoot?.getElementById("automatonId")).value;
      store.dispatch(ChangeAutomatonName(automatonId, newName));
    } 
    //Abfangen moeglicher Fehler
    catch (e) {
      //Sichtbar machen der Fehlerelemente
      let errorMessage = (<Error>e).message;
      let messageElement = this.shadowRoot?.getElementById("message");
      let shadowElement = this.shadowRoot?.getElementById("shadowError");
      if (shadowElement) {
        shadowElement.style.visibility = "visible";
        shadowElement.style.zIndex = "5"
      }
      let button = document.createElement("button");
      if (messageElement) {
        messageElement.style.visibility = "visible";
        messageElement.style.zIndex = "6";
        switch (errorMessage) {
          //Anpassen des Nachrichtfeldes entsprechend des Fehlers
          case "invalidName": {
            messageElement.innerHTML = "Der ausgewählte Automatenname ist ungültig" + "<br><br>";
            break;
          }
          case "nameAlreadyTaken": {
            messageElement.innerHTML = "Der ausgewählte Automatenname wird bereits verwendet" + "<br><br>";
            break;
          }
          case "nameContainsOperators": {
            messageElement.innerHTML = "Der ausgewählte Automatenname enthält anderweitig verwendete Zeichen" + "<br><br>";
            break;
          }
        }
        //Funktion zum schließen des Feldes an das Feld anhaengen
        button.innerHTML = "Schließen";
        button.onclick = (() => this.closeError());
        messageElement.appendChild(button);
      }
    }

  }

  /**
   * Einfuegen der Liste von Automaten und aktiven Automaten ins HTML
   */
  listeAusgeben() {
    let unsortedListElem = this.shadowRoot?.getElementById("namenListe");
    while (unsortedListElem?.firstChild) {
      unsortedListElem?.removeChild(unsortedListElem?.firstChild);
    }
    this.automatonList.forEach((value: ApiAutomaton) => {
      let listItemElem = document.createElement("li");
      listItemElem.innerText = value.name.validName;
      unsortedListElem?.appendChild(listItemElem);
    });
    let activeUnsortedListElem = this.shadowRoot?.getElementById("activeListe");
    while (activeUnsortedListElem?.firstChild) {
      activeUnsortedListElem?.removeChild(activeUnsortedListElem?.firstChild);
    }
    this.activeAutomatonList.forEach((value: ApiAutomaton) => {
      let listItemElem = document.createElement("li");
      listItemElem.innerText = value.name.validName;
      activeUnsortedListElem?.appendChild(listItemElem);
    });
  }

  /**
   * Gibt den namen des letzten Automaten in der Liste aus
   */
  getNameOfLatestAutomaton() {
    if (this.automatonList.length > 0) {
      return this.automatonList[this.counter - 1].name.validName;
    }
    else {
      return "";
    }
  }



  foo(): string {
    return 'foo';
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'automaton-button': AutomatonButton;
  }
}