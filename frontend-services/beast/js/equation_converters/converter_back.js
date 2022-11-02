class ExpressionExtractor {

    extractExpressions(circuit, getComponent) {

        const expressions = [];
        const trees = this.buildTrees(circuit, getComponent);
        for (let i = 0; i < trees.length; i++) {
            const tree = trees[i];
            const expression = this.buildExpression(tree);
            expressions.push({
                output: "y" + i,
                expression: expression
            });
        }
        return expressions;
    }

    buildTrees(circuit, getComponent) {
        this.getComponent = getComponent;

        const devices = circuit.devices;
        const devicesMap = ExpressionExtractor.transformDevicesToMap(circuit.devices);
        const connectors = ExpressionExtractor.transformConnectorsToMap(circuit.connectors);
        const outputs = ExpressionExtractor.findAllOutputDevices(devices);

        const trees = [];
        for (let i = 0; i < outputs.length; i++) {
            if (!this.isCycled(outputs[i], connectors, devicesMap)) {
                const tree = this.buildTree(outputs[i], connectors, devicesMap);
                trees.push(tree.children[0]);
            }
        }
        return trees;
    }

    static findAllOutputDevices(devices) {
        const outputs = [];
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].type.componentID === 'LED' || devices[i].type.componentID === 'Out') {
                outputs.push(devices[i]);
            }
        }
        return outputs;
    }

    static transformConnectorsToMap(connectors) {
        const connectorsMap = new Map();
        for (let connector of connectors) {

            const {id: deviceId, port: devicePort} = ExpressionExtractor.getIdAndPort(connector.to);

            const {id: neighborId, port: neighborPort} = ExpressionExtractor.getIdAndPort(connector.from);

            if (!connectorsMap.has(neighborId)) {
                connectorsMap.set(neighborId, []);
            }
            connectorsMap.get(neighborId).push({
                port: neighborPort,
                neighborPort: devicePort,
                neighborId: deviceId
            });
        }
        // console.log(connectorsMap);
        return connectorsMap;
    }

    static getIdAndPort(connectorPart) {
        const toLastDotIndex = connectorPart.lastIndexOf('.');
        const deviceId = connectorPart.substring(0, toLastDotIndex);
        const devicePort = connectorPart.substring(toLastDotIndex + 1);
        return {id: deviceId, port: devicePort};
    }

    static transformDevicesToMap(devices) {
        const devicesMap = new Map();
        for (let device of devices) {
            devicesMap.set(device.id, device);

        }
        return devicesMap;
    }

    isCycled(device, connectors, devicesMap, visited = new Set()) {
        const neighbors = connectors.get(device.id);
        if (visited.has(device.id)) {
            throw new Error("Cycle detected");
        }
        visited.add(device.id);
        const self = this;
        if (neighbors) {
            // for (let neighbor of neighbors) {
            neighbors.forEach(function (neighbor) {
                self.isCycled(devicesMap.get(neighbor.neighborId), connectors, devicesMap, visited);
            });
        }
        visited.delete(device.id);
        return false;
    }

    buildTree(device, connectors, devicesMap) {
        const neighbors = connectors.get(device.id);
        const children = [];
        if (neighbors && device.type.componentID !== 'In') {
            // console.log(neighbors.length + " " + device.numInputs);
            if (device.numInputs !== undefined && neighbors.length !== device.numInputs) {
                throw new Error("Elements should not have empty inputs");
            }
            if (device.type.componentID === 'NOT' && device.numInputs > 1) {
                throw new Error("'NOT' can have only 1 child");
            }
            const self = this;
            neighbors.forEach(function (neighbor) {
                // const neighborId = neighbor.substring(0, neighbor.lastIndexOf('.'));
                const child = self.buildTree(devicesMap.get(neighbor.neighborId), connectors, devicesMap);
                children.push(child);
            });
        } else {
            let value = "";
            switch (device.type.componentID) {
                case 'Logic1':
                    value = 1;
                    break;
                case 'Logic0':
                    value = 0;
                    break;
                default:
                    if (device.label === undefined) {
                        throw new Error("Input should have name");
                    }
                    value = device.label;
            }
            return {type: "VAR", value: value, id: device.id};
        }

        if (device.type.componentID !== 'Joint') {

            if (ExpressionExtractor.isComponent(device)) {
                return this.replaceComponentWithSubtree(device, children);
            } else {
                return {type: device.type.componentID, children: children, id: device.id};
            }
        } else {
            if (children.length === 1) {
                return children[0];
            } else {
                throw new Error("Joint should have only 1 child");
            }
        }
    }

    static isComponent(device) {
        return device.type.libraryID !== 'beast-basic' && device.type.libraryID !== 'beast-compound'
    }

    replaceComponentWithSubtree(device, children) {
        const component = this.getComponent(device.type.libraryID, device.type.componentID);
        const tree = this.buildTrees(component, this.getComponent);

        const componentLeaves = this.takeLeavesFromTree(tree[0]);

        const map = new Map();
        let j = 0;
        for (let i = 0; i < componentLeaves.length; i++) {
            if (!map.has(componentLeaves[i].id)) {
                map.set(componentLeaves[i].id, j);
                j++;
            }
            const nodeChildrenIndex = map.get(componentLeaves[i].id);
            componentLeaves[i].type = children[nodeChildrenIndex].type;
            componentLeaves[i].value = children[nodeChildrenIndex].value;
            componentLeaves[i].children = children[nodeChildrenIndex].children;
            componentLeaves[i].id = children[nodeChildrenIndex].id;
        }
        return tree[0]
    }

    takeLeavesFromTree(node, leaves = []) {
        if (node.type === 'VAR') {
            leaves.push(node);
            return leaves;
        }
        for (let i = 0; i < node.children.length; i++) {
            this.takeLeavesFromTree(node.children[i], leaves)
        }
        return leaves;
    }

    buildExpression(node) {
        if (node.type === "VAR") {
            return node.value;
        } else {
            let expression = "";
            if (!ExpressionExtractor.typeIsOk(node.type)) {
                throw new Error("Unsupported device type '" + node.type + "'");
            }

            if (ExpressionExtractor.isNotAtFront(node)) expression += "/";

            const needParenthesis = ExpressionExtractor.shouldHaveParenthesis(node);
            if (needParenthesis) expression += "(";

            const self = this;
            node.children.forEach(function (child, i) {
                // add sign after first iteration to avoid such '+x1+x2'
                if (i > 0) expression += ExpressionExtractor.typeToSign(node.type);
                expression += self.buildExpression(child);
            });

            if (needParenthesis) expression += ")";
            return expression;
        }
    }

    static typeIsOk(type) {
        return [
            "OR", "NOT", "AND", "NAND", "NOR", "XNOR", "XNAND", "LED", "Out"
        ].includes(type);
    }

    static shouldHaveParenthesis(node) {
        return node.children.length > 1;
    }

    static isNotAtFront(node) {
        switch (node.type) {
            case "NOT":
                return true;
            case "NAND":
                return true;
            case "NOR":
                return true;
            case "XNOR":
                return true;
            default:
                return false;
        }
    }

    static typeToSign(type) {
        switch (type) {
            case "OR":
                return "+";
            case "AND":
                return "&";
            case "NOT":
                return "/";
            case "XOR":
                return "^";
            case "NAND":
                return "&";
            case "NOR":
                return "+";
            case "XNOR":
                return "^";
        }
    }
}

// const fs = require('fs');
// const data = fs.readFileSync('C:\\Users\\Swati\\Downloads\\beast.beast', 'utf8');
// const result = convertBack(data);
// console.log(JSON.stringify(result, null, 2));