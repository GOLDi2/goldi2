import interact from "interactjs";

export interface Plugable extends HTMLElement {
    readonly getConnectPoint: (from: Coordinate) => Coordinate;
    readonly compatible: string[];
    readonly plug: (element: Plugable) => void;
    isPlugableTarget: boolean;
}

export class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromDOMRect(rect: DOMRect): Coordinate {
        return new Coordinate(rect.x + rect.width / 2, rect.y + rect.height / 2);
    }

    static add(...coordinates: Coordinate[]): Coordinate {
        return coordinates.reduce((a, b) => new Coordinate(a.x + b.x, a.y + b.y));
    }

    add(other: Coordinate): Coordinate {
        return new Coordinate(this.x + other.x, this.y + other.y);
    }

    sub(other: Coordinate): Coordinate {
        return new Coordinate(this.x - other.x, this.y - other.y);
    }

    normalize(divider: number): Coordinate {
        return new Coordinate(this.x / divider, this.y / divider);
    }
}

export interface Connection extends HTMLElement {
    elements: (Plugable | Coordinate)[];
}

export function getConnectionLines(container: HTMLElement, elements: (Plugable | Coordinate)[]) {
    const offset = Coordinate.fromDOMRect(container.getBoundingClientRect())

    let elementCoordinates = elements.map(e => checkPlugable(e) ? Coordinate.fromDOMRect(e.getBoundingClientRect()) : e);
    let center = Coordinate.add(...elementCoordinates).normalize(elementCoordinates.length);

    elementCoordinates = elements.map(e => checkPlugable(e) ? e.getConnectPoint(center) : e);

    elementCoordinates=elementCoordinates.map(e => e.sub(offset));
    center = Coordinate.add(...elementCoordinates).normalize(elementCoordinates.length);

    const lines: { x1: number, y1: number, x2: number, y2: number, angle: number, length: number }[] = [];
    const calculate_line = (c1: Coordinate,c2: Coordinate)=>{
        const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x)
        const length = Math.sqrt((c1.y - c2.y) ** 2 + (c1.x - c2.x) ** 2)
        lines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, angle: angle, length: length })
    }
    if(elementCoordinates.length===2){
        calculate_line(elementCoordinates[0],elementCoordinates[1]);
    }else{
        elementCoordinates.forEach(e=>calculate_line(e, center))
    }

    return lines;
}

export class PlugableReflectEvent extends CustomEvent<Plugable> {
    constructor(plugable: Plugable) {
        super('plugable-reflect', {
            detail: plugable,
            bubbles: true
        })
    }
}

export class PlugableDragEvent extends CustomEvent<{enabled: false} | {element: Plugable, coordinate: Coordinate}|{second_element: Plugable}> {
    constructor(detail: {enabled: false} | {element: Plugable, coordinate: Coordinate}|{second_element: Plugable}) {
        super('plugable-drag', {
            detail: detail,
            bubbles: true
        })
    }
}


function checkPlugable(element: any): element is Plugable {
    return element.getConnectPoint !== undefined && element.compatible !== undefined;
}

export function makePlugable(plugable: Plugable) {
    ;
    interact(plugable).styleCursor(false).draggable({
        cursorChecker: false,
        onstart: (event) => {
            console.log(event)
        },
        onend: (event) => {
            plugable.dispatchEvent(new PlugableDragEvent({enabled: false}));
        },
        onmove: (event) => {
            plugable.dispatchEvent(new PlugableDragEvent({element: plugable, coordinate: new Coordinate(event.client.x, event.client.y)}));
        }
    })
    interact(plugable).dropzone({
        accept: ({ dropzone, draggableElement }) => {
            const dropzoneElement = dropzone.target;
            if (!checkPlugable(dropzoneElement) || !checkPlugable(draggableElement)) return false;
            if (dropzoneElement.contains(draggableElement)) { return false; }
            return draggableElement.compatible.some(compatible => dropzoneElement.compatible.includes(compatible))
        },
        ondropactivate: () => {
            plugable.isPlugableTarget = true;
        },
        ondropdeactivate: () => {
            plugable.isPlugableTarget = false;
        },
        ondrop: (event) => {
            plugable.plug(event.relatedTarget);
        },
        ondragenter: (event) => {
            plugable.dispatchEvent(new PlugableDragEvent({second_element: plugable}));
        },
        ondragleave: (event) => {
            plugable.dispatchEvent(new PlugableDragEvent({second_element: undefined}));
        }
    })

    plugable.dispatchEvent(new PlugableReflectEvent(plugable));
}