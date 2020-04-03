/**
 * Created by maximilian on 12.05.17.
 */

namespace SVGGraphics{
    const attrX = 'simcir-transform-x';
    const attrY = 'simcir-transform-y';
    const attrRotate = 'simcir-transform-rotate';
    const attrZoom = 'simcir-transform-zoom';
    
    /**
     * Creates a DOM Element in the DOM namespace
     * @param tagName
     * @returns {JQuery}
     */
    export function createSVGElement(tagName: string) : JQuery {
        return $(document.createElementNS(
            'http://www.w3.org/2000/svg', tagName) );
    };
    
    /**
     * Creates a SVG Element
     * @param width - Width of the element - set to 100% if not given
     * @param height - Height of the element - set to 100% if not given
     * @returns {JQuery}
     */
    export function createSVG(width?: number, height?: number): JQuery {
        if (width === undefined || height === undefined)
            return createSVGElement('svg').attr({
                version: '1.1', width: "100%", height: "100%",
            });
        return createSVGElement('svg').attr({
            version: '1.1',
            width: width, height: height,
            viewBox: '0 0 ' + width + ' ' + height
        });
    };
    
    export interface Transformation{
        x: number,
        y:  number,
        rotate: number,
        zoom: number,
    }
    
    /**
     * Gets the current transformation parameters of the given element
     * @param $o
     */
    export function transform($o: JQuery): Transformation;
    /**
     * Applies transformations to a SVG object
     * @param $o - element to apply transformations to
     * @param x
     * @param y
     * @param rotate - rotation in degree - negative numbers mean left
     * @param zoom - zoom factor
     */
    export function transform($o: JQuery, x?: number, y?: number, rotate?:number, zoom?:number): void;
    export function transform($o: JQuery, x?: number, y?: number, rotate?:number, zoom?:number) {
        const getNumber = function($o: JQuery, k:string) {
            var v = $o.attr(k);
            return v? +v : 0;
        };
    
        if (arguments.length >= 3) {
            var transform = 'translate(' + x + ' ' + y + ')';
            if (rotate) {
                transform += ' rotate(' + rotate + ')';
            }
            if (zoom) {
                transform += ' scale(' + zoom + ')';
            }
            $o.attr('transform', transform);
            $o.attr(attrX, x);
            $o.attr(attrY, y);
            $o.attr(attrRotate, rotate);
            $o.attr(attrZoom, zoom);
            $o.trigger("tansformed");
        } else if (arguments.length == 1) {
            return {x: getNumber($o, attrX), y: getNumber($o, attrY),
                rotate: getNumber($o, attrRotate), zoom: getNumber($o, attrZoom) || 1};
        }
    };
    
    /**
     * Class for manipulating jQuery SVG Objects, esp. creating paths
     */
    export class SVGGraphics {
        attr = {};
        protected buf: string = '';
        protected target: JQuery;
        
        constructor(target: JQuery) {
            this.target = target;
        }
        
        moveTo(x: number, y: number) {
            this.buf += ' M ' + x + ' ' + y;
        };
        
        lineTo(x: number, y: number) {
            this.buf += ' L ' + x + ' ' + y;
        };
        curveTo(x1: number, y1: number, x: number, y: number) {
            this.buf += ' Q ' + x1 + ' ' + y1 + ' ' + x + ' ' + y;
        };
        closePath(close?: boolean) {
            if (close) {
                // really close path.
                this.buf += ' Z';
            }
            this.target.append(createSVGElement('path').
                                                   attr('d', this.buf).attr(this.attr) );
            this.buf = '';
        };
        drawRect(x: number, y: number, width, height) {
            this.target.append(createSVGElement('rect').
                                                   attr({x: x, y: y, width: width, height: height}).attr(this.attr) );
        };
        drawCircle(x: number, y: number, r: number) {
            this.target.append(createSVGElement('circle').
                                                     attr({cx: x, cy: y, r: r}).attr(this.attr) );
        };
    };
};