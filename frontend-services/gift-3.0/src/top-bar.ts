import { LitElement, html, property, customElement, TemplateResult, css, CSSResult, PropertyValues, query } from "lit-element";

import { connect } from "pwa-helpers";
import { store } from './store/configureStore';
import "@material/mwc-top-app-bar-fixed";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";
import "@material/mwc-top-app-bar";
import "@material/mwc-icon-button"

import { AddGlobalInput, AddGlobalOutput, ChangeCustomOperator, ChangeGlobalInputName, ChangeGlobalOutputName, ChangeView, NewAutomaton, RemoveGlobalInput, RemoveGlobalOutput } from './actioncreator/editorState';
import { Viewstate } from "./types/view";
import { AppState } from "./types/NormalizedState/AppState";
import { MetaState } from "./types/NormalizedState/MetaState";


import 'regenerator-runtime/runtime'


import { LanguageIdentifier, registerTranslateConfig, Strings, use, translate } from 'lit-translate'

import { BrowserInteractor } from './browserinteractor';
import { LoadStateFromFile, Redo, Undo } from './actioncreator/metaState';
import { Dialog } from "@material/mwc-dialog";
import { OperatorEnum, Operators } from "./types/Operators";
import { FullApiSystemAssignmentSelector, getOperators, getViewState } from "./selectors/normalizedEditorStateSelectors";
import { ApiFullSystemAssignment } from "./types/ApiClasses/SystemAssignment";
import { doChangeLanguage, SetEquationMinimizationLevel, SetZeroOutputVisibility, SetZeroTransitionsVisibility } from "./actioncreator/viewConfig";
import { MinimizationLevel } from "./types/NormalizedState/ViewConfig";

import downloadUrl from "./GIFT_Handbuch.pdf";

import mode from './test.json';
import Mousetrap from "mousetrap";

@customElement("top-bar-element")
export class TopBarElement extends connect(store)(LitElement) {
  language: string;
  
  constructor() {
    super();
    Mousetrap.bind('mod+z', function (e, combo) {
      e.preventDefault();
      store.dispatch(Undo());
      // logs 'ctrl+z'
    });
    Mousetrap.bind('mod+shift+z', function (e, combo) {
      e.preventDefault();
      store.dispatch(Redo());
      // logs 'ctrl+z'
    });
    Mousetrap.bind('mod+n', function (e, combo) {
      e.preventDefault();
      store.dispatch(NewAutomaton());
      // logs 'ctrl+z'
    });

    Mousetrap.bind('mod+g', function (e, combo) {
      e.preventDefault();
      store.dispatch(ChangeView(Viewstate.StateDiagram));
      // logs 'ctrl+z'
    });
    Mousetrap.bind('mod+m', function (e, combo) {
      e.preventDefault();
      store.dispatch(ChangeView(Viewstate.TransitionMatrix));
      // logs 'ctrl+z'
    });
    Mousetrap.bind('mod+e', function (e, combo) {
      e.preventDefault();
      store.dispatch(ChangeView(Viewstate.zEquations));
      // logs 'ctrl+z'
    });
    Mousetrap.bind('mod+d', function (e, combo) {
      e.preventDefault();
      store.dispatch(ChangeView(Viewstate.Simulation));
      // logs 'ctrl+z'
    });

    Mousetrap.bind('mod+s', function (e, combo) {
      e.preventDefault();
      BrowserInteractor.downloadFile(
        'test.json',
        store.getState())
      // logs 'ctrl+z'
    });

    
  }



  public connectedCallback() {
    registerTranslateConfig({
      loader: async (lang: LanguageIdentifier): Promise<Strings> => {
        this.language = lang;
        return fetch(`lang/${lang}.json`).then(
          async (res: Response): Promise<Strings> => {
            return res.json();
          },
        );
      },
    });
    use('ger');
    this.langLoaded = true;
    super.connectedCallback()
  }

  protected shouldUpdate(changedProperties: PropertyValues): boolean {
    return this.langLoaded && super.shouldUpdate(changedProperties);
  }


  @property({ type: Boolean })
  private langLoaded: boolean = false;

  @property({ type: Array }) customOperators: Operators;

  @property({ type: String }) currentSignalTab: string = "input";

  @property({ type: ApiFullSystemAssignment }) assignments: ApiFullSystemAssignment;

  @property({ type: String }) currentTab: string;

  @property({ type: String }) currentAutomatonViewTab: string = "WORKING-AUTOMATON";

  @property({ type: Boolean}) zeroOutVis: boolean = true;

  @property({ type: Boolean}) zeroEdgeVis: boolean = true;

  @property({ type: Boolean}) showDots: boolean = this.parentElement?.lastElementChild?.shadowRoot?.lastElementChild.dotsVisible; 

  stateChanged(state: MetaState) {
    this.customOperators = getOperators(state.appState.normalizedEditorState);
    this.assignments = FullApiSystemAssignmentSelector(state.appState.normalizedEditorState);
    this.currentTab = getViewState(state.appState);
  }

  static get styles(): CSSResult {
    return css`
    :host {
      min-height: 100vh;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      margin: 0 auto;
      text-align: center;
    }

    @media print {
      :host {
        display:none
      }
  }

    mwc-drawer {
      height: calc(100vh - 64px);
      z-index: 0;
      position: sticky;
    }

    mwc-top-app-bar-fixed {
      --mdc-theme-primary: var(--beast-primary-color);
    }

    mwc-fab {
      position: absolute;
      left: calc(var(--mdc-icon-button-size, 56px) / 4);
      top: calc(50vh - var(--mdc-icon-button-size, 56px) / 2);
      z-index: 1;

      transition: left 0.5s cubic-bezier(0.68, -0.35, 0.265, 1.35);
    }

    mwc-fab.open {
      left: calc(
        var(--mdc-drawer-width, 256px) - var(--mdc-icon-button-size, 56px) / 2
      );
    }

    mwc-icon {
      transform: rotate(0deg);
      transition: transform 0.5s cubic-bezier(0.68, -0.35, 0.265, 1.35);
    }

    mwc-icon.open {
      transform: rotate(540deg);
    }

    img.logo {
      height: 32px;
    }

    goldi-drop-menu {

      padding-left: 8px;
      padding-right: 8px;
    }

    .title-text {
      padding-left: 8px;
      padding-right: 32px;
      font-weight: bold;
      user-select: none;
    }

    .menu-nest {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      position: relative;
      margin-left: auto;
      width: 100%;
      height: 100%;
    }

    .seperator {
      border-top: 1px solid black;
      width: 100%;
      height: 0px;
      padding: 0;
      margin: 0;
    }



    .grid{
      display: grid;
      border-collapse: collapse;
      grid-template-columns: repeat(4,250px);
      grid-auto-rows: 50px;
    }


    mwc-dialog{
      --mdc-dialog-max-width:100%;
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
  }


  render(): TemplateResult {

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

    <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentTab==="SIMULATION"? "0.85" : "1"}; pointer-events:all; position:fixed; right:11px; top:74px; z-index:2;" title="${translate('topBar.tab4')}" icon="view_timeline" @click=${()=> (store.dispatch(ChangeView(Viewstate.Simulation)))}></mwc-icon-button>
    <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentTab==="ZEQUATIONS"? "0.85" : "1"}; pointer-events:all; position:fixed; right:71px; top:74px; z-index:2;" title="${translate('topBar.tab3')}" icon="list" @click=${()=> (store.dispatch(ChangeView(Viewstate.zEquations)))}></mwc-icon-button>
    <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentTab==="TRANSITIONMATRIX"? "0.85" : "1"}; pointer-events:all; position:fixed; right:131px; top:74px; z-index:2;" title="${translate('topBar.tab2')}" icon="table_chart" @click=${()=> (store.dispatch(ChangeView(Viewstate.TransitionMatrix)))}></mwc-icon-button>
    <mwc-icon-button class="mdc-fab" style="opacity: ${this.currentTab==="STATEDIAGRAM"? "0.85" : "1"}; pointer-events:all; position:fixed; right:191px; top:74px; z-index:2;" title="${translate('topBar.tab1')}" icon="scatter_plot" @click=${()=> (store.dispatch(ChangeView(Viewstate.StateDiagram)))}></mwc-icon-button>
       


    <mwc-top-app-bar-fixed>
      <mwc-icon-button icon="menu" slot="navigationIcon" @click=${()=> (this.invertSidebar())}></mwc-icon-button>
      <!-- <mwc-icon-button icon="menu" slot="navigationIcon"></mwc-icon-button> -->
      <div class="menu-nest" slot="title">
        <div class="title-text">GIFT</div>
    
        <div class="menu-spacer" style="width:100px"></div>
        <goldi-drop-menu label="${translate('topBar.file')}">
          <goldi-drop-menu-entry label="${translate('topBar.save')}" .keyCombo="${['Ctrl', 'S']}"  @click=${() =>
                BrowserInteractor.downloadFile(
                  'project.gift',
                  store.getState()
                )}></goldi-drop-menu-entry>
        <goldi-drop-menu-entry label="${translate('topBar.load')}" .keyCombo="${[]}" @click=${(e: Event)=><HTMLInputElement>(e.target?.firstElementChild).click()}>
          <input type="file" id="file-selector" @change=${(e: Event)=>this.openFile(e.target?.files[0])}>
        </goldi-drop-menu-entry>
        </goldi-drop-menu>
        <div class="menu-spacer"></div>
        <goldi-drop-menu label="${translate('topBar.edit')}">
          <goldi-drop-menu-entry label="${translate('topBar.undo')}" .keyCombo="${['Ctrl', 'Z']}" @click=${()=>store.dispatch(Undo())}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.redo')}" .keyCombo="${['Ctrl', 'Y']}" @click=${()=>store.dispatch(Redo())}></goldi-drop-menu-entry>
        </goldi-drop-menu>
        <div class="menu-spacer"></div>
        <goldi-drop-menu label="${translate('topBar.view')}">
          <goldi-drop-menu-entry label="${translate('topBar.tab1')}" .keyCombo="${['Ctrl', 'V']}" @click=${() => (store.dispatch(ChangeView(Viewstate.StateDiagram)))}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.tab2')}" .keyCombo="${['Ctrl', 'Shift', 'V']}" @click=${() => (store.dispatch(ChangeView(Viewstate.TransitionMatrix)))}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.tab3')}" .keyCombo="${['Ctrl', 'E']}" @click=${() => (store.dispatch(ChangeView(Viewstate.zEquations)))}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.tab4')}" .keyCombo="${['Ctrl', 'Shift', 'E']}" @click=${() => (store.dispatch(ChangeView(Viewstate.Simulation)))}></goldi-drop-menu-entry>
        </goldi-drop-menu>
        <div class="menu-spacer"></div>
        <goldi-drop-menu label="${translate('topBar.settings')}">
          <goldi-drop-menu-entry label="${translate('topBar.changelang')}" .keyCombo="${[]}" @click=${() => this.changeLanguage()}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.changeops')}" .keyCombo="${[]}" @click=${() => (this.openOperatorDialog())}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.signals')}" .keyCombo="${[]}" @click=${() => (this.openSignalDialog())}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${this.showDots? translate('topBar.sdots'):translate('topBar.hdots')}" .keyCombo="${[]}" @click=${() => (this.changeDotVisibility())}></goldi-drop-menu-entry>
        </goldi-drop-menu>

        <goldi-drop-menu label="${translate('topBar.equationsHead')}">
          <goldi-drop-menu-entry label="${translate('topBar.equations.unminimized')}" .keyCombo="${[]}" @click=${() => store.dispatch(SetEquationMinimizationLevel(MinimizationLevel.Unminimized))}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${translate('topBar.equations.minimized')}" .keyCombo="${[]}" @click=${() => store.dispatch(SetEquationMinimizationLevel(MinimizationLevel.Minimized))}></goldi-drop-menu-entry>
          <!-- <goldi-drop-menu-entry label="${translate('topBar.equations.hstar')}" .keyCombo="${[]}" @click=${() => store.dispatch(SetEquationMinimizationLevel(MinimizationLevel.HStarMinimized))}></goldi-drop-menu-entry> -->
          <goldi-drop-menu-entry label="${this.zeroOutVis? translate('topBar.0outsh') : translate('topBar.0outss')}" .keyCombo="${[]}" @click=${() => (store.dispatch(SetZeroOutputVisibility(!this.zeroOutVis)), this.zeroOutVis = !this.zeroOutVis)}></goldi-drop-menu-entry>
          <goldi-drop-menu-entry label="${this.zeroEdgeVis? translate('topBar.0edgeh') : translate("topBar.0edges")}" .keyCombo="${[]}" @click=${() => (store.dispatch(SetZeroTransitionsVisibility(!this.zeroEdgeVis)), this.zeroEdgeVis = !this.zeroEdgeVis)}></goldi-drop-menu-entry>
        
        </goldi-drop-menu>
        <div class="menu-spacer" style="width:500px"></div>
        <div style="min-width: 550px; text-align:right" class="title-text">
        ${this.currentTab==="SIMULATION"? translate("topBar.tab4") : (this.currentTab==="ZEQUATIONS"? translate("topBar.tab3") : (this.currentTab==="TRANSITIONMATRIX"? translate("topBar.tab2") : (this.currentTab==="STATEDIAGRAM"? translate("topBar.tab1") : "ERROR")))}
        ${this.currentTab==="STATEDIAGRAM"? ": " : ""}
        ${this.currentTab==="STATEDIAGRAM"? (this.currentAutomatonViewTab==="WORKING-AUTOMATON"? translate("topBar.statediagram.work"): (this.currentAutomatonViewTab==="MERGED-AUTOMATON"? translate("topBar.statediagram.merged"):(this.currentAutomatonViewTab==="HARDWARE-AUTOMATON"? translate("topBar.statediagram.hardware"):""))) : ""}
      </div>
      <mwc-icon-button icon="info" slot="navigationIcon" @click=${()=>(this.downloadHandbook())}></mwc-icon-button>
      </div>
    </mwc-top-app-bar-fixed>





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




    <mwc-dialog id="operatorDialog" scrimClickAction="" heading="${translate('pop-ups.operators.header')}">
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

        `;
  }





  downloadHandbook() {
    const elem = window.document.createElement('a');
    elem.href = downloadUrl;
    elem.download = "Handbuch.pdf";
    window.document.body.appendChild(elem);
    elem.click();
    window.document.body.removeChild(elem);
}
  



  changeDotVisibility() {
    this.showDots = !this.showDots
    this.parentElement?.lastElementChild?.shadowRoot?.lastElementChild.dotsVisible=!this.parentElement?.lastElementChild?.shadowRoot?.lastElementChild.dotsVisible
  }





  
  changeLanguage() {
    // console.log((<HTMLIFrameElement>(this.parentElement?.lastElementChild?.shadowRoot?.firstElementChild?.shadowRoot?.firstElementChild?.shadowRoot?.firstElementChild)).contentWindow)
    if(this.language==="ger"){
      this.language="eng";
      use("eng");
      store.dispatch(doChangeLanguage("eng"));
    }
    else{
      this.language="ger";
      use("ger");
      store.dispatch(doChangeLanguage("ger"));
    }
  }




  openFile(file: any) {
    var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e?.target?.result;
    var intern = JSON.parse(<any>content); // parse json 
    store.dispatch(LoadStateFromFile(intern))
  };
  let jsonfile = fileread.readAsText(file);
  // store.dispatch(LoadStateFromFile(jsonfile))
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



  openOperatorDialog() {
    (<any>this.shadowRoot?.getElementById("operatorDialog")?.shadowRoot?.getElementById("title")).style.color = "white";
    (<any>this.shadowRoot?.getElementById("operatorDialog")?.shadowRoot?.getElementById("title")).style.background = "#4f5d6e";
    (<Dialog>this.shadowRoot?.getElementById("operatorDialog")).open = true;
  }



  invertSidebar() {
    if (this.parentElement) {
      this.parentElement.getElementsByTagName("side-bar-element")[0].shown = !this.parentElement.getElementsByTagName("side-bar-element")[0].shown
      if (this.parentElement.getElementsByTagName("side-bar-element")[0].shown) {
        this.parentElement.getElementsByTagName("main-router-element")[0].leftBarSetting = 240;
      } else {
        this.parentElement.getElementsByTagName("main-router-element")[0].leftBarSetting = 74;
      }
    }
  }




  dispatchActions() {
    this.customiseAnd();
    this.customiseOr();
    this.customiseNot();
    this.customiseXOR();
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

}


declare global {
  interface HTMLElementTagNameMap {
    'top-bar-element': TopBarElement;
  }
}
