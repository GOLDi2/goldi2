import { LitElement, adoptStyles, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import style from '../../../stylesheet.css';
import { MessageField } from './message-field';
const stylesheet = unsafeCSS(style);

@customElement('apitool-editor')
export class Editor extends LitElement {
    @property({ type: String })
    type: 'editor' | 'creator' | 'viewer' = 'editor';

    @query('apitool-message-field')
    messageField!: MessageField;

    connectedCallback(): void {
        super.connectedCallback();
        if (this.shadowRoot) adoptStyles(this.shadowRoot, [stylesheet]);
    }

    protected render(): unknown {
        return html`<div
            class="m-4 bg-slate-100 rounded-lg p-4 flex flex-col gap-2 border-2 border-black h-fit w-[60rem] max-w-[calc(100%_-_2rem)]"
        >
            <slot></slot>
            <apitool-message-field .parent=${this}></apitool-message-field>
            ${this.renderButtons()}
        </div>`;
    }

    private renderButtons() {
        switch (this.type) {
            case 'editor':
                return this.renderEditorButtons();
            case 'creator':
                return this.renderCreatorButtons();
            case 'viewer':
                return this.renderViewerButtons();
        }
    }

    private renderEditorButtons() {
        return html` <div class="flex flex-col gap-2 mt-2">
            <div class="flex gap-2">
                <button
                    @click=${this.updateResource}
                    class="p-2 w-full rounded-lg bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-gray-50"
                >
                    Update
                </button>
                <button
                    @click=${this.deleteResource}
                    class="p-2 w-full rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-gray-50"
                >
                    Delete
                </button>
            </div>
            <button
                class="p-2 w-full rounded-lg bg-neutral-500 hover:bg-neutral-600 active:bg-neutral-700 text-gray-50"
                @click=${() => this.cancel()}
            >
                Cancel
            </button>
        </div>`;
    }

    private renderCreatorButtons() {
        return html` <div class="flex flex-col gap-2 mt-2">
            <button
                @click=${this.createResource}
                class="p-2 w-full rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-gray-50"
            >
                Create
            </button>
            <button
                class="p-2 w-full rounded-lg bg-neutral-500 hover:bg-neutral-600 active:bg-neutral-700 text-gray-50"
                @click=${this.cancel}
            >
                Cancel
            </button>
        </div>`;
    }

    private renderViewerButtons() {
        return html` <div class="flex flex-col gap-2 mt-2">
            <button
                @click=${this.deleteResource}
                class="p-2 w-full rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-gray-50"
            >
                Delete
            </button>
            <button
                class="p-2 w-full rounded-lg bg-neutral-500 hover:bg-neutral-600 active:bg-neutral-700 text-gray-50"
                @click=${() => this.cancel()}
            >
                Cancel
            </button>
        </div>`;
    }

    private createResource() {
        const createResourceEvent = new CustomEvent('create-resource');
        this.dispatchEvent(createResourceEvent);
    }

    private updateResource() {
        const updateResourceEvent = new CustomEvent('update-resource');
        this.dispatchEvent(updateResourceEvent);
    }

    private deleteResource() {
        const deleteResourceEvent = new CustomEvent('delete-resource');
        this.dispatchEvent(deleteResourceEvent);
    }

    private cancel() {
        const cancelEvent = new CustomEvent('cancel');
        this.dispatchEvent(cancelEvent);
    }
}
