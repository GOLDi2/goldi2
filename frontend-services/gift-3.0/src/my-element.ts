/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {LitElement, html, customElement, property, css} from 'lit-element';
import {connect}  from  'pwa-helpers';
import { AddTransition, ChangeView } from './actioncreator/editorState';
import { AppState, store} from './store/configureStore';
import { Viewstate } from './types/view';





/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends connect (store)(LitElement) {

  constructor() {
    super();

  }
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      margin-top: 64px;
    }
  `;

@property({type : Number}) counter:number;
@property({type:String}) name:string;

stateChanged(state:AppState){
this.counter=state.counter.counter;
this.name =state.counter.name;

}
  render() {
    return html`
      <h1>Hello, }!</h1>

      
      <button @click=${() => store.dispatch(AddTransition(0,0,1))}>+ ${this.name}</button>
      Click Count: ${this.counter}
    </button>

      <button @click=${() => store.dispatch(AddTransition(0,1,2))}>+ ${this.name}</button>
        Click Count: ${this.counter}
      </button>

    <button @click=${() => store.dispatch(ChangeView(Viewstate.StateDiagram))}>+ ${this.name}</button>
    Click Count: ${this.counter}

    <button @click=${() => store.dispatch(ChangeView(Viewstate.zEquations))}>+ ${this.name}</button>
    Click Count: ${this.counter}

    <button @click=${() => store.dispatch(ChangeView(Viewstate.TransitionMatrix))}>+ ${this.name}</button>
    Click Count: ${this.counter}
  </button>


      <slot></slot>
    `;
  }


  foo(): string {
    return 'foo';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
