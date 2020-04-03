/**
 * Created by maximilian on 12.05.17.
 */

!function($, $s) {

    // unit size
    var unit = $s.unit;

    var connectNode = function(in1, out1, cond) {
        // set input value to output without inputValueChange event.
        var in1_super_setValue = in1.setValue;
        in1.setValue = function(value, force) {
            var changed = in1.getValue() !== value;
            in1_super_setValue(value, force);
            if ((changed || force) && ((cond == undefined) || cond())) {
                out1.setValue(in1.getValue() );
            }
        };
    };

    var createPortFactory = function(type) {
        return function(device) {
            var in1 = device.addInput();
            var out1 = device.addOutput();
            connectNode(in1, out1, () => !externalManipulation || type!=="in");
            var super_createUI = device.createUI;
            device.createUI = function() {
                super_createUI();
                var size = device.getSize();
                var cx = size.width / 2;
                var cy = size.height / 2;
                device.$ui.append(SVGGraphics.createSVGElement('circle').
                attr({cx: cx, cy: cy, r: unit / 2}).
                attr('class', 'simcir-port simcir-node-type-' + type) );
                device.$ui.append(SVGGraphics.createSVGElement('circle').
                attr({cx: cx, cy: cy, r: unit / 4}).
                attr('class', 'simcir-port-hole') );
                device.$ui.on('inputValueChange',updateUI);
            };

            var externalManipulation = false;

            var updateUI = function() {
                device.$ui.toggleClass("simcir-port-manipulated", externalManipulation);
                device.$ui.toggleClass("simcir-port-manipulated-hot", externalManipulation && (out1.getValue() != null));
            }

            device.setExternalManipulation = function(value) {
                externalManipulation = value;
                if (!value)
                    out1.setValue(in1.getValue() );
                updateUI();
            }

            device.setManipulationValue = function(value) {
                if (externalManipulation) {
                    out1.setValue(value ? 1 : null)
                }
                updateUI();
            }
        };
    };

    var createJointFactory = function() {

        var maxFadeCount = 16;
        var fadeTimeout = 100;

        return function(device) {

            var in1 = device.addInput();
            var out1 = device.addOutput();
            connectNode(in1, out1);

            var showConnectorState = false;

            device.getSize = function() {
                return { width : unit, height : unit };
            };

            var super_createUI = device.createUI;
            device.createUI = function() {
                super_createUI();

                var $label = device.$ui.children('.simcir-device-label');
                $label.attr('y', $label.attr('y') - unit / 4);

                var $point = SVGGraphics.createSVGElement('circle').
                css('pointer-events', 'none').css('opacity', 0).attr('r', 2);
                $point.addClass( 'simcir-connector');
                $point.addClass( 'simcir-joint-point');
                device.$ui.append($point);

                var $path = SVGGraphics.createSVGElement('path').
                css('pointer-events', 'none').css('opacity', 0);
                $path.addClass( 'simcir-connector');
                device.$ui.append($path);

                var $title = SVGGraphics.createSVGElement('title')

                var updatePoint = function() {
                    $point.css('display', out1.getInputs().length > 1? '' : 'none');
                };

                updatePoint();

                var super_connectTo = out1.connectTo;
                out1.connectTo = function(inNode) {
                    super_connectTo(inNode);
                    updatePoint();
                };
                var super_disconnectFrom = out1.disconnectFrom;
                out1.disconnectFrom = function(inNode) {
                    super_disconnectFrom(inNode);
                    updatePoint();
                };

                var updateUI = function() {
                    var x0, y0, x1, y1;
                    x0 = y0 = x1 = y1 = unit / 2;
                    var d = unit / 2;

                    x0 -= d;
                    x1 += d;

                    $path.attr('d', 'M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1);
                    SVGGraphics.transform(in1.$ui, x0, y0);
                    SVGGraphics.transform(out1.$ui, x1, y1);
                    $point.attr({cx : x1, cy : y1});

                    device.$ui.children('.simcir-device-body').
                    attr({x: 0, y: unit / 4, width: unit, height: unit / 2});
                };

                updateUI();

                // fadeout a body.
                var fadeCount = 0;
                var setOpacity = function(opacity) {
                    device.$ui.children('.simcir-device-body,.simcir-node').
                    css('opacity', opacity);
                    $path.css('opacity', 1 - opacity);
                    $point.css('opacity', 1 - opacity);
                };
                var fadeout = function() {
                    window.setTimeout(function() {
                        if (fadeCount > 0) {
                            fadeCount -= 1;
                            setOpacity(fadeCount / maxFadeCount);
                            fadeout();
                        }
                    }, fadeTimeout);
                };

                var device_mouseoutHandler = function(event) {
                    if (!device.isSelected() ) {
                        fadeCount = maxFadeCount;
                        fadeout();
                    }
                };

                var updateState = function() {
                    $path.toggleClass("beast-connection-hot", in1.getValue() === 1 && showConnectorState);
                    $path.toggleClass("beast-connection-cold", in1.getValue() !== 1 && showConnectorState);
                    $point.toggleClass("beast-connection-hot", in1.getValue() === 1 && showConnectorState);
                    $point.toggleClass("beast-connection-cold", in1.getValue() !== 1 && showConnectorState);
                };

                device.$ui.on('mouseover', function(event) {
                    setOpacity(1);
                    fadeCount = 0;
                }).on('deviceAdd', function() {
                    setOpacity(0);
                    $(this).append($title).on('mouseout', device_mouseoutHandler);
                    // hide a label
                    $label.remove();
                }).on('deviceRemove', function() {
                    $(this).off('mouseout', device_mouseoutHandler);
                    $title.remove();
                }).on('deviceSelect', function() {
                    if (device.isSelected() ) {
                        setOpacity(1);
                        fadeCount = 0;
                    } else {
                        if (fadeCount === 0) {
                            setOpacity(0);
                        }
                    }
                }).on('inputValueChange', function () {
                    if (updateState !== undefined)
                        updateState();
                });

                var super_setShowConnectorState = device.setShowConnectorState;

                device.setShowConnectorState = function (showState) {
                    super_setShowConnectorState(showState);
                    showConnectorState = showState;
                    if (updateState !== undefined)
                        updateState();
                }
            };
        };
    };

    // register built-in devices
    BeastController.registerDefaultComponent(new BasicComponent('In', "In Port", createPortFactory('in')) );
    BeastController.registerDefaultComponent(new BasicComponent('Out', "Out Port", createPortFactory('out')) );
    BeastController.registerDefaultComponent(new BasicComponent('Joint', "Joint", createJointFactory()) );

}(jQuery, simcir);
