import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type Message = { id?: string; type: 'success' | 'error'; value: string };

@customElement('apitool-message-field')
export class MessageField extends LitElement {
    @property({ type: Array })
    messages: Message[] = [];

    @property({ type: Object })
    parent!: LitElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        if (this.messages.length === 0) {
            this.hidden = true;
            return html``;
        }

        this.hidden = false;
        return html`<div class="flex flex-col">
            <p>Messages:</p>
            <div class="flex flex-col gap-2">
                ${this.messages.map(this.renderMessage.bind(this))}
            </div>
        </div>`;
    }

    private renderMessage(message: Message) {
        return html`<apitool-auto-resize-textarea
            id="input-description"
            class="${message.type === 'success'
                ? 'text-green-600'
                : 'text-red-600'}"
            .parent=${this}
            .classes=${'p-[calc(0.5rem_+_1px)] border'}
            .value=${message.value}
            .editable=${false}
        ></apitool-auto-resize-textarea>`;
    }

    public addMessage(type: 'success' | 'error', value: string, id?: string) {
        const index = this.messages.findIndex(
            (message) => message.id && message.id === id
        );

        if (index === -1) this.messages.push({ type, value, id });
        else this.messages[index] = { type, value, id };

        this.messages = [...this.messages];
    }

    public removeMessageWithId(id: string) {
        this.messages = this.messages.filter(
            (message) => message.id && message.id !== id
        );
        console.log(id, this.messages);
    }

    public removeAllErrorMessages() {
        this.messages = this.messages.filter(
            (message) => message.type !== 'error'
        );
    }

    public removeAllSuccessMessages() {
        this.messages = this.messages.filter(
            (message) => message.type !== 'success'
        );
    }
}
