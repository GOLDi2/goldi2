import {
    LitElement,
    html,
    css,
    property,
    customElement,
    query,
    queryAssignedNodes,
    PropertyValues,
} from 'lit-element';
import { Button } from '@material/mwc-button';
import { Menu } from '@material/mwc-menu';
import "@material/mwc-menu";
import "@material/mwc-button";
import GoldiDropMenuEntry from './goldi-drop-menu-entry';
import { Undefable } from './utils/generic-types';

// function generateKeyCombo(combo: string[]): TemplateResult[] {
//   const result = [];
//   for (let i = 0; i < combo.length; i++) {
//     result.push(html`<kbd>${combo[i]}</kbd>`);
//     if (i < combo.length - 1) {
//       result.push(html`+`);
//     }
//   }
//   return result;
// }


@customElement('goldi-drop-menu')
export default class GoldiDropMenu extends LitElement {
    @property({ type: Boolean, reflect: true })
    dropped = false;

    @property({ type: String, reflect: true }) label = 'button';

    @query('#menu_button')
    menuButton: Undefable<Button>;

    // protected get menuButton(): Undefable<Button> {
    //   return this.renderRoot.querySelector("#menu_button") as Undefable<Button>;
    // }

    @query('#menu_body')
    menuBody: Undefable<Menu>;

    // protected get menuBody(): Undefable<Menu> {
    //   return this.renderRoot.querySelector("#menu_body") as Undefable<Menu>;
    // }

    @queryAssignedNodes('', false, 'goldi-drop-menu-entry') menuEntries!:
        | GoldiDropMenuEntry[]
        | null;

    // @property({ type: String }) menuWidth = 'auto';

    static styles = css`
      :host {
        position: relative;
        z-index: 10;
      }

      mwc-button{
        --mdc-theme-primary: rgb(52, 62, 72);
      }
  
      mwc-menu {
        display: flex;
        flex-flow: column nowrap;
      }
    `;

    // linter wants this
    _setMenu() {
        this.menuBody!.open = true;
    }

    updated(p: PropertyValues) {
        super.updated(p);
        // console.log(this.renderRoot.querySelector("#menu_button"));
        if (this.menuBody !== undefined && this.menuButton !== undefined) {
            this.menuBody.anchor = this.menuButton;
            this.menuButton.addEventListener('click', () => {
                this._setMenu();
            });
        }
    }

    render() {
        super.render();

        return html`
        <div style="position: relative;">
            <mwc-button id="menu_button" raised @clicked=${()=> this._setMenu()}
                label=${this.label}
                ></mwc-button>
            <mwc-menu id="menu_body" ?open="${this.dropped}" .corner=${'BOTTOM_LEFT'} fixed>
                <slot></slot>
            </mwc-menu>
        </div>
      `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'goldi-drop-menu': GoldiDropMenu;
    }
}