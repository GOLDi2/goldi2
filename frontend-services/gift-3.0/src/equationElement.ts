//EquationSetSelector(state)
import { LitElement, html, customElement, property, css } from 'lit-element';
import { connect } from 'pwa-helpers';
import { EquationSetSelector } from './selectors/normalizedEditorStateSelectors';
import { store } from './store/configureStore';
import { ApiAutomatonEquationSet, ApiControlSignalEquation, ApiOutputEquation, ApiZEquation } from './types/ApiClasses/Equation';
import { AppState } from './types/NormalizedState/AppState';
import { MetaState } from './types/NormalizedState/MetaState';



import { LanguageIdentifier, registerTranslateConfig, Strings, use, translate } from 'lit-translate';


@customElement('equation-element')
export class equationElement extends connect(store)(LitElement) {
    static styles = css`
    /* @import "@material/card/dist";
     @use "@material/card";
     @include card.core-styles;  */
    :host {
      display: block;
      padding: 16px;
      padding-top:28px;
      max-width: 100%;
      height: 100%;
      background-color:white;
      padding-right:0px;
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
    height: 94%;
    padding-left:32px;
    margin-top:5%;
    margin-right:1vw;
    margin-left:1vw;
    background-color: #4f5d6e;
    float:left; 
}
.equation-card{
    padding: 16px;
    background-color: #343E48;
    color: white;
    margin-top: 16px;
    margin-right: 32px;
    margin-bottom: 32px;
}
.smaller-width{
    min-width:45%;
}
.holder-grid{
    display: grid;
    border-collapse: collapse;
    grid-template-columns: 1fr 1fr;
}
p{
    margin-left:32px;
}
  `;




    @property({ type: Array }) equations: Array<ApiAutomatonEquationSet>;


    stateChanged(state: MetaState) {

        this.equations = EquationSetSelector(state.appState);
    }

    render() {
        return html`
            <div class="holder-grid" id="equationHolder">
                ${this.equations.map((eqSet, i, arr) => html`
                <div>
                    <div class="mdc-card card-body" style="${i%2===0? "min-width: 97%" : "min-width: 96%"}">
                    <h2 class="mdc-card autom-name-card">${eqSet.automatonName}</h2>
                    <div class="mdc-card equation-card">
                    
                    ${translate('equations.z-eq')}
                    <div>${eqSet.zEquations.map((eq, j, eqArr) => html`<div><p>${eq.name}:=${eq.equation}</p></div>`)}
                    </div>

                    <br>${translate('equations.ctrl-sigs')}
                    ${eqSet.controlSignalEquations.length < 1 ?
                html`<br><p>${translate('equations.no-ctrl-sigs')}</p>` :
                html`<div>${eqSet.controlSignalEquations.map((sig, k, sigArr) => html`<div><p>${sig.name}=${sig.equation}</p></div>`)}</div>`}
               
                    <br>${translate('equations.outputs')}
                    ${eqSet.outputEquations.length < 1 ?
                html`<br><p>${translate('equations.no-outputs')}</p>` :
                html`<div>${eqSet.outputEquations.map((out, l, outArr) => html`<div><p>${out.name}=${out.equation}</p></div>`)}</div>`}

                    </div>
                    </div>
                </div>`)} 
            </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'equation-element': equationElement;
    }
}