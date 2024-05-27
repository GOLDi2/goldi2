import {LitElement, html, customElement, property, css} from 'lit-element';
import {connect}  from  'pwa-helpers';
import { RemoveNode } from './actioncreator/editorState';
import { AppState, store} from './store/configureStore';

@customElement('test-button')
export class TestButton extends connect(store) (LitElement){
  static styles = css`
  :host {
    display: block;
    border: solid 1px gray;
    padding: 16px;
    max-width: 800px;
  }
`;

@property({type:Number}) counter:number;

stateChanged(state:AppState){
this.counter=state.counter.counter;
}
render() {
  return html`
    <h1>Hello, }!</h1>
    <button @click=${() => (store.dispatch(RemoveNode(1)))}>-</button>
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
      'test-button': TestButton;
    }
  }