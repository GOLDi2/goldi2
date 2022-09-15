export interface Focusable extends HTMLElement {
  isFocused: boolean;
}

export class FocusableEvent extends CustomEvent<{
  element: Focusable;
}> {
  constructor(element: Focusable) {
    super('focusable', {
      detail: {element},
      bubbles: true,
      composed: true,
    });
  }
}

export function makeFocusable(focusable: Focusable, clickable?: HTMLCollection | HTMLElement | HTMLElement[] | ShadowRoot) {
  if (!clickable) {
    clickable = focusable;
  }
  if ((clickable as HTMLCollectionOf<HTMLElement>).length === undefined) {
    clickable = [clickable as HTMLElement];
  } else {
    clickable = Array.from(clickable as HTMLCollection).filter((e) => e instanceof HTMLElement) as HTMLElement[];
  }
  clickable.forEach(element => {
    element.addEventListener('mousedown', () => {
      focusable.isFocused = true;
      focusable.dispatchEvent(new FocusableEvent(focusable));
    });
  });
}
