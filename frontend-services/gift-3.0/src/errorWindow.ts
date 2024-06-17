import { Dialog } from '@material/mwc-dialog';
import { LitElement, html, customElement, property, css } from 'lit-element';
import { sortedIndex } from 'lodash';
import { connect } from 'pwa-helpers';
import { createTextChangeRange } from 'typescript';
import { AddTransition, ChangeAutomatonName, ChangeControlSignalName, ChangeNodeName, ChangeNodeNumber, ChangeTransitionMatrixEntry, ChangeView, ResetControlSignal, Resetoutput, SetControlSignal, SetOutput } from './actioncreator/editorState';
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
import { LanguageIdentifier, registerTranslateConfig, Strings, use, translate } from 'lit-translate';




@customElement('error-window')
export class ErrorWindow extends connect(store)(LitElement) {

    constructor() {
        super();
    }


    static styles = css`
    :host {
      display: block;
      pointer-events:all;
      
      z-index:5;
    }
    mwc-textfield{
        --mdc-theme-primary: black;
        --mdc-theme-on-primary: white;
        max-width: 200px
      }
      mwc-button {
        --mdc-theme-primary: black;
        --mdc-theme-on-primary: white;
        padding-top:10px;
  `;

    @property({ type: Boolean }) openWindow: boolean = false;
    @property({ type: String }) invalidValue: string|number;
    @property({ type: String }) lastValid: string | number;
    @property({ type: String }) errorName: string;
    @property({ type: String }) errorType: string;
    @property({ type: String }) errorMessage: string;
    @property({ type: Number }) errorObjectId: number;
    @property({ type: Number }) freeParameter: number|string;

    stateChanged(state: MetaState) {
    }



    render() {
        return html`
        <mwc-dialog id="new-automaton-dialog" scrimClickAction="" heading=${this.errorName} .open=${this.openWindow}>
            <mwc-button 
                id="accButton"
                slot="primaryAction" 
                @click=${() => {
                let value=(<HTMLInputElement>this.shadowRoot?.querySelector(".textfield")).value
                switch (this.errorType) {
                    case "AutomatonNameError": {
                        if(value===""){
                            this.openWindow=true;
                            this.errorMessage= this.errorMessage + " Your new value could not fix this error."
                        }
                        else{
                        store.dispatch(ChangeAutomatonName(this.errorObjectId,value));
                        this.openWindow = false 
                        }
                    break;
                    }
                    case "SignalNameError": {
                        if(value===""){
                            this.openWindow=true;
                            this.errorMessage= this.errorMessage + " Your new value could not fix this error."
                        }
                        else{
                        store.dispatch(ChangeControlSignalName(this.errorObjectId,this.lastValid+"",value));
                        this.openWindow = false 
                        }
                    break;
                    }
                    case "NodeNameError": {
                        if(value===""){
                            this.openWindow=true;
                            this.errorMessage= this.errorMessage + " Your new value could not fix this error."
                        }
                        else{
                        store.dispatch(ChangeNodeNumber(<number>this.lastValid,<number><unknown>value));
                        this.openWindow = false 
                        }
                    break;
                    }
                    case "TransitionError": {
                        if(value===""){
                            this.openWindow=true;
                            this.errorMessage= this.errorMessage + " Your new value could not fix this error."
                        }
                        else{
                        store.dispatch(ChangeTransitionMatrixEntry(<number>this.errorObjectId,<number>this.freeParameter,value));
                        this.openWindow = false 
                        }
                    break;
                    }
                    case "CtrlAssignmentError": {
                        if(value===""){
                            this.openWindow=true;
                            this.errorMessage= this.errorMessage + " Your new value could not fix this error."
                        }
                        else{
                        store.dispatch(SetControlSignal(<number>this.errorObjectId,this.freeParameter+"",value));
                        this.openWindow = false 
                        }
                    break;
                    }
                    case "OutputAssignmentError": {
                        if(value===""){
                            this.openWindow=true;
                            this.errorMessage= this.errorMessage + " Your new value could not fix this error."
                        }
                        else{
                        store.dispatch(SetOutput(<number>this.errorObjectId, this.freeParameter+"",value));
                        this.openWindow = false 
                        }
                    break;
                    }
                    default:{
                    break;
                    }
                }
                    }}>
                ${translate('pop-ups.accept')}
            </mwc-button>
            <mwc-button 
                id="accButton"
                slot="secondaryAction" 
                @click=${() => {
                let value=<string>this.lastValid;
                switch (this.errorType) {
                    case "AutomatonNameError": {
                        store.dispatch(ChangeAutomatonName(this.errorObjectId,value));
                        this.openWindow = false 
                        
                    break;
                    }
                    case "SignalNameError": {
                        store.dispatch(ChangeControlSignalName(this.errorObjectId,this.lastValid+"",value));
                        this.openWindow = false 
                        
                    break;
                    }
                    case "NodeNameError": {
                        store.dispatch(ChangeNodeNumber(<number>this.lastValid,<number><unknown>value));
                        this.openWindow = false 
                        
                    break;
                    }
                    case "TransitionError": {
                        store.dispatch(ChangeTransitionMatrixEntry(<number>this.errorObjectId,<number>this.freeParameter,value));
                        this.openWindow = false 
                    break;
                    }
                    case "CtrlAssignmentError": {
                        store.dispatch(SetControlSignal(<number>this.errorObjectId,this.freeParameter+"",value));
                        this.openWindow = false 
                    break;
                    }
                    case "OutputAssignmentError": {
                        store.dispatch(SetOutput(<number>this.errorObjectId, this.freeParameter+"",value));
                        this.openWindow = false 
                    break;
                    }
                    default:{
                    break;
                    }
                }
                    }}>
                ${translate('pop-ups.undo')}
            </mwc-button>
            

            <p>${this.errorMessage}</p>
            <p>${translate('pop-ups.error.choseNew')}</p>
            <mwc-textfield class="textfield" style="max-width:200px; height:40px" outlined id="newValue" @change=${() => {
            }}></mwc-textfield>
            <p>${translate('pop-ups.error.choseUndo')}</p>
        
        </mwc-dialog>
        `;
    }





    foo(): string {
        return 'foo';
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'error-window': ErrorWindow;
    }
}