class Grid {
    inputs: number;
    outputs: number;
    columns: number;
    fixedAnd: boolean;
    fixedOr: boolean;
    lineDistance: number = 25;
    sectionBorder: number = this.lineDistance / 2;
    inputLineDist: number = 10;
    inputLines: { high: GridLine, low: GridLine, inLine: GridLine }[] = [];
    inputNodes: { high: GridNode[], low: GridNode[] }[] = [];
    verticalLines: GridLine[] = [];
    outputLines: GridLine[] = [];
    outputNodes: GridNode[][];
    inputPosition: number[] = [];
    outputPosition: number[] = [];
    outputLinks: string[] = [];
    inputLinks: string[] = [];

    constructor(numInputs: number, numColumns: number, numOutputs: number, fixedAnd: boolean, fixedOr: boolean) {
        this.inputs = numInputs;
        this.outputs = numOutputs;
        this.columns = numColumns;
        this.fixedAnd = fixedAnd;
        this.fixedOr = fixedOr;
    }

    setParams(inputs: number, outputs: number, columns: number = this.columns) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.columns = columns;
    }

    getSize() {
        const inputSpace = {
            width: (this.columns - 1) * this.lineDistance + this.sectionBorder * 2,
            height: (this.inputs - 1) * this.lineDistance + this.inputLineDist + this.sectionBorder * 2
        };
        const outputSpace = {
            width: inputSpace.width,
            height: (this.outputs - 1) * this.lineDistance + this.sectionBorder * 2
        };
        const border = {
            top: 15,
            left: 30,
            right: 30,
            bottom: 15
        };
        return {
            height: inputSpace.height + outputSpace.height + this.sectionBorder + border.top + border.bottom,
            width: inputSpace.width + border.left + border.right,
            border: border,
            inputSpace: inputSpace,
            outputSpace: outputSpace
        }
    }

    changeANDGrid(x: number, y: number, highActive: boolean) {
        if (highActive) {
            this.inputNodes[x].high[y].switchLink();
        }
        else {
            this.inputNodes[x].low[y].switchLink();
        }
    }

    changeORGrid(x: number, y: number) {
        this.outputNodes[x][y].switchLink();
    }

    getInputPositions(): number[] {
        return this.inputPosition;
    }

    getOutputPositions(): number[] {
        return this.outputPosition;
    }

    getInputLinks(): string[] {
        return this.inputLinks;
    }

    setInputLinks(inputs: string[]) {
        inputs.forEach((line, x) => {
            line = this.padEnd(line, this.columns, '-');
            const inputLine = this.inputNodes[this.inputs - x - 1];
            if (inputLine) {
                for (let i = 0; i < this.columns; ++i) {
                    const tvl = line.charAt(i);
                    inputLine.low[i].setLink(tvl == '0');
                    inputLine.high[i].setLink(tvl == '1');
                }
            }
            this.inputLinks[x] = line;
        });
    }

    getOutputLinks(): string[] {
        this.outputNodes.reverse().forEach((line, x) => {
            let lineStr = this.outputLinks[x] || '';
            line.reverse().forEach((node, y) => {
                lineStr = this.replaceAt(lineStr, y, node.isLinked() ? '1' : '0');
            });
            this.outputLinks[x] = lineStr;
            line.reverse();
        });
        this.outputNodes.reverse();
        return this.outputLinks.slice();
    }

    setOutputLinks(outputs: string[]) {
        outputs.forEach((numb, x) => {
            const outputLine = this.outputNodes[this.outputs - x - 1];
            if (outputLine) {
                for (let i = 0; i < this.columns; ++i) {
                    const node = outputLine[this.columns - i - 1];
                    if (node) {
                        node.setLink(numb.charAt(i) == '1');
                    }
                }
            }
        });
        this.outputLinks = outputs;
    }

    insertAt(str, index, insertStr) {
        return str.substr(0, index) + insertStr + str.substr(index);
    }

    replaceAt(str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    };

    padEnd(str, length, padStr) {
        while (str.length < length)
            str += padStr;
        return str;
    }

    drawNodes(svg: SVGGraphics.SVGGraphics, lines: number, fixed: boolean, nodeCbk: (linked: boolean, x: number, y: number) => void, x: number = 0, y: number = 0): GridNode[][] {
        const nodes: GridNode[][] = [];
        for (let i = 1; i <= lines; ++i) {
            nodes[i - 1] = [];
            for (let p = 1; p <= this.columns; ++p) {
                const circle = svg.drawCircle(x + p * this.lineDistance, y + i * this.lineDistance, 4);
                let styleCbk: (linked: boolean) => {};
                if (fixed) {
                    circle.css({'pointer-events': 'none', stroke: '#000000', 'stroke-width': 1.5, fill: 'none'});
                    styleCbk = (linked) => {
                        //TODO use opacity and fix bug
                        return {stroke: linked ? '#000000' : 'none'}
                    };
                }
                else {
                    circle.css({'pointer-events': 'all', cursor: 'pointer', stroke: 'none', fill: '#000000'});
                    styleCbk = (linked) => {
                        return {'fill-opacity': linked ? 1 : 0}
                    };
                }
                const node = new GridNode(circle, false, styleCbk, (linked) => nodeCbk(linked, i - 1, p - 1));
                circle.on('click', () => node.switchLink());
                nodes[i - 1].push(node);
            }
        }
        return nodes;
    }

    drawLines(svg: SVGGraphics.SVGGraphics, lines: number, posFct: (i: number) => { x1: number, y1: number, x2: number, y2: number }, valueFct: (line: GridLine, idx: number) => void = null): void {
        for (let i = 0; i < lines; ++i) {
            const pos = posFct(i);
            svg.moveTo(pos.x1, pos.y1);
            svg.lineTo(pos.x2, pos.y2);
            const path = svg.closePath(true);
            path.css('stroke-width', 1.5);
            valueFct(new GridLine(path), i);
        }
        //TODO Lines umgedreht -> überall anwenden
    }

    drawGrid(target: JQuery, x: number = 0, y: number = 0) {
        let svg = this.getChildSVG(target, 'grid-sections');
        const size = this.getSize();
        this.drawSection(svg, size.border.left, size.border.top, size.width - size.border.right, size.border.top + size.inputSpace.height);
        const outputStart = size.border.top + size.inputSpace.height + this.sectionBorder;
        this.drawSection(svg, size.border.left, outputStart, size.width - size.border.right, outputStart + size.outputSpace.height);
        //draw verticalLines
        svg = this.getChildSVG(target, 'grid-vertical');
        this.verticalLines = [];
        this.drawLines(svg, this.columns, (i) => {
            const x = size.border.left + this.sectionBorder + i * this.lineDistance;
            return {y1: size.border.top, y2: size.height - size.border.bottom, x1: x, x2: x};
        }, (value, idx) => {
            this.verticalLines[idx] = value;
        });
        //draw highInput
        svg = this.getChildSVG(target, 'grid-input');
        const xLowStart = [];
        this.drawLines(svg, this.inputs, (i) => {
            const y = i * this.lineDistance + size.border.top + this.sectionBorder;
            const yTri = y + this.inputLineDist / 2;
            const textSize = 12;
            const xText = textSize / 2 - 1;
            const yText = yTri - textSize / 3;
            svg.drawText(xText, yText, textSize, 'x' + (this.inputs - 1 - i));
            const xStart = this.drawInputTriangle(svg, size.border.left - 10, yTri);
            xLowStart.push(xStart.low);
            this.inputPosition[i] = yTri;
            return {y1: y, y2: y, x1: xStart.high, x2: size.width - size.border.right}
        }, (value, idx) => this.inputLines[idx] = {high: value, low: null, inLine: null});
        this.drawLines(svg, this.inputs, (i) => {
            return {y1: this.inputPosition[i], y2: this.inputPosition[i], x1: 0, x2: size.border.left - 10}
        }, (value, idx) => this.inputLines[idx].inLine = value);
        //draw lowInput
        this.drawLines(svg, this.inputs, (i) => {
            const y = i * this.lineDistance + this.inputLineDist + size.border.top + this.sectionBorder;
            return {y1: y, y2: y, x1: xLowStart[i], x2: size.width - size.border.right}
        }, (value, idx) => this.inputLines[idx].low = value);
        //triangle back to front
        svg.getTarget().children('.inputTriangle').appendTo(svg.getTarget());
        //draw highNodes
        this.inputLinks = new Array(this.inputs).fill('-'.repeat(this.columns));
        const highNodes = this.drawNodes(svg, this.inputs, this.fixedAnd, (linked, x, y) => {
            const idx = this.inputs - x - 1
            if (linked) {
                this.inputNodes[x].low[y].setLink(false);
                this.inputLinks[idx] = this.replaceAt(this.inputLinks[idx], y, '1');
            }
            else {
                this.inputLinks[idx] = this.replaceAt(this.inputLinks[idx], y, '-');
            }
            target.trigger('inputValueChange', true);
        }, size.border.left - this.sectionBorder, size.border.top - this.sectionBorder);
        //draw lowNodes
        const lowNodes = this.drawNodes(svg, this.inputs, this.fixedAnd, (linked, x, y) => {
            const idx = this.inputs - x - 1;
            if (linked) {
                this.inputNodes[x].high[y].setLink(false);
                this.inputLinks[idx] = this.replaceAt(this.inputLinks[idx], y, '0');
            }
            else {
                this.inputLinks[idx] = this.replaceAt(this.inputLinks[idx], y, '-');
            }
            target.trigger('inputValueChange', true);
        }, size.border.left - this.sectionBorder, size.border.top - this.sectionBorder + this.inputLineDist);
        lowNodes.forEach((value, idx) => {
            this.inputNodes[idx] = {high: highNodes[idx], low: lowNodes[idx]}
        });
        //draw output
        svg = this.getChildSVG(target, 'grid-output');
        this.drawLines(svg, this.outputs, (i) => {
            const y = i * this.lineDistance + outputStart + this.sectionBorder;
            this.outputPosition[i] = y;
            const textSize = 12;
            const text = 'y' + (this.outputs - 1 - i);
            const xText = size.width - 3 - textSize * 3 / 2;
            const yText = y - textSize / 3;
            svg.drawText(xText, yText, textSize, text);
            return {y1: y, y2: y, x1: size.border.left, x2: size.width}
        }, (value, idx) => this.outputLines[idx] = value);
        this.outputNodes = this.drawNodes(svg, this.outputs, this.fixedOr, () => target.trigger('inputValueChange', true), size.border.left - this.sectionBorder, outputStart - this.sectionBorder);
    }

    drawSection(svg: SVGGraphics.SVGGraphics, x: number, y: number, x2: number, y2: number) {
        const ele: JQuery = svg.drawRect(x, y, x2 - x, y2 - y);
        ele.css({
            fill: '#ffffff',
            'stroke-linejoin': 'round',
            stroke: '#000000',
            'stroke-dasharray': '5 4',
            'stroke-width': 1
        });
    }

    drawInputTriangle(svg: SVGGraphics.SVGGraphics, xOffset: number, yOffset: number): { high: number, low: number } {
        const triWidth = 1.5;
        const circleWidth = 0.5;
        const r = 1.5;
        const x = 9;
        const y = 7;
        const dy = y - this.inputLineDist / 2;
        const dx = dy * x / y;
        const alpha = Math.PI / 2 - Math.atan2(dx, dy);
        const xCircle2 = xOffset + dx + (r + triWidth / 2 + circleWidth / 2) / Math.sin(alpha);
        svg.drawCircle(xCircle2, yOffset + this.inputLineDist / 2, r).css({
            'stroke': '#000000',
            'stroke-width': circleWidth
        }).addClass('inputTriangle');
        svg.addPoint(xOffset, yOffset - y);
        svg.addPoint(xOffset + x, yOffset);
        svg.addPoint(xOffset, yOffset + y);
        svg.closePolygon().css({'stroke': '#000000', 'stroke-width': triWidth}).addClass('inputTriangle');
        const xHigh = xOffset + dx;
        return {high: xHigh, low: xCircle2};
    }

    protected getChildSVG(target: JQuery, clazz: string): SVGGraphics.SVGGraphics {
        const group = SVGGraphics.createSVGElement('g').addClass(clazz);
        target.append(group);
        return new SVGGraphics.SVGGraphics(group);
    }

    computeInput(inputs: boolean[]): boolean[] {

        this.inputLines.forEach((value, idx) => {
            value.high.setState(inputs[idx]);
            value.inLine.setState(inputs[idx]);
            value.low.setState(!inputs[idx])
        });

        this.inputLines = this.inputLines.reverse();

        const output = [];
        this.verticalLines.forEach((line, idx) => {
            let state = true;
            if (this.inputLinks.every(l => l.charAt(idx) === "-")) {
                state = false;
            } else {
                for (let x = 0; x < this.inputs; ++x) {
                    const char = this.inputLinks[x].charAt(idx);
                    if (!(char == '-' || char == (inputs[x] ? '1' : '0'))) {
                        state = false;
                        break;
                    }
                }
            }

            line.setState(state);
            this.outputNodes.forEach((nodes, index) => {
                if (state && nodes[idx].isLinked()) {
                    output[index] = state;
                }
            })
        });
        for (let i = 0; i < this.outputs; ++i) {
            this.outputLines[i].setState(output[i]);
        }
        return output;
    }
}

class GridNode {
    ui: JQuery;
    linked: boolean;
    styleCbk: (linked: boolean) => {};
    fctCbk: (linked: boolean) => void;

    constructor(ui: JQuery, state: boolean, styleCbk: (linked: boolean) => {}, fctCbk: (linked: boolean) => void) {
        this.ui = ui;
        this.styleCbk = styleCbk;
        this.fctCbk = fctCbk;
        this.linked = state;
        this.update();
    }

    switchLink(): boolean {
        this.setLink(!this.linked);
        return this.linked;
    }

    setLink(link: boolean) {
        this.linked = link;
        this.update();
        this.fctCbk(this.linked);
    }

    isLinked(): boolean {
        return this.linked;
    }

    update() {
        this.ui.css(this.styleCbk(this.linked));
    }
}

class GridLine {
    ui: JQuery;

    constructor(ui: JQuery) {
        this.ui = ui;
        this.setState(false);
    }

    setState(state: boolean) {
        this.ui.css({stroke: state ? '#ff0000' : '#000000'});
    }
}

class ROM extends Grid {
    constructor(inputs: number, outputs: number) {
        super(inputs, Math.pow(2, inputs), outputs, true, false);
    }

    drawGrid(target: JQuery) {
        super.drawGrid(target, 0, 0);
        const svg = this.getChildSVG(target, 'grid-kIndex');
        const size = this.getSize();
        const textSize = 10;
        for (let i = 0; i < this.columns; ++i) {
            for (let b = 0; b < this.inputs; ++b) {
                this.changeANDGrid(this.inputs - 1 - b, this.columns - 1 - i, ((i >> b) & 1) == 1);
            }
            const idx = i + 1;
            const yOffset = size.height - size.border.bottom / 2 + textSize / 2;
            svg.drawText(size.border.left - this.sectionBorder + idx * this.lineDistance - textSize / 2, yOffset, textSize, "k" + (this.columns - idx));
        }
    }

    setParams(inputs: number, outputs: number) {
        super.setParams(inputs, outputs, Math.pow(2, inputs));
    }
}

class PLA extends Grid {
    constructor(inputs: number, outputs: number, columns: number) {
        super(inputs, columns, outputs, false, false);
    }

    drawGrid(target: JQuery) {
        super.drawGrid(target, 0, 0);
    }
}

class GAL extends Grid {

    private linksPerOutput: number;
    private galLinks: string[];

    constructor(inputs: number, outputs: number, linksPerOutput: number) {
        super(inputs, outputs * linksPerOutput, outputs, false, true);
        this.linksPerOutput = linksPerOutput;
        this.galLinks = [];
    }

    drawGrid(target: JQuery) {
        super.drawGrid(target, 0, 0);
        let column = 0;
        for (let row = 0; row < this.outputs; ++row) {
            const end = column + this.linksPerOutput;
            for (; column < end; ++column) {
                this.changeORGrid(row, column);
            }
        }
    }

    setInputLinks(links: string[]) {
        const legacy = [];
        links.forEach((line, idx) => {
            let legLine = '';
            const blocks = line.split('|');
            blocks.forEach((block) => {
                for (let i = 0; i < this.linksPerOutput; ++i) {
                    legLine += block.charAt(i) || '-';
                }
            });
            legacy[idx] = legLine;
        });
        this.galLinks = links;
        super.setInputLinks(legacy);
        console.log(legacy);
    }

    getInputLinks(): string[] {
        //Save format
        //00-|--1|00-|1-0
        //11|-1|01|00
        const legacy = super.getInputLinks();
        const save = [];
        legacy.forEach((line, idx) => {
                const split = (this.galLinks[idx] || '').split('|');
                const blocks = this.columns / this.linksPerOutput;
                for (let blockIdx = 0; blockIdx < blocks; ++blockIdx) {
                    const startBlock = blockIdx * this.linksPerOutput;
                    for (let i = 0; i < this.linksPerOutput; ++i) {
                        const str = split[blockIdx] || '';
                        split[blockIdx] = this.replaceAt(str, i, line.charAt(startBlock + i));
                    }
                }
                save[idx] = split.join('|');
                console.log(idx, save[idx] + " // " + line);
            }
        );
        return save.concat(this.galLinks.slice(save.length));
    }

    setParams(inputs: number, outputs: number, linksPerOutput: number) {
        this.linksPerOutput = linksPerOutput;
        super.setParams(inputs, outputs, linksPerOutput * outputs);
    }
}