//
// SimcirJS - basicset
//
// Copyright (c) 2014 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

// includes following device types:
//  DC
//  LED
//  PushOff
//  PushOn
//  Toggle
//  BUF
//  NOT
//  AND
//  NAND
//  OR
//  NOR
//  XOR
//  ENOR
//  OSC
//  7seg
//  16seg
//  4bit7seg
//  RotaryEncoder
//  BusIn
//  BusOut

!function ($, $s) {

    // unit size
    var unit = $s.unit;

    // red/black
    var defaultLEDColor = '#ff0000';
    var defaultLEDBgColor = '#000000';

    var multiplyColor = function () {
        var HEX = '0123456789abcdef';
        var toIColor = function (sColor) {
            if (!sColor) {
                return 0;
            }
            sColor = sColor.toLowerCase();
            if (sColor.match(/^#[0-9a-f]{3}$/i)) {
                var iColor = 0;
                for (var i = 0; i < 6; i += 1) {
                    iColor = (iColor << 4) | HEX.indexOf(sColor.charAt((i >> 1) + 1));
                }
                return iColor;
            } else if (sColor.match(/^#[0-9a-f]{6}$/i)) {
                var iColor = 0;
                for (var i = 0; i < 6; i += 1) {
                    iColor = (iColor << 4) | HEX.indexOf(sColor.charAt(i + 1));
                }
                return iColor;
            }
            return 0;
        };
        var toSColor = function (iColor) {
            var sColor = '#';
            for (var i = 0; i < 6; i += 1) {
                sColor += HEX.charAt((iColor >>> (5 - i) * 4) & 0x0f);
            }
            return sColor;
        };
        var toRGB = function (iColor) {
            return {
                r: (iColor >>> 16) & 0xff,
                g: (iColor >>> 8) & 0xff,
                b: iColor & 0xff
            };
        };
        var multiplyColor = function (iColor1, iColor2, ratio) {
            var c1 = toRGB(iColor1);
            var c2 = toRGB(iColor2);
            var mc = function (v1, v2, ratio) {
                return ~~Math.max(0, Math.min((v1 - v2) * ratio + v2, 255));
            };
            return (mc(c1.r, c2.r, ratio) << 16) |
                (mc(c1.g, c2.g, ratio) << 8) | mc(c1.b, c2.b, ratio);
        };
        return function (color1, color2, ratio) {
            return toSColor(multiplyColor(
                toIColor(color1), toIColor(color2), ratio));
        };
    }();

    // symbol draw functions
    var drawBUF = function (g, x, y, width, height) {
        g.moveTo(x, y);
        g.lineTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width, y);
        g.lineTo(x , y);
        g.moveTo(x + (width * 2/5), y + (height * 2/5));
        g.lineTo(x + (width * 3/5), y + (height * 1/5));
        g.lineTo(x + (width * 3/5), y + (height * 4/5));
        g.moveTo(x, y);
        g.closePath(true);
    };

    var drawAND = function (g, x, y, width, height, ) {
        g.drawText(x + width/5  , y + height/1.2 , 15, "&");
        g.moveTo(x, y);
        g.lineTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width, y);
        g.lineTo(x , y);
        g.closePath(true);
    };
    var drawOR = function (g, x, y, width, height) {
        g.moveTo(x, y);
        g.lineTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width, y);
        g.lineTo(x , y);
        g.moveTo(x + (width * 1/4), y + (height * 1/5));
        g.lineTo(x + (width * 2/4), y + (height * 2/5));
        g.lineTo(x + (width * 1/4), y + (height * 3/5));
        g.moveTo(x + (width * 1/4), y + (height * 4/5));
        g.lineTo(x + (width * 2/4), y + (height * 4/5));
        g.moveTo(x + (width * 3/5), y + (height * 2/5));
        g.lineTo(x + (width * 3/4), y + (height * 1/5));
        g.lineTo(x + (width * 3/4), y + (height * 4/5));
        g.moveTo(x, y);
        g.closePath(true);
    };
    var drawXOR = function (g, x, y, width, height) {
        g.moveTo(x, y);
        g.lineTo(x, y + height);
        g.lineTo(x + width, y + height);
        g.lineTo(x + width, y);
        g.lineTo(x , y);
        g.moveTo(x + (width * 1/4), y + (height * 2/5));
        g.lineTo(x + (width * 2/4), y + (height * 2/5));
        g.moveTo(x + (width * 1/4), y + (height * 3/5));
        g.lineTo(x + (width * 2/4), y + (height * 3/5));
        g.moveTo(x + (width * 3/5), y + (height * 2/5));
        g.lineTo(x + (width * 3/4), y + (height * 1/5));
        g.lineTo(x + (width * 3/4), y + (height * 4/5));
        g.moveTo(x, y);
        g.closePath(true);
    };
    var drawNOT = function (g, x, y, width, height) {
        drawBUF(g, x - 1, y, width - 2, height);
        g.drawCircle(x + width - 1, y + height / 2, 2);
    };
    var drawNAND = function (g, x, y, width, height) {
        drawAND(g, x - 1, y, width - 2, height);
        g.drawCircle(x + width - 1, y + height / 2, 2);
    };
    var drawNOR = function (g, x, y, width, height) {
        drawOR(g, x - 1, y, width - 2, height);
        g.drawCircle(x + width - 1, y + height / 2, 2);
    };
    var drawENOR = function (g, x, y, width, height) {
        drawXOR(g, x - 1, y, width - 2, height);
        g.drawCircle(x + width - 1, y + height / 2, 2);
    };
    // logical functions
    var AND = function (a, b) {
        return a & b;
    };
    var OR = function (a, b) {
        return a | b;
    };
    var XOR = function (a, b) {
        return a ^ b;
    };
    var BUF = function (a) {
        return (a == 1) ? 1 : 0;
    };
    var NOT = function (a) {
        return (a == 1) ? 0 : 1;
    };

    var onValue = 1;
    var offValue = null;
    var isHot = function (v) {
        return v != null;
    };
    var intValue = function (v) {
        return isHot(v) ? 1 : 0;
    };

    var createSwitchFactory = function (type) {
        return function (device) {
            var in1 = device.addInput();
            var out1 = device.addOutput();
            var on = (type == 'PushOff');

            if (type == 'Toggle' && device.deviceDef.state) {
                on = device.deviceDef.state.on;
            }
            device.getState = function () {
                return type == 'Toggle' ? {on: on} : null;
            };

            device.$ui.on('inputValueChange', function () {
                if (on) {
                    out1.setValue(in1.getValue());
                }
            });
            var updateOutput = function () {
                out1.setValue(on ? in1.getValue() : null);
            };
            updateOutput();

            var super_createUI = device.createUI;
            device.createUI = function () {
                super_createUI();
                var size = device.getSize();
                var $button = SVGGraphics.createSVGElement('rect').attr({
                    x: size.width / 4, y: size.height / 4,
                    width: size.width / 2, height: size.height / 2,
                    rx: 2, ry: 2
                });
                $s.addClass($button, 'simcir-basicset-switch-button');
                if (type == 'Toggle' && on) {
                    $s.addClass($button, 'simcir-basicset-switch-button-pressed');
                }
                device.$ui.append($button);
                var button_mouseDownHandler = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (type == 'PushOn') {
                        on = true;
                        $button.addClass( 'simcir-basicset-switch-button-pressed');
                    } else if (type == 'PushOff') {
                        on = false;
                        $button.addClass( 'simcir-basicset-switch-button-pressed');
                    } else if (type == 'Toggle') {
                        on = !on;
                        $button.addClass( 'simcir-basicset-switch-button-pressed');
                    }
                    updateOutput();
                    $(document).on('mouseup', button_mouseUpHandler);
                    $(document).on('touchend', button_mouseUpHandler);
                };
                var button_mouseUpHandler = function (event) {
                    if (type == 'PushOn') {
                        on = false;
                        $button.removeClass( 'simcir-basicset-switch-button-pressed');
                    } else if (type == 'PushOff') {
                        on = true;
                        $button.removeClass( 'simcir-basicset-switch-button-pressed');
                    } else if (type == 'Toggle') {
                        // keep state
                        if (!on) {
                            $button.removeClass(  'simcir-basicset-switch-button-pressed');
                        }
                        device.markDirty(true);
                    }
                    updateOutput();
                    $(document).off('mouseup', button_mouseUpHandler);
                    $(document).off('touchend', button_mouseUpHandler);
                };
                var ignoreEvent = (e) => {e.stopPropagation(), e.preventDefault()};

                device.$ui.on('deviceAdd', function () {
                    $s.enableEvents($button, true);
                    $button.on('mousedown', button_mouseDownHandler);
                    $button.on('touchstart', button_mouseDownHandler);
                    $button.on('dblclick', ignoreEvent);
                });
                device.$ui.on('deviceRemove', function () {
                    $s.enableEvents($button, false);
                    $button.off('mousedown', button_mouseDownHandler);
                    $button.off('touchstart', button_mouseDownHandler);
                    $button.off('dblclick', ignoreEvent);
                });
                device.$ui.addClass('simcir-basicset-switch');
            };
        };
    };

    var createLogicGateFactory = function (op, out, draw) {
        return function (device) {

            var update = function () {
                const numInputs = (op == null) ? 1 :
                    Math.max(2, device.deviceDef.numInputs || 2);
                device.halfPitch = numInputs > 4;
                const curNumInputs = device.getInputs().length;
                if (curNumInputs < numInputs) {
                    for (var i = curNumInputs; i < numInputs; i += 1) {
                        device.addInput();
                    }
                }
                if (curNumInputs > numInputs) {
                    const inputs = device.getInputs()
                    for (var i = curNumInputs-1; i >= numInputs; i -= 1) {
                        var outNode = inputs[i].getOutput();
                        if (outNode != null) {
                            outNode.disconnectFrom(inputs[i]);
                        }
                        inputs[i].$ui.remove();
                    }
                    inputs.splice(numInputs, curNumInputs-numInputs)
                }
                device.layoutUI();
                device.$ui.trigger('inputValueChange');
            };
            update();
            device.addOutput();

            device.$ui.on('inputValueChange', function () {
                var inputs = device.getInputs();
                var outputs = device.getOutputs();
                var b = intValue(inputs[0].getValue());
                if (op != null) {
                    for (var i = 1; i < inputs.length; i += 1) {
                        b = op(b, intValue(inputs[i].getValue()));
                    }
                }
                b = out(b);
                outputs[0].setValue((b == 1) ? 1 : null);
            });
            var super_createUI = device.createUI;
            device.createUI = function () {
                super_createUI();
                var size = device.getSize();
                var g = new SVGGraphics.SVGGraphics(device.$ui);
                g.attr['class'] = 'simcir-basicset-symbol';


                device.$ui.on('parameterChange', update);

                draw(g,
                    (size.width - unit) / 2,
                    (size.height - unit) / 2,
                    unit, unit);
                if (op != null) {
                    device.doc = {
                        params: [
                            {
                                name: 'numInputs', type: 'number', displayName: "Number of inputs",
                                defaultValue: 2,
                                description: 'number of inputs'
                            }
                        ],
                        code: '{"type":"' + device.deviceDef.type + '","numInputs":2}'
                    };
                }
            };
        };
    };

    /*
     var segBase = function() {
     return {
     width: 0,
     height: 0,
     allSegments: '',
     drawSegment: function(g, segment, color) {},
     drawPoint: function(g, color) {}
     };
     };
     */

    var _7Seg = function () {
        var _SEGMENT_DATA = {
            a: [575, 138, 494, 211, 249, 211, 194, 137, 213, 120, 559, 120],
            b: [595, 160, 544, 452, 493, 500, 459, 456, 500, 220, 582, 146],
            c: [525, 560, 476, 842, 465, 852, 401, 792, 441, 562, 491, 516],
            d: [457, 860, 421, 892, 94, 892, 69, 864, 144, 801, 394, 801],
            e: [181, 560, 141, 789, 61, 856, 48, 841, 96, 566, 148, 516],
            f: [241, 218, 200, 453, 150, 500, 115, 454, 166, 162, 185, 145],
            g: [485, 507, 433, 555, 190, 555, 156, 509, 204, 464, 451, 464]
        };
        return {
            width: 636,
            height: 1000,
            allSegments: 'abcdefg',
            drawSegment: function (g, segment, color) {
                if (!color) {
                    return;
                }
                var data = _SEGMENT_DATA[segment];
                var numPoints = data.length / 2;
                g.attr['fill'] = color;
                for (var i = 0; i < numPoints; i += 1) {
                    var x = data[i * 2];
                    var y = data[i * 2 + 1];
                    if (i == 0) {
                        g.moveTo(x, y);
                    } else {
                        g.lineTo(x, y);
                    }
                }
                g.closePath(true);
            },
            drawPoint: function (g, color) {
                if (!color) {
                    return;
                }
                g.attr['fill'] = color;
                g.drawCircle(542, 840, 46);
            }
        };
    }();

    var _16Seg = function () {
        var _SEGMENT_DATA = {
            a: [255, 184, 356, 184, 407, 142, 373, 102, 187, 102],
            b: [418, 144, 451, 184, 552, 184, 651, 102, 468, 102],
            c: [557, 190, 507, 455, 540, 495, 590, 454, 656, 108],
            d: [487, 550, 438, 816, 506, 898, 573, 547, 539, 507],
            e: [281, 863, 315, 903, 500, 903, 432, 821, 331, 821],
            f: [35, 903, 220, 903, 270, 861, 236, 821, 135, 821],
            g: [97, 548, 30, 897, 129, 815, 180, 547, 147, 507],
            h: [114, 455, 148, 495, 198, 454, 248, 189, 181, 107],
            i: [233, 315, 280, 452, 341, 493, 326, 331, 255, 200],
            j: [361, 190, 334, 331, 349, 485, 422, 312, 445, 189, 412, 149],
            k: [430, 316, 354, 492, 432, 452, 522, 334, 547, 200],
            l: [354, 502, 408, 542, 484, 542, 534, 500, 501, 460, 434, 460],
            m: [361, 674, 432, 805, 454, 691, 405, 550, 351, 509],
            n: [265, 693, 242, 816, 276, 856, 326, 815, 353, 676, 343, 518],
            o: [255, 546, 165, 671, 139, 805, 258, 689, 338, 510],
            p: [153, 502, 187, 542, 254, 542, 338, 500, 278, 460, 203, 460]
        };
        return {
            width: 690,
            height: 1000,
            allSegments: 'abcdefghijklmnop',
            drawSegment: function (g, segment, color) {
                if (!color) {
                    return;
                }
                var data = _SEGMENT_DATA[segment];
                var numPoints = data.length / 2;
                g.attr['fill'] = color;
                for (var i = 0; i < numPoints; i += 1) {
                    var x = data[i * 2];
                    var y = data[i * 2 + 1];
                    if (i == 0) {
                        g.moveTo(x, y);
                    } else {
                        g.lineTo(x, y);
                    }
                }
                g.closePath(true);
            },
            drawPoint: function (g, color) {
                if (!color) {
                    return;
                }
                g.attr['fill'] = color;
                g.drawCircle(610, 900, 30);
            }
        };
    }();

    var drawSeg = function (seg, g, pattern, hiColor, loColor, bgColor) {
        g.attr['stroke'] = 'none';
        if (bgColor) {
            g.attr['fill'] = bgColor;
            g.drawRect(0, 0, seg.width, seg.height);
        }
        var on;
        for (var i = 0; i < seg.allSegments.length; i += 1) {
            var c = seg.allSegments.charAt(i);
            on = (pattern != null && pattern.indexOf(c) != -1);
            seg.drawSegment(g, c, on ? hiColor : loColor);
        }
        on = (pattern != null && pattern.indexOf('.') != -1);
        seg.drawPoint(g, on ? hiColor : loColor);
    };

    var createSegUI = function (device, seg) {
        var size = device.getSize();
        var sw = seg.width;
        var sh = seg.height;
        var dw = size.width - unit;
        var dh = size.height - unit;
        var scale = (sw / sh > dw / dh) ? dw / sw : dh / sh;
        var tx = (size.width - seg.width * scale) / 2;
        var ty = (size.height - seg.height * scale) / 2;
        return SVGGraphics.createSVGElement('g').attr('transform', 'translate(' + tx + ' ' + ty + ')' +
            ' scale(' + scale + ') ');
    };

    var createLEDSegFactory = function (seg) {
        return function (device) {
            var allSegs = seg.allSegments + '.';
            device.halfPitch = true;
            for (var i = 0; i < allSegs.length; i += 1) {
                device.addInput();
            }

            var super_getSize = device.getSize;
            device.getSize = function () {
                var size = super_getSize();
                return {width: unit * 4, height: size.height};
            };

            var super_createUI = device.createUI;
            device.createUI = function () {
                super_createUI();

                var $seg = createSegUI(device, seg);
                device.$ui.append($seg);

                var update = function () {
                    var hiColor = device.deviceDef.color || defaultLEDColor;
                    var bgColor = device.deviceDef.bgColor || defaultLEDBgColor;
                    var loColor = multiplyColor(hiColor, bgColor, 0.25);
                    var segs = '';
                    for (var i = 0; i < allSegs.length; i += 1) {
                        if (isHot(device.getInputs()[i].getValue())) {
                            segs += allSegs.charAt(i);
                        }
                    }
                    $seg.children().remove();
                    drawSeg(seg, new SVGGraphics.SVGGraphics($seg), segs,
                        hiColor, loColor, bgColor);
                };
                device.$ui.on('inputValueChange', update);
                update();
                device.$ui.on('parameterChange', update);
                device.doc = {
                    params: [
                        {
                            name: 'color', type: 'color', displayName: "Color Active",
                            defaultValue: defaultLEDColor,
                            description: 'Color of the active LED'
                        },
                        {
                            name: 'bgColor', type: 'color', displayName: "Color Inactive",
                            defaultValue: defaultLEDBgColor,
                            description: 'Color of the inactive LED'
                        }
                    ],
                    code: '{"type":"' + device.deviceDef.type +
                    '","color":"' + defaultLEDColor + '"}'
                };
            };
        };
    };

    var createLED4bitFactory = function () {

        var _PATTERNS = {
            0: 'abcdef',
            1: 'bc',
            2: 'abdeg',
            3: 'abcdg',
            4: 'bcfg',
            5: 'acdfg',
            6: 'acdefg',
            7: 'abc',
            8: 'abcdefg',
            9: 'abcdfg',
            a: 'abcefg',
            b: 'cdefg',
            c: 'adef',
            d: 'bcdeg',
            e: 'adefg',
            f: 'aefg'
        };

        var getPattern = function (value) {
            return _PATTERNS['0123456789abcdef'.charAt(value)];
        };

        var seg = _7Seg;

        return function (device) {
            var hiColor = device.deviceDef.color || defaultLEDColor;
            var bgColor = device.deviceDef.bgColor || defaultLEDBgColor;
            var loColor = multiplyColor(hiColor, bgColor, 0.25);
            for (var i = 0; i < 4; i += 1) {
                device.addInput();
            }

            var super_getSize = device.getSize;
            device.getSize = function () {
                var size = super_getSize();
                return {width: unit * 4, height: size.height};
            };

            var super_createUI = device.createUI;
            device.createUI = function () {
                super_createUI();

                var $seg = createSegUI(device, seg);
                device.$ui.append($seg);

                var update = function () {
                    var value = 0;
                    for (var i = 0; i < 4; i += 1) {
                        if (isHot(device.getInputs()[i].getValue())) {
                            value += (1 << i);
                        }
                    }
                    $seg.children().remove();
                    drawSeg(seg, new SVGGraphics.SVGGraphics($seg), getPattern(value),
                        hiColor, loColor, bgColor);
                };
                device.$ui.on('inputValueChange', update);
                update();
                device.doc = {
                    params: [
                        {
                            name: 'color', type: 'string',
                            defaultValue: defaultLEDColor,
                            description: 'color in hexadecimal.'
                        },
                        {
                            name: 'bgColor', type: 'string',
                            defaultValue: defaultLEDBgColor,
                            description: 'background color in hexadecimal.'
                        }
                    ],
                    code: '{"type":"' + device.deviceDef.type +
                    '","color":"' + defaultLEDColor + '"}'
                };
            };
        };
    };

    var createRotaryEncoderFactory = function () {
        var _MIN_ANGLE = 0;
        var _MAX_ANGLE = 360;
        let normalizeAngle = function (angle) {
            while (angle < 0) {
                angle += 360;
            }
            while (angle >= 360) {
                angle -= 360;
            }
            return angle;
        };
        var thetaToAngle = function (theta) {
            var angle = (theta - Math.PI / 2) / Math.PI * 180;
            angle = normalizeAngle(angle);
            return angle;
        };
        return function (device) {
            var numOutputs = Math.max(2, device.deviceDef.numOutputs || 4);
            device.halfPitch = numOutputs > 4;
            device.addInput();
            for (var i = 0; i < numOutputs; i += 1) {
                device.addOutput();
            }

            var super_getSize = device.getSize;
            device.getSize = function () {
                var size = super_getSize();
                return {width: unit * 4, height: size.height};
            };

            var super_createUI = device.createUI;
            device.createUI = function () {
                super_createUI();
                const angleStep = (_MAX_ANGLE - _MIN_ANGLE) / ((1 << numOutputs));
                var size = device.getSize();

                var $knob = SVGGraphics.createSVGElement('g').attr('class', 'simcir-basicset-knob').append(SVGGraphics.createSVGElement('rect').attr({
                    x: -10,
                    y: -10,
                    width: 20,
                    height: 20
                }));
                var r = Math.min(size.width, size.height) / 4 * 1.5;
                var g = new SVGGraphics.SVGGraphics($knob);
                g.drawCircle(0, 0, r);
                g.attr['class'] = 'simcir-basicset-knob-mark';
                g.moveTo(-0.6*r, 0);
                g.lineTo(-r, 0);
                g.closePath();
                device.$ui.append($knob);
                var $label = SVGGraphics.createSVGElement('text').text("F").addClass("simcir-basicset-knob-label").css({"text-anchor": "middle", "font-size": r+"px"}).attr({x: 0, y: 0});
                var $labelContainer = SVGGraphics.createSVGElement('g');
                $s.transform($label, 0, parseFloat($label.css("font-size"))*0.35);
                $labelContainer.append($label);
                $knob.append($labelContainer);

                var _angle = _MIN_ANGLE;
                var setAngle = function (angle) {
                    _angle = Math.trunc(normalizeAngle(angle)/ angleStep) * angleStep;
                    update();
                    device.markDirty(true);
                };

                var dragPoint = null;
                var valueChanged = false;
                var knob_mouseDownHandler = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    dragPoint = {x: event.pageX, y: event.pageY};
                    $(document).on('mousemove', knob_mouseMoveHandler);
                    $(document).on('mouseup', knob_mouseUpHandler);
                    valueChanged = false;
                };
                var knob_mouseMoveHandler = function (event) {
                    var off = $knob.parents('svg').offset();
                    var pos = $s.offset($knob);
                    var cx = off.left + pos.x;
                    var cy = off.top + pos.y;
                    var dx = event.pageX - cx;
                    var dy = event.pageY - cy;
                    if (dx == 0 && dy == 0) return;
                    setAngle(180+thetaToAngle(Math.atan2(dy, dx)));
                    valueChanged = true;
                };
                var knob_mouseUpHandler = function (event) {
                    $(document).off('mousemove', knob_mouseMoveHandler);
                    $(document).off('mouseup', knob_mouseUpHandler);
                    if (!valueChanged) {
                        if (event.which == 1)
                            knob_click("l");
                        if (event.which == 3)
                            knob_click("r");
                        if (event.which == 3 || event.which == 1){
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                };

                var knob_click = function(key) {
                    const delta = key === "l" ? 1 : -1;
                    setAngle(_angle + delta * angleStep);
                }

                device.$ui.on('deviceAdd', function () {
                    $s.enableEvents($knob, true);
                    $knob.on('mousedown', knob_mouseDownHandler);
                    $knob.dblclick((ev) => {ev.stopPropagation(); ev.preventDefault()});
                    $knob.bind("contextmenu", () => {return false;});
                });
                device.$ui.on('deviceRemove', function () {
                    $s.enableEvents($knob, false);
                    $knob.off('mousedown', knob_mouseDownHandler);
                });

                var update = function () {
                    $s.transform($knob, size.width / 2,
                        size.height / 2, _angle + 90);
                    $s.transform($labelContainer, 0, 0, -(_angle + 90));
                    var max = 1 << numOutputs;
                    var value = Math.min(( (_angle - _MIN_ANGLE) /
                    (_MAX_ANGLE - _MIN_ANGLE) * max), max - 1);
                    $label.text(value.toString(16).toUpperCase());
                    for (var i = 0; i < numOutputs; i += 1) {
                        device.getOutputs()[i].setValue((value & (1 << i) ) ?
                            device.getInputs()[0].getValue() : null);
                    }
                };
                device.$ui.on('inputValueChange', update);
                update();
                /*device.doc = {
                    params: [
                        {
                            name: 'numOutputs', type: 'number', defaultValue: 4,
                            description: 'number of outputs.'
                        }
                    ],
                    code: '{"type":"' + device.deviceDef.type + '","numOutputs":4}'
                };*/
            };
        };
    };

    // register direct current source
    BeastController.registerDefaultComponent(new BasicComponent('DC', "DC", function (device) {
        device.addOutput();
        var super_createUI = device.createUI;
        device.createUI = function () {
            super_createUI();
            device.$ui.addClass('simcir-basicset-osc');
        };
        device.$ui.on('deviceAdd', function () {
            device.getOutputs()[0].setValue(onValue);
        });
        device.$ui.on('deviceRemove', function () {
            device.getOutputs()[0].setValue(null);
        });
    }));

    // register simple LED
    BeastController.registerDefaultComponent(new BasicComponent("LED", 'LED', function (device) {
        var in1 = device.addInput();
        var super_createUI = device.createUI;
        device.createUI = function () {
            super_createUI();
            var loColor, bLoColor, bHiColor, hiColor, bgColor;
            var setParameters = function () {
                hiColor = device.deviceDef.color || defaultLEDColor;
                bgColor = device.deviceDef.bgColor || defaultLEDBgColor;
                loColor = multiplyColor(hiColor, bgColor, 0.25);
                bLoColor = multiplyColor(hiColor, bgColor, 0.2);
                bHiColor = multiplyColor(hiColor, bgColor, 0.8);
            }
            setParameters();
            var size = device.getSize();
            var $ledbase = SVGGraphics.createSVGElement('circle').attr({
                cx: size.width / 2,
                cy: size.height / 2,
                r: size.width / 4
            }).attr('stroke', 'none').attr('fill', bLoColor);
            device.$ui.append($ledbase);
            var $led = SVGGraphics.createSVGElement('circle').attr({
                cx: size.width / 2,
                cy: size.height / 2,
                r: size.width / 4 * 0.8
            }).attr('stroke', 'none').attr('fill', loColor);
            device.$ui.append($led);
            device.$ui.on('inputValueChange', function () {
                $ledbase.attr('fill', isHot(in1.getValue()) ? bHiColor : bLoColor);
                $led.attr('fill', isHot(in1.getValue()) ? hiColor : loColor);
            });
            device.$ui.on('parameterChange', function () {
                setParameters();
                device.$ui.trigger("inputValueChange");
            });
            device.doc = {
                params: [
                    {
                        name: 'color', type: 'color', displayName: "Color",
                        defaultValue: defaultLEDColor,
                        description: 'color in hexadecimal'
                    },
                    {
                        name: 'bgColor', type: 'color', displayName: "Background color",
                        defaultValue: defaultLEDBgColor,
                        description: 'background color in hexadecimal'
                    }
                ],
                code: '{"type":"' + device.deviceDef.type +
                '","color":"' + defaultLEDColor + '"}'
            };
        };
    }));

    // register switches
    BeastController.registerDefaultComponent(new BasicComponent('PushOff', 'PushOff', createSwitchFactory('PushOff')));
    BeastController.registerDefaultComponent(new BasicComponent('PushOn', 'PushOn', createSwitchFactory('PushOn')));
    BeastController.registerDefaultComponent(new BasicComponent('Toggle', 'Toggle', createSwitchFactory('Toggle')));

    // register logic gates
    BeastController.registerDefaultComponent(new BasicComponent('BUF', 'BUF', createLogicGateFactory(null, BUF, drawBUF)));
    BeastController.registerDefaultComponent(new BasicComponent('NOT', 'NOT', createLogicGateFactory(null, NOT, drawNOT)));
    BeastController.registerDefaultComponent(new BasicComponent('AND', 'AND', createLogicGateFactory(AND, BUF, drawAND)));
    BeastController.registerDefaultComponent(new BasicComponent('NAND', 'NAND', createLogicGateFactory(AND, NOT, drawNAND)));
    BeastController.registerDefaultComponent(new BasicComponent('OR', 'OR', createLogicGateFactory(OR, BUF, drawOR)));
    BeastController.registerDefaultComponent(new BasicComponent('NOR', 'NOR', createLogicGateFactory(OR, NOT, drawNOR)));
    BeastController.registerDefaultComponent(new BasicComponent('XOR', 'XOR', createLogicGateFactory(XOR, BUF, drawXOR)));
    BeastController.registerDefaultComponent(new BasicComponent('XNOR', 'XNOR', createLogicGateFactory(XOR, NOT, drawENOR)));

    // register Oscillator
    BeastController.registerDefaultComponent(new BasicComponent('OSC', "Oscilator", function (device) {
        const DEFAULT_FREQUENCY = 10;

        var out1 = device.addOutput();
        var timerId = null;
        var on = false;

        var setTimer = function() {
            var freq = device.deviceDef.freq || DEFAULT_FREQUENCY;
            var delay = ~~(500 / freq); //Math.floor
            timerId = window.setInterval(function () {
                out1.setValue(on ? onValue : offValue);
                on = !on;
            }, delay);
        }
        var resetTimer = function() {
            if (timerId != null) {
                window.clearInterval(timerId);
                timerId = null;
            }
        };

        device.$ui.on('deviceAdd', setTimer);
        device.$ui.on('deviceRemove', resetTimer);
        device.$ui.on('parameterChange', function () {
            if (timerId != null) {
                resetTimer();
                setTimer();
            }
        });
        var super_createUI = device.createUI;
        device.createUI = function () {
            super_createUI();
            device.$ui.addClass( 'simcir-basicset-dc');
            device.doc = {
                params: [
                    {
                        name: 'freq', type: 'string', displayName: "Frequency", unit: "Hz",
                        defaultValue: DEFAULT_FREQUENCY,
                        description: 'frequency of the oscillator.'
                    }
                ],
            };
        };
    }));

    // register LED seg
    BeastController.registerDefaultComponent(new BasicComponent('7seg', "7 segment display",createLEDSegFactory(_7Seg)));
    BeastController.registerDefaultComponent(new BasicComponent('16seg', "16 segment display", createLEDSegFactory(_16Seg)));
    BeastController.registerDefaultComponent(new BasicComponent('4bit7seg', '4bit7seg',createLED4bitFactory()));

    // register Rotary Encoder
    BeastController.registerDefaultComponent(new BasicComponent('RotaryEncoder', 'RotaryEncoder', createRotaryEncoderFactory()));

    BeastController.registerDefaultComponent(new BasicComponent('BusIn', 'BusIn', function (device) {
        var numOutputs = Math.max(2, device.deviceDef.numOutputs || 8);
        device.halfPitch = true;
        device.addInput('', 'x' + numOutputs);
        for (var i = 0; i < numOutputs; i += 1) {
            device.addOutput();
        }
        var extractValue = function (busValue, i) {
            return (busValue != null && typeof busValue == 'object' &&
            typeof busValue[i] != 'undefined') ? busValue[i] : null;
        };
        device.$ui.on('inputValueChange', function () {
            var busValue = device.getInputs()[0].getValue();
            for (var i = 0; i < numOutputs; i += 1) {
                device.getOutputs()[i].setValue(extractValue(busValue, i));
            }
        });
        var super_createUI = device.createUI;
        device.createUI = function () {
            super_createUI();
            /*device.doc = {
                params: [
                    {
                        name: 'numOutputs', type: 'number', defaultValue: 8,
                        description: 'number of outputs.'
                    }
                ],
            };*/
        };
    }));

    BeastController.registerDefaultComponent(new BasicComponent('BusOut', 'BusOut', function (device) {
        var numInputs = Math.max(2, device.deviceDef.numInputs || 8);
        device.halfPitch = true;
        for (var i = 0; i < numInputs; i += 1) {
            device.addInput();
        }
        device.addOutput('', 'x' + numInputs);
        device.$ui.on('inputValueChange', function () {
            var busValue = [];
            var hotCount = 0;
            for (var i = 0; i < numInputs; i += 1) {
                var value = device.getInputs()[i].getValue();
                if (isHot(value)) {
                    hotCount += 1;
                }
                busValue.push(value);
            }
            device.getOutputs()[0].setValue(
                (hotCount > 0) ? busValue : null);
        });
        var super_createUI = device.createUI;
        device.createUI = function () {
            super_createUI();
            /*device.doc = {
                params: [
                    {
                        name: 'numInputs', type: 'number', defaultValue: 8,
                        description: 'number of inputs.'
                    }
                ]
            };*/
        };
    }));


    BeastController.registerDefaultComponent(new BasicComponent('Label', "Label", function (device) {
        const defaultText = "Label";
        const defaultTextSize = 18;
        const defaultColor = "#000000";


        var super_createUI = device.createUI;
        device.createUI = function () {
            super_createUI();
            device.$ui.addClass("beast-label");

            var $display = SVGGraphics.createSVGElement('g');
            device.$ui.append($display);
            SVGGraphics.transform($display, unit / 2, unit / 2);


            let $content = SVGGraphics.createSVGElement('text');//.attr("text-anchor", "start");

            $display.append($content);

            var update = function () {
                $content.remove();
                let dy = 0;
                $content = SVGGraphics.createSVGElement('text').addClass("beast-label-text")
                    .css('font-size', device.deviceDef.fontSize || defaultTextSize + 'px')
                    .css("fill", device.deviceDef.color || defaultColor);//.attr("text-anchor", "start");

                $display.append($content);
                SVGGraphics.transform($display, unit / 2, unit / 2 + 0.8*(device.deviceDef.fontSize || defaultTextSize));

                for (let line of (device.deviceDef.text || defaultText).split("\n")) {
                    let tspan = SVGGraphics.createSVGElement('tspan').attr({x: "0", y: dy+"em"}).text(line);
                    $content.append(tspan);
                    dy += 1.2;
                }

                //Call fails when label is not yet attached to DOM in inconsistent ways
                //FF: exception Chrome: return zeros
                try {
                    let bbox = $display[0].getBBox();
                    if (bbox.width != 0 && bbox.height != 0)
                        device.$ui.children('.simcir-device-body').attr('width', bbox.width + unit).attr('height', bbox.height + unit);
                }
                catch(err) {}

            }

            update();
            device.$ui.on('parameterChange', update);
            device.$ui.on('deviceAdd', update);

            device.doc = {
                haslabel: false,
                params: [
                    {
                        name: 'color', type: 'color', displayName: "Text Color",
                        defaultValue: defaultColor,
                        description: 'Color of the labels text'
                    },
                    {
                        name: 'fontSize', type: 'integer', displayName: "Font Size",
                        defaultValue: defaultTextSize,
                        description: 'Font size of the labels text'
                    },
                    {
                        name: 'text', type: 'multilinestring', displayName: "Text",
                        defaultValue: defaultText,
                        description: 'The text to be displayed in the label'
                    }
                ],
            };
        };
    }));

}(jQuery, simcir);
