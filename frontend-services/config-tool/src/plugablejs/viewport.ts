import {css, html, LitElement, PropertyDeclaration, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {Coordinate} from './coordinate';
import {Focusable, FocusableEvent} from './focusable';
import {ConnectionCoordinates, getConnectionCoordinates, PlugableDragEvent, PlugableElement, PlugableReflectEvent} from './plugable';

interface Point {
  x: number;
  y: number;
}

interface Camera {
  x: number;
  y: number;
  z: number;
}

interface Area {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

@customElement('plugable-viewport-scrollbar')
export class PlugableViewportScrollbar extends LitElement {
  static styles = css``;

  @property()
  bottom: boolean = false;

  @property()
  lower: number = NaN;

  @property()
  upper: number = NaN;

  createRenderRoot() {
    return this;
  }

  render() {
    if (this.upper == 1 && this.lower == 0) {
      return html``;
    }
    const style = this.bottom
      ? `left: ${this.lower * 100}%; right: ${(1 - this.upper) * 100}%`
      : `top: ${this.lower * 100}%; bottom: ${(1 - this.upper) * 100}%`;
    return html`
      <div class="scrollbar-track${this.bottom ? ' scrollbar-bottom' : null}">
        <div class="scrollbar-thumb" style=${style}></div>
      </div>
    `;
  }
}

function iterateDOMforFirstBlockElements(element: Element): Element[] {
  if (element.clientWidth > 0 || element.clientHeight > 0) {
    return [element];
  }
  if ('assignedElements' in element) {
    return (element as any).assignedElements().flatMap(iterateDOMforFirstBlockElements);
  }
  return Array.from(element.children).flatMap(iterateDOMforFirstBlockElements);
}

let globalViewport: PlugableViewport;
export function closestViewport(el: Element | Window | Document): PlugableViewport {
  return globalViewport;
}

@customElement('plugable-viewport')
export class PlugableViewport extends LitElement {
  static styles = css`
    #plugable-viewport-container {
      overflow: hidden;
      position: absolute;
      width: 100%;
      height: 100%;
    }

    #plugable-viewport-container > div {
      transform-origin: top left;
      position: relative
      width: 100%;
      height: 100%;
      display: inline-block;
    }

    .scrollbar-track {
      position: absolute;
      width: 8px;
      background: #ff000036;
      top: 10px;
      right: 10px;
      bottom: 20px;
      border-radius: 16px;
    }

    .scrollbar-bottom {
      height: 8px;
      width: initial;
      top: initial;
      right: 20px;
      left: 10px;
      bottom: 10px;
      border-radius: 16px;
    }

    .scrollbar-thumb {
      position: absolute;
      background: #00000036;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      border-radius: 16px;
    }
  `;

  constructor() {
    super();
    globalViewport = this;
  }

  @state()
  private camera: Camera = {x: 0, y: 0, z: 1};

  clientToCanvas(point: Point, camera_override: Partial<Camera> = {}): Point {
    const {left: referenceX, top: referenceY} = this.renderRoot.firstElementChild.getBoundingClientRect();
    const screenPoint: Point = {x: point.x - referenceX, y: point.y - referenceY};
    return this.toCanvas(screenPoint, camera_override);
  }

  private toCanvas(point: Point, camera_override: Partial<Camera> = {}): Point {
    const _camera = {...this.camera, ...camera_override};
    return {
      x: point.x / _camera.z - _camera.x,
      y: point.y / _camera.z - _camera.y,
    };
  }

  private panCamera(dx: number, dy: number) {
    this.camera = {
      x: this.camera.x - dx / this.camera.z,
      y: this.camera.y - dy / this.camera.z,
      z: this.camera.z,
    };
    this.recalculateVisibleArea();
  }

  @state()
  p1: Point = {x: 0, y: 0};
  @state()
  p2: Point = {x: 0, y: 0};
  private zoomCamera(point: Point, dz: number) {
    const zoom = this.camera.z - dz * this.camera.z;

    const p1 = this.toCanvas(point);
    const p2 = this.toCanvas(point, {z: zoom});

    this.p1 = p1;
    this.p2 = p2;

    this.camera = {
      x: this.camera.x + (p2.x - p1.x),
      y: this.camera.y + (p2.y - p1.y),
      z: zoom,
    };
    this.recalculateVisibleArea();
  }

  @state()
  private visibleArea?: Area;
  private recalculateVisibleArea() {
    const {width, height} = this.renderRoot.firstElementChild.getBoundingClientRect();
    const {x, y} = this.toCanvas({x: 0, y: 0});
    this.visibleArea = {
      bottom: y + height / this.camera.z,
      left: x,
      right: x + width / this.camera.z,
      top: y,
    };
  }

  @state()
  private contentArea?: Area;
  private recalculateContentArea() {
    const rect: {
      bottom?: number;
      left?: number;
      right?: number;
      top?: number;
    } = {};

    const contentDoms = iterateDOMforFirstBlockElements(this.renderRoot.querySelector('slot'));
    contentDoms.forEach(element => {
      const child_rect = element.getBoundingClientRect();
      rect.bottom = rect.bottom ? Math.max(rect.bottom, child_rect.bottom) : child_rect.bottom;
      rect.left = rect.left ? Math.min(rect.left, child_rect.left) : child_rect.left;
      rect.right = rect.right ? Math.max(rect.right, child_rect.right) : child_rect.right;
      rect.top = rect.top ? Math.min(rect.top, child_rect.top) : child_rect.top;
    });

    const {left: referenceX, top: referenceY} = this.renderRoot.firstElementChild.getBoundingClientRect();
    rect.left -= referenceX;
    rect.right -= referenceX;
    rect.top -= referenceY;
    rect.bottom -= referenceY;

    rect.left /= this.camera.z;
    rect.right /= this.camera.z;
    rect.top /= this.camera.z;
    rect.bottom /= this.camera.z;
    this.contentArea = rect as any;
  }

  @state()
  mouse_position: Point = {x: 0, y: 0};

  @property()
  renderConnection: (connection: ConnectionCoordinates) => TemplateResult;

  @state()
  plugables: {[key: string]: PlugableElement} = {};
  onPlugableReflectEvent(e: PlugableReflectEvent) {
    this.plugables = {...this.plugables, [e.detail.key]: e.detail as PlugableElement};
    this.updateCoordinates();
  }

  @property()
  connections: {keys: string[]}[] = [];

  @state()
  dragging?: {element: PlugableElement; coordinate: Coordinate; second_element?: PlugableElement};
  onPlugableDragEvent(e: PlugableDragEvent) {
    if ((e.detail as any).enabled === false) {
      this.dragging = undefined;
      this.updateCoordinates();
      return;
    }
    this.dragging = {...this.dragging, ...e.detail} as any;
    this.updateCoordinates();
  }

  @state()
  coordinates: ConnectionCoordinates[] = [];

  updateCoordinates() {
    const coordinates: ConnectionCoordinates[] = [];
    for (const connection of this.connections) {
      const plugables = connection.keys.map(key => this.plugables[key]).filter(e => e !== undefined);
      coordinates.push(getConnectionCoordinates(plugables));
    }
    //coordinates.forEach(c=> console.log(...c.connectionPoints))
    if (this.dragging && this.dragging.element) {
      coordinates.push(getConnectionCoordinates([this.dragging.element, this.dragging.second_element || this.dragging.coordinate]));
    }
    this.coordinates = coordinates;
  }

  requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration<unknown, unknown>) {
    if (name == 'connections') {
      this.updateCoordinates();
    }
    return super.requestUpdate(name, oldValue, options);
  }

  render() {
    const transform = `scale(${this.camera.z}) translate(${this.camera.x}px, ${this.camera.y}px)`;
    const contentArea = {
      top: Math.min(this.contentArea?.top, this.visibleArea?.top),
      left: Math.min(this.contentArea?.left, this.visibleArea?.left),
      right: Math.max(this.contentArea?.right, this.visibleArea?.right),
      bottom: Math.max(this.contentArea?.bottom, this.visibleArea?.bottom),
    };
    const scrollbarXLower = (this.visibleArea?.left - contentArea.left) / (contentArea.right - contentArea.left);
    const scrollbarXUpper = (this.visibleArea?.right - contentArea.left) / (contentArea.right - contentArea.left);
    const scrollbarYLower = (this.visibleArea?.top - contentArea.top) / (contentArea.bottom - contentArea.top);
    const scrollbarYUpper = (this.visibleArea?.bottom - contentArea.top) / (contentArea.bottom - contentArea.top);

    return html`
      <div
        id="plugable-viewport-container"
        @dragable-dragged="${() => {
          this.recalculateContentArea();
          this.updateCoordinates();
        }}">
        <div style="transform: ${transform};">
          <slot></slot>${this.renderConnection ? this.coordinates.map(this.renderConnection) : null}
        </div>
        <plugable-viewport-scrollbar lower=${scrollbarYLower} upper=${scrollbarYUpper} />
        <plugable-viewport-scrollbar bottom="true" lower=${scrollbarXLower} upper=${scrollbarXUpper} />
      </div>
    `;
    //<div style="position:absolute; top: ${this.mouse_position.y}px; left: ${this.mouse_position.x}px; width:  20px; height:20px; background: #0f0;">
  }

  firstUpdated() {
    this.addEventListener('plugable-reflect', this.onPlugableReflectEvent);
    this.addEventListener('plugable-drag', this.onPlugableDragEvent);
    this.addEventListener('focusable', this.onFocusableEvent);
    this.renderRoot.firstElementChild.addEventListener('wheel', this.onWheel);
    this.renderRoot.firstElementChild.addEventListener('mousemove', this.onMouse);
    this.recalculateContentArea();
    this.recalculateVisibleArea();
  }

  focusedElement?: Focusable;
  onFocusableEvent(e: FocusableEvent) {
    if(this.focusedElement===e.detail.element) return;
    if (this.focusedElement) {
      this.focusedElement.isFocused = false;
    }
    this.focusedElement = e.detail.element;
  }

  onWheel = (e: WheelEvent) => {
    const {left: referenceX, top: referenceY} = this.renderRoot.firstElementChild.getBoundingClientRect();
    const screenPoint: Point = {
      x: e.clientX - referenceX,
      y: e.clientY - referenceY,
    };

    if (e.ctrlKey) {
      e.preventDefault();
      this.zoomCamera(screenPoint, e.deltaY / 500);
    } else if (e.shiftKey) {
      e.preventDefault();
      this.panCamera(e.deltaY, 0);
    } else {
      e.preventDefault();
      this.panCamera(0, e.deltaY);
    }
  };

  onMouse = (e: MouseEvent) => {
    const old_mouse_position = this.mouse_position;

    const point: Point = {x: e.clientX, y: e.clientY};
    this.mouse_position = point;

    if (e.buttons & 4) {
      this.panCamera(old_mouse_position.x - point.x, old_mouse_position.y - point.y);
    }
  };
}
