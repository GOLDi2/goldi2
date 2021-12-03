

class Equation_BEAST_Converter {

    constructor() {
        this.declareConsts();

        this.idCounter = 0;
        this.devices = [];
        this.connectors = [];
        this.joints = [];
        this.maxDepth = 0;
        this.elementsHeightCounter = 0;
        this.inputsEndpointX = 0;
        this.charSet = {
            andChar: "&",
            antivalChar: "°",
            equivChar: "~",
            implyChar: ">",
            notChar: "/",
            orChar: "+",
        };
    }

    declareConsts() {
        // NOT CHANGE
        this.JOINT_SIZE = 16;

        // changeable
        this.INPUTS_START_POINT_X = 100;
        this.INPUTS_START_POINT_Y = 150;
        this.DEVICES_START_POINT_Y = this.INPUTS_START_POINT_Y + 100;
        this.DISTANCE_BETWEEN_INPUTS_X = 40;
        this.DISTANCE_BETWEEN_INPUTS_AND_LOGIC_ELEMENTS_X = 100;
        this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_X = 100;
        this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y = 40;
        this.JOINT_INDENT_Y = 7;
        this.DISTANCE_BETWEEN_ROOT_AND_LED = 70;
    }

    convert(projectName, expression) {

        let expTree = expressionParser.parse(expression, {}, this.charSet);

        let variables = Array.from(this.findAllVariables(expTree)).sort();

        this.createInputs(variables);

        this.maxDepth = this.getMaxDepth(expTree);

        this.inputsEndpointX = variables.length * this.DISTANCE_BETWEEN_INPUTS_X;

        const result = this.buildCircuitObject(projectName);

        result.devices = this.devices;
        result.connectors = this.connectors;

        const root = this.createDevices(expTree);
        this.addOutputToRoot(root);
        return result;
    }

    findAllVariables(tree, set = new Set()) {
        const property = this.getFirstProperty(tree);

        if (property.name === 'variable') {
            set.add(property.value);
            return set;
        }
        const children = this.checkOrCreateOneObjectArray(property.value);
        for (let i = 0; i < children.length; i++) {
            this.findAllVariables(children[i], set);
        }
        return set;
    }

    createInputs(variables) {
        for (let i = 0; i < variables.length; i++) {
            let deviceId = this.idCounter++;
            const x = this.INPUTS_START_POINT_X + this.DISTANCE_BETWEEN_INPUTS_X * i;
            let y = this.INPUTS_START_POINT_Y;

            // const device = this.createToggle("dev" + deviceId, x, y, "x" + variables[i], false, 90);
            const device = this.createInPort("dev" + deviceId, x, y, "x" + variables[i], 90);
            this.devices.push(device);

            this.joints[variables[i]] = device;
        }
    }

    getMaxDepth(tree, depth = 0) {
        const property = this.getFirstProperty(tree);

        if (property.name === 'variable') return depth;

        const children = this.checkOrCreateOneObjectArray(property.value);
        let max = depth;
        for (let i = 0; i < children.length; i++) {
            max = Math.max(this.getMaxDepth(children[i], depth + 1), max);
        }
        return max;
    }

    buildCircuitObject(projectName) {
        return {
            ID: "project",
            name: projectName,
            devices: []
        };
    }

    createDevices(tree, depth = 0) {
        if (tree.variable) {
            return this.processVariable(tree, depth);
        }
        return this.processDevice(tree, depth);
    }

    processVariable(tree, depth) {
        const id = this.idCounter++;
        const x = this.calculateXForDevice(depth);
        const y = this.elementsHeightCounter * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.DEVICES_START_POINT_Y;
        const device = this.createJoint("dev" + id, x, y);

        this.extendBottomLineFromInput(tree.variable, id, y);

        this.connectors.push({
            to: `dev${id}_.out0`,
            from: `dev${id}.in0`
        });

        this.elementsHeightCounter++;

        this.devices.push(device);
        // return { childId: id, childY: y, childX: x };
        return device;

    }

    extendBottomLineFromInput(variable, id, y) {
        const joint = this.joints[variable];
        let prevJointId = joint.id.substr(3);
        let jointX = joint.x;
        let jointY = y - this.JOINT_INDENT_Y;
        // if (joint.id.indexOf("_") === -1) jointX -= this.JOINT_INDENT_Y;
        if (joint.type.componentID !== 'Joint') jointX -= this.JOINT_INDENT_Y;

        const jointToJoint = this.createJoint("dev" + id + "_", jointX, jointY, '  ', 90);
        this.devices.push(jointToJoint);
        this.connectors.push({
            to: `dev${prevJointId}.out0`,
            from: `dev${id}_.in0`
        });
        this.joints[variable] = jointToJoint;
    }

    processDevice(tree, depth) {
        const deviceId = this.idCounter++;
        const property = this.getFirstProperty(tree);
        const children = this.checkOrCreateOneObjectArray(property.value);

        const deviceName = property.name;

        const x = this.calculateXForDevice(depth);
        const device = this.createDevice(deviceName.toUpperCase(), "dev" + deviceId, x, 0, deviceName, children.length);

        this.devices.push(device);
        // console.log(device.label);
        let firstChildY, lastChildY;

        const tempChildren = [];
        for (let i = 0; i < children.length; i++) {

            const childDevice = this.createDevices(children[i], depth + 1);
            const childY = childDevice.y;
            tempChildren.push(childDevice);

            if (children.length > 1) {
                if (i === 0) firstChildY = childY;
                if (i === children.length - 1) lastChildY = childY;
            } else {
                const childHeight = this.calculateDeviceHeight(childDevice.numInputs);
                device.y = childY;

                if (childDevice.type.componentID === 'Joint') {
                    device.y -= 8;
                } else {
                    // console.log(device);
                    // if (device.type.componentID !== 'NOT') {
                    device.y += childHeight / 2 - 16;
                    // }
                }

            }
        }

        if (firstChildY && lastChildY) {
            device.y = firstChildY + (lastChildY - firstChildY) / 2;
        }

        const distanceBetweenPorts = this.calculatePortDistance(device.numInputs);

        let numberOfChildrenHigherThanPort =
            this.calculateNumberOfChildrenHigherThanPort(tempChildren,
                device.y,
                distanceBetweenPorts);

        this.connectChildrenWithParent(device,
            tempChildren,
            0,
            numberOfChildrenHigherThanPort);

        this.connectChildrenWithParent(device,
            tempChildren,
            tempChildren.length - 1,
            numberOfChildrenHigherThanPort - 1,
            true);

        return device;
    }

    calculateNumberOfChildrenHigherThanPort(children, deviceY, distanceBetweenPorts) {
        let numberOfChildrenHigherThanPort = 0;
        for (let i = 0; i < children.length; i++) {
            if (children[i].y < deviceY + i * distanceBetweenPorts) {
                numberOfChildrenHigherThanPort++;
            }
        }
        return numberOfChildrenHigherThanPort;
    }

    connectChildrenWithParent(parent, children, indexFrom, indexTo, isReversed = false) {
        let nextChildXIndent = this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_X * 0.6;
        const distanceBetweenPorts = this.calculatePortDistance(parent.numInputs);
        let stepX = 0;
        if (children.length < 10) {
            stepX = 5;
        } else if (children.length < 20) {
            stepX = 3;
        } else {
            stepX = 1;
        }
        let i = indexFrom;
        while (i != indexTo && children[i] != undefined) {
            // for (let i = tempChildren.length - 1; i >= numberOfChildrenHigherThanPort; i--) {
            const childDevice = children[i];
            const childId = childDevice.id;
            const childY = childDevice.y;
            const childX = childDevice.x;
            // console.log(childDevice);
            if (children.length === 1) {
                this.connectors.push({
                    to: `${childId}.out0`,
                    from: `${parent.id}.in${i}`
                });
            } else {
                let joint1Y = childY;
                let childDeviceHeight = this.calculateDeviceHeight(childDevice.numInputs);
                if (childDevice.type.componentID !== 'Joint') {
                    joint1Y += childDeviceHeight / 2 - 8;
                }

                const joint1 = this.createJoint(childId + "_1", childX + nextChildXIndent, joint1Y);
                this.connectors.push({
                    to: `${childId}.out0`,
                    from: `${childId}_1.in0`
                });

                this.devices.push(joint1);
                const joint2 = this.createJoint(childId + "_2", childX + nextChildXIndent + this.JOINT_SIZE, parent.y + i * distanceBetweenPorts);
                this.connectors.push({
                    to: `${childId}_1.out0`,
                    from: `${childId}_2.in0`
                });
                this.devices.push(joint2);

                this.connectors.push({
                    to: `${childId}_2.out0`,
                    from: `${parent.id}.in${i}`
                });
                nextChildXIndent -= stepX;
            }
            if (isReversed) {
                i--;
            } else {
                i++;
            }
        }
    }

    calculateXForDevice(depth) {
        return this.inputsEndpointX + this.maxDepth * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_X - depth * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_X + this.DISTANCE_BETWEEN_INPUTS_AND_LOGIC_ELEMENTS_X;
    }

    addOutputToRoot(root) {
        const rootHeight = this.calculateDeviceHeight(root.numInputs);
        const x = root.x + this.DISTANCE_BETWEEN_ROOT_AND_LED;
        const y = root.y + (rootHeight / 2 - 16);
        /*const led = this.createLED(
            "devLED",
            (isComponent) ? x + 60 : x,
            y,
            LED_LIGHT_ON,
            LED_LIGHT_OFF); */
        const led = this.createOutPort(
            "devOutput",
            x,
            y,
            'y0');
        this.devices.push(led);
        this.connectors.push({
            to: `${root.id}.out0`,
            from: `${led.id}.in${0}`
        });
        //  this.connectors.push({
        // to: `${root.id}.out0`,
        // from: `${led.id}.in${0}`
        // });
    }

    checkOrCreateOneObjectArray(obj) {
        if (obj.constructor === Array) {
            return obj;
        } else {
            return [obj];
        }
    }

    getFirstProperty(obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return {
                    name: key,
                    value: obj[key]
                };
            }
        }
        throw new Error("Can't find property");
    }

    createDevice(componentId, id, x, y, label = '   ', numInputs) {
        const device = {
            type: {
                libraryID: "beast-basic",
                componentID: componentId
            },
            label: label,
            id: id,
            x: x,
            y: y
        };
        if (numInputs) {
            device.numInputs = numInputs;
        }
        return device;
    }

    createJoint(id, x, y, label, rotation) {
        const device = this.createDevice("Joint", id, x, y, label);
        if (rotation) {
            device.rotation = rotation;
        }
        return device;
    }


    createToggle(id, x, y, label, state, rotation) {
        const device = this.createDevice("Toggle", id, x, y, label);
        if (state) {
            device.state = {
                on: state
            };
        }
        if (rotation) {
            device.rotation = rotation;
        }
        return device;
    }

    createInPort(id, x, y, label, rotation) {
        const device = this.createDevice("In", id, x, y, label);
        if (rotation) {
            device.rotation = rotation;
        }
        return device;
    }

    createLED(id, x, y, color, bgColor) {
        const device = this.createDevice("LED", id, x, y);
        if (color) device.color = color;
        if (bgColor) device.bgColor = bgColor;
        return device;
    }

    createOutPort(id, x, y, label) {
        const device = this.createDevice("Out", id, x, y, label);
        return device;
    }

    calculateDeviceHeight(numInputs) {
        if (numInputs >= 5) {
            return 8 + 8 * numInputs;
        } else if (numInputs <= 2) {
            return 32;
        } else if (numInputs === 3) {
            return 48;
        } else if (numInputs === 4) {
            return 64;
        } else {
            return 0;
        }
    }

    calculatePortDistance(numInputs) {
        if (!numInputs || numInputs < 2) {
            return 0;
        } else if (numInputs < 5) {
            return 16;
        } else {
            return 8;
        }
    }

// let userRawInput = "/x5&/(x2&(x0+/x3+x4)&x1)+/((x2x1x3x4)&x2&x5&x0&x2&x3&x1&x2&x2&x2&x2&x2&x3&x1&x2&x3)+x4+x3+x1";
// let userRawInput = "/x5&/(x2&(x0+/x3+x4)&x1)+(x2x1x3x4)&x2&x5&x0&x1+x4+x3";
// let userRawInput = "/x5&/(x2&(x0+/x3+x4)&x1)+(x2x1x3x4)&x2+x4";
// let userRawInput = "(x4 + x3 + x2 + /x1 + x0)(x4 + x3 + x2 + /x1 + /x0)(x4 + x3 + /x2 + x1 + x0)(x4 + x3 + /x2 + x1 + /x0)(x4 + x3 + /x2 + /x1 + x0)(x4 + x3 + /x2 + /x1 + /x0)(x4 + /x3 + x2 + x1 + x0)(x4 + /x3 + x2 + x1 + /x0)(x4 + /x3 + x2 + /x1 + x0)(x4 + /x3 + x2 + /x1 + /x0)(x4 + /x3 + /x2 + x1 + x0)(x4 + /x3 + /x2 + x1 + /x0)(x4 + /x3 + /x2 + /x1 + x0)(x4 + /x3 + /x2 + /x1 + /x0)(/x4 + x3 + x2 + x1 + x0)(/x4 + x3 + x2 + x1 + /x0)(/x4 + x3 + x2 + /x1 + x0)(/x4 + x3 + x2 + /x1 + /x0)(/x4 + x3 + /x2 + x1 + x0)(/x4 + x3 + /x2 + x1 + /x0)(/x4 + x3 + /x2 + /x1 + x0)(/x4 + x3 + /x2 + /x1 + /x0)(/x4 + /x3 + x2 + x1 + x0)(/x4 + /x3 + x2 + x1 + /x0)(/x4 + /x3 + x2 + /x1 + x0)(/x4 + /x3 + x2 + /x1 + /x0)(/x4 + /x3 + /x2 + x1 + x0)(/x4 + /x3 + /x2 + x1 + /x0)(/x4 + /x3 + /x2 + /x1 + x0)(/x4 + /x3 + /x2 + /x1 + /x0)";

}

// const convertedData = JSON.stringify(convert("Project", userRawInput, charSet), null, 2);
// const convertedData = JSON.stringify(
//         convertToComponent("Project", userRawInput, charSet,
//                 {
//                     libraryName: "Library1",
//                     libraryVersion: "1.0.0",
//                     componentName: "Component1",
//                     componentVersion: "1.0.0"
//                 }), 
//         null, 2);
// console.log(convertedData);


// // console.log(convertedData, charSet);
// console.log(userRawInput);
// const fs = require('fs');
// fs.writeFile('C:\\Users\\Swati\\Downloads\\beast.beast', convertedData,  (err) {
//     if (err) console.log(err)
// });
