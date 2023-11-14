import { LitElement, adoptStyles, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import style from '../../../stylesheet.css';
const stylesheet = unsafeCSS(style);

@customElement('apitool-collapsable-element')
export class CollapsableElement extends LitElement {
    @property({ type: String })
    title: string = 'UNDEFINED_TITLE';

    @property({ type: String })
    titleAlign: 'left' | 'center' = 'center';

    @property({ type: Object })
    parent?: LitElement;

    @property({ type: Boolean })
    isOpen: boolean = false;

    connectedCallback(): void {
        super.connectedCallback();
        if (this.shadowRoot) adoptStyles(this.shadowRoot, [stylesheet]);
    }

    protected render(): unknown {
        return html`<div class="w-full flex flex-col">
            <div class="w-full flex justify-center items-center relative">
                <slot name="pre-title"></slot>
                <p
                    class="w-[calc(100%_-_4rem)] ${this.titleAlign === 'left'
                        ? 'text-left relative'
                        : 'text-center absolute'} whitespace-nowrap overflow-hidden text-ellipsis"
                >
                    ${this.title}
                </p>
                ${renderChevron(this.isOpen, this.toggleOpen)}
            </div>
            <div ?hidden=${!this.isOpen} class="mt-2">
                <slot></slot>
            </div>
        </div>`;
    }

    protected async toggleOpen() {
        this.isOpen = !this.isOpen;

        if (this.parent) {
            const scrollTop = this.parent.scrollTop;
            await this.updateComplete;
            await this.parent.updateComplete;
            this.parent.scrollTop = scrollTop;
        }
    }
}

function renderChevron(isOpen: boolean, onClick: () => void) {
    if (!isOpen)
        return html`<svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-8 h-8 ml-auto hover:cursor-pointer hover:bg-slate-400 active:bg-slate-500 rounded-full p-1 relative flex-shrink-0"
            @click=${onClick}
        >
            <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
            />
        </svg> `;
    else
        return html`<svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-8 h-8 ml-auto hover:cursor-pointer hover:bg-slate-400 active:bg-slate-500 rounded-full p-1 relative flex-shrink-0"
            @click=${onClick}
        >
            <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
            />
        </svg> `;
}
