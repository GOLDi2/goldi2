import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

function autoResize(
    parent: HTMLElement,
    element: HTMLElement,
    scroll: boolean = true
) {
    const scrollTop = parent.scrollTop;
    const oldHeight = parseInt(element.style.height.slice(0, -2));
    const oldScrollHeight = element.scrollHeight;
    element.style.height = '0px';
    element.style.height = `${
        Math.abs(oldScrollHeight - element.scrollHeight) === 1
            ? oldScrollHeight
            : element.scrollHeight
    }px`;
    const newHeight = parseInt(element.style.height.slice(0, -2));
    if (scroll && element.scrollHeight > 0)
        parent.scrollTop = scrollTop + newHeight - oldHeight;
}

function resize(parent: HTMLElement, element: HTMLElement, height: string) {
    const scrollTop = parent.scrollTop;
    const scrollTopMax = (parent as any).scrollTopMax;
    element.style.height = height;
    if (scrollTop === scrollTopMax)
        parent.scrollTop = (parent as any).scrollTopMax;
}

@customElement('apitool-auto-resize-textarea')
export class AutoResizeTextArea extends LitElement {
    @query('textarea')
    textarea!: HTMLTextAreaElement;

    @property({ type: Object })
    parent!: HTMLElement;

    @property({ type: String })
    value: string = '';

    @property({ type: Boolean })
    editable: boolean = true;

    @property({ type: String })
    classes: string = '';

    resizeObserver: ResizeObserver;

    firstUpdateCompleted: boolean = false;

    constructor() {
        super();
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = parseInt(
                    this.textarea.style.height.slice(0, -2)
                );
                autoResize(
                    this.parent,
                    entry.target as HTMLElement,
                    height !== 0 && this.editable
                );
            }
            resize(this.parent, this, this.textarea.style.height);
        });
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<textarea
            @input=${this.handleInput}
            class="w-full resize-none rounded-lg overflow-hidden ${this
                .classes}"
            ?disabled=${!this.editable}
        ></textarea>`;
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.resizeObserver.disconnect();
    }

    protected firstUpdated(
        _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
    ): void {
        const resizeListener = () => {
            autoResize(this.parent, this.textarea, this.editable);
            resize(this.parent, this, this.textarea.style.height);
        };
        autoResize(this.parent, this.textarea, false);
        resize(this.parent, this, this.textarea.style.height);
        this.textarea.addEventListener('input', resizeListener);
        this.resizeObserver.observe(this.textarea);
    }

    protected updated(
        _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
    ): void {
        this.textarea.value = this.value;
        autoResize(
            this.parent,
            this.textarea,
            this.firstUpdateCompleted && this.editable
        );
        resize(this.parent, this, this.textarea.style.height);
        this.firstUpdateCompleted = true;
    }

    protected handleInput() {
        this.value = this.textarea.value;
        const updatePropertyEvent = new CustomEvent<string>('update-value', {
            detail: this.textarea.value,
        });
        this.dispatchEvent(updatePropertyEvent);
    }
}
