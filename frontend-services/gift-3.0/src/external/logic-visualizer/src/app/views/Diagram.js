var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { store } from "../model/store";
import { LitElement, html, property, customElement } from "lit-element";
import { connect } from "pwa-helpers";
import { renderWaveForm } from "../WaveDrom/WaveDromAdapted";
import { getIsSequentialSelector, getWaveDromSourceSelector } from "../model/selectors";
import { DiagramEvent, dispatchUserChangeEvent } from "../model/Events";
import { userChange, vLineAction, zoomAction } from "../model/actions";
import BoolPropOptions from "../model/BooleanProperty";
import { TimelineData } from "../model/TimelineData";
let Diagram = /** @class */ (() => {
    let Diagram = class Diagram extends connect(store)(LitElement) {
        constructor() {
            super(...arguments);
            this.fullRedraw = true;
            this.viewMode = false;
        }
        // is called by LitElement on property changes
        render() {
            return html `
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
            <div id="handscroll" style="overflow: hidden;" @wheel="${this.customScroll}">
                <div id="lv-diagram-svg-container0" style="width: inherit;"></div>
            </div>
        `;
        }
        // is called by LitElement after an update
        updated(changedProperties) {
            let handscroll = this.shadowRoot.getElementById("handscroll");
            // diagram should stay at the same relative scroll position
            let oldScrollMax = handscroll.scrollLeftMax;
            if (oldScrollMax === undefined) { //chrome
                oldScrollMax = handscroll.scrollWidth - handscroll.clientWidth;
            }
            let relativeScroll = handscroll.scrollLeft / oldScrollMax;
            // generates the svg and attaches it to "lv-diagram-svg-container"
            renderWaveForm(this.waveDromSource, "lv-diagram-svg-container", this.shadowRoot, this.fullRedraw); // no 0 at the end, it's added in renderWaveForm
            let svg = this.shadowRoot.getElementById("svgcontent_0");
            let laneLength;
            if (this.isSequential) {
                laneLength = (2 * this.clocksElapsed + 1) * 20 * this.hscale;
            }
            else {
                laneLength = (this.clocksElapsed + 1) * 20 * this.hscale;
            }
            this.shadowRoot.getElementById("lv-diagram-svg-container0").style.marginLeft = String(laneLength + 10 - svg.clientWidth) + "px"; // clipping off the group and lane names
            let newScrollMax = handscroll.scrollLeftMax;
            if (newScrollMax === undefined) { //chrome
                newScrollMax = handscroll.scrollWidth - handscroll.clientWidth;
            }
            handscroll.scrollLeft = newScrollMax * relativeScroll; // keeping the same relative scroll position
            this.dispatchEvent(new DiagramEvent(String(laneLength) + "px", false)); // send the information to the scrollbar
            svg.ondblclick = this.customDoubleClick; // toggle inputs and vLines
            // attaching important information to the svg so that the event handler (which cannot access Diagram) can access it
            let offsetToToggleArea;
            if (this.isSequential) {
                offsetToToggleArea = 2 * this.clocksElapsed * 20 * this.hscale;
            }
            else {
                offsetToToggleArea = this.clocksElapsed * 20 * this.hscale;
            }
            svg.setAttribute("offsetToToggleArea", String(offsetToToggleArea));
            svg.setAttribute("viewMode", String(Number(this.viewMode)));
            let smallSource = { indexMap: this.waveDromSource.indexMap, signal: [...this.waveDromSource.signal] }; // don't have to stringify all
            smallSource.signal[smallSource.indexMap.states] = [];
            smallSource.signal[smallSource.indexMap.outputs] = [];
            svg.setAttribute("waveDromSource", JSON.stringify(smallSource));
        }
        // is called by redux on state changes
        stateChanged(state) {
            this.waveDromSource = getWaveDromSourceSelector(state);
            this.fullRedraw = state.fullRedraw;
            this.hscale = state.hscale;
            this.clocksElapsed = state.clocksElapsed;
            this.isSequential = getIsSequentialSelector(state);
            this.viewMode = state.viewMode;
        }
        customScroll(e) {
            if (e.ctrlKey) {
                e.preventDefault();
                store.dispatch(zoomAction(e));
            }
            else if (e.shiftKey) {
                e.preventDefault();
                this.dispatchEvent(new DiagramEvent(e.deltaY + '0', true));
            }
        }
        customDoubleClick(e) {
            let svg;
            if (e.originalTarget !== undefined) {
                if (e.originalTarget.id === "svgcontent_0") {
                    svg = e.originalTarget;
                }
                else {
                    svg = e.originalTarget.ownerSVGElement;
                }
            }
            else { //chrome
                e.path.forEach((elem) => {
                    if (elem.tagName !== undefined && elem.tagName === "svg") {
                        svg = elem;
                    }
                });
            }
            let waveDromSource = JSON.parse(svg.getAttribute("waveDromSource"));
            if (e.layerX > Number(svg.getAttribute("offsetToToggleArea")) && !Boolean(Number(svg.getAttribute("viewMode")))) {
                if (waveDromSource.indexMap.states !== undefined) {
                    let clockOffset = Math.floor((e.layerY - 60) / 30);
                    if (clockOffset < waveDromSource.signal[waveDromSource.indexMap.inputs].length - 1 && clockOffset >= 0) {
                        let clickedLane = waveDromSource.signal[waveDromSource.indexMap.inputs][Math.floor((e.layerY - 60) / 30) + 1];
                        let tld = new TimelineData("x", "x");
                        tld.values = clickedLane.wave.split("");
                        let cleanValues = tld.removeAllDots();
                        dispatchUserChangeEvent({ inputs: [{ name: clickedLane.name, value: String((Number(cleanValues[cleanValues.length - 1]) + 1) % 2) }] });
                    }
                    if (e.layerY < 20) {
                        store.dispatch(vLineAction(e.layerX));
                    }
                }
                else {
                    let clockOffset = Math.floor((e.layerY) / 30);
                    if (clockOffset < waveDromSource.signal[waveDromSource.indexMap.inputs].length - 1) {
                        let clickedLane = waveDromSource.signal[waveDromSource.indexMap.inputs][Math.floor((e.layerY) / 30) + 1];
                        let tld = new TimelineData("x", "x");
                        tld.values = clickedLane.wave.split("");
                        let cleanValues = tld.removeAllDots();
                        store.dispatch(userChange({ inputs: [{ name: clickedLane.name, value: String((Number(cleanValues[cleanValues.length - 1]) + 1) % 2) }] }));
                    }
                }
            }
            else if (e.layerY < 20) {
                store.dispatch(vLineAction(e.layerX));
            }
        }
    };
    __decorate([
        property({ type: Object })
    ], Diagram.prototype, "waveDromSource", void 0);
    __decorate([
        property(BoolPropOptions)
    ], Diagram.prototype, "fullRedraw", void 0);
    __decorate([
        property(BoolPropOptions)
    ], Diagram.prototype, "viewMode", void 0);
    __decorate([
        property({ type: Number })
    ], Diagram.prototype, "hscale", void 0);
    __decorate([
        property({ type: Number })
    ], Diagram.prototype, "clocksElapsed", void 0);
    __decorate([
        property({ type: Number })
    ], Diagram.prototype, "isSequential", void 0);
    Diagram = __decorate([
        customElement('lv-diagram')
    ], Diagram);
    return Diagram;
})();
export default Diagram;
//# sourceMappingURL=Diagram.js.map