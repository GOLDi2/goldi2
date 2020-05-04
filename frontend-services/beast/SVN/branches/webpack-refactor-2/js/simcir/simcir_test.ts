/**
 * Created by dorianmueller on 27.05.2017.
 */
    
    
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


class dialogMngr
{
    dialogs = [];
    
    updateDialogs($dlg, remove)
        {
            let newDialogs = [];
            $.each(this.dialogs, function(i)
            {
                if (this.dialogs[i] != $dlg)
                {
                    newDialogs.push(this.dialogs[i]);
            }
            });
            if (!remove)
            {
                newDialogs.push($dlg);
            }
            // renumber z-index
            $.each(newDialogs, function(i)
            {
                newDialogs[i].css('z-index', '' + (i + 1));
            });
            this.dialogs = newDialogs;
        };
    
    add($dlg)
        {
            this.updateDialogs($dlg, false);
        };
    
    remove($dlg)
        {
            this.updateDialogs($dlg, true);
        };
    
    toFront($dlg)
        {
            this.updateDialogs($dlg, false);
        };
    
    showDialog(title, $content)
        {
            let $closeButton = function()
            {
                let r    = 16;
                let pad  = 4;
                let $btn = this.createSVG(r, r)
                               .attr('class', 'simcir-dialog-close-button');
                let g    = this.graphics($btn);
                g.drawRect(0, 0, r, r);
                g.attr['class'] = 'simcir-dialog-close-button-symbol';
                g.moveTo(pad, pad);
                g.lineTo(r - pad, r - pad);
                g.closePath();
                g.moveTo(r - pad, pad);
                g.lineTo(pad, r - pad);
                g.closePath();
                return $btn;
            }();
            let $title       = $('<div></div>')
                .addClass('simcir-dialog-title')
                .text(title)
                .css('cursor', 'default')
                .on('mousedown', function(event)
                {
                    event.preventDefault();
                });
            let $dlg         = $('<div></div>')
                .addClass('simcir-dialog')
                .css({position : 'absolute'})
                .append($title.css('float', 'left'))
                .append($closeButton.css('float', 'right'))
                .append($('<br/>')
                            .css('clear', 'both'))
                .append($content);
            $('BODY')
                .append($dlg);
            this.add($dlg);
            let dragPoint            = null;
            let dlg_mouseDownHandler = function(event)
            {
                if (!$(event.target)
                        .hasClass('simcir-dialog') &&
                    !$(event.target)
                        .hasClass('simcir-dialog-title'))
                {
                    return;
                }
                event.preventDefault();
                this.toFront($dlg);
                let off   = $dlg.offset();
                dragPoint = {
                    x : event.pageX - off.left,
                    y : event.pageY - off.top
                };
                $(document)
                    .on('mousemove', dlg_mouseMoveHandler);
                $(document)
                    .on('mouseup', dlg_mouseUpHandler);
            };
            let dlg_mouseMoveHandler = function(event)
            {
                moveTo(
                    event.pageX - dragPoint.x,
                    event.pageY - dragPoint.y);
            };
            let dlg_mouseUpHandler   = function(event)
            {
                $(document)
                    .off('mousemove', dlg_mouseMoveHandler);
                $(document)
                    .off('mouseup', dlg_mouseUpHandler);
            };
            $dlg.on('mousedown', dlg_mouseDownHandler);
            $closeButton.on('mousedown', function()
            {
                $dlg.remove();
                this.remove($dlg);
            });
            let w      = $dlg.width();
            let h      = $dlg.height();
            let cw     = $(window)
                .width();
            let ch     = $(window)
                .height();
            let x      = (cw - w) / 2 + $(document)
                    .scrollLeft();
            let y      = (ch - h) / 2 + $(document)
                    .scrollTop();
            let moveTo = function(x, y)
            {
                $dlg.css({left : x + 'px', top : y + 'px'});
            };
            moveTo(x, y);
            return $dlg;
        };
}

class simCir
{
    createSVGElement = SVGGraphics.createSVGElement;
    createSVG        = SVGGraphics.createSVG;
    
    constructor()
        {
            $(() => {
                $('.simcir')
                    .each(() =>
                          {
                              let $placeHolder = $(this);
                              let text         = $placeHolder.text()
                                                             .replace(/^\s+|\s+$/g, '');
                              this.setupSimcir($placeHolder, JSON.parse(text || '{}'));
                          });
            });
        }
    graphics($target)
        {
            return new SVGGraphics.SVGGraphics($target);
        }
    
    transform = SVGGraphics.transform;
    
    eachClass($o, f)
        {
            let className = $o.attr('class');
            if (className)
            {
                $.each(className.split(/\s+/g), f);
            }
        };
    
    addClass($o, className, remove)
        {
            let newClass = '';
            this.eachClass($o, function(i, c)
            {
                if (!(remove && c == className))
                {
                    newClass += '\u0020';
                    newClass += c;
                }
            });
            if (!remove)
            {
                newClass += '\u0020';
                newClass += className;
            }
            $o.attr('class', newClass);
            return $o;
        };
    
    removeClass($o, className)
        {
            return this.addClass($o, className, true);
        };
    
    hasClass($o, className)
        {
            let found = false;
            this.eachClass($o, function(i, c)
            {
                if (c == className)
                {
                    found = true;
                }
            });
            return found;
        };
    
    
    offset($o)
        {
            let x = 0;
            let y = 0;
            while ($o[0].nodeName != 'svg')
            {
                let pos = this.transform($o);
                x += pos.x;
                y += pos.y;
                $o      = $o.parent();
            }
            return {x : x, y : y};
        };
    
    enableEvents($o, enable)
        {
            $o.css('pointer-events', enable ? 'visiblePainted' : 'none');
        };
    
    disableSelection($o)
        {
            $o.each(function()
                    {
                        this.onselectstart = function()
                        {
                            return false;
                        };
                    })
              .css('-webkit-user-select', 'none');
        };
    
    
    eventQueue = new EventQueue();
    
    unit     = 16;
    fontSize = 12;
    
    createLabel(text)
        {
            return this.createSVGElement('text')
                       .text(text)
                       .css('font-size', this.fontSize + 'px');
        };
    
    createNode(type, label, description, headless)
        {
            let $node = this.createSVGElement('g')
                            .attr('simcir-node-type', type);
            if (!headless)
            {
                $node.attr('class', 'simcir-node');
            }
            let node = this.createNodeController({
                                                $ui         : $node, type : type, label : label,
                                                description : description, headless : headless
                                            });
            if (type == 'in')
            {
                this.controller($node, this.createInputNodeController(node));
            }
            else if (type == 'out')
            {
                this.controller($node, this.createOutputNodeController(node));
            }
            else
            {
                throw 'unknown type:' + type;
            }
            return $node;
        };
    
    isActiveNode($o)
        {
            return $o.closest('.simcir-node').length == 1 &&
                   $o.closest('.simcir-toolbox').length == 0;
        };
    
    public controller = function()
    {
        const id = 'controller';
        return function($ui, controller)
        {
            if (arguments.length == 1)
            {
                return $.data($ui[0], id);
            }
            else if (arguments.length == 2)
            {
                $.data($ui[0], id, controller);
            }
        };
    }();

    createNodeController(node)
        {
            let _value   = null;
            let setValue = function(value, force)
            {
                if (_value === value && !force)
                {
                    return;
                }
                _value = value;
                this.eventQueue.postEvent({target : node.$ui, type : 'nodeValueChange'});
            };
            let getValue = function()
            {
                return _value;
            };
            
            if (!node.headless)
            {
                
                node.$ui.attr('class', 'simcir-node simcir-node-type-' + node.type);
    
                let $circle = this.createSVGElement('circle')
                                  .attr({cx : 0, cy : 0, r : 4});
                node.$ui.on('mouseover', function(event)
                {
                    if (this.isActiveNode(node.$ui))
                    {
                        this.addClass(node.$ui, 'simcir-node-hover');
                    }
                });
                node.$ui.on('mouseout', function(event)
                {
                    if (this.isActiveNode(node.$ui))
                    {
                        this.removeClass(node.$ui, 'simcir-node-hover');
                    }
                });
                node.$ui.append($circle);
                let appendLabel = function(text, align)
                {
                    let $label = this.createLabel(text)
                                     .attr('class', 'simcir-node-label');
                    this.enableEvents($label, false);
                    if (align == 'right')
                    {
                        $label.attr('text-anchor', 'start')
                              .attr('x', 6)
                              .attr('y', this.fontSize / 2);
                    }
                    else if (align == 'left')
                    {
                        $label.attr('text-anchor', 'end')
                              .attr('x', -6)
                              .attr('y', this.fontSize / 2);
                    }
                    node.$ui.append($label);
                };
                if (node.label)
                {
                    if (node.type == 'in')
                    {
                        appendLabel(node.label, 'right');
                    }
                    else if (node.type == 'out')
                    {
                        appendLabel(node.label, 'left');
                    }
                }
                if (node.description)
                {
                    if (node.type == 'in')
                    {
                        appendLabel(node.description, 'left');
                    }
                    else if (node.type == 'out')
                    {
                        appendLabel(node.description, 'right');
                    }
                }
                node.$ui.on('nodeValueChange', function(event)
                {
                    if (_value != null)
                    {
                        this.addClass(node.$ui, 'simcir-node-hot');
                    }
                    else
                    {
                        this.removeClass(node.$ui, 'simcir-node-hot');
                    }
                });
            }
            
            return $.extend(node, {
                setValue : setValue,
                getValue : getValue
            });
        };
    
    createInputNodeController(node)
        {
            let output    = null;
            let setOutput = function(outNode)
            {
                output = outNode;
            };
            let getOutput = function()
            {
                return output;
            };
            return $.extend(node, {
                setOutput : setOutput,
                getOutput : getOutput
            });
        };
    
    createOutputNodeController(node)
        {
            let inputs         = [];
            let super_setValue = node.setValue;
            let setValue       = function(value)
            {
                super_setValue(value);
                for (let i = 0; i < inputs.length; i += 1)
                {
                    inputs[i].setValue(value);
                }
            };
            let connectTo      = function(inNode)
            {
                if (inNode.getOutput() != null)
                {
                    inNode.getOutput()
                          .disconnectFrom(inNode);
                }
                inNode.setOutput(node);
                inputs.push(inNode);
                inNode.setValue(node.getValue(), true);
            };
            
            let disconnectFrom = function(inNode)
            {
                if (inNode.getOutput() != node)
                {
                    throw 'not connected.';
                }
                inNode.setOutput(null);
                inNode.setValue(null, true);
                inputs = $.grep(inputs, function(v)
                {
                    return v != inNode;
                });
            };
            let getInputs      = function()
            {
                return inputs;
            };
            return $.extend(node, {
                setValue       : setValue,
                getInputs      : getInputs,
                connectTo      : connectTo,
                disconnectFrom : disconnectFrom
            });
        };
    
    createDevice(deviceDef, headless, scope)
        {
            headless = headless || false;
            scope    = scope || null;
            let $dev = this.createSVGElement('g');
            if (!headless)
            {
                $dev.attr('class', 'simcir-device');
            }
            this.controller($dev, this.createDeviceController(
                {
                    $ui                                     : $dev, deviceDef                   : deviceDef,
                    headless : headless, scope : scope, doc : null
                }));
    
            let factory = this.factories[deviceDef.type];
            if (factory)
            {
                factory(this.controller($dev, null));
            }
            if (!headless)
            {
                this.controller($dev, null)
                    .createUI();
            }
            return $dev;
        };
    
    createDeviceController(device)
        {
            let inputs        = [];
            let outputs       = [];
            let addInput      = function(label, description)
            {
                let $node = this.createNode('in', label, description, device.headless);
                $node.on('nodeValueChange', function(event)
                {
                    device.$ui.trigger('inputValueChange');
                });
                if (!device.headless)
                {
                    device.$ui.append($node);
                }
                let node = this.controller($node);
                inputs.push(node);
                return node;
            };
            let addOutput     = function(label, description)
            {
                let $node = this.createNode('out', label, description, device.headless);
                if (!device.headless)
                {
                    device.$ui.append($node);
                }
                let node = this.controller($node);
                outputs.push(node);
                return node;
            };
            let getInputs     = function()
            {
                return inputs;
            };
            let getOutputs    = function()
            {
                return outputs;
            };
            let disconnectAll = function()
            {
                $.each(getInputs(), function(i, inNode)
                {
                    let outNode = inNode.getOutput();
                    if (outNode != null)
                    {
                        outNode.disconnectFrom(inNode);
                    }
                });
                $.each(getOutputs(), function(i, outNode)
                {
                    $.each(outNode.getInputs(), function(i, inNode)
                    {
                        outNode.disconnectFrom(inNode);
                    });
                });
            };
            
            let selected    = false;
            let setSelected = function(value)
            {
                selected = value;
                device.$ui.trigger('deviceSelect');
            };
            let isSelected  = function()
            {
                return selected;
            };
            
            let label        = device.deviceDef.label;
            let defaultLabel = device.deviceDef.type;
            if (typeof label == 'undefined')
            {
                label = defaultLabel;
            }
            let setLabel = function(value)
            {
                value = value.replace(/^\s+|\s+$/g, '');
                label = value || defaultLabel;
                device.$ui.trigger('deviceLabelChange');
            };
            let getLabel = function()
            {
                return label;
            };
            
            let getSize = function()
            {
                let nodes = Math.max(device.getInputs().length,
                                     device.getOutputs().length);
                return {
                    width  : this.unit * 2,
                    height : this.unit * Math.max(2, device.halfPitch ?
                                                (nodes + 1) / 2 : nodes)
                };
            };
            
            let layoutUI = function()
            {
                
                let size = device.getSize();
                let w    = size.width;
                let h    = size.height;
                
                device.$ui.children('.simcir-device-body')
                      .attr({x : 0, y : 0, width : w, height : h});
    
                let pitch       = device.halfPitch ? this.unit / 2 : this.unit;
                let layoutNodes = function(nodes, x)
                {
                    let offset = (h - pitch * (nodes.length - 1) ) / 2;
                    $.each(nodes, function(i, node)
                    {
                        this.transform(node.$ui, x, pitch * i + offset);
                    });
                };
                layoutNodes(getInputs(), 0);
                layoutNodes(getOutputs(), w);
                
                device.$ui.children('.simcir-device-label')
                      .attr({x : w / 2, y : h + this.fontSize});
            };
            
            let createUI = function()
            {
                
                device.$ui.attr('class', 'simcir-device');
                device.$ui.on('deviceSelect', function()
                {
                    if (selected)
                    {
                        this.addClass($(this), 'simcir-device-selected');
                    }
                    else
                    {
                        this.removeClass($(this), 'simcir-device-selected');
                    }
                });
    
                let $body = this.createSVGElement('rect')
                                .attr('class', 'simcir-device-body')
                                .attr('rx', 2)
                                .attr('ry', 2);
                device.$ui.prepend($body);
    
                let $label = this.createLabel(label)
                                 .attr('class', 'simcir-device-label')
                                 .attr('text-anchor', 'middle');
                device.$ui.on('deviceLabelChange', function()
                {
                    $label.text(getLabel());
                });
                
                let label_dblClickHandler = function(event)
                {
                    // open library,
                    event.preventDefault();
                    event.stopPropagation();
                    let title        = 'Enter device name ';
                    let $labelEditor = $('<input type="text"/>')
                        .addClass('simcir-label-editor')
                        .val($label.text())
                        .on('keydown', function(event)
                        {
                            if (event.keyCode == 13)
                            {
                                // ENTER
                                setLabel($(this)
                                             .val());
                                $dlg.remove();
                            }
                            else if (event.keyCode == 27)
                            {
                                // ESC
                                $dlg.remove();
                            }
                        });
                    let $placeHolder = $('<div></div>')
                        .append($labelEditor);
                    let $dlg         = this.showDialog(title, $placeHolder);
                    $labelEditor.focus();
                };
                device.$ui.on('deviceAdd', function()
                {
                    $label.on('dblclick', label_dblClickHandler);
                });
                device.$ui.on('deviceRemove', function()
                {
                    $label.off('dblclick', label_dblClickHandler);
                });
                device.$ui.append($label);
                
                layoutUI();
                
            };
            
            let getState = function()
            {
                return null;
            };
            
            return $.extend(device, {
                addInput      : addInput,
                addOutput     : addOutput,
                getInputs     : getInputs,
                getOutputs    : getOutputs,
                disconnectAll : disconnectAll,
                setSelected   : setSelected,
                isSelected    : isSelected,
                getLabel      : getLabel,
                halfPitch     : false,
                getSize       : getSize,
                createUI      : createUI,
                layoutUI      : layoutUI,
                getState      : getState
            });
        };
    
    createConnector(x1, y1, x2, y2)
        {
            return this.createSVGElement('path')
                       .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
                       .attr('class', 'simcir-connector');
        };
    
    connect($node1, $node2)
        {
            let type1 = $node1.attr('simcir-node-type');
            let type2 = $node2.attr('simcir-node-type');
            if (type1 == 'in' && type2 == 'out')
            {
                this.controller($node2, null)
                    .connectTo(this.controller($node1, null));
            }
            else if (type1 == 'out' && type2 == 'in')
            {
                this.controller($node1, null)
                    .connectTo(this.controller($node2, null));
            }
        };
    
    buildCircuit(data, headless, scope)
        {
            let $devices = [];
            let $devMap  = {};
            let getNode  = function(path)
            {
                if (!path.match(/^(\w+)\.(in|out)([0-9]+)$/g))
                {
                    throw 'unknown path:' + path;
                }
                let devId = RegExp.$1;
                let type  = RegExp.$2;
                let index = +RegExp.$3;
                return (type == 'in') ?
                       this.controller($devMap[devId])
                           .getInputs()[index] :
                       this.controller($devMap[devId])
                           .getOutputs()[index];
            };
            $.each(data.devices, function(i, deviceDef)
            {
                let $dev = this.createDevice(deviceDef, headless, scope);
                this.transform($dev, deviceDef.x, deviceDef.y);
                $devices.push($dev);
                $devMap[deviceDef.id] = $dev;
            });
            $.each(data.connectors, function(i, conn)
            {
                let nodeFrom = getNode(conn.from);
                let nodeTo   = getNode(conn.to);
                if (nodeFrom && nodeTo)
                {
                    this.connect(nodeFrom.$ui, nodeTo.$ui);
                }
            });
            return $devices;
        };
    
    
    createDeviceRefFactory(data)
        {
            return function(device)
            {
                let $devs  = this.buildCircuit(data, true, {});
                let $ports = [];
                $.each($devs, function(i, $dev)
                {
                    let deviceDef = this.controller($dev).deviceDef;
                    if (deviceDef.type == 'In' || deviceDef.type == 'Out')
                    {
                        $ports.push($dev);
                    }
                });
                $ports.sort(function($p1, $p2)
                            {
                                let x1 = this.controller($p1).deviceDef.x;
                                let y1 = this.controller($p1).deviceDef.y;
                                let x2 = this.controller($p2).deviceDef.x;
                                let y2 = this.controller($p2).deviceDef.y;
                                if (x1 == x2)
                                {
                                    return (y1 < y2) ? -1 : 1;
                                }
                                return (x1 < x2) ? -1 : 1;
                            });
                let getDesc = function(port)
                {
                    return port ? port.description : '';
                };
                $.each($ports, function(i, $port)
                {
                    let port    = this.controller($port);
                    let portDef = port.deviceDef;
                    let inPort;
                    let outPort;
                    if (portDef.type == 'In')
                    {
                        outPort    = port.getOutputs()[0];
                        inPort     = device.addInput(portDef.label,
                                                     getDesc(outPort.getInputs()[0]));
                        // force disconnect test devices that connected to In-port
                        let inNode = port.getInputs()[0];
                        if (inNode.getOutput() != null)
                        {
                            inNode.getOutput()
                                  .disconnectFrom(inNode);
                        }
                    }
                    else if (portDef.type == 'Out')
                    {
                        inPort      = port.getInputs()[0];
                        outPort     = device.addOutput(portDef.label,
                                                       getDesc(inPort.getOutput()));
                        // force disconnect test devices that connected to Out-port
                        let outNode = port.getOutputs()[0];
                        $.each(outNode.getInputs(), function(i, inNode)
                        {
                            if (inNode.getOutput() != null)
                            {
                                inNode.getOutput()
                                      .disconnectFrom(inNode);
                            }
                        });
                    }
                    inPort.$ui.on('nodeValueChange', function()
                    {
                        outPort.setValue(inPort.getValue());
                    });
                });
                let super_getSize = device.getSize;
                device.getSize    = function()
                {
                    let size = super_getSize();
                    return {width : this.unit * 4, height : size.height};
                };
                device.$ui.on('dblclick', function(event)
                {
                    // open library,
                    event.preventDefault();
                    event.stopPropagation();
                    this.showDialog(device.deviceDef.label || device.deviceDef.type,
                                    this.setupSimcir($('<div></div>'), data));
                });
            };
        };
    
    factories      = {};
    defaultToolbox = [];
    
    registerDevice(type, factory, deprecated)
        {
            
            if (typeof factory == 'object')
            {
                factory = this.createDeviceRefFactory(factory);
            }
            this.factories[type] = factory;
            if (!deprecated)
            {
                this.defaultToolbox.push({type : type});
            }
            
        };
    
    createScrollbar()
        {
            
            // vertical only.
            let _value   = 0;
            let _min     = 0;
            let _max     = 0;
            let _barSize = 0;
            let _width   = 0;
            let _height  = 0;
    
            let $body      = this.createSVGElement('rect');
            let $bar       = this.createSVGElement('g')
                                 .append(this.createSVGElement('rect'))
                .attr('class', 'simcir-scrollbar-bar');
            let $scrollbar = this.createSVGElement('g')
                                 .attr('class', 'simcir-scrollbar')
                                 .append($body)
                                 .append($bar)
                                 .on('unitup', function(event)
                {
                    setValue(_value - this.unit * 2);
                })
                                 .on('unitdown', function(event)
                {
                    setValue(_value + this.unit * 2);
                })
                                 .on('rollup', function(event)
                {
                    setValue(_value - _barSize);
                })
                                 .on('rolldown', function(event)
                {
                    setValue(_value + _barSize);
                });
            
            let dragPoint            = null;
            let bar_mouseDownHandler = function(event)
            {
                event.preventDefault();
                event.stopPropagation();
                let pos   = this.transform($bar);
                dragPoint = {
                    x : event.pageX - pos.x,
                    y : event.pageY - pos.y
                };
                $(document)
                    .on('mousemove', bar_mouseMoveHandler);
                $(document)
                    .on('mouseup', bar_mouseUpHandler);
            };
            let bar_mouseMoveHandler = function(event)
            {
                calc(function(unitSize)
                     {
                         setValue((event.pageY - dragPoint.y) / unitSize);
                     });
            };
            let bar_mouseUpHandler   = function(event)
            {
                $(document)
                    .off('mousemove', bar_mouseMoveHandler);
                $(document)
                    .off('mouseup', bar_mouseUpHandler);
            };
            $bar.on('mousedown', bar_mouseDownHandler);
            let body_mouseDownHandler = function(event)
            {
                event.preventDefault();
                event.stopPropagation();
                let off    = $scrollbar.parents('svg')
                                       .offset();
                let pos    = this.transform($scrollbar);
                let y      = event.pageY - off.top - pos.y;
                let barPos = this.transform($bar);
                if (y < barPos.y)
                {
                    $scrollbar.trigger('rollup');
                }
                else
                {
                    $scrollbar.trigger('rolldown');
                }
            };
            $body.on('mousedown', body_mouseDownHandler);
            
            let setSize   = function(width, height)
            {
                _width  = width;
                _height = height;
                layout();
            };
            let layout    = function()
            {
                
                $body.attr({x : 0, y : 0, width : _width, height : _height});
                
                let visible = _max - _min > _barSize;
                $bar.css('display', visible ? 'inline' : 'none');
                if (!visible)
                {
                    return;
                }
                calc(function(unitSize)
                     {
                         $bar.children('rect')
                             .attr({x : 0, y : 0, width : _width, height : _barSize * unitSize});
                         this.transform($bar, 0, _value * unitSize);
                     });
            };
            let calc      = function(f)
            {
                f(_height / (_max - _min));
            };
            let setValue  = function(value)
            {
                setValues(value, _min, _max, _barSize);
            };
            let setValues = function(value, min, max, barSize)
            {
                value       = Math.max(min, Math.min(value, max - barSize));
                let changed = (value != _value);
                _value      = value;
                _min        = min;
                _max        = max;
                _barSize    = barSize;
                layout();
                if (changed)
                {
                    $scrollbar.trigger('scrollValueChange');
                }
            };
            let getValue  = function()
            {
                return _value;
            };
            this.controller($scrollbar, {
                setSize   : setSize,
                setValues : setValues,
                getValue  : getValue
            });
            return $scrollbar;
        };
    
    
    getUniqueId()
        {
            let uniqueIdCount = 0;
            return function()
            {
                return 'simcir-id' + uniqueIdCount++;
            };
        };
    
    createWorkspace(data)
        {
            
            data = $.extend({
                                width       : 400,
                                height      : 200,
                                showToolbox : true,
                                toolbox     : this.defaultToolbox,
                                devices     : [],
                                connectors  : []
                            }, data);
            
            let scope = {};
            
            let workspaceWidth  = data.width;
            let workspaceHeight = data.height;
            let barWidth        = this.unit;
            let toolboxWidth    = data.showToolbox ? this.unit * 6 + barWidth : 0;
    
            let $workspace = this.createSVG(
                workspaceWidth, workspaceHeight)
                                 .attr('class', 'simcir-workspace');
            this.disableSelection($workspace);
    
            let $defs = this.createSVGElement('defs');
            $workspace.append($defs);
            
            !function()
            {
                
                // fill with pin hole pattern.
                let patId = this.getUniqueId();
                let pitch = this.unit / 2;
                let w     = workspaceWidth - toolboxWidth;
                let h     = workspaceHeight;
    
                $defs.append(this.createSVGElement('pattern')
                                 .attr({
                                           id                        : patId, x             : 0, y      : 0,
                                           width : pitch / w, height : pitch / h
                                       })
                                 .append(
                                     this.createSVGElement('rect')
                                         .attr('class', 'simcir-pin-hole')
                                         .attr({x : 0, y : 0, width : 1, height : 1})));
    
                $workspace.append(this.createSVGElement('rect')
                                      .attr({
                                                x      : toolboxWidth,
                                                y      : 0,
                                                width  : w,
                                                height : h
                                            })
                                      .css({fill : 'url(#' + patId + ')'}));
            }();
    
            let $toolboxDevicePane = this.createSVGElement('g');
            let $scrollbar         = this.createScrollbar();
            $scrollbar.on('scrollValueChange', function(event)
            {
                this.transform($toolboxDevicePane, 0,
                               -this.controller($scrollbar)
                                    .getValue());
            });
            this.controller($scrollbar, null)
                .setSize(barWidth, workspaceHeight);
            this.transform($scrollbar, toolboxWidth - barWidth, 0);
            let $toolboxPane = this.createSVGElement('g')
                                   .attr('class', 'simcir-toolbox')
                                   .append(this.createSVGElement('rect')
                                               .attr({
                                      x : 0, y : 0,
                                      width    : toolboxWidth,
                                      height   : workspaceHeight
                                  }))
                                   .append($toolboxDevicePane)
                                   .append($scrollbar)
                                   .on('wheel', function(event)
                {
                    event.preventDefault();
                    if (this.event.originalEvent.deltaY < 0)
                    {
                        $scrollbar.trigger('unitup');
                    }
                    else if (this.event.originalEvent.deltaY > 0)
                    {
                        $scrollbar.trigger('unitdown');
                    }
                });
    
            let $devicePane = this.createSVGElement('g');
            this.transform($devicePane, toolboxWidth, 0);
            let $connectorPane = this.createSVGElement('g');
            let $temporaryPane = this.createSVGElement('g');
    
            this.enableEvents($connectorPane, false);
            this.enableEvents($temporaryPane, false);
            
            if (data.showToolbox)
            {
                $workspace.append($toolboxPane);
            }
            $workspace.append($devicePane);
            $workspace.append($connectorPane);
            $workspace.append($temporaryPane);
            
            let addDevice = function($dev)
            {
                $devicePane.append($dev);
                $dev.trigger('deviceAdd');
            };
            
            let removeDevice = function($dev)
            {
                $dev.trigger('deviceRemove');
                // before remove, disconnect all
                this.controller($dev)
                    .disconnectAll();
                $dev.remove();
                updateConnectors();
            };
            
            let disconnect = function($inNode)
            {
                let inNode = this.controller($inNode);
                if (inNode.getOutput() != null)
                {
                    inNode.getOutput()
                          .disconnectFrom(inNode);
                }
                updateConnectors();
            };
            
            let updateConnectors = function()
            {
                $connectorPane.children()
                              .remove();
                $devicePane.children('.simcir-device')
                           .each(function()
                                 {
                                     let device = this.controller($(this));
                                     $.each(device.getInputs(), function(i, inNode)
                                     {
                                         if (inNode.getOutput() != null)
                                         {
                                             let p1 = this.offset(inNode.$ui);
                                             let p2 = this.offset(inNode.getOutput().$ui);
                                             $connectorPane.append(
                                                 this.createConnector(p1.x, p1.y, p2.x, p2.y));
                                         }
                                     });
                                 });
            };
            
            let loadToolbox = function(data)
            {
                let vgap = 8;
                let y    = vgap;
                $.each(data.toolbox, function(i, deviceDef)
                {
                    let $dev = this.createDevice(deviceDef);
                    $toolboxDevicePane.append($dev);
                    let size = this.controller($dev)
                                   .getSize();
                    this.transform($dev, (toolboxWidth - barWidth - size.width) / 2, y);
                    y += (size.height + this.fontSize + vgap);
                });
                this.controller($scrollbar)
                    .setValues(0, 0, y, workspaceHeight);
            };
            
            let getData = function()
            {
                
                // renumber all id
                let devIdCount = 0;
                $devicePane.children('.simcir-device')
                           .each(function()
                                 {
                                     let $dev   = $(this);
                                     let device = this.controller($dev);
                                     let devId  = 'dev' + devIdCount++;
                                     device.id  = devId;
                                     $.each(device.getInputs(), function(i, node)
                                     {
                                         node.id = devId + '.in' + i;
                                     });
                                     $.each(device.getOutputs(), function(i, node)
                                     {
                                         node.id = devId + '.out' + i;
                                     });
                                 });
                
                
                let toolbox    = [];
                let devices    = [];
                let connectors = [];
                let clone      = function(obj)
                {
                    return JSON.parse(JSON.stringify(obj));
                };
                $toolboxDevicePane.children('.simcir-device')
                                  .each(function()
                                        {
                                            let $dev   = $(this);
                                            let device = this.controller($dev);
                                            toolbox.push(device.deviceDef);
                                        });
                $devicePane.children('.simcir-device')
                           .each(function()
                                 {
                                     let $dev   = $(this);
                                     let device = this.controller($dev);
                                     $.each(device.getInputs(), function(i, inNode)
                                     {
                                         if (inNode.getOutput() != null)
                                         {
                                             connectors.push({from : inNode.id, to : inNode.getOutput().id});
                                         }
                                     });
                                     let pos         = this.transform($dev);
                                     let deviceDef   = clone(device.deviceDef);
                                     deviceDef.id    = device.id;
                                     deviceDef.x     = pos.x;
                                     deviceDef.y     = pos.y;
                                     deviceDef.label = device.getLabel();
                                     let state       = device.getState();
                                     if (state != null)
                                     {
                                         deviceDef.state = state;
                                     }
                                     devices.push(deviceDef);
                                 });
                return {
                    width       : data.width,
                    height      : data.height,
                    showToolbox : data.showToolbox,
                    toolbox     : toolbox,
                    devices     : devices,
                    connectors  : connectors
                };
            };
            let getText = function()
            {
                
                let data = getData();
                
                let buf        = '';
                let print      = function(s)
                {
                    buf += s;
                };
                let println    = function(s)
                {
                    print(s);
                    buf += '\r\n';
                };
                let printArray = function(array)
                {
                    $.each(array, function(i, item)
                    {
                        println('    ' + JSON.stringify(item) +
                                (i + 1 < array.length ? ',' : ''));
                    });
                };
                println('{');
                println('  "width":' + data.width + ',');
                println('  "height":' + data.height + ',');
                println('  "showToolbox":' + data.showToolbox + ',');
                println('  "toolbox":[');
                printArray(data.toolbox);
                println('  ],');
                println('  "devices":[');
                printArray(data.devices);
                println('  ],');
                println('  "connectors":[');
                printArray(data.connectors);
                println('  ]');
                print('}');
                return buf;
            };
            
            //-------------------------------------------
            // mouse operations
            
            let dragMoveHandler     = null;
            let dragCompleteHandler = null;
            
            let adjustDevice = function($dev)
            {
                let pitch  = this.unit / 2;
                let adjust = function(v)
                {
                    return Math.round(v / pitch) * pitch;
                };
                let pos    = this.transform($dev);
                let size   = this.controller($dev)
                                 .getSize();
                let x      = Math.max(0, Math.min(pos.x,
                                                  workspaceWidth - toolboxWidth - size.width));
                let y      = Math.max(0, Math.min(pos.y,
                                                  workspaceHeight - size.height));
                this.transform($dev, adjust(x), adjust(y));
            };
            
            let beginConnect = function(event, $target)
            {
                let $srcNode = $target.closest('.simcir-node');
                let off      = $workspace.offset();
                let pos      = this.offset($srcNode);
                let endpos;
                if ($srcNode.attr('simcir-node-type') == 'in')
                {
                    disconnect($srcNode);
                }
                let insertJunction  = function(event)
                {
                    let x = endpos.pageX - off.left;
                    let y = endpos.pageY - off.top;
                    
                    let junction = {type : 'Joint'};
                    let dev      = this.createDevice(junction, false, scope);
                    let size     = this.controller(dev)
                                       .getSize();
                    this.transform(dev, x - toolboxWidth, y - size.height / 2);
                    adjustDevice(dev);
                    addDevice(dev);
                    if ($srcNode.attr('simcir-node-type') == 'out')
                    {
                        this.connect($srcNode, this.controller(dev)
                                                   .getInputs()[0].$ui);
                        $srcNode = this.controller(dev)
                                       .getOutputs()[0].$ui;
                    }
                    else
                    {
                        this.connect($srcNode, this.controller(dev)
                                                   .getOutputs()[0].$ui);
                        $srcNode = this.controller(dev)
                                       .getInputs()[0].$ui;
                    }
                    updateConnectors();
    
                    pos = this.offset($srcNode);
                    dragMoveHandler(endpos);
                    
                };
                let keyPressHandler = function(event)
                {
                    if (event.key == ' ')
                    {
                        insertJunction(event);
                    }
                };
                $(document)
                    .on('keypress', keyPressHandler);
                
                dragMoveHandler = function(event)
                {
                    endpos = event;
                    let x  = event.pageX - off.left;
                    let y  = event.pageY - off.top;
                    $temporaryPane.children()
                                  .remove();
                    $temporaryPane.append(this.createConnector(pos.x, pos.y, x, y));
                };
                
                dragCompleteHandler = function(event)
                {
                    $(document)
                        .off('keypress', keyPressHandler);
                    $temporaryPane.children()
                                  .remove();
                    let $dst = $(event.target);
                    if (this.isActiveNode($dst))
                    {
                        let $dstNode = $dst.closest('.simcir-node');
                        this.connect($srcNode, $dstNode);
                        updateConnectors();
                    }
                };
            };
            
            let beginNewDevice = function(event, $target)
            {
                let $dev = $target.closest('.simcir-device');
                let pos  = this.offset($dev);
                $dev     = this.createDevice(this.controller($dev).deviceDef, false, scope);
                this.transform($dev, pos.x, pos.y);
                $temporaryPane.append($dev);
                let dragPoint       = {
                    x : event.pageX - pos.x,
                    y : event.pageY - pos.y
                };
                dragMoveHandler     = function(event)
                {
                    this.transform($dev,
                              event.pageX - dragPoint.x,
                              event.pageY - dragPoint.y);
                };
                dragCompleteHandler = function(event)
                {
                    let $target = $(event.target);
                    if ($target.closest('.simcir-toolbox').length == 0)
                    {
                        $dev.detach();
                        let pos = this.transform($dev);
                        this.transform($dev, pos.x - toolboxWidth, pos.y);
                        adjustDevice($dev);
                        addDevice($dev);
                    }
                    else
                    {
                        $dev.remove();
                    }
                };
            };
            
            let $selectedDevices = [];
            let addSelected      = function($dev)
            {
                this.controller($dev)
                    .setSelected(true);
                $selectedDevices.push($dev);
            };
            
            let deselectAll = function()
            {
                $devicePane.children('.simcir-device')
                           .each(function()
                                 {
                                     this.controller($(this))
                                         .setSelected(false);
                                 });
                $selectedDevices = [];
            };
            
            let beginMoveDevice = function(event, $target)
            {
                let $dev = $target.closest('.simcir-device');
                let pos  = this.transform($dev);
                if (!this.controller($dev)
                         .isSelected())
                {
                    deselectAll();
                    addSelected($dev);
                    // to front.
                    $dev.parent()
                        .append($dev.detach());
                }
                
                let dragPoint       = {
                    x : event.pageX - pos.x,
                    y : event.pageY - pos.y
                };
                dragMoveHandler     = function(event)
                {
                    // disable events while dragging.
                    this.enableEvents($dev, false);
                    let curPos   = this.transform($dev);
                    let deltaPos = {
                        x : event.pageX - dragPoint.x - curPos.x,
                        y : event.pageY - dragPoint.y - curPos.y
                    };
                    $.each($selectedDevices, function(i, $dev)
                    {
                        let curPos = this.transform($dev);
                        this.transform($dev,
                                  curPos.x + deltaPos.x,
                                  curPos.y + deltaPos.y);
                    });
                    updateConnectors();
                };
                dragCompleteHandler = function(event)
                {
                    let $target = $(event.target);
                    this.enableEvents($dev, true);
                    $.each($selectedDevices, function(i, $dev)
                    {
                        if ($target.closest('.simcir-toolbox').length == 0)
                        {
                            adjustDevice($dev);
                            updateConnectors();
                        }
                        else
                        {
                            removeDevice($dev);
                        }
                    });
                };
            };
            
            let beginSelectDevice = function(event, $target)
            {
                let intersect   = function(rect1, rect2)
                {
                    return !(
                    rect1.x > rect2.x + rect2.width ||
                    rect1.y > rect2.y + rect2.height ||
                    rect1.x + rect1.width < rect2.x ||
                    rect1.y + rect1.height < rect2.y);
                };
                let pointToRect = function(p1, p2)
                {
                    return {
                        x      : Math.min(p1.x, p2.x),
                        y      : Math.min(p1.y, p2.y),
                        width  : Math.abs(p1.x - p2.x),
                        height : Math.abs(p1.y - p2.y)
                    };
                };
                deselectAll();
                let off         = $workspace.offset();
                let pos         = this.offset($devicePane);
                let p1          = {x : event.pageX - off.left, y : event.pageY - off.top};
                dragMoveHandler = function(event)
                {
                    deselectAll();
                    let p2      = {x : event.pageX - off.left, y : event.pageY - off.top};
                    let selRect = pointToRect(p1, p2);
                    $devicePane.children('.simcir-device')
                               .each(function()
                                     {
                                         let $dev    = $(this);
                                         let devPos  = this.transform($dev);
                                         let devSize = this.controller($dev)
                                             .getSize();
                                         let devRect = {
                                             x      : devPos.x + pos.x,
                                             y      : devPos.y + pos.y,
                                             width  : devSize.width,
                                             height : devSize.height
                                         };
                                         if (intersect(selRect, devRect))
                                         {
                                             addSelected($dev);
                                         }
                                     });
                    $temporaryPane.children()
                                  .remove();
                    $temporaryPane.append(this.createSVGElement('rect')
                                              .attr(selRect)
                                              .attr('class', 'simcir-selection-rect'));
                };
            };
            
            let mouseDownHandler = function(event)
            {
                event.preventDefault();
                event.stopPropagation();
                let $target = $(event.target);
                if (this.isActiveNode($target))
                {
                    beginConnect(event, $target);
                }
                else if ($target.closest('.simcir-device').length == 1)
                {
                    if ($target.closest('.simcir-toolbox').length == 1)
                    {
                        beginNewDevice(event, $target);
                    }
                    else
                    {
                        beginMoveDevice(event, $target);
                    }
                }
                else
                {
                    beginSelectDevice(event, $target);
                }
                $(document)
                    .on('mousemove', mouseMoveHandler);
                $(document)
                    .on('mouseup', mouseUpHandler);
            };
            let mouseMoveHandler = function(event)
            {
                if (dragMoveHandler != null)
                {
                    dragMoveHandler(event);
                }
            };
            let mouseUpHandler   = function(event)
            {
                if (dragCompleteHandler != null)
                {
                    dragCompleteHandler(event);
                }
                dragMoveHandler     = null;
                dragCompleteHandler = null;
                $devicePane.children('.simcir-device')
                           .each(function()
                                 {
                                     this.enableEvents($(this), true);
                                 });
                $temporaryPane.children()
                              .remove();
                $(document)
                    .off('mousemove', mouseMoveHandler);
                $(document)
                    .off('mouseup', mouseUpHandler);
            };
            $workspace.on('mousedown', mouseDownHandler);
            
            //-------------------------------------------
            //
            
            loadToolbox(data);
            $.each(this.buildCircuit(data, false, scope), function(i, $dev)
            {
                addDevice($dev);
            });
            updateConnectors();
            
            let workspaceController = {
                data : getData,
                ui   : $workspace
            };
    
            this.controller($workspace, workspaceController);
            
            return workspaceController;
        };
    
    
    setupSimcir($placeHolder, data)
        {
            let $workspace = simcir.createWorkspace(data).ui;
            let $dataArea  = $('<textarea></textarea>')
                .addClass('simcir-json-data-area')
                .attr('readonly', 'readonly')
                .css('width', $workspace.attr('width') + 'px')
                .css('height', $workspace.attr('height') + 'px');
            let showData   = false;
            let toggle     = function()
            {
                $workspace.css('display', !showData ? 'inline' : 'none');
                $dataArea.css('display', showData ? 'inline' : 'none');
                if (showData)
                {
                    $dataArea.val(this.controller($workspace)
                                      .text())
                             .focus();
                }
                showData = !showData;
            };
            $placeHolder.text('');
            $placeHolder.append($('<div></div>')
                                    .addClass('simcir-body')
                                    .append($workspace)
                                    .append($dataArea)
                                    .on('click', function(event)
                                    {
                                        if (event.ctrlKey || event.metaKey)
                                        {
                                            toggle();
                                        }
                                    }));
            toggle();
            return $placeHolder;
        };
    
    
    returnSimcirValues()
        {
            return {
                registerDevice   : this.registerDevice,
                setupSimcir      : this.setupSimcir,
                createWorkspace  : this.createWorkspace,
                createSVGElement : this.createSVGElement,
                addClass         : this.addClass,
                removeClass      : this.removeClass,
                hasClass         : this.hasClass,
                offset           : this.offset,
                transform        : this.transform,
                enableEvents     : this.enableEvents,
                graphics         : this.graphics,
                controller       : this.controller,
                unit             : this.unit
                
            };
            
            
        };
    
}

var simcir_obj = new simCir();
