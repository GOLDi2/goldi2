import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import ace, { Ace } from 'ace-builds';

@customElement('apitool-auto-resize-json-editor')
export class AutoResizeJSONEditor extends LitElement {
    @query('#container')
    container!: HTMLDivElement;

    @property({ type: String })
    value: string = '';

    editor!: Ace.Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div id="container" class="rounded-lg"></div>`;
    }

    protected firstUpdated(
        _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
    ): void {
        this.editor = ace.edit(this.container, {
            mode: 'ace/mode/json',
            maxLines: 30,
            wrap: false,
            autoScrollEditorIntoView: true,
            fontSize: 16,
            tabSize: 2,
            showPrintMargin: false,
        });
        this.editor.container.style.lineHeight = '24px';
        this.editor.renderer.updateFontSize();
        this.editor.setValue(this.value);
        this.editor.addEventListener('change', () => {
            this.value = this.editor.getValue();
            const event = new CustomEvent<string>('update-value', {
                detail: this.editor.getValue(),
            });
            this.dispatchEvent(event);
        });
    }
}
