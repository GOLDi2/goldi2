import { LitElement, html, property, customElement, TemplateResult, PropertyValues } from "lit-element";

import { connect } from "pwa-helpers";
import { store } from './store/configureStore';
import "@material/mwc-top-app-bar-fixed";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";
import "./external/logic-visualizer/iFrameComponent/component/logic_visualizer"

import { DEFAULT_NODE_RADIUS } from './types/Node';
import { getViewState } from "./selectors/normalizedEditorStateSelectors";
import Mousetrap from "mousetrap";
import { AppState } from "./types/NormalizedState/AppState";
import { MetaState } from "./types/NormalizedState/MetaState";
import { Redo, Undo } from "./actioncreator/metaState";

import "@material/mwc-icon-button";

import 'regenerator-runtime/runtime'


import { LanguageIdentifier, registerTranslateConfig, Strings, use,translate } from 'lit-translate';

@customElement("main-router-element")
export class MainRouterElement extends connect(store)(LitElement) {
  constructor() {
    super();
    this.currentView = "working-automaton"
    

    // let automButton = this.shadowRoot;
    // Mousetrap.bind('ctrl+i', function (e, combo) {
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.visibility = "hidden";
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.height = "0px";
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.padding = "0px";
    // });

    // Mousetrap.bind('ctrl+m', function (e, combo) {
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.visibility = "visible";
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.height = "1275px";
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.padding = "16px";
    //   (<HTMLElement>(automButton?.getElementById("automButton"))).style.paddingLeft = "80px";
    // });
  }

    

  public connectedCallback () {
    registerTranslateConfig({
        loader: async (lang: LanguageIdentifier): Promise<Strings> => {
            return fetch(`/lang/${lang}.json`).then(
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

protected shouldUpdate (changedProperties: PropertyValues): boolean {
  return this.langLoaded && super.shouldUpdate(changedProperties);
}

  /**
   * Der aktuelle Anzeigetab
   */
  @property({ type: String }) currentTab: string;
  @property({ type: String }) currentView: string;
  @property({ type: Number }) leftBarSetting: number = 74;


  @property({ type: Boolean })
    private langLoaded: boolean = false;

    @property({ type: Boolean })
    private errorWindowOpen: boolean = false;


  stateChanged(state: MetaState) {
    this.currentTab = getViewState(state.appState);
    
  }

  render(): TemplateResult {
    
    return html`
    
    ${this.mapRout(this.currentTab, this.currentView)}
      `}

  /**
   * Entscheidet welches HTML verwendet wird in Abhängigkeit von dem ausgewaehlten Tab
   * @param currentTab Der aktuelle Tab
   */
  mapRout(currentTab: string, currentView: string): TemplateResult {
    
    
    switch (currentTab) {
      case "STATEDIAGRAM": {
        switch (currentView) {
          case "working-automaton": {
            // console.log("O1")
            return html` 
          
            

            <!-- <my-element></my-element> -->
            
            <automaton-button id="automButton" style="visibility:hidden; height:0px; padding:0px;padding-left: ${this.leftBarSetting+6}px;">
                
            </automaton-button>

            <error-window class="errorWindow" .openWindow=${this.errorWindowOpen} style="padding-left: ${this.leftBarSetting+6}px;"></error-window>
            
            <graph-viewer currentAutomView="working-automaton" leftSpace=${this.leftBarSetting-44} style="padding: ${DEFAULT_NODE_RADIUS}px;padding-left: ${this.leftBarSetting+6}px;" >
            
            </graph-viewer>

            `;
          }
          case "merged-automaton": {
            // console.log("O2")
            return html` 

            
            <!-- <my-element></my-element> -->
            
            <automaton-button id="automButton" style="visibility:hidden; height:0px; padding:0px;padding-left: ${this.leftBarSetting+6}px;">
                
            </automaton-button>

            <error-window class="errorWindow" .openWindow=${this.errorWindowOpen} style="padding-left: ${this.leftBarSetting+6}px;"></error-window>
            
            <graph-viewer currentAutomView="merged-automaton" leftSpace=${this.leftBarSetting-44} style="padding: ${DEFAULT_NODE_RADIUS}px;padding-left: ${this.leftBarSetting+6}px;" >
            
            </graph-viewer>


            `;
          }
          case "hardware-automaton": {
            // console.log("O3")
            return html` 

            
            <!-- <my-element></my-element> -->
            
            <automaton-button id="automButton" style="visibility:hidden; height:0px; padding:0px;padding-left: ${this.leftBarSetting+6}px;">
                
            </automaton-button>

            <error-window class="errorWindow" .openWindow=${this.errorWindowOpen} style="padding-left: ${this.leftBarSetting+6}px;"></error-window>
            
            <graph-viewer currentAutomView="hardware-automaton" leftSpace=${this.leftBarSetting-44} style="padding: ${DEFAULT_NODE_RADIUS}px;padding-left: ${this.leftBarSetting+6}px;" >
            
            </graph-viewer>



            `;
          }
        }
      }
      case "TRANSITIONMATRIX": {
        return html` 
        <transition-matrix  style="padding-left: ${this.leftBarSetting}px;"></transition-matrix>
        <error-window class="errorWindow" .openWindow=${this.errorWindowOpen} style="padding-left: ${this.leftBarSetting+6}px;"></error-window>
            
        `;
      }
      case "ZEQUATIONS": {
        return html` <equation-element  style="padding-left: ${this.leftBarSetting}px;"></equation-element>
        <error-window class="errorWindow" .openWindow=${this.errorWindowOpen} style="padding-left: ${this.leftBarSetting+6}px;"></error-window>`;
        
      }
      case "SIMULATION": {
        return html` <simulation-element style="padding-left: ${this.leftBarSetting}px;"></simulation-element>
        <error-window class="errorWindow" .openWindow=${this.errorWindowOpen} style="padding-left: ${this.leftBarSetting+6}px;"></error-window>`;
      }
    }
    return html`<div>grober fehler</div>`
  }



}


declare global {
  interface HTMLElementTagNameMap {
    'main-router-element': MainRouterElement;
  }
}
