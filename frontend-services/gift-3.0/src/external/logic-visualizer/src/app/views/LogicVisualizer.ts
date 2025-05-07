import {customElement, html, LitElement} from "lit-element";
import {store} from "../model/store";
import {
    ClockEvent,
    DiagramEvent, ExportEvent,
    InitArgs,
    InitializeVisualizerEvent, ResetEvent,
    SimulatorChangeEvent,
    UserChangeEvent
} from "../model/Events"
import {clock, initializeVisualizer, simulatorChange, userChange} from "../model/actions";
import {saveAs} from "file-saver";
import {SvgToPngConverter} from "../model/SvgToPngConverter";
import {getWaveJsonSelector} from "../model/selectors";

@customElement('logic-visualizer')
export default class LogicVisualizer extends LitElement {

    // args = {
    //          inputs: [{
    //              name: "x0",
    //              initValue: 0
    //          }, {}, ...],
    //          states: [],
    //          outputs: [],
    //          hStar: 0,
    //          canSetState: true
    // }
    args: InitArgs;

    constructor() {
        super();
        // should it be important to handle late answer Events one could send the current state.clocksElapsed with the request event
        //     and on getting the answer change the value in the correct position in the state (add a parameter to TimelineData.updateValue())

        // LogicVisualizer catches all relevant events and translates them to method calls
        document.addEventListener('lv-initialize', (e: InitializeVisualizerEvent) => {
            // remember the args for resetting
            this.args = e.args;
            store.dispatch(initializeVisualizer(e.args));
        });
        document.addEventListener('lv-user-change', (e: UserChangeEvent) => {
            store.dispatch(userChange(e.args));
        });
        document.addEventListener('lv-simulator-change', (e: SimulatorChangeEvent) => {
            store.dispatch(simulatorChange(e.args));
        });
        document.addEventListener('lv-clock', (e: ClockEvent) => {
            store.dispatch(clock());
        });
        document.addEventListener('lv-reset', (e: ResetEvent) => {
            store.dispatch(initializeVisualizer(this.args));
        });
    }

    // is called by LitElement on property changes
    render() { //TODO should probably move the scrollbar into diagram
        return html`
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
            <div id="lv-box" style="display: grid; grid-template-rows: auto 18px max-content; width: inherit; height: inherit;">
                <div style="display: grid; overflow-y: scroll; width: inherit; grid-template-columns: max-content 100%; overflow-x: hidden;">
                    <lv-legend id="lv-legend" style="grid-column: 1;display: inline-block;"></lv-legend>
                    <lv-diagram id="lv-diagram" style="grid-column: 2; display: inline-block;"></lv-diagram>
                </div>
                <div id="fixed-scroll" style="overflow: auto; background: transparent !important;" @scroll="${this.synchScroll}">
                    <div id="fixed-scroll-content" style="height: 1px;background: transparent !important;"></div>
                </div>
                <lv-menu id="lv-menu" style="display: block; margin-top: 2px; width: inherit;"></lv-menu>
            </div>
        `;
    }

    // is called by LitElement on the first ever update performed, before updated() is called
    firstUpdated(changedProperties) {
        this.shadowRoot.getElementById("lv-diagram").addEventListener("lv-diagram-svg-change", (e: DiagramEvent) => {
            let fixedScroll: HTMLElement    = this.shadowRoot.getElementById("fixed-scroll");
            let diagram: HTMLElement        = this.shadowRoot.getElementById("lv-diagram");
            let legend: HTMLElement         = this.shadowRoot.getElementById("lv-legend");

            diagram.style.width = String(this.shadowRoot.getElementById("lv-box").clientWidth - 18 - legend.clientWidth)+"px"; // assigned width - scrollbar width - legend width

            fixedScroll.style.width = String(diagram.clientWidth)+"px";
            fixedScroll.style.marginLeft = String(legend.clientWidth)+"px";

            if(e.isScroll) {
                fixedScroll.scrollLeft += Number(e.width);
            } else {
                // keep the relative position of the scrollbar (e.g. 100% == rightmost)
                let oldScrollMax = (fixedScroll as any).scrollLeftMax;
                if(oldScrollMax === undefined) { // for chrome
                    oldScrollMax = fixedScroll.scrollWidth - fixedScroll.clientWidth;
                }
                let relativeScroll = fixedScroll.scrollLeft / oldScrollMax;

                this.shadowRoot.getElementById("fixed-scroll-content").style.width = e.width;
                let newScrollMax = (fixedScroll as any).scrollLeftMax;
                if(newScrollMax === undefined) { // for chrome
                    newScrollMax = fixedScroll.scrollWidth - fixedScroll.clientWidth;
                }
                
                if(oldScrollMax === 0 && newScrollMax !== 0) {
                    relativeScroll = 1; // when the diagram becomes larger than the view port we want to see the rightmost part
                }
                fixedScroll.scrollLeft = newScrollMax * relativeScroll;
            }
        });

        this.shadowRoot.getElementById("lv-menu").addEventListener("lv-export", (e: ExportEvent) => {
            let svgElement: HTMLElement;
            let svgData: string;
            let preface: string;
            let svgBlob: Blob;

            switch(e.format) {
                case ExportEvent.WaveJSON:
                    let blob = new Blob([getWaveJsonSelector(store.getState())], {type: "text/plain;charset=utf-8"});
                    saveAs(blob, "WaveJSON.txt");
                    break;

                case ExportEvent.SVG:
                    svgElement = this.shadowRoot.getElementById("lv-diagram").shadowRoot.getElementById("svgcontent_0");
                    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgData = svgElement.outerHTML;
                    preface = '<?xml version="1.0" standalone="no"?>\r\n';
                    svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
                    saveAs(svgBlob, "impulse_diagram.svg");
                    break;

                case ExportEvent.PNG:
                    svgElement = this.shadowRoot.getElementById("lv-diagram").shadowRoot.getElementById("svgcontent_0");
                    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgData = svgElement.outerHTML;
                    preface = '<?xml version="1.0" standalone="no"?>\r\n';
                    svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});

                    let url = URL.createObjectURL(svgBlob);

                    new SvgToPngConverter().convertFromInput(url, function(imgData){
                        saveAs(imgData, "impulse_diagram.png");
                    });
                    break;

                default:
            }
        });

        // update after language change
        this.shadowRoot.getElementById("lv-menu").addEventListener("request-litelement-update", e => {
            (this.shadowRoot.getElementById("lv-diagram") as LitElement).requestUpdate().then();
            (this.shadowRoot.getElementById("lv-menu") as LitElement).requestUpdate().then();
            (this.shadowRoot.getElementById("lv-legend") as LitElement).requestUpdate().then();
        });
    }

    synchScroll() {
        this.shadowRoot.getElementById("lv-diagram").shadowRoot.getElementById("handscroll").scrollLeft = this.shadowRoot.getElementById("fixed-scroll").scrollLeft;
    }
}