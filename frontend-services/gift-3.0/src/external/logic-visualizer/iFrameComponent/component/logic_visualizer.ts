import { LitElement, html, customElement } from 'lit-element';

@customElement('logic-visualizer')
export class LogicVisualizer extends LitElement {
    constructor() {
        super();
        let forwardToFrame = (e) => {(this.shadowRoot.children[0] as HTMLIFrameElement).contentWindow.postMessage({type: e.type, args:e.args},"*");}
        document.addEventListener('lv-initialize', forwardToFrame);
        document.addEventListener('lv-simulator-change', forwardToFrame);

        function receiveMessage(e) {
            console.log(e)
            let event = new CustomEvent( e.data.type );
            event[ "args" ] = e.data.args;
            document.dispatchEvent(event);
        }
        window.addEventListener("message", receiveMessage, false);
    }

    render() {
        return html`<iframe style="width: 100%;" src="https://x105.theoinf.tu-ilmenau.de/waveform/"></iframe>`;
    }
}