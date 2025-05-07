import { LitElement, html, customElement, property, css } from 'lit-element';
import { connect } from 'pwa-helpers';
import { FullApiSystemAssignmentSelector } from './selectors/normalizedEditorStateSelectors';
import { store } from './store/configureStore';
import { ApiControlSignalAssignment, ApiInputAssignment, ApiOutputAssignment, ApiZVariableAssignment } from './types/ApiClasses/SignalAssignments';
import { ApiAutomatonAssignment, ApiFullSystemAssignment } from './types/ApiClasses/SystemAssignment';
import { dispatchInitializeVisualizerEvent, dispatchSimulatorChangeEvent } from './external/logic-visualizer/src/app/model/Events';
import { ComputeNextClock, ResetGlobalInput, SetGloablInput, SetInitialState } from './actioncreator/editorState';
import { AppState } from './types/NormalizedState/AppState';
import { MetaState } from './types/NormalizedState/MetaState';





@customElement('simulation-element')
export class simulationElement extends connect(store)(LitElement) {


  static styles = css`
    :host {
      display: block;
      max-width: 100%;
      max-height: 100%;
      height: 93.3vh;
      overflow: hidden;
    }
  `;


  @property({ type: ApiFullSystemAssignment }) assignments: ApiFullSystemAssignment;

  stateChanged(state: MetaState) {
    this.assignments = FullApiSystemAssignmentSelector(state.appState.normalizedEditorState);
    // this.fillAssignmentList();
  }

  firstUpdated() {

    window.addEventListener("message", this.receiveMessage, false);

    (window as any).logicVisElem = this;

    // this.fillAssignmentList();
    setTimeout(
      () => {
        (this.startVisualizer());
      }, 500);
  }


  render() {
    return html`
    <!-- <mwc-button @click=${() => (this.startVisualizer())}>retry loading</mwc-button>
      <br> -->
      <logic-visualizer id="vis">
      </logic-visualizer>

    `;
  }



  startVisualizer() {

    (<HTMLIFrameElement>(this.shadowRoot?.getElementById("vis")?.shadowRoot?.firstChild?.nextSibling)).style.height="93.3vh";
    (<HTMLIFrameElement>(this.shadowRoot?.getElementById("vis")?.shadowRoot?.firstChild?.nextSibling)).style.border="0";
    
    //console.log(this.assignments);
    let inputListForVis: { name: string; value: string }[] = [];
    let inputList = this.assignments.inputAssignment
    let tempName;
    inputList.forEach((currentVar: ApiInputAssignment) => {
      let tempVal = "0";
      tempName = currentVar.name;
      if (currentVar.assignment) {
        tempVal = "1";
      }
      inputListForVis.push({ name: tempName, value: tempVal });
    });

    let outputListForVis: { name: string; value: string }[] = [];
    let zListForVis: { name: string; value: string }[] = [];
    let currentStateListForVis: { name: string; value: string }[] = [];
    let outputList = this.assignments.outputAssignment
    outputList.forEach((currentVar: ApiOutputAssignment) => {
      let tempVal = "0";
      tempName = currentVar.name;
      if (currentVar.assignment) {
        tempVal = "1";
      }
      outputListForVis.push({ name: tempName, value: tempVal });
    });

    let automatonList = this.assignments.automatonAssignment;
    automatonList.forEach((currentAutomaton: ApiAutomatonAssignment) => {


      //Steuersignale
      let ctrlSignalList = currentAutomaton.controlSignalAssignment;
      ctrlSignalList.forEach((currentVar: ApiControlSignalAssignment) => {
        let tempVal = "0";
        tempName = currentVar.name;
        if (currentVar.assignment) {
          tempVal = "1";
        }
        outputListForVis.push({ name: tempName, value: tempVal });
      });

      //Zustaende
      let zAssignmentList = currentAutomaton.zVariableAssignment;
      zAssignmentList.forEach((currentZVar: ApiZVariableAssignment) => {
        let tempVal = "0";
        tempName = currentAutomaton.automatonName + "." + currentZVar.name
        if (currentZVar.assignment) {
          tempVal = "1";
        }
        zListForVis.push({ name: tempName, value: tempVal });
      });

      currentStateListForVis.push({ name: currentAutomaton.automatonName, value: "Z" + currentAutomaton.currentState })


    });
    outputListForVis = zListForVis.concat(outputListForVis);

    


    let args = {
      inputs: inputListForVis,

      states: currentStateListForVis,

      outputs: outputListForVis,

      hStar: "0",

      canSetState: true
    };

    dispatchInitializeVisualizerEvent(args);

  }

  receiveMessage(e: MessageEvent) {
    // console.log(e)
    //Falls ein clock Schritt gerechnet werden soll
    if (e.data.type === "lv-clock") {
      store.dispatch(ComputeNextClock());
      (window as any).logicVisElem.clockCalculated();
    }
    //Falls ein Input geaendert wurde
    else if (e.data.type == "lv-user-change" && e.data.args.inputs != undefined) {
      if (e.data.args.inputs[0].value === "0") {
        store.dispatch(ResetGlobalInput(e.data.args.inputs[0].name));
        (window as any).logicVisElem.inputChanged();
      } else if (e.data.args.inputs[0].value === "1") {
        store.dispatch(SetGloablInput(e.data.args.inputs[0].name));
        (window as any).logicVisElem.inputChanged();
      }
    }
    //Falls der Initialzustand geaendert wird
    else if (e.data.type == "lv-user-change" && e.data.args.states != undefined) {
      store.dispatch(SetInitialState(e.data.args.states[0].name, <number>e.data.args.states[0].value));
    }


  }



  inputChanged() {
    //console.log(this.assignments)
    let tempName;
    let outputListForVis: { name: string; value: string }[] = [];
    let zListForVis: { name: string; value: string }[] = [];
    let outputList = this.assignments.outputAssignment
    outputList.forEach((currentVar: ApiOutputAssignment) => {
      let tempVal = "0";
      tempName = currentVar.name;
      if (currentVar.assignment) {
        tempVal = "1";
      }
      outputListForVis.push({ name: tempName, value: tempVal });
    });

    let automatonList = this.assignments.automatonAssignment;
    automatonList.forEach((currentAutomaton: ApiAutomatonAssignment) => {


      //Steuersignale
      let ctrlSignalList = currentAutomaton.controlSignalAssignment;
      ctrlSignalList.forEach((currentVar: ApiControlSignalAssignment) => {
        let tempVal = "0";
        tempName = currentVar.name;
        if (currentVar.assignment) {
          tempVal = "1";
        }
        outputListForVis.push({ name: tempName, value: tempVal });
      });

      //Zustaende
      let zAssignmentList = currentAutomaton.zVariableAssignment;
      zAssignmentList.forEach((currentVar: ApiZVariableAssignment) => {
        let tempVal = "0";
        tempName = currentAutomaton.automatonName + "." + currentVar.name
        if (currentVar.assignment) {
          tempVal = "1";
        }
        zListForVis.push({ name: tempName, value: tempVal });
      });
    });

    
    outputListForVis = zListForVis.concat(outputListForVis);

    let args = {
      outputs: outputListForVis,

      hStar: "0",

      answeringClock: false
    }
    dispatchSimulatorChangeEvent(args);
  }


  clockCalculated() {
    //console.log(this.assignments)
    let tempName;
    let outputListForVis: { name: string; value: string }[] = [];
    let zListForVis: { name: string; value: string }[] = [];
    let outputList = this.assignments.outputAssignment
    outputList.forEach((currentVar: ApiOutputAssignment) => {
      let tempVal = "0";
      tempName = currentVar.name;
      if (currentVar.assignment) {
        tempVal = "1";
      }
      outputListForVis.push({ name: tempName, value: tempVal });
    });


    let currentStateListForVis: { name: string; value: string }[] = [];
    let automatonList = this.assignments.automatonAssignment;
    automatonList.forEach((currentAutomaton: ApiAutomatonAssignment) => {


      //Steuersignale
      let ctrlSignalList = currentAutomaton.controlSignalAssignment;
      ctrlSignalList.forEach((currentVar: ApiControlSignalAssignment) => {
        let tempVal = "0";
        tempName = currentVar.name;
        if (currentVar.assignment) {
          tempVal = "1";
        }
        outputListForVis.push({ name: tempName, value: tempVal });
      });

      //Zustaende
      let zAssignmentList = currentAutomaton.zVariableAssignment;
      zAssignmentList.forEach((currentZVar: ApiZVariableAssignment) => {
        let tempVal = "0";
        tempName = currentAutomaton.automatonName + "." + currentZVar.name
        if (currentZVar.assignment) {
          tempVal = "1";
        }
        zListForVis.push({ name: tempName, value: tempVal });
      });

      currentStateListForVis.push({ name: currentAutomaton.automatonName, value: "Z" + currentAutomaton.currentState })
    });

    
    outputListForVis = zListForVis.concat(outputListForVis);

    let args = {
      states: currentStateListForVis,

      outputs: outputListForVis,

      hStar: "0",

      answeringClock: true
    }
    dispatchSimulatorChangeEvent(args);
  }










  // test(): any {
  //   console.log("test");
  // }








  // fillAssignmentList() {
  //   let listIns = this.shadowRoot?.getElementById("assignmentInputs");
  //   while (listIns?.firstChild) {
  //     listIns?.removeChild(listIns?.firstChild);
  //   }
  //   this.assignments.inputAssignment.forEach((value: ApiInputAssignment) => {
  //     let listItemElem = document.createElement("li");
  //     listItemElem.innerText = value.name + " ist " + value.assignment;
  //     listIns?.appendChild(listItemElem);

  //   });

  //   let listOuts = this.shadowRoot?.getElementById("assignmentOutputs");
  //   while (listOuts?.firstChild) {
  //     listOuts?.removeChild(listOuts?.firstChild);
  //   }
  //   this.assignments.outputAssignment.forEach((value: ApiOutputAssignment) => {
  //     let listItemElem = document.createElement("li");
  //     listItemElem.innerText = value.name + " ist " + value.assignment;
  //     listOuts?.appendChild(listItemElem);

  //   });

  //   let listZ = this.shadowRoot?.getElementById("assignmentZVariable");
  //   while (listZ?.firstChild) {
  //     listZ?.removeChild(listZ?.firstChild);
  //   }
  //   this.assignments.zVariableAssignment.forEach((value: ApiZVariableAssignment) => {
  //     let listItemElem = document.createElement("li");
  //     listItemElem.innerText = value.name + " aus dem Automaten " + value.automatonName + " ist " + value.assignment;
  //     listZ?.appendChild(listItemElem);
  //   });

  //   let listControl = this.shadowRoot?.getElementById("assignmentControlSignal");
  //   while (listControl?.firstChild) {
  //     listControl?.removeChild(listControl?.firstChild);
  //   }
  //   this.assignments.controlSignalAssignment.forEach((value: ApiControlSignalAssignment) => {
  //     let listItemElem = document.createElement("li");
  //     listItemElem.innerText = value.name + " aus dem Automaten " + value.automatonName + " ist " + value.assignment;
  //     listControl?.appendChild(listItemElem);
  //   });

  // }



  foo(): string {
    return 'foo';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'simulation-element': simulationElement;
  }
}
