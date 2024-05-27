export class WaveDromSource {
    constructor() {
        this.signal = [];
        this.hStar = [];
        this.vLines = [];
        this.config = { hscale: 2 }; // usually 1 but due to shrinking the skin by 1/2, 2 is the new 1.
        this.indexMap = { inputs: undefined, states: undefined, outputs: undefined };
    }
}
// only the first element can be a string
export class WaveDromGroup extends Array {
    constructor(groupName, entries) {
        super();
        this[0] = groupName;
        entries.forEach((value, index) => {
            this[index + 1] = value;
        });
    }
}
export class WaveDromLane {
    constructor(name, wave, data) {
        this.name = name;
        this.wave = wave;
        if (data) {
            this.data = data;
        }
    }
}
//# sourceMappingURL=WaveDromSource.js.map