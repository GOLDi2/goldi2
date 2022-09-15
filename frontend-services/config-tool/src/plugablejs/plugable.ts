import interact from 'interactjs';
import {html, LitElement, PropertyValueMap} from 'lit';
import {customElement, property, query, queryAll, queryAssignedElements, state} from 'lit/decorators.js';
import {Coordinate} from './coordinate';
import {closestViewport, PlugableViewport} from './viewport';

interface Point {
  x: number;
  y: number;
}

export interface Plugable extends HTMLElement {
  readonly getConnectPoint: (from: Point) => Point;
  readonly key: string;
  readonly compatible_plug_types: string[];
  readonly plug_types: string[];
  isPlugableTarget: boolean;
}

export interface Connection extends HTMLElement {
  elements: (Plugable | Coordinate)[];
}

interface Point {
  x: number;
  y: number;
}
export interface ConnectionCoordinates {
  center: Point;
  connectionPoints: Point[];
}

export function getConnectionLines(coordinates: ConnectionCoordinates) {
  const lines: {x1: number; y1: number; x2: number; y2: number; angle: number; length: number}[] = [];
  const calculate_line = (c1: Point, c2: Point) => {
    const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
    const length = Math.sqrt((c1.y - c2.y) ** 2 + (c1.x - c2.x) ** 2);
    lines.push({x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, angle: angle, length: length});
  };
  if (coordinates.connectionPoints.length === 2) {
    calculate_line(coordinates.connectionPoints[0], coordinates.connectionPoints[1]);
  } else {
    coordinates.connectionPoints.forEach(e => calculate_line(e, coordinates.center));
  }

  return lines;
}

export function getConnectionCoordinates(plugablesOrCoordinates: (PlugableElement | Point)[]) {
  const centerPoints = plugablesOrCoordinates.map(plugable => ('getCenter' in plugable ? plugable.getCenter() : plugable));

  let center = centerPoints.reduce((a, b) => ({x: a.x + b.x, y: a.y + b.y}), {x: 0, y: 0});
  center = {x: center.x / centerPoints.length, y: center.y / centerPoints.length};

  const connectionPoints = plugablesOrCoordinates.map(plugable =>
    'getConnectPoint' in plugable ? plugable.getConnectPoint(center) : plugable,
  );

  center = connectionPoints.reduce((a, b) => ({x: a.x + b.x, y: a.y + b.y}), {x: 0, y: 0});
  center = {x: center.x / centerPoints.length, y: center.y / centerPoints.length};

  return {center, connectionPoints};
}

export class PlugableReflectEvent extends CustomEvent<Plugable> {
  constructor(plugable: Plugable) {
    super('plugable-reflect', {
      detail: plugable,
      bubbles: true,
    });
  }
}

export class PlugableDragEvent extends CustomEvent<{enabled: false} | {element: Plugable; coordinate: Point} | {second_element: Plugable}> {
  constructor(detail: {enabled: false} | {element: Plugable; coordinate: Point} | {second_element: Plugable}) {
    super('plugable-drag', {
      detail: detail,
      bubbles: true,
    });
  }
}

export class PlugablePlugEvent extends CustomEvent<{element: Plugable}> {
  constructor(detail: {element: Plugable}) {
    super('plugable-plug', {
      detail: detail,
      bubbles: false,
    });
  }
}

function checkPlugable(element: any): element is Plugable {
  return element.getConnectPoint !== undefined && element.plug_types !== undefined && element.compatible_plug_types !== undefined;
}

@customElement('plugable-connection-point')
export class PlugableConnectionPoint extends LitElement {
  viewport: PlugableViewport;

  @property()
  isPlugableTarget: boolean;

  getCenter(): Point {
    const rect = this.getBoundingClientRect();
    if (this.viewport) {
      return this.viewport.clientToCanvas({x: rect.left + rect.width / 2, y: rect.top + rect.height / 2});
    }else{
      return {x: 0, y:0};
    }
  }

  render() {
    if (this.isPlugableTarget) {
      return html`<slot name="active"><slot /></slot>`;
    } else {
      return html`<slot />`;
    }
  }

  firstUpdated() {
    this.viewport = closestViewport(this);
    this.style.zIndex = '100';
  }
}

@customElement('plugable-plugable')
export class PlugableElement extends LitElement implements Plugable {
  @property()
  isPlugableTarget: boolean;

  @property()
  key: string;

  public get connectionPoints(): PlugableConnectionPoint[] {
    return Array.from(
      (this.renderRoot.firstElementChild as HTMLSlotElement)
        .assignedElements({flatten: true})
        .flatMap(e => Array.from(e.querySelectorAll('plugable-connection-point') as NodeListOf<PlugableConnectionPoint>)),
    );
  }

  @property()
  isTarget?: (element: Plugable) => boolean;

  @property()
  plug_types: string[];
  @property()
  compatible_plug_types: string[];
  viewport: PlugableViewport;

  requestUpdate(name?: PropertyKey, oldValue?: unknown) {
    if (name === '_slot') {
      console.log('slot changed');
    }
    if (name === 'isPlugableTarget') {
      if (this.connectionPoints && this.connectionPoints.length > 0) {
        this.connectionPoints.forEach(e => (e.isPlugableTarget = this.isPlugableTarget));
      }
    }
    super.requestUpdate(name, oldValue);
  }

  getCenter(): Point {
    const rect = this.getBoundingClientRect();
    return this.viewport.clientToCanvas({x: rect.left + rect.width / 2, y: rect.top + rect.height / 2});
  }

  getConnectPoint(from: Point): Point {
    if (this.connectionPoints && this.connectionPoints.length > 0) {
      const points = Array.from(this.connectionPoints).map(e => e.getCenter());
      const distances = points.map(p => Math.sqrt((p.x - from.x) ** 2 + (p.y - from.y) ** 2));
      return points[distances.indexOf(Math.min(...distances))];
    } else {
      return this.getCenter();
    }
  }

  render() {
    if (this.isPlugableTarget) {
      return html`<slot name="active"><slot /></slot>`;
    } else {
      return html`<slot />`;
    }
  }

  firstUpdated() {
    this.viewport = closestViewport(this);
    this.style.display = 'block';
    if (this.key === undefined) {
      throw new Error('PlugableElement must have a key');
    }
    if (this.plug_types === undefined) {
      throw new Error('PlugableElement must have plug_types');
    }
    if (this.compatible_plug_types === undefined) {
      throw new Error('PlugableElement must have compatible_plug_types');
    }
    interact(this)
      .styleCursor(false)
      .draggable({
        cursorChecker: false,
        onstart: event => {},
        onend: event => {
          this.dispatchEvent(new PlugableDragEvent({enabled: false}));
        },
        onmove: event => {
          this.dispatchEvent(
            new PlugableDragEvent({
              element: this,
              coordinate: this.viewport.clientToCanvas(new Coordinate(event.client.x, event.client.y)),
            }),
          );
        },
      });
    interact(this).dropzone({
      accept: ({dropzone, draggableElement}) => {
        const dropzoneElement = dropzone.target;
        if (!checkPlugable(dropzoneElement) || !checkPlugable(draggableElement)) return false;
        if (dropzoneElement.contains(draggableElement)) {
          return false;
        }
        const dropzone_compatible = draggableElement.plug_types.some(plug_type => dropzoneElement.compatible_plug_types.includes(plug_type));
        const dragable_compatible = dropzoneElement.plug_types.some(plug_type => draggableElement.compatible_plug_types.includes(plug_type));
        return dragable_compatible && dropzone_compatible;
      },
      ondropactivate: () => {
        console.log('ondropactivate');
        this.isPlugableTarget = true;
      },
      ondropdeactivate: () => {
        this.isPlugableTarget = false;
      },
      ondrop: event => {
        this.dispatchEvent(new PlugablePlugEvent({element: event.relatedTarget}));
      },
      ondragenter: event => {
        this.dispatchEvent(new PlugableDragEvent({second_element: this}));
      },
      ondragleave: event => {
        this.dispatchEvent(new PlugableDragEvent({second_element: undefined}));
      },
    });

    this.dispatchEvent(new PlugableReflectEvent(this));
  }
}
