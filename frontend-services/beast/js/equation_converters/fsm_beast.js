// const expressionParser = require('./sane-expression-parser_node');


class FSM_Equation_BEAST_Converter {

    constructor() {
        this.prepareConsts();

        this.inputsEndpointX = 0;
        this.maxDepth = 0;
        this.deviceId = 0;
        this.devices = [];
        this.connectors = [];
        this.elementsHeightCounterZ = 0;
        this.elementsHeightCounterY = 0;

// let xWidthForEachLevel = [];
        this.yDistanceFromInputs = 0;

        this.dffOutputCounter = 0;
        this.topJointCounter = 0;
        this.jointsFromInputs = [];

        this.firstBackZ0PositionX = 0;
        this.topToBottomRightZJoints = new Map();
        this.zVariablesCount = 0;
        this.topToBottomRightXJoints = [];
        this.prevOscJoint = null;
        this.isMealy = false;
        this.showXOnRightWhenMoore = false;
    }

    prepareConsts() {
        this.JOINT_Y_INDENT = 8;

        this.INPUTS_START_POINT_X = 100;
        this.INPUTS_START_POINT_Y = 150;
        this.INPUTS_NOT_MARGIN_X = 40;
        this.INPUTS_NOT_MARGIN_Y = 70;
        this.DISTANCE_BETWEEN_INPUTS_X = 70;
        this.BASE_DISTANCE_BETWEEN_INPUTS_AND_LOGIC_ELEMENTS_X = 50;
        this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y = 40;
        this.BASE_DISTANCE_BETWEEN_LOGIC_ELEMENTS_X = 50;
        // const BASE_DISTANCE_BETWEEN_DFF_JOINT = 40;
        // const DFF_OUTPUT_X_DIFFERENCE = 50;
        this.DISTANCE_BETWEEN_LINES_Y = 10;
        this.DISTANCE_BETWEEN_LINES_X = 10;

        this.VARIABLE_REGEXP = /([a-zA-Z]\d+)/gm;
        this.Z_VARIABLE_REGEXP = /([zZ]\d+)/gm;

        this.charSet = {
            andChar: "&",
            antivalChar: "°",
            equivChar: "~",
            implyChar: ">",
            notChar: "/",
            orChar: "+",
        };

    }

    convert(projectName, expressions) {
        const result = this.buildCircuitObject(projectName);
        this.checkExpressions(expressions);
        this.createZTrees(expressions, result);
        this.createYTrees(expressions, result);
        return result;
    }

    checkExpressions(expressions) {
        const possibleZ = new Set();

        expressions.z.forEach((item) => {
            possibleZ.add(item.name);
        });

        expressions.y.forEach((item) => {
            this.areAllOperandsCorrect(possibleZ, item);
        });

        expressions.z.forEach((item) => {
            this.areAllOperandsCorrect(possibleZ, item);
        });
    }

    areAllOperandsCorrect(possibleZ, item) {
        const matches = item.expression.match(this.Z_VARIABLE_REGEXP);
        if (matches) {
            matches.forEach((match) => {
                if (!possibleZ.has(match)) {
                    throw new Error(`'${item.name}' uses '${match}'. But '${match}' is not exist`);
                }
            });
        }
    }

    createZTrees(expressions, result) {
        const zTrees = [];

        let xVariables = new Set();
        let zVariables = new Set();
        let zCounter = 0;
        for (let z of expressions.z) {
            const tree = {
                "D-FF": this.buildTree(z.expression),
                label: 'z' + zCounter
            };
            zCounter++;
            this.removeVariablesNots(tree);
            zTrees.push(tree);

            this.getVariables('x', tree, xVariables);
            this.getVariables('z', tree, zVariables);
            zVariables.add(parseInt(z.name.substr(1)));

            const depth = this.getMaxDepth(tree);
            this.maxDepth = Math.max(this.maxDepth, depth);
        }
        this.isMealy = false;
        for (let y of expressions.y) {

            const tree = this.buildTree(y.expression);

            this.getVariables('x', tree, xVariables);
            this.getVariables('z', tree, zVariables);

            let tempXVariables = new Set();
            this.getVariables('x', tree, tempXVariables);
            this.isMealy = tempXVariables.size > 0;
        }

        xVariables = Array.from(xVariables).sort((a, b) => a - b);
        zVariables = Array.from(zVariables).sort();
        this.zVariablesCount = zVariables.length * 2;

        this.createInputs(xVariables);

        this.inputsEndpointX = xVariables.length * this.DISTANCE_BETWEEN_INPUTS_X + this.zVariablesCount * this.DISTANCE_BETWEEN_LINES_X;

        const maxChildrenForEachLevel = Array(this.maxDepth).fill(0);

        this.yDistanceFromInputs = this.calculateYDistanceFromInputs(zVariables.length);

        for (let tree of zTrees) {
            this.calculateMaxChildrenForEachLevel(tree, maxChildrenForEachLevel);
        }

        const xWidthForEachLevel = this.calculateXWidthForEachLevel(maxChildrenForEachLevel, this.maxDepth);

        const leftTopJoints = this.createLeftTopZJoints(zVariables);

        this.drawTrees(zTrees, xWidthForEachLevel);

        this.extendLeftZVariablesToBottom();

        const rightTopZJoints = this.createOutputJointsForDffs();

        this.extendTopRightZJointsToLeft(rightTopZJoints, leftTopJoints);

        result.devices = this.devices;
        result.connectors = this.connectors;
    }


    buildCircuitObject(projectName) {
        return {
            ID: "project",
            name: projectName,
            devices: [],
            connectors: []
        };
    }

    buildTree(expression) {

        const variablesMap = new Map(); // key - original name, value - temp name
        const reverseMap = new Map(); // key - temp name, value - original name

        // const exp = z.expression;
        let i = 0;
        const newExp = expression.replace(this.VARIABLE_REGEXP, function (match) {
            if (!variablesMap.has(match)) {
                const tempName = 'x' + (i++);
                variablesMap.set(match, tempName);
                reverseMap.set(tempName, match);
                return tempName;
            }
            return variablesMap.get(match)
        });

        let expTree = expressionParser.parse(newExp, {}, this.charSet);

        this.backVariablesToOriginalNames(expTree, reverseMap);
        // console.log(JSON.stringify(expTree, null, 2));
        return expTree;
    }

    removeVariablesNots(node) {
        if (node.variable) {
            // node.variable = reverseMap.get('x' + node.variable);
            return;
        }
        const firstProp = this.getFirstProperty(node);
        const children = this.checkOrCreateOneObjectArray(firstProp.value);

        // console.log(node)
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childProperty = this.getFirstProperty(child);

            if (childProperty.name === "not" && child.not.variable) {
                // child.not.variable = '/' + child.not.variable;
                child.not.not = true;
                children[i] = child.not;
                continue;
            }
            this.removeVariablesNots(children[i]);
        }
    }

    backVariablesToOriginalNames(node, reverseMap) {
        if (node.variable) {
            node.variable = reverseMap.get('x' + node.variable);
            return;
        }
        const firstProp = this.getFirstProperty(node);
        const children = this.checkOrCreateOneObjectArray(firstProp.value);
        for (let i = 0; i < children.length; i++) {
            this.backVariablesToOriginalNames(children[i], reverseMap);
        }
    }

    getFirstProperty(obj) {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return {
                    name: key,
                    value: obj[key]
                };
            }
        }
        throw new Error("Can't find property");
    }

    checkOrCreateOneObjectArray(obj) {
        if (obj.constructor === Array) {
            return obj;
        } else {
            return [obj];
        }
    }

    getVariables(variableLetter, node, variables = new Set()) {
        if (node.variable) {
            const letter = node.variable[0];
            const number = parseInt(node.variable.substring(1));
            if (letter === variableLetter) variables.add(number);
            return variables;
        }
        const firstProp = this.getFirstProperty(node);
        // console.log(variables);
        const children = this.checkOrCreateOneObjectArray(firstProp.value);
        for (let i = 0; i < children.length; i++) {
            this.getVariables(variableLetter, children[i], variables);
        }
        return variables;
    }

    createInputs(variables) {
        for (let i = 0; i < variables.length; i++) {
            let deviceId = this.generateDeviceId();
            const x = this.INPUTS_START_POINT_X + this.DISTANCE_BETWEEN_INPUTS_X * i;
            let y = this.INPUTS_START_POINT_Y;

            // const device = this.createToggle("dev" + deviceId, x, y, "x" + variables[i], false, 90);
            const device = this.createInPort("dev" + deviceId, x, y, "x" + variables[i], 90);
            this.devices.push(device);

            const deviceNot = this.createDevice("NOT", "dev" + deviceId + "_not",
                x + this.INPUTS_NOT_MARGIN_X,
                y + this.INPUTS_NOT_MARGIN_Y, "!x" + variables[i]);
            deviceNot.rotation = 90;
            this.devices.push(deviceNot);
            this.connectors.push({
                from: `dev${deviceId}_not.in0`,
                to: `dev${deviceId}.out0`
            });

            this.jointsFromInputs['x' + variables[i]] = device;
            this.jointsFromInputs['/x' + variables[i]] = deviceNot;
        }
    }

    createLeftTopZJoints(zVariables) {
        let counter = 0;
        const leftTopJoints = [];
        // console.log(zVariables);
        for (let number of zVariables) {
            let name = 'z' + number;
            const oneDigitJoints = [];
            for (let i = 0; i < 2; i++) {
                let jointY = this.calculateYForTopJoints(counter) - 8;
                let jointX = this.calculateXForDevice(0) - counter * this.DISTANCE_BETWEEN_LINES_X - 8;

                const newJointId = 'dev' + this.generateDeviceId();
                const newJoint = this.createJoint(newJointId, jointX, jointY, '  ', 90);

                this.devices.push(newJoint);

                if (i === 1) name = '/' + name;

                this.jointsFromInputs[name] = newJoint;

                oneDigitJoints.push(newJoint);
                counter++;
                // console.log(name, jointX);
            }
            leftTopJoints.push(oneDigitJoints);
        }
        return leftTopJoints;
    }

    calculateYDistanceFromInputs(count) {
        return Math.max(count * this.DISTANCE_BETWEEN_LINES_Y, this.BASE_DISTANCE_BETWEEN_INPUTS_AND_LOGIC_ELEMENTS_X);
    }

    calculateMaxChildrenForEachLevel(tree, maxChildrenForEachLevel, depth = 0) {
        const property = this.getFirstProperty(tree);

        if (property.name === 'variable') return;

        const children = this.checkOrCreateOneObjectArray(property.value);
        let childCount = 0;
        for (let i = 0; i < children.length; i++) {
            this.calculateMaxChildrenForEachLevel(children[i], maxChildrenForEachLevel, depth + 1);
        }
        childCount += children.length;
        maxChildrenForEachLevel[depth] = Math.max(maxChildrenForEachLevel[depth], childCount);
    }


    calculateXWidthForEachLevel(maxChildrenForEachLevel, maxDepth) {
        const xWidthForEachLevel = Array(maxDepth).fill(0);

        for (let i = 0; i < maxChildrenForEachLevel.length; i++) {
            xWidthForEachLevel[i] = Math.max(this.BASE_DISTANCE_BETWEEN_LOGIC_ELEMENTS_X, maxChildrenForEachLevel[i] * 10 + 32);
        }
        for (let i = xWidthForEachLevel.length - 1; i > 0; i--) {
            xWidthForEachLevel[i - 1] += xWidthForEachLevel[i] + 32;
        }
        return xWidthForEachLevel;
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

    drawTrees(trees, xWidthForEachLevel) {
        for (let tree of trees) {
            const dff = this.createDevices(tree, xWidthForEachLevel);
            this.extendOscJoints(dff)
        }
    }

    extendOscJoints(dff) {

        const joint = this.createJoint(dff.id + '_', dff.x - 20, dff.y + 40, ' ', 270);

        this.devices.push(joint);

        this.connectors.push({
            from: `${dff.id}_.out0`,
            to: `${dff.id}.in1`
        });

        if (this.prevOscJoint) {
            this.connectors.push({
                from: `${this.prevOscJoint.id}.in0`,
                to: `${dff.id}_.out0`
            });
        }

        this.prevOscJoint = joint;
    }

    createDevices(tree, xWidthForEachLevel, depth = 0) {
        if (tree.variable) {
            return this.processVariable(tree, depth);
        }
        return this.processDevice(tree, xWidthForEachLevel, 'z', true, depth);
    }

    processVariable(tree, depth) {
        const id = this.generateDeviceId();
        const x = this.calculateXForDevice(0);
        const y = this.elementsHeightCounterZ * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.INPUTS_START_POINT_Y
            + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 50;
        const device = this.createJoint("dev" + id, x, y);

        this.elementsHeightCounterZ++;

        this.devices.push(device);

        const not = (tree.not) ? '/' : '';
        this.extendBottomLineFromInput(not + tree.variable, id, y);

        this.connectors.push({
            to: `dev${id}_.out0`,
            from: `dev${id}.in0`
        });

        return device;
    }

    processDevicesFactory(param) {
        switch (param) {
            case 'z':
                return this.createDevices.bind(this);
            case 'y':
                return this.createYDevices.bind(this);
            default:
                throw new Error('No such function');
        }
    }

    extendBottomLineFromInput(variable, id, y) {
        const joint = this.jointsFromInputs[variable];

        let prevJointId = joint.id.substr(3);
        let jointX = joint.x;
        let jointY = y - this.JOINT_Y_INDENT;

        if (joint.type.componentID !== 'Joint') jointX -= this.JOINT_Y_INDENT;

        const jointToJoint = this.createJoint("dev" + id + "_", jointX, jointY, '  ', 90);
        this.devices.push(jointToJoint);
        // console.log(joint.x, variable);
        this.connectors.push({
            to: `dev${prevJointId}.out0`,
            from: `dev${id}_.in0`
        });
        this.jointsFromInputs[variable] = jointToJoint;
    }

    processDevice(node, distanceBetweenChildAndParent, param, optimizeJoints, depth = 0) {
        if (node.variable) {
            return;
        }
        const deviceId = this.generateDeviceId();
        const property = this.getFirstProperty(node);
        const children = this.checkOrCreateOneObjectArray(property.value);

        let deviceName;
        if (property.name === 'Out') {
            deviceName = property.name;
        } else {
            deviceName = property.name.toUpperCase();
        }
        const deviceLabel = node.label || deviceName;

        const x = this.calculateXForDevice(distanceBetweenChildAndParent[depth]);
        const device = this.createDevice(deviceName, "dev" + deviceId, x, 0, deviceLabel, children.length);

        this.devices.push(device);

        let firstChildY, lastChildY;

        const tempChildren = [];
        // const zChildren = [];
        for (let i = 0; i < children.length; i++) {

            const childDevice = this.processDevicesFactory(param)(children[i], distanceBetweenChildAndParent, depth + 1);

            const childY = childDevice.y;
            tempChildren.push(childDevice);
            if (children.length > 1) {
                if (i === 0) firstChildY = childY;
                if (i === children.length - 1) lastChildY = childY + this.calculateDeviceHeight(childDevice.numInputs);
            } else {
                const childHeight = this.calculateDeviceHeight(childDevice.numInputs);
                device.y = childY;

                if (childDevice.type.componentID === 'Joint') {
                    device.y -= 8;
                } else {
                    device.y += childHeight / 2 - 16;
                }

            }
        }

        if (firstChildY && lastChildY) {
            device.y = firstChildY + (lastChildY - firstChildY) / 2
                - this.calculateDeviceHeight(device.numInputs) / 2;
        }

        const distanceBetweenPorts = this.calculatePortDistance(device.numInputs);
        let numberOfChildrenHigherThanPort =
            this.calculateNumberOfChildrenHigherThanPort(tempChildren,
                device.y,
                distanceBetweenPorts);

        this.connectChildrenWithParent(device,
            tempChildren,
            0,
            numberOfChildrenHigherThanPort,
            {optimizeJoints: optimizeJoints});

        this.connectChildrenWithParent(device,
            tempChildren,
            tempChildren.length - 1,
            numberOfChildrenHigherThanPort - 1,
            {isReversed: true, optimizeJoints: optimizeJoints});

        return device;
    }

    calculateXForDevice(distanceBetweenChildAndParent) {
        return this.inputsEndpointX + distanceBetweenChildAndParent + this.BASE_DISTANCE_BETWEEN_INPUTS_AND_LOGIC_ELEMENTS_X
            + this.zVariablesCount * 8 + 30;
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

    connectChildrenWithParent(parent, children, indexFrom, indexTo, options) {
        let nextChildXIndent = parent.x - 40;
        const distanceBetweenPorts = this.calculatePortDistance(parent.numInputs);

        let i = indexFrom;
        while (i !== indexTo && children[i] !== undefined) {
            // for (let i = tempChildren.length - 1; i >= numberOfChildrenHigherThanPort; i--) {
            const childDevice = children[i];
            const childId = childDevice.id;
            let childY = childDevice.y;
            const childX = childDevice.x;
            if (childDevice.type.componentID === 'Joint') {
                // childY -= 24;
                if (childDevice.rotation === 90) {
                    childY += 8;
                } else if (childDevice.rotation === 270) {
                    childY -= 24;
                }
            }
            // console.log(childDevice);
            if (children.length === 1 && parent.type.componentID !== 'D-FF') {
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

                const joint2 = this.createJoint(
                    childId + "_2",
                    nextChildXIndent + 16,
                    parent.y + i * distanceBetweenPorts);

                // if child is horizontal Joint we can just move this joint instead of creating new
                if (childDevice.type.componentID === 'Joint' && options.optimizeJoints) {
                    childDevice.x = nextChildXIndent;
                    this.connectors.push({
                        to: `${childId}.out0`,
                        from: `${childId}_2.in0`
                    });

                } else {
                    const joint1 = this.createJoint(
                        childId + "_1",
                        nextChildXIndent,
                        joint1Y);

                    this.connectors.push({
                        to: `${childId}.out0`,
                        from: `${childId}_1.in0`
                    });

                    this.devices.push(joint1);

                    this.connectors.push({
                        to: `${childId}_1.out0`,
                        from: `${childId}_2.in0`
                    });

                }
                this.devices.push(joint2);

                this.connectors.push({
                    to: `${childId}_2.out0`,
                    from: `${parent.id}.in${i}`
                });
                nextChildXIndent -= 10;
            }
            if (options.isReversed) {
                i--;
            } else {
                i++;
            }
        }
    }


    extendLeftZVariablesToBottom() {
        for (let jointName in this.jointsFromInputs) {
            if (jointName.indexOf('z') === -1) continue;
            const topJoint = this.jointsFromInputs[jointName];

            const bottomJointId = 'dev' + this.generateDeviceId();
            const bottomJointY = this.elementsHeightCounterZ * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.INPUTS_START_POINT_Y
                + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 20;
            const bottomJointX = topJoint.x;
            const bottomJoint = this.createJoint(bottomJointId, bottomJointX, bottomJointY, ' ', 90);

            this.devices.push(bottomJoint);

            this.connectors.push({
                from: `${topJoint.id}.out0`,
                to: `${bottomJoint.id}.in0`
            });
        }

    }

    createOutputJointsForDffs() {
        const rightTopZJoints = [];
        let dffOutputCount = 0;
        for (let device of this.devices) {
            if (device.type.componentID === 'D-FF') {
                const dffOutputName = 'z' + dffOutputCount;
                rightTopZJoints.push(this.createOutputJointsForSingleDff(device, dffOutputName));
                dffOutputCount++;
            }
        }
        return rightTopZJoints;
    }

    createOutputJointsForSingleDff(dffDevice, dffOutputName) {
        const id = this.generateDeviceId();
        const x = dffDevice.x + 100 + (this.dffOutputCounter * this.DISTANCE_BETWEEN_LINES_X);
        const y = dffDevice.y;
        if (this.firstBackZ0PositionX === 0) this.firstBackZ0PositionX = x;

        const joint = this.createJoint(id, x, y, ' ');

        this.dffOutputCounter++;
        this.devices.push(joint);

        const jointNot = this.createJoint(id + "_not", x + this.DISTANCE_BETWEEN_LINES_X, y + 16, ' ');

        this.dffOutputCounter++;
        this.devices.push(jointNot);

        const jointTop = this.createJoint(id + "_top",
            x + 16,
            this.calculateYForTopJoints(this.topJointCounter),
            ' ', 180);

        this.topJointCounter++;
        this.devices.push(jointTop);

        const jointTopNot = this.createJoint(id + "_top_not",
            x + 16 + this.DISTANCE_BETWEEN_LINES_X,
            this.calculateYForTopJoints(this.topJointCounter),
            ' ', 180);

        this.topJointCounter++;
        this.devices.push(jointTopNot);

        this.connectors.push({
            to: `${dffDevice.id}.out0`,
            from: `${id}.in0`
        });

        this.connectors.push({
            to: `${dffDevice.id}.out1`,
            from: `${id}_not.in0`
        });

        this.topToBottomRightZJoints.set(dffOutputName,
            {
                dffOutputName: dffOutputName,
                topTop: undefined,
                topBottom: undefined,
                bottomTop: undefined,
                bottomBottom: undefined,
                y: y,
                dffId: id,
                topJointId: id + "_top"
            });
        this.topToBottomRightZJoints.set('/' + dffOutputName,
            {
                dffOutputName: '/' + dffOutputName,
                topTop: undefined,
                topBottom: undefined,
                bottomTop: undefined,
                bottomBottom: undefined,
                y: y + 16,
                dffId: id + "_not",
                topJointId: id + "_top_not"
            });
        // console.log(topToBottomJoints);
        return [jointTop, jointTopNot];
    }

    calculateYForTopJoints(topJointCounter) {
        return this.INPUTS_START_POINT_Y + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 20 - topJointCounter * this.DISTANCE_BETWEEN_LINES_Y;
    }

    extendTopRightZJointsToLeft(rightTopJoints, leftTopJoints) {

        for (let i = 0; i < rightTopJoints.length; i++) {
            for (let j = 0; j < 2; j++) {
                const rightJoint = rightTopJoints[i][j];
                const leftJoint = leftTopJoints[i][j];
                this.connectors.push({
                    from: `${rightJoint.id}.out0`,
                    to: `${leftJoint.id}.in0`
                });
            }
        }
    }

    drawXVariablesForMealy() {
        let counter = 0;
        for (let variable in this.jointsFromInputs) {
            if (variable.indexOf('z') !== -1) continue;
            counter++;
        }
        let length = counter;
        for (let variable in this.jointsFromInputs) {
            if (variable.indexOf('z') !== -1) {
                continue;
            }
            const joint = this.jointsFromInputs[variable];
            // console.log(joint);

            const bottomLeftId = 'dev' + this.generateDeviceId();
            let bottomLeftX = joint.x - 8;
            if (joint.type.componentID !== 'Joint') bottomLeftX -= this.JOINT_Y_INDENT;

            const bottomLeftY = Math.max(this.elementsHeightCounterY, this.elementsHeightCounterZ) * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.INPUTS_START_POINT_Y
                + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 50 + counter * this.DISTANCE_BETWEEN_LINES_Y;
            const bottomLeftJoint = this.createJoint(bottomLeftId, bottomLeftX, bottomLeftY, ' ');

            this.devices.push(bottomLeftJoint);
            this.connectors.push({
                from: `${joint.id}.out0`,
                to: `${bottomLeftId}.in0`
            });

            const bottomRightId = 'dev' + this.generateDeviceId();
            const bottomRightX = this.firstBackZ0PositionX + this.zVariablesCount * this.DISTANCE_BETWEEN_LINES_X + counter * this.DISTANCE_BETWEEN_LINES_X;
            const bottomRightY = bottomLeftY;
            const bottomRightJoint = this.createJoint(bottomRightId, bottomRightX, bottomRightY, ' ');

            this.devices.push(bottomRightJoint);
            this.connectors.push({
                from: `${bottomLeftId}.out0`,
                to: `${bottomRightId}.in0`
            });

            this.jointsFromInputs[variable] = bottomRightJoint;

            counter--;
        }

    }

    drawOsc() {
        let length = 0;
        if (this.isMealy || this.showXOnRightWhenMoore) {
            for (let variable in this.jointsFromInputs) {
                if (variable.indexOf('z') !== -1) continue;
                length++;
            }
        } else {
            length = 1;
        }

        const oscY = Math.max(this.elementsHeightCounterY, this.elementsHeightCounterZ) * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.INPUTS_START_POINT_Y
            + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 100 + length * this.DISTANCE_BETWEEN_LINES_Y;


        const osc = this.createInPort("devOSC", this.prevOscJoint.x - 8, oscY, 'C', -90);
        // const osc = this.createDevice('OSC', 'devOSC', this.prevOscJoint.x - 8, oscY, 'Generator');
        // osc.rotation = 270;
        this.devices.push(osc);
        this.connectors.push({
            from: `${this.prevOscJoint.id}.in0`,
            to: `${osc.id}.out0`
        });
    }

    createYTrees(expressions, result) {

        this.maxDepth = 0;

        const yTrees = [];

        let xVariables = new Set();
        let zVariables = new Set();

        for (let i = 0; i < expressions.y.length; i++) {
            const y = expressions.y[i];
            const tree = {
                Out: this.buildTree(y.expression),
                label: y.name
            };
            // label: 'y' + i

            this.removeVariablesNots(tree);
            yTrees.push(tree);

            this.getVariables('z', tree, zVariables);
            this.getVariables('x', tree, xVariables);

            const depth = this.getMaxDepth(tree);
            this.maxDepth = Math.max(this.maxDepth, depth);
        }

        this.inputsEndpointX = this.firstBackZ0PositionX + this.zVariablesCount * this.DISTANCE_BETWEEN_LINES_X;
        if (this.isMealy || this.showXOnRightWhenMoore) {
            this.inputsEndpointX += xVariables.size * 2 * this.DISTANCE_BETWEEN_LINES_X;
        }

        const maxChildrenForEachLevel = Array(this.maxDepth).fill(0);

        this.yDistanceFromInputs = this.calculateYDistanceFromInputs(zVariables.size);

        for (let tree of yTrees) {
            this.calculateMaxChildrenForEachLevel(tree, maxChildrenForEachLevel);
        }

        const xWidthForEachLevel = this.calculateXWidthForEachLevel(maxChildrenForEachLevel, this.maxDepth);

        if (this.isMealy || this.showXOnRightWhenMoore) {
            this.createRightTopXVariablesJoints();
        }

        this.drawYTrees(yTrees, xWidthForEachLevel);
        if (this.isMealy || this.showXOnRightWhenMoore) {
            this.drawXVariablesForMealy();
        }
        this.drawOsc();

        if (this.isMealy || this.showXOnRightWhenMoore) {
            this.connectRightXTopToBottomJoints();
        }
        this.connectRightZTopToBottomJoints();

    }

    drawYTrees(trees, distanceBetweenChildAndParent) {
        for (let tree of trees) {
            this.createYDevices(tree, distanceBetweenChildAndParent);
        }
    }

    createYDevices(tree, distanceBetweenChildAndParent, depth) {
        if (tree.variable) {
            return this.processYVariable(tree);
        }
        return this.processDevice(tree, distanceBetweenChildAndParent, 'y', false, depth);
    }

    processYVariable(tree) {
        if (tree.variable.indexOf('z') !== -1) {
            return this.processYVariableZ(tree);
        } else if (tree.variable.indexOf('x') !== -1) {
            return this.processYVariableX(tree);
        }

    }

    processYVariableX(tree) {
        const id = this.generateDeviceId();
        const not = (tree.not) ? '/' : '';
        const name = not + tree.variable;

        const topJoint = this.topToBottomRightXJoints[name];
        // console.log(tree.variable, prevJoint);

        let x = topJoint.x;
        const y = this.elementsHeightCounterY * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.INPUTS_START_POINT_Y
            + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 70;
        // if (tree.not) x += 10;
        const device = this.createJoint("dev" + id, x, y, ' ', 270);

        this.elementsHeightCounterY++;

        // console.log(tree, x, prevJoint.x);
        this.devices.push(device);

        this.connectors.push({
            from: `${device.id}.out0`,
            to: `${this.topToBottomRightXJoints[name].id}.in0`
        });

        this.topToBottomRightXJoints[name] = device;

        return device;
    }

    processYVariableZ(tree) {
        const id = this.generateDeviceId();
        const not = (tree.not) ? '/' : '';

        // console.log(tree);
        const variableNumber = tree.variable.substr(1);
        // let x = firstBackZ0PositionX + DFF_OUTPUT_X_DIFFERENCE + variableNumber * (this.DISTANCE_BETWEEN_LINES_X * 2) - 2;
        let x = this.firstBackZ0PositionX + variableNumber * (this.DISTANCE_BETWEEN_LINES_X * 2) + 8;

        const y = this.elementsHeightCounterY * this.DISTANCE_BETWEEN_LOGIC_ELEMENTS_Y + this.INPUTS_START_POINT_Y
            + this.yDistanceFromInputs + this.INPUTS_NOT_MARGIN_Y + 70;
        if (tree.not) x += this.DISTANCE_BETWEEN_LINES_X;
        const device = this.createJoint("dev" + id, x, y, ' ', 270);

        this.elementsHeightCounterY++;

        this.devices.push(device);

        const topToBottomJoint = this.topToBottomRightZJoints.get(not + tree.variable);

        if (!topToBottomJoint) {
            throw new Error('There is no equation for ' + not + tree.variable);
        }
        if (topToBottomJoint.y > y) {
            device.rotation = 270;
            // device.x -= 8;
        } else {
            device.rotation = 90;
            device.x += 16;
        }


        if (topToBottomJoint.y > y) {
            if (!topToBottomJoint.topTop) {
                topToBottomJoint.topTop = device.id;
            } else {
                let prevDeviceId;
                if (!topToBottomJoint.topBottom) {
                    prevDeviceId = topToBottomJoint.topTop;
                } else {
                    prevDeviceId = topToBottomJoint.topBottom;
                }
                this.connectors.push({
                    from: `${device.id}.out0`,
                    to: `${prevDeviceId}.in0`
                });
                topToBottomJoint.topBottom = device.id;
            }
        } else {
            // console.log(not + tree.variable + " " + x + " " + y + " " + topToBottomJoint.y);
            // console.log(not + tree.variable, topToBottomJoint);
            if (!topToBottomJoint.bottomTop) {
                topToBottomJoint.bottomTop = device.id;
            } else {
                let prevDeviceId;
                if (!topToBottomJoint.bottomBottom) {
                    prevDeviceId = topToBottomJoint.bottomTop;
                } else {
                    prevDeviceId = topToBottomJoint.bottomBottom;
                }
                this.connectors.push({
                    from: `${prevDeviceId}.out0`,
                    to: `${device.id}.in0`
                });
                // console.log(prevDeviceId);
                topToBottomJoint.bottomBottom = device.id;
            }
        }

        return device;
    }

    createRightTopXVariablesJoints() {
        let counter = 0;
        for (let jointName in this.jointsFromInputs) {
            if (jointName.indexOf('x') === -1) continue;
            counter++;
        }
        const baseY = this.calculateYForTopJoints(this.zVariablesCount);
        for (let bottomJointName in this.jointsFromInputs) {
            if (bottomJointName.indexOf('x') === -1) continue;

            const id = 'dev' + this.generateDeviceId();
            const x = this.firstBackZ0PositionX + this.zVariablesCount * this.DISTANCE_BETWEEN_LINES_X + counter * this.DISTANCE_BETWEEN_LINES_X + 8;
            const y = baseY + 28;
            const device = this.createJoint(id, x, y, ' ', 270);

            this.devices.push(device);

            this.topToBottomRightXJoints[bottomJointName] = device;
            counter--;

        }
    }

    connectRightXTopToBottomJoints() {
        for (let joint in this.topToBottomRightXJoints) {
            const topJoint = this.topToBottomRightXJoints[joint];
            const bottomJoint = this.jointsFromInputs[joint];

            this.connectors.push({
                from: `${bottomJoint.id}.out0`,
                to: `${topJoint.id}.in0`
            })
        }

    }

    connectRightZTopToBottomJoints() {
        const forEach = function (v, k, m) {

            if (v.topTop) {
                this.connectors.push({
                    from: `${v.topTop}.out0`,
                    to: `${v.topJointId}.in0`
                });
            } else if (v.topBottom) {
                this.connectors.push({
                    from: `${v.topBottom}.out0`,
                    to: `${v.topJointId}.in0`
                });
            }
            let connectTo;
            if (v.topBottom) {
                connectTo = v.topBottom;
            } else if (v.topTop) {
                connectTo = v.topTop;
            } else {
                connectTo = v.topJointId;
            }

            this.connectors.push({
                from: `${v.dffId}.out0`,
                to: `${connectTo}.in0`
            });

            if (v.bottomTop) {
                connectTo = v.bottomTop;
                this.connectors.push({
                    from: `${v.dffId}.out0`,
                    to: `${connectTo}.in0`
                });
            }
        };
        this.topToBottomRightZJoints.forEach(forEach.bind(this));
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
        if (componentId === 'D-FF') {
            device.type.libraryID = "beast-basic-compound";
            device.numInputs = 0;
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

    generateDeviceId() {
        return this.deviceId++;
    }

}

/*let expressions = {
    z: [],
    y: []
};
function exampleSmall() {
    expressions.z.push({
        name: 'z0',
        expression: '/z1z0/x1+/z1/z0/x1x0+z1z0x0+z1/z0/x1x0'
    });
    expressions.z.push({
        name: 'z1',
        expression: 'z1z0x0+z1/z0/x1x0+/z1z0x1+z1/z0x1'
    });
    expressions.y.push({
        name: 'y0',
        expression: '/z1z0x1+z1/z0x1'
    });
}*/
// expressions.y.push({
//     name: 'y0',
//     expression: '/z1x1'
// });
// expressions.y.push({
//     name: 'y1',
//     expression: 'z1x3x4x5'
// });
/*
function exampleBig() {
    expressions.z.push({
        name: 'z0',
        expression: 'z2x1+/z0z1x1z0+z1x2+z0x3+x10x1z1z2/x0'
    });
    expressions.z.push({
        name: 'z1',
        expression: '/z2&(z0z1x7+x1)'
    });
    expressions.z.push({
        name: 'z2',
        expression: 'z0z1x7+/x1+z0z1x7+/(z0z1x7+z0z1/x7)+z0z1x7z0z1x7z0z1x7z0z1x7z2+x0/x10'
    });
    expressions.z.push({
        name: 'z3',
        expression: '/z2&(z0z1x7+x1)'
    });
    expressions.z.push({
        name: 'z4',
        expression: '/z2&(z0z1x7+x1)'
    });
    expressions.z.push({
        name: 'z5',
        expression: '/z2&(z0z1x7+x1)'
    });
    expressions.y.push({
        name: 'y0',
        expression: 'z0z1'
    });
    expressions.y.push({
        name: 'y1',
        expression: 'z2&(/z0z2+z1)&/x10'
    });
    expressions.y.push({
        name: 'y2',
        expression: 'z2&(/z0z2+z1)&x1'
    });
    expressions.y.push({
        name: 'y3',
        expression: 'x1z2&(/z0z0+z0/x0)'
    });
    expressions.y.push({
        name: 'y4',
        expression: '/z2x1/x10'
    });
    expressions.y.push({
        name: 'y4',
        expression: '/z2x1/x10'
    });
    expressions.y.push({
        name: 'y4',
        expression: 'z1x10/x10'
    });
    expressions.y.push({
        name: 'y4',
        expression: 'x10/z0x1/x10'
    });
    expressions.y.push({
        name: 'y5',
        expression: 'x10/z0x1/x10'
    });
    expressions.y.push({
        name: 'y6',
        expression: 'x123/z0x1/x0'
    });
}

exampleSmall();
// console.log(expressions);
//
const result = JSON.stringify(convert(expressions, "Project"), null, 2);
// console.log(JSON.stringify(result, null, 2));
const fs = require('fs');
fs.writeFile('C:\\Users\\Swati\\Downloads\\beast.beast', result, function (err) {
    if (err) console.log(err)
});*/
