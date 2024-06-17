import {
    LitElement,
    html,
    css,
    property,
    customElement,
    query,
    internalProperty,
} from 'lit-element';

import "@material/mwc-list";
// function KeysToKBD(keys: String[]): TemplateResult[] {
//   const result = [];
//   for (let i = 0; i < keys.length; i += 1) {
//     result.push(html`<kbd>${keys[i]}</kbd>`);
//     if (i < keys.length - 1) {
//       result.push(html`+`);
//     }
//   }
//   return result;
// }

@customElement('goldi-drop-menu-entry')
export default class GoldiDropMenuEntry extends LitElement {
    @property({ type: String, reflect: true }) label = 'entry';

    @property({ type: Array, reflect: true }) keyCombo = ['Ctrl', 'Shift', 'X'];

    @internalProperty()
    isDomConnected = false;

    @query('.label')
    labelSpan!: HTMLElement;

    @query('.key-combo')
    keyComboSpan!: HTMLElement;

    static styles = css`
      mwc-list-item {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
      }
    `;

    static proposeTargetWidth(): number {
        return 250;
    }

    // <!-- ${this.keyCombo.length > 0 ? html`<div class="key-combo">${KeysToKBD(this.keyCombo)}</div>` : html``} -->

    render() {
        return html`
    <mwc-list-item>
        <div class="label">${this.label}</div>
    
        </div>
    
    
    </mwc-list-item>
      `;
    }

    firstUpdated() {
        // console.log(this.keyComboSpan.getClientRects());
    }
}


declare global {
    interface HTMLElementTagNameMap {
        'goldi-drop-menu-entry': GoldiDropMenuEntry;
    }
}