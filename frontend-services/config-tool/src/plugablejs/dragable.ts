import interact from 'interactjs';
import {Coordinate} from './coordinate';
import {closestViewport} from './viewport';

export interface Dragable extends HTMLElement {
  position: Coordinate;
}

type DragableConfig = {
  scaleObject: {scale: number};
};

export class DragableReflectEvent extends CustomEvent<{
  dragable: Dragable;
}> {
  constructor(dragable: Dragable) {
    super('dragable-reflect', {
      detail: {dragable},
      bubbles: true,
    });
  }
}

export class DragableDragged extends CustomEvent<{dragable: Dragable}> {
  constructor(dragable: Dragable) {
    super('dragable-dragged', {
      detail: {dragable},
      bubbles: true,
    });
  }
}

export function makeDragable(dragable: Dragable) {
  let start_position_mouse: any;
  const start_position = new Coordinate(0, 0);
  const viewport = closestViewport(dragable);
  interact(dragable).draggable({
    onstart: event => {
      start_position_mouse = viewport.clientToCanvas(new Coordinate(event.client.x, event.client.y));
      start_position.x = dragable.position.x;
      start_position.y = dragable.position.y;
    },
    onmove: event => {
      const position_mouse = viewport.clientToCanvas(new Coordinate(event.client.x, event.client.y));
      dragable.position = start_position.add(
        new Coordinate(position_mouse.x - start_position_mouse.x, position_mouse.y - start_position_mouse.y),
      );
      dragable.dispatchEvent(new DragableDragged(dragable));
    },
    onend: event => {
      dragable.dispatchEvent(new DragableDragged(dragable));
    }
  });
  dragable.dispatchEvent(new DragableReflectEvent(dragable));
}
