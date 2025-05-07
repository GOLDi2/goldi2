var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement } from 'lit-element';
let LogicVisualizer = /** @class */ (() => {
    let LogicVisualizer = class LogicVisualizer extends LitElement {
        constructor() {
            super();
            let forwardToFrame = (e) => { this.shadowRoot.children[0].contentWindow.postMessage({ type: e.type, args: e.args }, "*"); };
            document.addEventListener('lv-initialize', forwardToFrame);
            document.addEventListener('lv-simulator-change', forwardToFrame);
            function receiveMessage(e) {
                console.log(e);
                let event = new CustomEvent(e.data.type);
                event["args"] = e.data.args;
                document.dispatchEvent(event);
            }
            window.addEventListener("message", receiveMessage, false);
        }
        render() {
            return html `<iframe style="width: 100%;" src="https://x105.theoinf.tu-ilmenau.de/waveform/"></iframe>`;
        }
    };
    LogicVisualizer = __decorate([
        customElement('logic-visualizer')
    ], LogicVisualizer);
    return LogicVisualizer;
})();
export { LogicVisualizer };
//# sourceMappingURL=logic_visualizer.js.map