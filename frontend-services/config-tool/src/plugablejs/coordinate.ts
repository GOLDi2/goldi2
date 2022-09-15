
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
