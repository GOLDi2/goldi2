import {store} from "../model/store";
import {LitElement, html, property, customElement} from "lit-element";
import {connect} from "pwa-helpers";
import {reduxState} from "../model/reducer";
import {renderWaveForm} from "../WaveDrom/WaveDromAdapted";
import {getIsSequentialSelector, getWaveDromSourceSelector} from "../model/selectors";
import {DiagramEvent, dispatchUserChangeEvent} from "../model/Events";
import {userChange, vLineAction, zoomAction} from "../model/actions";
import BoolPropOptions from "../model/BooleanProperty";
import {TimelineData} from "../model/TimelineData";

@customElement('lv-diagram')
export default class Diagram extends connect(store)(LitElement) {

    @property({type: Object}) waveDromSource;
    @property(BoolPropOptions) fullRedraw = true;
    @property(BoolPropOptions) viewMode = false;
    @property({type:  Number}) hscale;
    @property({type:  Number}) clocksElapsed;
    @property({type:  Number}) isSequential;

    // is called by LitElement on property changes
    render() {
        return html`
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
            <div id="handscroll" style="overflow: hidden;" @wheel="${this.customScroll}">
                <div id="lv-diagram-svg-container0" style="width: inherit;"></div>
            </div>
        `;
    }

    // is called by LitElement after an update
    updated(changedProperties) {
        let handscroll: HTMLElement  = this.shadowRoot.getElementById("handscroll");

        // diagram should stay at the same relative scroll position
        let oldScrollMax: number = (handscroll as any).scrollLeftMax;
        if(oldScrollMax === undefined) { //chrome
            oldScrollMax = handscroll.scrollWidth - handscroll.clientWidth;
        }

        let relativeScroll: number = handscroll.scrollLeft / oldScrollMax;

        // generates the svg and attaches it to "lv-diagram-svg-container"
        renderWaveForm(this.waveDromSource, "lv-diagram-svg-container", this.shadowRoot, this.fullRedraw); // no 0 at the end, it's added in renderWaveForm

        let svg: HTMLElement = this.shadowRoot.getElementById("svgcontent_0");
        let laneLength: number;

        if(this.isSequential) {
            laneLength = (2*this.clocksElapsed +1)*20*this.hscale;
        } else {
            laneLength = (this.clocksElapsed +1)*20*this.hscale;
        }

        this.shadowRoot.getElementById("lv-diagram-svg-container0").style.marginLeft = String(laneLength +10 - svg.clientWidth)+"px"; // clipping off the group and lane names

        let newScrollMax: number = (handscroll as any).scrollLeftMax;
        if(newScrollMax === undefined) { //chrome
            newScrollMax = handscroll.scrollWidth - handscroll.clientWidth;
        }

        handscroll.scrollLeft = newScrollMax * relativeScroll; // keeping the same relative scroll position
        this.dispatchEvent(new DiagramEvent(String(laneLength)+"px", false)); // send the information to the scrollbar

        svg.ondblclick = this.customDoubleClick; // toggle inputs and vLines

        // attaching important information to the svg so that the event handler (which cannot access Diagram) can access it
        let offsetToToggleArea: number;
        if(this.isSequential) {
            offsetToToggleArea = 2*this.clocksElapsed*20*this.hscale;
        } else {
            offsetToToggleArea = this.clocksElapsed*20*this.hscale;
        }
        svg.setAttribute("offsetToToggleArea", String(offsetToToggleArea));

        svg.setAttribute("viewMode", String(Number(this.viewMode)));

        let smallSource = {indexMap: this.waveDromSource.indexMap, signal: [...this.waveDromSource.signal]}; // don't have to stringify all
        smallSource.signal[smallSource.indexMap.states] = [];
        smallSource.signal[smallSource.indexMap.outputs] = [];
        svg.setAttribute("waveDromSource", JSON.stringify(smallSource));
    }

    // is called by redux on state changes
    stateChanged(state: reduxState) {
        this.waveDromSource = getWaveDromSourceSelector(state);
        this.fullRedraw     = state.fullRedraw;
        this.hscale         = state.hscale;
        this.clocksElapsed  = state.clocksElapsed;
        this.isSequential   = getIsSequentialSelector(state);
        this.viewMode       = state.viewMode;
    }

    customScroll(e) {
        if(e.ctrlKey) {
            e.preventDefault();
            store.dispatch(zoomAction(e));
        } else if(e.shiftKey) {
            e.preventDefault();
            this.dispatchEvent(new DiagramEvent(e.deltaY+'0', true));
        }
    }

    customDoubleClick(e){
        let svg: HTMLElement;
        if(e.originalTarget !== undefined) {
            if (e.originalTarget.id === "svgcontent_0") {
                svg = e.originalTarget;
            } else {
                svg = e.originalTarget.ownerSVGElement;
            }
        } else { //chrome
            e.path.forEach((elem: HTMLElement) => {
                if(elem.tagName !== undefined && elem.tagName === "svg") {
                    svg = elem;
                }
            });
        }

        let waveDromSource = JSON.parse(svg.getAttribute("waveDromSource"));

        if(e.layerX > Number(svg.getAttribute("offsetToToggleArea")) && !Boolean(Number(svg.getAttribute("viewMode")))) {
            if(waveDromSource.indexMap.states !== undefined) {
                let clockOffset: number = Math.floor((e.layerY - 60)/30);

                if( clockOffset < waveDromSource.signal[waveDromSource.indexMap.inputs].length-1 && clockOffset >= 0){
                    let clickedLane = waveDromSource.signal[waveDromSource.indexMap.inputs][Math.floor((e.layerY - 60)/30)+1];
                    let tld: TimelineData = new TimelineData("x", "x");

                    tld.values = clickedLane.wave.split("");
                    let cleanValues = tld.removeAllDots();

                    dispatchUserChangeEvent({inputs: [{name: clickedLane.name, value: String((Number(cleanValues[cleanValues.length-1]) + 1) % 2)}]});
                }
                if(e.layerY < 20){
                    store.dispatch(vLineAction(e.layerX));
                }
            } else {
                let clockOffset: number = Math.floor((e.layerY)/30);

                if( clockOffset < waveDromSource.signal[waveDromSource.indexMap.inputs].length-1){
                    let clickedLane = waveDromSource.signal[waveDromSource.indexMap.inputs][Math.floor((e.layerY)/30)+1];
                    let tld: TimelineData = new TimelineData("x", "x");

                    tld.values = clickedLane.wave.split("");
                    let cleanValues = tld.removeAllDots();

                    store.dispatch(userChange({inputs: [{name: clickedLane.name, value: String((Number(cleanValues[cleanValues.length-1]) + 1) % 2)}]}));
                }
            }
        } else if(e.layerY < 20){
            store.dispatch(vLineAction(e.layerX));
        }
    }
}