//
// SimcirJS
//
// Copyright (c) 2014 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

// includes following device types:
//  In
//  Out
//  Joint

import transform = SVGGraphics.transform;
type position = {x: number, y: number}

var simcir = function($) {
    
    var createSVGElement = SVGGraphics.createSVGElement;
    var createSVG = SVGGraphics.createSVG;
    var graphics = function($target) {
        return new SVGGraphics.SVGGraphics($target);
    };
    var transform = SVGGraphics.transform;
    
    var rotateCoords = function(p: position, angle: number): position {
        const radAngle = angle / 180 * Math.PI;
        return { x: Math.round(Math.cos(radAngle) * p.x - Math.sin(radAngle) * p.y),
            y: Math.round(Math.sin(radAngle) * p.x + Math.cos(radAngle) * p.y)};
    };
    
    var normalizeAngle = function(angle: number): number {
        return (angle % 360 + 360) % 360;
    };
    
    var clone = function(obj) {
        return JSON.parse(JSON.stringify(obj) );
    };
    
    var eachClass = function($o, f) {
        var className = $o.attr('class');
        if (className) {
            $.each(className.split(/\s+/g), f);
        }
    };
    
    var addClass = function($o, className, remove?) {
        var newClass = '';
        eachClass($o, function(i, c) {
            if (!(remove && c == className) ) {
                newClass += '\u0020';
                newClass += c;
            }
        });
        if (!remove) {
            newClass += '\u0020';
            newClass += className;
        }
        $o.attr('class', newClass);
        return $o;
    };
    
    var removeClass = function($o, className) {
        return addClass($o, className, true);
    };
    
    var hasClass = function($o, className) {
        var found = false;
        eachClass($o, function(i, c) {
            if (c == className) {
                found = true;
            }
        });
        return found;
    };
    
    
    var offset = function($o, prex?: number, prey?: number) {
        var x = prex || 0;
        var y = prey || 0;
        while ($o[0].nodeName != 'svg' && !$o.hasClass("simcir-containerPane")) {
            var pos = transform($o);
            
            const angle = pos.rotate * Math.PI / 180;
            //apply rotation matrix
            [x, y] =  [ Math.round(Math.cos(angle) * x - Math.sin(angle) * y),
                        Math.round(Math.sin(angle) * x + Math.cos(angle) * y)];
            
            x += pos.x;
            y += pos.y;
            $o = $o.parent();
        }
        return {x: x, y: y};
    };
    
    var enableEvents = function($o, enable) {
        $o.css('pointer-events', enable? 'visiblePainted' : 'none');
    };
    
    var disableSelection = function($o) {
        $o.each(function() {
            this.onselectstart = function() { return false; };
        }).css('-webkit-user-select', 'none');
    };
    
    var controller = function():any {
        var id = 'controller';
        return function($ui, controller) {
            if (arguments.length == 1) {
                return $.data($ui[0], id);
            } else if (arguments.length == 2) {
                $.data($ui[0], id, controller);
            }
        };
    }();
    
    var markDirty = function($elem: JQuery)
    {
        const $workspace = $elem.closest(".simcir-workspace");
        controller($workspace).markDirty();
    }
    
    var eventQueue = new EventQueue();
    
    var unit = 16;
    var fontSize = 12;
    
    var createLabel = function(text) {
        return createSVGElement('text').
                                       text(text).
                                       css('font-size', fontSize + 'px');
    };
    
    var createNode = function(type, label, description, headless) {
        var $node = createSVGElement('g').
                                         attr('simcir-node-type', type);
        if (!headless) {
            $node.attr('class', 'simcir-node');
        }
        var node = createNodeController({
                                            $ui: $node, type: type, label: label,
                                            description: description, headless: headless});
        if (type == 'in') {
            controller($node, createInputNodeController(node) );
        } else if (type == 'out') {
            controller($node, createOutputNodeController(node) );
        } else {
            throw 'unknown type:' + type;
        }
        return $node;
    };
    
    var isActiveNode = function($o) {
        return $o.closest('.simcir-node').length == 1;
    };
    
    var createNodeController = function(node) {
        var _value = null;
        var setValue = function(value, force) {
            if (_value === value && !force) {
                return;
            }
            _value = value;
            eventQueue.postEvent({target: node.$ui, type: 'nodeValueChange'});
        };
        var getValue = function() {
            return _value;
        };
        
        var showConnectorState = false;
        
        var setShowConnectorState = (showState: boolean) => null;
        
        if (!node.headless) {
            
            node.$ui.attr('class', 'simcir-node simcir-node-type-' + node.type);
            
            var $circle = createSVGElement('circle').
                                                    attr({cx: 0, cy: 0, r: 4});
            node.$ui.on('mouseover', function(event) {
                if (isActiveNode(node.$ui) ) {
                    addClass(node.$ui, 'simcir-node-hover');
                }
            });
            node.$ui.on('mouseout', function(event) {
                if (isActiveNode(node.$ui) ) {
                    removeClass(node.$ui, 'simcir-node-hover');
                }
            });
            node.$ui.append($circle);
            var appendLabel = function(text, align) {
                var $label = createLabel(text).
                                              attr('class', 'simcir-node-label');
                enableEvents($label, false);
                if (align == 'right') {
                    $label.attr('text-anchor', 'start').
                    attr('x', 6).
                          attr('y', fontSize / 2);
                } else if (align == 'left') {
                    $label.attr('text-anchor', 'end').
                    attr('x', -6).
                          attr('y', fontSize / 2);
                }
                node.$ui.append($label);
            };
            if (node.label) {
                if (node.type == 'in') {
                    appendLabel(node.label, 'right');
                } else if (node.type == 'out') {
                    appendLabel(node.label, 'left');
                }
            }
            if (node.description) {
                if (node.type == 'in') {
                    appendLabel(node.description, 'left');
                } else if (node.type == 'out') {
                    appendLabel(node.description, 'right');
                }
            }
            
            var updateState = function()
            {
                if (showConnectorState) {
                    node.$ui.toggleClass('simcir-node-hot', _value != null);
                    node.$ui.toggleClass('simcir-node-cold', _value == null);
                }
            }
            
            node.$ui.on('nodeValueChange', updateState);
    
            setShowConnectorState = function(state: boolean) {
                showConnectorState = state;
                if (!state) {
                    node.$ui.removeClass('simcir-node-hot');
                    node.$ui.removeClass('simcir-node-cold');
                }
                else
                    updateState();
                
            }
        }
        
        return $.extend(node, {
            setValue: setValue,
            getValue: getValue,
            setShowConnectorState: setShowConnectorState,
        });
    };
    
    var createInputNodeController = function(node) {
        var output = null;
        var setOutput = function(outNode) {
            output = outNode;
        };
        var getOutput = function() {
            return output;
        };
        return $.extend(node, {
            setOutput: setOutput,
            getOutput: getOutput
        });
    };
    
    var createOutputNodeController = function(node) {
        var inputs = [];
        var super_setValue = node.setValue;
        var setValue = function(value) {
            super_setValue(value);
            for (var i = 0; i < inputs.length; i += 1) {
                inputs[i].setValue(value);
            }
        };
        var connectTo = function(inNode) {
            if (inNode.getOutput() != null) {
                inNode.getOutput().disconnectFrom(inNode);
            }
            inNode.setOutput(node);
            inputs.push(inNode);
            inNode.setValue(node.getValue(), true);
        };
        var disconnectFrom = function(inNode) {
            if (inNode.getOutput() != node) {
                throw 'not connected.';
            }
            inNode.setOutput(null);
            inNode.setValue(null, true);
            inputs = $.grep(inputs, function(v) {
                return v != inNode;
            });
        };
        var getInputs = function() {
            return inputs;
        };
        return $.extend(node, {
            setValue: setValue,
            getInputs: getInputs,
            connectTo: connectTo,
            disconnectFrom: disconnectFrom
        });
    };
    
    var createDevice = function(deviceDef, componentLoader: (id: GlobalComponentTypeID) => Component, headless?, scope?) {
        headless = headless || false;
        scope = scope || null;
        var $dev = createSVGElement('g');
        if (!headless) {
            $dev.attr('class', 'simcir-device');
        }
        const component = componentLoader(deviceDef.type);
        
        controller($dev, createDeviceController(
            {$ui: $dev, deviceDef: deviceDef,
                headless: headless, scope: scope, doc: null}, component.name) );
        
        
        if (Component.isBasic(component)) {
            component.factory(controller($dev) );
        }
        else if (Component.isCompound(component)) {
            const factory = createDeviceRefFactory(component, componentLoader);
            factory(controller($dev));
        }
        else {
            alert("Unkown device!");
        }
        if (!headless) {
            controller($dev).createUI();
        }
        return $dev;
    };
    
    var createDeviceController = function(device, defaultLabel) {
        var inputs = [];
        var outputs = [];
        var addInput = function(label, description) {
            var $node = createNode('in', label, description, device.headless);
            $node.on('nodeValueChange', function(event) {
                device.$ui.trigger('inputValueChange');
            });
            if (!device.headless) {
                device.$ui.append($node);
            }
            var node = controller($node);
            inputs.push(node);
            return node;
        };
        var addOutput = function(label, description) {
            var $node = createNode('out', label, description, device.headless);
            if (!device.headless) {
                device.$ui.append($node);
            }
            var node = controller($node);
            outputs.push(node);
            return node;
        };
        var getInputs = function() {
            return inputs;
        };
        var getOutputs = function() {
            return outputs;
        };
        var disconnectAll = function() {
            $.each(getInputs(), function(i, inNode) {
                var outNode = inNode.getOutput();
                if (outNode != null) {
                    outNode.disconnectFrom(inNode);
                }
            });
            $.each(getOutputs(), function(i, outNode) {
                $.each(outNode.getInputs(), function(i, inNode) {
                    outNode.disconnectFrom(inNode);
                });
            });
        };
        
        var selected = false;
        var setSelected = function(value) {
            selected = value;
            device.$ui.trigger('deviceSelect');
        };
        var isSelected = function() {
            return selected;
        };
        
        var label = device.deviceDef.label;
        if (typeof label == 'undefined') {
            label = defaultLabel;
        }
        var setLabel = function(value) {
            value = value.replace(/^\s+|\s+$/g, '');
            label = value || defaultLabel;
            device.deviceDef.label = label;
            device.$ui.trigger('deviceLabelChange');
        };
        var getLabel = function() {
            return device.deviceDef.label;
        };
        
        var getSize = function() {
            var nodes = Math.max(device.getInputs().length,
                                 device.getOutputs().length);
            return { width: unit * 2,
                height: unit * Math.max(2, device.halfPitch?
                                           (nodes + 1) / 2 : nodes)};
        };
        
        var layoutUI = function() {
            
            var size = device.getSize();
            var w = size.width;
            var h = size.height;
            
            device.$ui.children('.simcir-device-body').
            attr({x: 0, y: 0, width: w, height: h});
            
            var pitch = device.halfPitch? unit / 2 : unit;
            var layoutNodes = function(nodes, x) {
                var offset = (h - pitch * (nodes.length - 1) ) / 2;
                $.each(nodes, function(i, node) {
                    transform(node.$ui, x, pitch * i + offset);
                });
            };
            layoutNodes(getInputs(), 0);
            layoutNodes(getOutputs(), w);
            
            device.$ui.children('.simcir-device-label').
            attr({x: w / 2, y: h + fontSize});
        };
        
        var updateLabelPosition = () => (null);
        
        var createUI = function() {
            
            device.$ui.attr('class', 'simcir-device');
            device.$ui.on('deviceSelect', function() {
                if (selected) {
                    addClass($(this), 'simcir-device-selected');
                } else {
                    removeClass($(this), 'simcir-device-selected');
                }
            });
            
            var $body = createSVGElement('rect').
                                                attr('class', 'simcir-device-body').
                                                attr('rx', 2).attr('ry', 2);
            device.$ui.prepend($body);
            
            var $label = createLabel(label).
                                           attr('class', 'simcir-device-label').
                                           attr('text-anchor', 'middle');
            device.$ui.on('deviceLabelChange', function() {
                $label.text(getLabel() );
                updateLabelPosition();
            });
            
            var dblClickHandler = function(event) {
                event.preventDefault();
                event.stopPropagation();
                openParameterDialog();
            };
            device.$ui.on('deviceAdd', function() {
                device.$ui.on('dblclick', dblClickHandler);
            } );
            device.$ui.on('deviceRemove', function() {
                device.$ui.off('dblclick', dblClickHandler);
            } );
            //device.$ui.append($label);
    
    
            device.$ui.on('deviceAdd', () => {
                if (device.doc == null || device.doc.haslabel === undefined || device.doc.haslabel == true)
                    device.$ui.closest(".simcir-devicepane").append($label);
                updateLabelPosition = function() {
                    const anchor = getAnchorBelow();
                    $label.attr({x: anchor.x , y: anchor.y + 1 * unit});
                };
    
                updateLabelPosition();
                device.$ui.on("deviceRemove", () => $label.remove());
            } );
            
            layoutUI();
            
        };
        
        var paramDialog: ParameterDialog = null;
        
        var openParameterDialog = function()
        {
            if (paramDialog !== null && paramDialog.isOpen)
                return;
            
            let setValues = (newvalues) => {
                $.extend(device.deviceDef, newvalues);
                device.$ui.trigger('parameterChange');
                device.$ui.trigger('deviceLabelChange');
                if ($tooltip !== null)
                    showTooltip();
                markDirty(device.$ui);
                controller(device.$ui.closest(".simcir-workspace")).updateConnectors();
            };
            let params: Array<SimcirParamDescription> = device.doc != null ? device.doc.params || [] : [];
            if (device.doc == null || device.doc.haslabel === undefined || device.doc.haslabel == true) {
                let labledef: SimcirParamDescription = {
                    name: "label",
                    type: 'string',
                    description: "Label of the device",
                    displayName: "Label",
                    defaultValue: device.deviceDef.type
                    };
                params = [labledef].concat(params);
            }
            paramDialog = new ParameterDialog(params, device.deviceDef, setValues);
            paramDialog.show();
        }
        
        var $tooltip: JQuery = null;
    
        var showTooltip = function()
        {
            if (device.doc === null)
                return;
            removeTooltip();
    
            const $container = $("<div></div>");
            const $table = $("<table></table>");
            
            for (let paramDesc of device.doc.params) {
                const $row = $("<tr></tr>");
                $row.append($("<td class='name'></td>").text((paramDesc.displayName || paramDesc.name) +":"));
                let value = device.deviceDef[paramDesc.name] || paramDesc.defaultValue;
                let $value = $("<td class='value'></td>").text(value);
                if (paramDesc.type === 'color')
                    $value.append($("<span class='beast-parameter-colorpreview'></span>").css("background-color", value));
                $row.append($value);
                $table.append($row);
            }
            
            $container.append($table);
            $container.addClass("beast-parameter-tooltip");
            $tooltip = SVGGraphics.createSVGElement("foreignObject");
            $tooltip.append($container);
            
            updateTooltipPosition();
        };
        
        var getAnchorBelow = function(): position
        {
            const bb = device.$ui[0].getBBox();
            const doff = offset(device.$ui);
            const radrot = -transform(device.$ui).rotate* Math.PI / 180;
            const dx = (Math.cos(radrot) * bb.width + Math.sin(radrot) * bb.height) / 2;
            const w = bb.width;
            const h = bb.height;
            const corners = [
                {x: 0, y: 0},
                {x: w, y: h},
                {x: 0, y: h},
                {x: w, y: 0},
            ];
            
            const posy = Math.max(...corners.map((point) => offset(device.$ui, point.x, point.y).y));
            
            //alert(bb.height+"  " +bb.width);
            return {x: doff.x + dx, y: posy};
        }
        
        var updateTooltipPosition = function() {
            if ($tooltip !== null) {
                const h = 200;
                const w = 250;
                //$tooltip.attr({x: size.width /2 - w/2, y: size.height + unit, width: w, height: h});
                const anchor = getAnchorBelow();
                $tooltip.attr({x: anchor.x - w/2, y: anchor.y + unit, width: w, height: h});
                device.$ui.closest(".simcir-containerPane").append($tooltip);
            }
        }
        
        var removeTooltip = function()
        {
            if ($tooltip !== null) {
                $tooltip.remove();
                $tooltip = null;
            }
        };
        
        device.$ui.on("deviceRemove", () => removeTooltip());
        
        var getState = function() { return null; };
        
        var updatePosition = function()
        {
            updateTooltipPosition();
            updateLabelPosition();
        }
        
        
        device.$ui.on("transformed", updatePosition);
        
        return $.extend(device, {
            addInput: addInput,
            addOutput: addOutput,
            getInputs: getInputs,
            getOutputs: getOutputs,
            disconnectAll: disconnectAll,
            setSelected: setSelected,
            isSelected: isSelected,
            getLabel: getLabel,
            halfPitch: false,
            markDirty: () => (markDirty(device.$ui)),
            getSize: getSize,
            createUI: createUI,
            layoutUI: layoutUI,
            getState: getState,
            openParameterDialog: openParameterDialog,
            showTooltip: showTooltip,
            removeTooltip: removeTooltip,
            updatePosition: updatePosition,
            setShowConnectorState: (showState: boolean) => null,
        });
    };
    
    var createConnector = function(x1, y1, x2, y2) {
        return createSVGElement('path').
                                       attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2).
                                       attr('class', 'simcir-connector');
    };
    
    var connect = function($node1, $node2) {
        var type1 = $node1.attr('simcir-node-type');
        var type2 = $node2.attr('simcir-node-type');
        if (type1 == 'in' && type2 == 'out') {
            controller($node2).connectTo(controller($node1) );
        } else if (type1 == 'out' && type2 == 'in') {
            controller($node1).connectTo(controller($node2) );
        }
    };
    
    var buildCircuit = function(data, componentLoader: (id: GlobalComponentTypeID) => Component, headless, scope) {
        var $devices = [];
        var $devMap = {};
        var getNode = function(path) {
            if (!path.match(/^(\w+)\.(in|out)([0-9]+)$/g) ) {
                throw 'unknown path:' + path;
            }
            var devId = RegExp.$1;
            var type = RegExp.$2;
            var index = +RegExp.$3;
            return (type == 'in')?
                   controller($devMap[devId]).getInputs()[index] :
                   controller($devMap[devId]).getOutputs()[index];
        };
        $.each(data.devices, function(i, deviceDef) {
            var $dev = createDevice(deviceDef, componentLoader, headless, scope);
            transform($dev, deviceDef.x, deviceDef.y, deviceDef.rotation || 0);
            $devices.push($dev);
            $devMap[deviceDef.id] = $dev;
        });
        $.each(data.connectors, function(i, conn) {
            var nodeFrom = getNode(conn.from);
            var nodeTo = getNode(conn.to);
            if (nodeFrom && nodeTo) {
                connect(nodeFrom.$ui, nodeTo.$ui);
            }
        });
        return $devices;
    };
    
    
    
    var createDeviceRefFactory = function(data, componentLoader: (id: GlobalComponentTypeID) => Component) {
        return function(device) {
            var $devs = buildCircuit(data, componentLoader, true, {});
            var $ports = [];
            $.each($devs, function(i, $dev) {
                var deviceDef = controller($dev).deviceDef;
                if (deviceDef.type.libraryID == BeastController.BASIC_LIB_ID &&
                        (deviceDef.type.componentID == 'In' || deviceDef.type.componentID == 'Out')) {
                    $ports.push($dev);
                }
            });
            $ports.sort(function($p1, $p2) {
                var x1 = controller($p1).deviceDef.x;
                var y1 = controller($p1).deviceDef.y;
                var x2 = controller($p2).deviceDef.x;
                var y2 = controller($p2).deviceDef.y;
                if (x1 == x2) {
                    return (y1 < y2)? -1 : 1;
                }
                return (x1 < x2)? -1 : 1;
            });
            var getDesc = function(port) {
                return port? port.description : '';
            };
            $.each($ports, function(i, $port) {
                var port = controller($port);
                var portDef = port.deviceDef;
                var inPort;
                var outPort;
                if (portDef.type.componentID == 'In') {
                    outPort = port.getOutputs()[0];
                    inPort = device.addInput(portDef.label,
                                             getDesc(outPort.getInputs()[0]) );
                    // force disconnect test devices that connected to In-port
                    var inNode = port.getInputs()[0];
                    if (inNode.getOutput() != null) {
                        inNode.getOutput().disconnectFrom(inNode);
                    }
                } else if (portDef.type.componentID == 'Out') {
                    inPort = port.getInputs()[0];
                    outPort = device.addOutput(portDef.label,
                                               getDesc(inPort.getOutput() ) );
                    // force disconnect test devices that connected to Out-port
                    var outNode = port.getOutputs()[0];
                    $.each(outNode.getInputs(), function(i, inNode) {
                        if (inNode.getOutput() != null) {
                            inNode.getOutput().disconnectFrom(inNode);
                        }
                    } );
                }
                inPort.$ui.on('nodeValueChange', function() {
                    outPort.setValue(inPort.getValue() );
                });
            });
            var super_getSize = device.getSize;
            device.getSize = function() {
                var size = super_getSize();
                return {width: unit * 4, height: size.height};
            };
            device.$ui.on('dblclick', function(event) {
                controller(device.$ui.closest(".simcir-workspace")).openCompound(device.deviceDef.type);
                event.stopImmediatePropagation();
                event.preventDefault();
            });
        };
    };
    
    var getUniqueId = function() {
        var uniqueIdCount = 0;
        return function() {
            return 'simcir-id' + uniqueIdCount++;
        };
    }();
    
    var createWorkspace = function(data, $container, getLibraryComponent: (id: GlobalComponentTypeID) => Component) {
        
        data = $.extend({
                            width: 400,
                            height: 200,
                            devices: [],
                            connectors: [],
                        }, data);
        
        var scope = {};
        var barWidth = unit;
        
        var $workspace = createSVG().attr('class', 'simcir-workspace');
        disableSelection($workspace);
        
        var $defs = createSVGElement('defs');
        var $containerPane = createSVGElement('g').addClass("simcir-containerPane");
        
        $workspace.append($defs);
        $workspace.append($containerPane);
        
        var $workspaceBackground;
        var patternPitch = unit / 2;
        
        !function() {
            
            // fill with pin hole pattern.
            var patId = getUniqueId();
            var w = 3*6000;
            var h = 3*4000;
            
            $defs.append(createSVGElement('pattern').
                                                    attr({id: patId, x: 0, y: 0,
                                                             width: patternPitch / w, height: patternPitch / h}).append(
                createSVGElement('rect').attr('class', 'simcir-pin-hole').
                attr({x: 0, y: 0, width: 1, height: 1}) ) );
    
            $workspaceBackground = createSVGElement('rect').
                                                      attr({x: -3000, y: -3000, width: w, height: h}).
                                                      css({fill: 'url(#' + patId + ')'});
        }();
        $containerPane.append($workspaceBackground);
        
        var $devicePane = createSVGElement('g');
        $devicePane.addClass("simcir-devicepane");
        var $connectorPane = createSVGElement('g');
        var $temporaryPane = createSVGElement('g');
        
        enableEvents($connectorPane, false);
        enableEvents($temporaryPane, false);
        
        $containerPane.append($devicePane);
        $containerPane.append($connectorPane);
        $containerPane.append($temporaryPane);
    
        $container.append($workspace);
        
        var addDevice = function($dev) {
            $devicePane.append($dev);
            $dev.trigger('deviceAdd');
            controller($dev).updatePosition();
            controller($dev).setShowConnectorState(showConnectorState)
            for (let $node of $dev.find(".simcir-node").toArray())
                controller($($node)).setShowConnectorState(showConnectorState);
        };
        
        var removeDevice = function($dev) {
            $dev.trigger('deviceRemove');
            // before remove, disconnect all
            controller($dev).disconnectAll();
            $dev.remove()
            updateConnectors();
        };
        
        var disconnect = function($inNode) {
            var inNode = controller($inNode);
            if (inNode.getOutput() != null) {
                inNode.getOutput().disconnectFrom(inNode);
            }
            updateConnectors();
        };
        
        var  showConnectorState = false;
        
        var updateConnectors = function() {
            $connectorPane.children().remove();
            $devicePane.children('.simcir-device').each(function() {
                var device = controller($(this) );
                $.each(device.getInputs(), function(i, inNode) {
                    if (inNode.getOutput() != null) {
                        var p1 = offset(inNode.$ui);
                        var p2 = offset(inNode.getOutput().$ui);
                        const $connector = createConnector(p1.x, p1.y, p2.x, p2.y);
                        $connectorPane.append($connector);
                        if (inNode.$ui !== null) {
                            var updateState = function() {
                                $connector.toggleClass("beast-connection-hot", inNode.getValue() === 1 && showConnectorState);
                                $connector.toggleClass("beast-connection-cold", inNode.getValue() !== 1 && showConnectorState);
                            }
                            
                            inNode.$ui.on("nodeValueChange", () => updateState());
                            updateState();
                        }
                    }
                });
            });
        };
        
        
        var devicesCenterOfGravity = function($devices: Array<JQuery>): position {
            let xsum = 0, ysum = 0;
    
            for (let $dev of $devices) {
                const size = controller($($dev)).getSize();
                const pos = offset($($dev), size.width / 2, size.height / 2);
                xsum += pos.x;
                ysum += pos.y;
            }
            
            return {x : xsum/$devices.length, y: ysum/$devices.length};
        }
        
        var exportPart = function($devices: Array<JQuery>, center: boolean) {
            
            // renumber all id
            var devIdCount = 0;
            
            for (let $dev of $devices) {
                var device = controller($($dev));
                var devId = 'dev' + devIdCount++;
                device.id = devId;
                $.each(device.getInputs(), function(i, node) {
                    node.id = devId + '.in' + i;
                });
                $.each(device.getOutputs(), function(i, node) {
                    node.id = devId + '.out' + i;
                });
            }
            let devicecontrollers = $devices.map((d) => controller($(d)));
            
            //When enabled, calculates the center of gravity or the (Sub-)Circuit
            //and moves it to (0,0)
            let deltax = 0, deltay = 0;
            if (center) {
                let cog = devicesCenterOfGravity($devices);
                deltax = -cog.x;
                deltay = -cog.y;
            }
            
            var devices = [];
            var connectors = [];
    
            for (let $dev of $devices) {
                $dev = $($dev);
                var device = controller($dev);
                $.each(device.getInputs(), function(i, inNode) {
                    const output = inNode.getOutput();
                    if (output != null && devicecontrollers.indexOf(controller(output.$ui.closest(".simcir-device"))) != -1) {
                        connectors.push({from:inNode.id, to:inNode.getOutput().id});
                    }
                });
                var pos = transform($dev);
                var deviceDef = clone(device.deviceDef);
                deviceDef.id = device.id;
                deviceDef.x = pos.x + deltax;
                deviceDef.y = pos.y + deltay;
                if (pos.rotate != 0)
                    deviceDef.rotation = pos.rotate;
                var state = device.getState();
                if (state != null) {
                    deviceDef.state = state;
                }
                devices.push(deviceDef);
            }
            return {
                ID: data.ID,
                name: data.name,
                devices: devices,
                connectors: connectors
            };
        };
        
        var getData = function()
        {
            return exportPart(jQuery.makeArray($devicePane.children('.simcir-device')), false);
        }
        
        var pasteSubcircuit = function(subcircuit)
        {
            const $subcircuit = buildCircuit(subcircuit, getLibraryComponent, false, scope);
            const pos = tranformCoords({x: $workspace.width()/2, y: $workspace.height()/2});
            deselectAll();
            for (let $dev of $subcircuit) {
                const oldpos = transform($dev);
                transform($dev, oldpos.x + pos.x, oldpos.y + pos.y, oldpos.rotate, oldpos.zoom);
                addDevice($dev);
                addSelected($dev);
            };
            updateConnectors();
            markDirty($workspace);
        }
        
        //-------------------------------------------
        // mouse operations
        
        var dragMoveHandler = null;
        var dragCompleteHandler = null;
        
        var adjustDevice = function($dev) {
            var pitch = unit / 2;
            var adjust = function(v) { return Math.round(v / pitch) * pitch; };
            var pos = transform($dev);
            var size = controller($dev).getSize();
            transform($dev, adjust(pos.x), adjust(pos.y), pos.rotate );
        };
        
        var tranformCoords = function(p:position): position {
            const globalTransform = transform($containerPane);
            return {x: (p.x - globalTransform.x) / globalTransform.zoom, y: (p.y - globalTransform.y )/ globalTransform.zoom};
        };
    
        var getEventPos = function(e: {pageX: number, pageY: number}): position {
            const workspaceOffset = $workspace.offset();
            return {x:e.pageX - workspaceOffset.left, y:e.pageY - workspaceOffset.top};
        };
        
        var tranformEventCoords = function(e: {pageX: number, pageY: number}): position {
            return tranformCoords(getEventPos(e));
        };
        var isOutsideWorkspace = function(pos: position): boolean {
            return pos.x < 0 || pos.y < 0 || pos.x > $workspace.width() || pos.y > $workspace.height();
        };
        
        var beginConnect = function(event, $target) {
            var $srcNode = $target.closest('.simcir-node');
            var off = $workspace.offset();
            var pos = offset($srcNode);
            var endpos;
            var junctions = [];
            var oldSrcNodes = [];
            if ($srcNode.attr('simcir-node-type') == 'in') {
                disconnect($srcNode);
            }
            var insertJunction = function(event?) {
                event.preventDefault();
                event.stopPropagation();
                oldSrcNodes.push($srcNode);
                const forward = $srcNode.attr('simcir-node-type') == 'out';
                
                var {x,y} = tranformEventCoords(endpos);
                
                let joint = {type: new GlobalComponentTypeID(BeastController.BASIC_LIB_ID, "Joint")};
                let $joint = createDevice(joint, getLibraryComponent, false, scope);
                let size = controller($joint).getSize();
    
                var theta = Math.atan2(pos.y - y, pos.x - x);
                theta = (!forward?  0 :180) +  90 *theta*2 / (Math.PI);
                theta = normalizeAngle(90 * Math.round(theta/90));
                
                addDevice($joint);
    
                if (forward) {
                    connect($srcNode, controller($joint).getInputs()[0].$ui);
                    $srcNode = controller($joint).getOutputs()[0].$ui;
                }
                else {
                    connect($srcNode, controller($joint).getOutputs()[0].$ui);
                    $srcNode = controller($joint).getInputs()[0].$ui;
                }
    
                transform($joint, 0, 0, theta);
                const portoffet = offset($srcNode);
                transform($joint, x - portoffet.x, y - portoffet.y, theta);
    
    
                adjustDevice($joint);
                updateConnectors();
                junctions.push($joint);
                pos = offset($srcNode);
                dragMoveHandler(endpos);
                markDirty($srcNode);
    
                controller($joint).$ui.trigger("mouseout"); //Let the Joint fade out
            }
            
            var removeJunction = function(event?)
            {
                if (junctions.length == 0)
                    return;
                event.preventDefault();
                event.stopPropagation();
                
                let dev = junctions.pop();
                $srcNode = oldSrcNodes.pop();
                pos = offset($srcNode);
                removeDevice(dev);
                $temporaryPane.children().remove();
                updateConnectors();
                dragMoveHandler(endpos);
                markDirty($srcNode);
            };
            
            var keyDownHandler = function (event) {
                const key = event.keyCode || event.charCode;
    
                if( key == 8 || key == 46 )
                    removeJunction(event);
                if (event.key == " ")
                    insertJunction(event);
            };
            $(document).on("keydown", keyDownHandler);
            
            dragMoveHandler = function(event) {
                endpos = event;
                var {x,y} = tranformEventCoords(event);
                $temporaryPane.children().remove();
                $temporaryPane.append(createConnector(pos.x, pos.y, x, y) );
            };
            
            dragCompleteHandler = function(event) {
                $(document).off("keydown", keyDownHandler);
                $temporaryPane.children().remove();
                var $dst = $(event.target);
                if (isActiveNode($dst) ) {
                    var $dstNode = $dst.closest('.simcir-node');
                    connect($srcNode, $dstNode);
                    updateConnectors();
                    markDirty($srcNode);
                }
            };
        };
        
        var $selectedDevices = [];
        var showTooltips = false;
        
        var addSelected = function($dev) {
            controller($dev).setSelected(true);
            $selectedDevices.push($dev);
            workspaceController.selectionChanged($selectedDevices.length);
            if (showTooltips)
                controller($dev).showTooltip();
        };
        var deselectAll = function() {
            $devicePane.children('.simcir-device').each(function() {
                controller($(this) ).setSelected(false);
                if (showTooltips)
                    controller($(this) ).removeTooltip();
            });
            $selectedDevices = [];
            workspaceController.selectionChanged(0);
        };
        var setShowParameterTooltips = function(show: boolean)
        {
            showTooltips = show;
            for (let $dev of $selectedDevices) {
                if (show)
                    controller($dev).showTooltip();
                else
                    controller($dev).removeTooltip();
            }
        }
        var removeSelected = function()
        {
            $.each($selectedDevices, function(i, $dev) {
                removeDevice($dev);
            });
            markDirty($workspace);
            $selectedDevices = [];
            workspaceController.selectionChanged(0);
        }
        var editSelectionParameters = function()
        {
            if ($selectedDevices.length != 1)
                console.error("Only one device must be selected for editing Parameters!");
            let deviceController = controller($selectedDevices[0]);
            deviceController.openParameterDialog();
        }
        
        var rotateSelection = function(rotationAngle: number) {
            let rotationCenter = devicesCenterOfGravity(jQuery.makeArray($selectedDevices));
    
            for (let $dev of $selectedDevices) {
                const size = controller($dev).getSize();
                
                const devoffset = offset($dev);
                let {x, y, rotate} = transform($dev);
                const centerOffset = {x: devoffset.x - rotationCenter.x, y: devoffset.y - rotationCenter.y};
    
                let dx = x - centerOffset.x;
                let dy = y - centerOffset.y;
                
                const backrot = rotateCoords(centerOffset, -rotate);
                rotate += rotationAngle;
                const newpos = rotateCoords(backrot, rotate);
                
                transform($dev, newpos.x + dx, newpos.y + dy, normalizeAngle(rotate));
                controller($dev).updatePosition();
            };
            markDirty($workspace);
            updateConnectors();
        }
    
        var selectedData = function()
        {
            return exportPart(jQuery.makeArray($selectedDevices),true);
        }
        
        
        var beginMoveDevice = function(event, $target) {
            var $dev = $target.closest('.simcir-device');
            var pos = transform($dev);
            var deviceMoved: boolean = false;
            if (!controller($dev).isSelected() ) {
                deselectAll();
                addSelected($dev);
                // to front.
                $dev.parent().append($dev.detach() );
            }
    
            const p1 = tranformEventCoords(event);
            var dragPoint = {
                x: p1.x - pos.x,
                y: p1.y - pos.y};
            dragMoveHandler = function(event) {
                // disable events while dragging.
                enableEvents($dev, false);
                var curPos = transform($dev);
                const p2 = tranformEventCoords(event);
                var deltaPos = {
                    x: p2.x - dragPoint.x - curPos.x,
                    y: p2.y - dragPoint.y - curPos.y};
                deviceMoved = deviceMoved || deltaPos.y != 0 || deltaPos.x != 0;
                $.each($selectedDevices, function(i, $dev) {
                    var curPos = transform($dev);
                    transform($dev,
                              curPos.x + deltaPos.x,
                              curPos.y + deltaPos.y,
                              curPos.rotate
                    );
                    controller($dev).updatePosition();
                });
                updateConnectors();
            };
            dragCompleteHandler = function(event) {
                var $target = $(event.target);
                enableEvents($dev, true);
                $.each($selectedDevices, function(i, $dev) {
                    if (!isOutsideWorkspace(getEventPos(event))) {
                        adjustDevice($dev);
                        controller($dev).updatePosition();
                        updateConnectors();
                        if (deviceMoved)
                            markDirty($dev);
                    } else {
                        let $p = $dev.parent();
                        removeDevice($dev);
                        markDirty($p);
                    }
                });
            };
        };
        
        var beginSelectDevice = function(event, $target) {
            var intersect = function(rect1, rect2) {
                return !(
                rect1.x > rect2.x + rect2.width ||
                rect1.y > rect2.y + rect2.height ||
                rect1.x + rect1.width < rect2.x ||
                rect1.y + rect1.height < rect2.y);
            };
            var pointToRect = function(p1, p2) {
                return {
                    x: Math.min(p1.x, p2.x),
                    y: Math.min(p1.y, p2.y),
                    width: Math.abs(p1.x - p2.x),
                    height: Math.abs(p1.y - p2.y)};
            };
            deselectAll();
            var off = $workspace.offset();
            var pos = offset($devicePane);
            var p1 = tranformEventCoords(event);
            dragMoveHandler = function(event) {
                deselectAll();
                var p2 = tranformEventCoords(event);
                var selRect = pointToRect(p1, p2);
                $devicePane.children('.simcir-device').each(function() {
                    var $dev = $(this);
                    var devPos = transform($dev);
                    var devSize = controller($dev).getSize();
                    var devRect = {
                        x: devPos.x + pos.x,
                        y: devPos.y + pos.y,
                        width: devSize.width,
                        height: devSize.height};
                    if (intersect(selRect, devRect) ) {
                        addSelected($dev);
                    }
                });
                $temporaryPane.children().remove();
                $temporaryPane.append(createSVGElement('rect').
                                                              attr(selRect).
                                                              attr('class', 'simcir-selection-rect') );
            };
        };
        
        var beginPan = function(event)
        {
            const pos = transform($containerPane);
            var dragPoint = {
                x: event.pageX - pos.x,
                y: event.pageY - pos.y};
            
            dragMoveHandler = function(event) {
                transform($containerPane, event.pageX - dragPoint.x, event.pageY - dragPoint.y, pos.rotate, pos.zoom);
    
            };
            dragCompleteHandler = function(event) {
                const pos = transform($containerPane);
                const adjustCoord = (k: number) => -Math.floor(pos.x/patternPitch) * patternPitch;
                //transform($workspaceBackground, adjustCoord(pos.x), adjustCoord(pos.y));
                //TODO: Fix and reenable backgound movement
            };
        }
        
        var doPanOnDrag = false;
        
        var mouseDownHandler = function(event) {
            $workspace.parent().focus();
            event.preventDefault();
            event.stopPropagation();
            var $target = $(event.target);
            if (isActiveNode($target) ) {
                beginConnect(event, $target);
            } else if ($target.closest('.simcir-device').length == 1) {
                beginMoveDevice(event, $target);
            } else {
                if (doPanOnDrag)
                    beginPan(event);
                else
                    beginSelectDevice(event, $target);
            }
            $(document).on('mousemove', mouseMoveHandler);
            $(document).on('mouseup', mouseUpHandler);
        };
        var mouseMoveHandler = function(event) {
            if (dragMoveHandler != null) {
                dragMoveHandler(event);
            }
        };
        var mouseUpHandler = function(event) {
            if (dragCompleteHandler != null) {
                dragCompleteHandler(event);
            }
            dragMoveHandler = null;
            dragCompleteHandler = null;
            $devicePane.children('.simcir-device').each(function() {
                enableEvents($(this), true);
            });
            $temporaryPane.children().remove();
            $(document).off('mousemove', mouseMoveHandler);
            $(document).off('mouseup', mouseUpHandler);
        };
        $workspace.on('mousedown', mouseDownHandler);
        
        var setDragMode = function(pan: boolean) {
            doPanOnDrag = pan;
        };
        
        var setShowConnectorState = function(showState: boolean) {
            showConnectorState = showState;
            updateConnectors();
            for (let $dev of $devicePane.find(".simcir-device").toArray()) {
                controller($($dev)).setShowConnectorState(showState);
            }
            for (let $node of $devicePane.find(".simcir-node").toArray()) {
                controller($($node)).setShowConnectorState(showState);
            }
        };
        
        var zoomRelative = function(zoomfactor:number, center?:position)
        {
            center = tranformCoords(center || {x:$workspace.width()/2, y:$workspace.height()/2});
            const pos = transform($containerPane);
    
            const scalechange = (pos.zoom*zoomfactor) - pos.zoom;
            pos.zoom *= zoomfactor;
            pos.x -= (scalechange)*(center.x);
            pos.y -= (scalechange)*(center.y);
            //pos.x += (1-zoomfactor)*(center.x - vieworign.x);
            //pos.y += (1-zoomfactor)*(center.y - vieworign.y);
            
            transform($containerPane, pos.x, pos.y, pos.rotate, pos.zoom);
        };
        $workspace.on('wheel', (event) => {
            event.preventDefault();
            zoomRelative(1+Math.sign((<any>event.originalEvent).deltaY) / 10, getEventPos(event))
        });
    
        var $draggedDevice = null;
        
        var addMouseMoveHandler = function(event)
        {
            if ($draggedDevice !== null) {
                const pos = tranformEventCoords(event);
                transform($draggedDevice,
                          pos.x, pos.y,
                          transform($draggedDevice).rotate);
            }
            
        };
    
    
        /*var instanciateDevice = function(id: GlobalComponentTypeID): JQueryEventObject {
        
        }*/
        
        $container.droppable({
            activate: function(event, ui) {
                const sourceNode = $(ui.helper).data("ftSourceNode");
                let dev = {type: <GlobalComponentTypeID>sourceNode.data};

                $draggedDevice = createDevice(dev, getLibraryComponent, false, scope);
    
                const pos = tranformEventCoords(event);
                transform($draggedDevice, pos.x, pos.y, transform($draggedDevice).rotate);
                
                $temporaryPane.append($draggedDevice);
                $(document).on('mousemove', addMouseMoveHandler);

            },
            deactivate: function(event, ui) {
                if ($draggedDevice !== null)
                    $draggedDevice.remove();
                $draggedDevice = null;
                $(document).off('mousemove', addMouseMoveHandler);
            },
            drop: function(event, ui){
                const pos = tranformEventCoords(event);
                $draggedDevice.detach();
                transform($draggedDevice, pos.x, pos.y, transform($draggedDevice).rotate);
                addDevice($draggedDevice);
                workspaceController.markDirty();
                $draggedDevice = null;
            },
        });
        
        //-------------------------------------------
        //
        
        $.each(buildCircuit(data, getLibraryComponent, false, scope), function(i, $dev) {
            addDevice($dev);
        });
        updateConnectors();
        
        var getPorts = function()
        {
            let inports = [];
            let outports = [];
            
            for (let $dev of $devicePane.find(".simcir-device").toArray()) {
                let dev = controller($($dev));
                if (dev.deviceDef.type == 'Out') {
                    outports.push(dev);
                }
                if (dev.deviceDef.type == 'In') {
                    inports.push(dev);
                }
            }
            
            return {inports: inports, outports: outports};
        };
        
        
        var workspaceController = {
            data: getData,
            ui: $workspace,
            removeSelected: removeSelected,
            editSelectionParameters: editSelectionParameters,
            setShowParameterTooltips: setShowParameterTooltips,
            pasteSubcircuit: pasteSubcircuit,
            selectedData: selectedData,
            setDragMode: setDragMode,
            markDirty: () => (null),
            openCompound: (identifier: any) => (null),
            selectionChanged: (size: number) => (null),
            rotateSelection: rotateSelection,
            setShowConnectorState: setShowConnectorState,
            zoomRelative     : zoomRelative,
            getPorts,
            updateConnectors,
        };
        
        controller($workspace, workspaceController);
        
        return workspaceController;
    };
    
   
    
    return {
        createWorkspace  : createWorkspace,
        createSVGElement : createSVGElement,
        addClass         : addClass,
        removeClass      : removeClass,
        hasClass         : hasClass,
        offset           : offset,
        transform        : transform,
        enableEvents     : enableEvents,
        graphics         : graphics,
        controller       : controller,
        unit             : unit
        
    };
}(jQuery);