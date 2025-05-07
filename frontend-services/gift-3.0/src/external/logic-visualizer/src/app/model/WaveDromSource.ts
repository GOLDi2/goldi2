
export class WaveDromSource {

    signal: Array<WaveDromLane | WaveDromGroup | {}> = [];
    hStar: string[] = [];
    vLines: string[] = [];
    config: {hscale} = {hscale: 2}; // usually 1 but due to shrinking the skin by 1/2, 2 is the new 1.
    indexMap: {inputs: number, states: number, outputs: number} = {inputs: undefined, states: undefined, outputs: undefined};

}

// only the first element can be a string
export class WaveDromGroup extends Array<string | WaveDromLane | WaveDromGroup | {}> {

    [index:number]: string | WaveDromLane | WaveDromGroup | {};

    constructor(groupName:string, entries: Array<WaveDromLane | WaveDromGroup | {}>) {
        super();
        this[0] = groupName;
        entries.forEach((value: (WaveDromLane | WaveDromGroup | {}), index: number) => {
            this[index+1] = value;
        })
    }

}

export class WaveDromLane {

    name: string;
    wave: string[] | string;
    data?: string[];

    constructor(name: string, wave: string[] | string, data?: string[]) {
        this.name = name;
        this.wave = wave;
        if(data){
            this.data = data;
        }
    }

}