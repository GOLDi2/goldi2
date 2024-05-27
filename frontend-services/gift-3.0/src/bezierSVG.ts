import { LitElement, html, property, customElement, TemplateResult, css, CSSResult, PropertyValues } from "lit-element";

import { connect } from "pwa-helpers";
import { store } from './store/configureStore';
import "@material/mwc-top-app-bar-fixed";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";

import { MetaState } from "./types/NormalizedState/MetaState";
import { calculateAngle, createPoint, Point } from './types/Points';

import 'regenerator-runtime/runtime'
import { DEFAULT_NODE_RADIUS } from "./types/Node";
import { ChangeDerivedViewTransitionPoints, ChangeTransitionCondition, ChangeTransitionEndPoint, ChangeTransitionStartPoint, ChangeTransitionSupportPoint } from "./actioncreator/editorState";
import { DerivedAutomatonViews } from "./types/view";
import Mousetrap from "mousetrap";



@customElement("bezier-svg-element")
export class BezierSVGElement extends connect(store)(LitElement) {
    constructor() {
        super();

        


        this.addEventListener('mouseup', function () {
            //Hier die Action zum umpositionieren rein machen 
            let ctrl = (this as BezierSVGElement).dragged;
            let ctrltype = (this as BezierSVGElement).dragged.id;
            (this as BezierSVGElement).dragging = false;
            (this as BezierSVGElement).dragged = <Element><unknown>null;
            (this as BezierSVGElement).style.visibility = "hidden";
            if (ctrltype === "start") {
                if ((this as BezierSVGElement).automView === "working-automaton") {
                    store.dispatch(ChangeTransitionStartPoint((this as BezierSVGElement).transID, createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + 29, <number>+<string>ctrl.getAttribute("cy")?.split("px")[0])));
                }
                else if((this as BezierSVGElement).automView === "merged-automaton"){
                    store.dispatch(ChangeDerivedViewTransitionPoints(DerivedAutomatonViews.MergedAutomaton,(this as BezierSVGElement).automID, (this as BezierSVGElement).transID, createPoint((this as BezierSVGElement).endpoint.xCord +29 , (this as BezierSVGElement).endpoint.yCord), createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + 29, <number>+<string>ctrl.getAttribute("cy")?.split("px")[0]), (this as BezierSVGElement).helppoint));
                }
                else if((this as BezierSVGElement).automView === "hardware-automaton"){
                    store.dispatch(ChangeDerivedViewTransitionPoints(DerivedAutomatonViews.HardwareAutomaton,(this as BezierSVGElement).automID, (this as BezierSVGElement).transID,  createPoint((this as BezierSVGElement).endpoint.xCord +29 , (this as BezierSVGElement).endpoint.yCord), createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + 29, <number>+<string>ctrl.getAttribute("cy")?.split("px")[0]), (this as BezierSVGElement).helppoint));
                }
            }
            else if (ctrltype === "end") {
                if ((this as BezierSVGElement).automView === "working-automaton") {
                    store.dispatch(ChangeTransitionEndPoint((this as BezierSVGElement).transID, createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + 29, <number>+<string>ctrl.getAttribute("cy")?.split("px")[0])));
                }
                else if((this as BezierSVGElement).automView === "merged-automaton"){
                    store.dispatch(ChangeDerivedViewTransitionPoints(DerivedAutomatonViews.MergedAutomaton,(this as BezierSVGElement).automID, (this as BezierSVGElement).transID, createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + 29, <number>+<string>ctrl.getAttribute("cy")?.split("px")[0]), createPoint((this as BezierSVGElement).startpoint.xCord +29 , (this as BezierSVGElement).startpoint.yCord), (this as BezierSVGElement).helppoint));
                }
                else if((this as BezierSVGElement).automView === "hardware-automaton"){
                    store.dispatch(ChangeDerivedViewTransitionPoints(DerivedAutomatonViews.HardwareAutomaton,(this as BezierSVGElement).automID, (this as BezierSVGElement).transID, createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + 29, <number>+<string>ctrl.getAttribute("cy")?.split("px")[0]), createPoint((this as BezierSVGElement).startpoint.xCord +29 , (this as BezierSVGElement).startpoint.yCord), (this as BezierSVGElement).helppoint));
                }
            }
            else if (ctrltype === "mid") {
                // let newx = (<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) + (this as BezierSVGElement).startpoint.xCord;
                // console.log(newx)
                // let newy = <number>+<string>ctrl.getAttribute("cy")?.split("px")[0] + (this as BezierSVGElement).startpoint.yCord; 
                // console.log(newy)
                // store.dispatch(ChangeTransitionSupportPoint((this as BezierSVGElement).transID,createPoint(newx, newy)));

                let newy = (this as BezierSVGElement).startpoint.yCord - <number>+<string>ctrl.getAttribute("cy")?.split("px")[0];
                let newx = (<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]) - (this as BezierSVGElement).startpoint.xCord;

                var newxAngle = Math.cos(-(this as BezierSVGElement).angle) * newx - Math.sin(-(this as BezierSVGElement).angle) * newy;
                var newyAngle = Math.cos(-(this as BezierSVGElement).angle) * newy + Math.sin(-(this as BezierSVGElement).angle) * newx;


                if ((this as BezierSVGElement).automView === "working-automaton") {
                store.dispatch(ChangeTransitionSupportPoint((this as BezierSVGElement).transID, createPoint(newxAngle, newyAngle)));
                }
                else if((this as BezierSVGElement).automView === "merged-automaton"){
                    store.dispatch(ChangeDerivedViewTransitionPoints(DerivedAutomatonViews.MergedAutomaton,(this as BezierSVGElement).automID, (this as BezierSVGElement).transID, createPoint((this as BezierSVGElement).endpoint.xCord + (this as BezierSVGElement).supPointLeftOffset , (this as BezierSVGElement).endpoint.yCord), createPoint((this as BezierSVGElement).startpoint.xCord + (this as BezierSVGElement).supPointLeftOffset , (this as BezierSVGElement).startpoint.yCord),createPoint(newxAngle, newyAngle)));
                }
                else if((this as BezierSVGElement).automView === "hardware-automaton"){
                    store.dispatch(ChangeDerivedViewTransitionPoints(DerivedAutomatonViews.HardwareAutomaton,(this as BezierSVGElement).automID, (this as BezierSVGElement).transID, createPoint((this as BezierSVGElement).endpoint.xCord + (this as BezierSVGElement).supPointLeftOffset , (this as BezierSVGElement).endpoint.yCord), createPoint((this as BezierSVGElement).startpoint.xCord + (this as BezierSVGElement).supPointLeftOffset , (this as BezierSVGElement).startpoint.yCord),createPoint(newxAngle, newyAngle)));
                }
                // store.dispatch(ChangeTransitionSupportPoint((this as BezierSVGElement).transID,createPoint((<number>+<string>ctrl.getAttribute("cx")?.split("px")[0]), <number>+<string>ctrl.getAttribute("cy")?.split("px")[0])));

            };
            // console.log("up");
        }, false);

        this.addEventListener('mousemove', function (e) {
            // console.log("move")
            if ((this as BezierSVGElement).dragging) { (this as BezierSVGElement).moveControlPoint(e) }
        }, false);

        this.addEventListener('resize', this.initSVGCanvas, false);

        
    }

    static styles = css`
    body { margin: 0; }

    :host {
        z-index:2;
        visibility:hidden;
        position:absolute;
    }
input{
    border-style: none;
background-color: #ffffff7f;
text-align: center;
font-size: large;
text-overflow: ellipsis;
}
svg {
  display: block;
  margin: 0 auto;
  width: 100vmin; height: 100vmin;
  background: transparent;
  overflow: visible;
  pointer-events:none;
}
.string {
  fill: none;
  stroke: black;
  stroke-width: 3;
}
.ctrl {
  cursor: move;
  fill: white;
  stroke: black;
  stroke-width: 2;
  pointer-events:all;
  z-index: 5;
}
@media print {
    #start{
        display: none
    }
    #mid{
        display: none
    }
    #end{
        display: none
    }
    #condition{
        background-color: transparent
    }
}
    `

    render() {
        return html`
    <input type="text" id="condition" value="test" style="position:absolute" @change=${(e:Event)=>this.changeCondition(e.target)} @mouseover=${(e)=>this.condition.length>=20? e.target.nextSibling.nextSibling.style.visibility="visible" :  e.target.nextSibling.nextSibling.style.visibility="hidden"} @mouseout=${(e)=>e.target.nextSibling.nextSibling.style.visibility="hidden"}>
    <div class="hover" id="fullCondition" style="font-size: large; visibility:hidden;padding:5px;text-align: center;margin:3px;position:absolute;background:black;color:white;opacity:0.75; min-width:210px;border-radius:4px;">
        test
        </div>
    <svg id="svg" style="height:2000px; width:2000px" viewbox='0 0 2000px 2000px'>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
    refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" />
    </marker>
  <path id="string" class='string' d='M-400 0 Q0 0, 400 0' marker-end="url(#arrowhead)" />
  <circle style="visibility:${(this.dotsVisible)? "visible" : "hidden"}" id="start" class='ctrl ctrl--start' 
          cx='-400' cy='0' r='5' />
  <circle style="visibility:${(this.dotsVisible)? "visible" : "hidden"}" id="end" class='ctrl ctrl--end' 
          cx='400' cy='0' r='5' />
  <circle style="visibility:${(this.dotsVisible)? "visible" : "hidden"}" id="mid" class='ctrl ctrl--mid' 
          cx='0' cy='0' r='8' />
          
</svg>




`;



    }
    changeCondition(target: any) {
        store.dispatch(ChangeTransitionCondition(this.fromNodeId, this.toNodeId, target.value))
    }



/**
   * Id des Automaten
   */
 @property({ type: Number }) automID: number;

    /**
   * Id der Transition
   */
    @property({ type: Number }) transID: number;

    /**
   * Position des Startpunkts
   */
    @property({ type: Array }) startpoint: Point = { xCord: 0, yCord: 0 };
    /**
   * Position des Endpunkts
   */
    @property({ type: Array }) endpoint: Point = { xCord: 0, yCord: 400 };
    /**
   * Position des Stuetzpunkts
   */
    @property({ type: Array }) helppoint: Point = { xCord: 200, yCord: 70 };

    /**
   * Position des Knotens, auf dem der Startpunkt liegt
   */
    @property({ type: Array }) startNode: Point = { xCord: 50, yCord: 200 };
    /**
   * Position des Knotens, auf dem der Endpunkt liegt
   */
    @property({ type: Array }) endNode: Point = { xCord: 450, yCord: 200 };

    /**
   * Winkel zwischen Start und Endpunkt
   */
    @property({ type: Number }) angle: number = -Math.PI / 2;

    /**
   * Id des Zustands von dem die Transition ausgeht
   */
    @property({ type: Number }) fromNodeId: number;

    /**
     * Id des Zustands zu dem die Transition hin geht
     */
    @property({ type: Number }) toNodeId: number;

    /**
     * Kondition der Transition
     */
    @property({ type: String }) condition: string;

    @property({ type: String }) automView: string;

    @property({ type: Number }) supPointLeftOffset: number

    @property({ type: HTMLElement }) svg: HTMLElement;
    @property({ type: DOMRect }) r: DOMRect;
    @property({ type: Number }) w: number;
    @property({ type: Number }) h: number;
    @property({ type: Boolean }) dragging: boolean = false;
    @property({ type: Array }) vb: Array<string>;
    @property({ type: Number }) vb_w: number;
    @property({ type: Number }) vb_h: number;
    @property({ type: Number }) vb_x: number;
    @property({ type: Number }) vb_y: number;
    @property({ type: Array }) ctrl_pts: { mid: any, end: any, start: any } = { mid: { coord: { x: null, y: null } }, end: { coord: { x: null, y: null } }, start: { coord: { x: null, y: null } } };
    @property({ type: Element }) chord: Element;
    @property({ type: Element }) dragged: Element;
    @property({ type: Array }) mid_pt: { x: any, y: any } = { x: null, y: null };

    @property({ type: Boolean }) dotsVisible: boolean = true;


    stateChanged(state: MetaState) {
    }


    setUpPoints() {
        var start = this.shadowRoot?.getElementById("start")
        var end = this.shadowRoot?.getElementById("end")
        var mid = this.shadowRoot?.getElementById("mid")
        
        start?.setAttribute("cx", this.startpoint.xCord + "px")
        start?.setAttribute("cy", this.startpoint.yCord + "px")
        end?.setAttribute("cx", this.endpoint.xCord + "px")
        end?.setAttribute("cy", this.endpoint.yCord + "px")

        var midxAngle = Math.cos(this.angle) * this.helppoint.xCord - Math.sin(this.angle) * this.helppoint.yCord
        var midyAngle = Math.cos(this.angle) * this.helppoint.yCord + Math.sin(this.angle) * this.helppoint.xCord
        var midx = this.startpoint.xCord + midxAngle + this.r.left
        var midy = this.startpoint.yCord - midyAngle + this.r.top

        //MACHE DAS GLEICHE ALS WAERE DER PUNKT GEZOGEN WORDEN
        var x = Math.round((midx - this.r.left) * this.vb_w / this.w + this.vb_x);
        var y = Math.round((midy - this.r.top) * this.vb_h / this.h + this.vb_y);

        var ctrl_point_type = "mid";
        var v_pt = { x, y };

        mid?.setAttribute('cx', "" + x + "px");
        mid?.setAttribute('cy', "" + y + "px");

        if (ctrl_point_type === 'mid') {
            x = 2 * x - (1 * this.ctrl_pts.start.coord.x + 1 * this.ctrl_pts.end.coord.x) / 2;
            y = 2 * y - (1 * this.ctrl_pts.start.coord.y + 1 * this.ctrl_pts.end.coord.y) / 2;
        }

        if (ctrl_point_type === "mid") {
            this.ctrl_pts.mid.coord = { 'x': x, 'y': y };
        }

        this.modifyString();



        //HIER WIRD DIE CONDITION POSITION GESETZT
        let condition = <HTMLInputElement>this.shadowRoot?.getElementById("condition")


        let fullCondition = <HTMLDivElement>this.shadowRoot?.getElementById("fullCondition")
        fullCondition.style.left = x -5- midx + "px";
        fullCondition.style.top = y - midy + "px";
        fullCondition.innerText = this.condition;


        condition.style.left = x - midx + "px";
        condition.style.top = y - midy + "px"

        this.svg.style.visibility = "visible";
        condition.style.visibility = "visible";
        condition.value = this.condition;

    }



    initMouseevents() {
        setTimeout(
            () => {

                this.shadowRoot?.getElementById("start")?.addEventListener('mousedown', function (e) {
                    var t = <HTMLElement>e.target;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).dragging = true;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).dragged = t;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).style.visibility = "visible"

                }, false);

                this.shadowRoot?.getElementById("mid")?.addEventListener('mousedown', function (e) {
                    var t = <HTMLElement>e.target;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).dragging = true;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).dragged = t;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).style.visibility = "visible"
                    // console.log("down")
                }, false);

                this.shadowRoot?.getElementById("end")?.addEventListener('mousedown', function (e) {
                    var t = <HTMLElement>e.target;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).dragging = true;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).dragged = t;
                    (<BezierSVGElement>(<ShadowRoot>this.parentElement?.parentNode).host).style.visibility = "visible"
                }, false);
            }, 0);

    }




    initValues() {
        setTimeout(
            () => {
                this.svg = <HTMLElement>this.shadowRoot?.getElementById('svg');
                this.vb = <Array<string>><unknown>this.svg?.getAttribute('viewBox')?.split(' ');
                this.vb_w = ~~this.vb[2].split('px')[0];
                this.vb_h = ~~this.vb[3].split('px')[0];
                this.vb_x = ~~this.vb[0];
                this.vb_y = ~~this.vb[1];
                this.chord = <Element>this.svg?.querySelector('.string');
                this.dragged = <Element><unknown>null;
            }, 0);
    }

    initSVGCanvas() {
        setTimeout(
            () => {
                this.r = this.svg?.getBoundingClientRect();
                this.w = this.svg.clientWidth;
                this.h = this.svg.clientHeight;
                this.setUpPoints();
            }, 0);
    }

    initDemo() {
        setTimeout(
            () => {
                var ctrl_els = this.svg.querySelectorAll('.ctrl');
                var n = ctrl_els?.length;

                for (var i = 0; i < <Number>n; i++) {
                    var type = ctrl_els[i].id;

                    if (type === "mid") {
                        this.ctrl_pts.mid = {};
                        this.ctrl_pts.mid.el = ctrl_els[i];
                        var x = <number><unknown>ctrl_els[i].getAttribute('cx')?.split('px')[0];
                        var y = <number><unknown>ctrl_els[i].getAttribute('cy')?.split('px')[0];
                        this.ctrl_pts.mid.coord = {
                            'x': 2 * x - (1 * this.ctrl_pts.start.coord.x + 1 * this.ctrl_pts.end.coord.x) / 2,
                            'y': 2 * y - (1 * this.ctrl_pts.start.coord.y + 1 * this.ctrl_pts.end.coord.y) / 2
                        };
                    } else if (type === "start") {
                        this.ctrl_pts.start = {};
                        this.ctrl_pts.start.el = ctrl_els[i];
                        this.ctrl_pts.start.coord = {
                            'x': ctrl_els[i].getAttribute('cx')?.split('px')[0],
                            'y': ctrl_els[i].getAttribute('cy')?.split('px')[0]
                        };
                    } else if (type === "end") {
                        this.ctrl_pts.end = {};
                        this.ctrl_pts.end.el = ctrl_els[i];
                        this.ctrl_pts.end.coord = {
                            'x': ctrl_els[i].getAttribute('cx')?.split('px')[0],
                            'y': ctrl_els[i].getAttribute('cy')?.split('px')[0]
                        }
                    };
                }

                this.modifyString();
            }, 0);
    }

    modifyString() {
        var d = 'M';
        // console.log(this.ctrl_pts.mid.coord)
        d += (this.ctrl_pts.start.coord.x || -400) + ' ' +
            (this.ctrl_pts.start.coord.y || 0) + ' Q' +
            (this.ctrl_pts.mid.coord.x || 0) + ' ' +
            (this.ctrl_pts.mid.coord.y || 0) + ', ' +
            (this.ctrl_pts.end.coord.x || 400) + ' ' +
            (this.ctrl_pts.end.coord.y || 0);

        this.chord?.setAttribute('d', d);

        let condition = <HTMLInputElement>this.shadowRoot?.getElementById("condition")
        condition.style.left = (<SVGCircleElement><unknown>this.shadowRoot?.getElementById("mid")).cx.baseVal.value -110+"px" ;
        condition.style.top = (<SVGCircleElement><unknown>this.shadowRoot?.getElementById("mid")).cy.baseVal.value -40+"px"

        let fullCondition = <HTMLDivElement>this.shadowRoot?.getElementById("fullCondition")
        fullCondition.style.left = (<SVGCircleElement><unknown>this.shadowRoot?.getElementById("mid")).cx.baseVal.value -113+"px" ;
        fullCondition.style.top = (<SVGCircleElement><unknown>this.shadowRoot?.getElementById("mid")).cy.baseVal.value-80+"px"
    }

    moveControlPoint(e: any) {
        // console.log(e)
        // console.log(window.scrollY)
        // console.log("--------------------------------------------------------:", this.r.top)
        var x = Math.round((e.clientX - this.r.left) * this.vb_w / this.w + this.vb_x);
        var y = Math.round((e.clientY - this.r.top) * this.vb_h / this.h + this.vb_y);
        // console.log(x,y)
        // console.log(this.dragged)
        // console.log(this.dragging)
        var ctrl_point_type = this.dragged.id;
        var v_pt = { x, y };

        this.dragged.setAttribute('cx', "" + x + "px");
        this.dragged.setAttribute('cy', "" + y + "px");

        

        if (ctrl_point_type === 'mid') {
            x = 2 * x - (1 * this.ctrl_pts.start.coord.x + 1 * this.ctrl_pts.end.coord.x) / 2;
            y = 2 * y - (1 * this.ctrl_pts.start.coord.y + 1 * this.ctrl_pts.end.coord.y) / 2;
        }
        // console.log(x,y)

        if (ctrl_point_type === "mid") {
            this.ctrl_pts.mid.coord = { 'x': x, 'y': y };
            // console.log(this.ctrl_pts.mid.coord)
        }
        else if (ctrl_point_type === "end") {
            let newX = this.endNode.xCord + (DEFAULT_NODE_RADIUS * (x - this.endNode.xCord) / (Math.sqrt((x - this.endNode.xCord) * (x - this.endNode.xCord) + (y - this.endNode.yCord) * (y - this.endNode.yCord))));
            let newY = this.endNode.yCord + (DEFAULT_NODE_RADIUS * (y - this.endNode.yCord) / (Math.sqrt((x - this.endNode.xCord) * (x - this.endNode.xCord) + (y - this.endNode.yCord) * (y - this.endNode.yCord))));
            this.dragged.setAttribute('cx', "" + newX + "px");
            this.dragged.setAttribute('cy', "" + newY + "px");
            this.ctrl_pts.end.coord = { 'x': newX, 'y': newY };


        }
        else if (ctrl_point_type === "start") {
            let newX = this.startNode.xCord + (DEFAULT_NODE_RADIUS * (x - this.startNode.xCord) / (Math.sqrt((x - this.startNode.xCord) * (x - this.startNode.xCord) + (y - this.startNode.yCord) * (y - this.startNode.yCord))));
            let newY = this.startNode.yCord + (DEFAULT_NODE_RADIUS * (y - this.startNode.yCord) / (Math.sqrt((x - this.startNode.xCord) * (x - this.startNode.xCord) + (y - this.startNode.yCord) * (y - this.startNode.yCord))));
            this.dragged.setAttribute('cx', "" + newX + "px");
            this.dragged.setAttribute('cy', "" + newY + "px");
            this.ctrl_pts.start.coord = { 'x': newX, 'y': newY };
        }


        // console.log(ctrl_point_type)
        if (ctrl_point_type === 'start' || ctrl_point_type === 'end') {
            v_pt = this.ctrl_pts.mid.coord;
            // console.log(this.mid_pt)
            this.mid_pt.x = (1 * this.ctrl_pts.start.coord.x + 1 * this.ctrl_pts.end.coord.x) / 2;
            this.mid_pt.y = (1 * this.ctrl_pts.start.coord.y + 1 * this.ctrl_pts.end.coord.y) / 2;

            this.ctrl_pts.mid.el.setAttribute('cx', (1 * v_pt.x + 1 * this.mid_pt.x) / 2 + "px");
            this.ctrl_pts.mid.el.setAttribute('cy', (1 * v_pt.y + 1 * this.mid_pt.y) / 2 + "px");
        }

        this.modifyString();

        // if(ctrl_point_type==="start"){
        //     store.dispatch(ChangeTransitionStartPoint((this as BezierSVGElement).transID,createPoint((<number>+<string>this.dragged.getAttribute("cx")?.split("px")[0])+29,<number>+<string>this.dragged.getAttribute("cy")?.split("px")[0])));
        // }
        // else if(ctrl_point_type==="end"){
        //     store.dispatch(ChangeTransitionEndPoint((this as BezierSVGElement).transID,createPoint((<number>+<string>this.dragged.getAttribute("cx")?.split("px")[0])+29,<number>+<string>this.dragged.getAttribute("cy")?.split("px")[0])));
        // }


    }




}


declare global {
    interface HTMLElementTagNameMap {
        'bezier-svg-element': BezierSVGElement;
    }
}
