/**
 * Created by maximilian on 12.05.17.
 */
var SVGGraphics;
(function (SVGGraphics_1) {
    const attrX = 'simcir-transform-x';
    const attrY = 'simcir-transform-y';
    const attrRotate = 'simcir-transform-rotate';
    const attrZoom = 'simcir-transform-zoom';
    /**
     * Creates a DOM Element in the DOM namespace
     * @param tagName
     * @returns {JQuery}
     */
    function createSVGElement(tagName) {
        return $(document.createElementNS('http://www.w3.org/2000/svg', tagName));
    }
    SVGGraphics_1.createSVGElement = createSVGElement;
    ;
    /**
     * Creates a SVG Element
     * @param width - Width of the element - set to 100% if not given
     * @param height - Height of the element - set to 100% if not given
     * @returns {JQuery}
     */
    function createSVG(width, height) {
        if (width === undefined || height === undefined)
            return createSVGElement('svg').attr({
                version: '1.1', width: "100%", height: "100%",
            });
        return createSVGElement('svg').attr({
            version: '1.1',
            width: width, height: height,
            viewBox: '0 0 ' + width + ' ' + height
        });
    }
    SVGGraphics_1.createSVG = createSVG;
    ;
    function transform($o, x, y, rotate, zoom) {
        const getNumber = function ($o, k) {
            var v = $o.attr(k);
            return v ? +v : 0;
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
        }
        else if (arguments.length == 1) {
            return {
                x: getNumber($o, attrX), y: getNumber($o, attrY),
                rotate: getNumber($o, attrRotate), zoom: getNumber($o, attrZoom) || 1
            };
        }
    }
    SVGGraphics_1.transform = transform;
    ;
    /**
     * Class for manipulating jQuery SVG Objects, esp. creating paths
     */
    class SVGGraphics {
        constructor(target) {
            this.attr = {};
            this.buf = '';
            this.polygonBuf = '';
            this.target = target;
        }
        getTarget() {
            return this.target;
        }
        moveTo(x, y) {
            this.buf += ' M ' + x + ' ' + y;
        }
        ;
        lineTo(x, y) {
            this.buf += ' L ' + x + ' ' + y;
        }
        ;
        curveTo(x1, y1, x, y) {
            this.buf += ' Q ' + x1 + ' ' + y1 + ' ' + x + ' ' + y;
        }
        ;
        closePath(close) {
            if (close) {
                // really close path.
                this.buf += ' Z';
            }
            const ele = createSVGElement('path').attr('d', this.buf).attr(this.attr);
            this.target.append(ele);
            this.buf = '';
            return ele;
        }
        ;
        addPoint(x, y) {
            this.polygonBuf += x + ',' + y + ' ';
        }
        closePolygon() {
            return this.closePoly('polygon');
        }
        closePolyline() {
            return this.closePoly('polyline');
        }
        closePoly(name) {
            const ele = createSVGElement(name).attr('points', this.polygonBuf).attr(this.attr);
            this.target.append(ele);
            this.polygonBuf = '';
            return ele;
        }
        drawRect(x, y, width, height) {
            const ele = createSVGElement('rect');
            this.target.append(ele.attr({
                x: x,
                y: y,
                width: width,
                height: height
            }).attr(this.attr));
            return ele;
        }
        ;
        drawCircle(x, y, r) {
            const ele = createSVGElement('circle');
            this.target.append(ele.attr({ cx: x, cy: y, r: r }).attr(this.attr));
            return ele;
        }
        ;
        drawText(x, y, size, text) {
            const element = createSVGElement('text');
            this.target.append(element.attr(this.attr).addClass("simcir-device-text").attr({
                x: x,
                y: y
            }).css('font-size', size).text(text));
            return element;
        }
        ;
    }
    SVGGraphics_1.SVGGraphics = SVGGraphics;
    ;
})(SVGGraphics || (SVGGraphics = {}));
;
//# sourceMappingURL=SVGGraphics.js.map