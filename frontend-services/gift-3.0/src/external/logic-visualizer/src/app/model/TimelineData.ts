export class TimelineData {

    name: string;
    values: string[]; // every entry is half a clock cycle, values should always have an uneven number of entries (even + init)
    meaningOfDot: string;
    isVisible: Boolean;

    constructor(name: string, initValue: string) {
        this.name           = name;
        this.values         = [initValue];
        this.meaningOfDot   = initValue; // not using the dots results in a WaveDrom rendering glitch
        this.isVisible      = true;
    }

    valueNow() {
        if(this.values[this.values.length - 1] === '.'){
            return this.meaningOfDot;
        } else if(this.values[this.values.length - 1] === undefined){
            return "";
        } else {
            return this.values[this.values.length - 1];
        }
    }

    updateValue(val: string) { // meaningOfDot is not set here so that if the value is updated again to the original value we write a "." again
        if(val === this.meaningOfDot && this.values.length > 1) {
            this.values[this.values.length-1] = '.';
        } else {
            this.values[this.values.length-1] = val;
        }
    }

    nextEntry() {
        if(this.values[this.values.length - 1] !== '.'){
            this.meaningOfDot = this.values[this.values.length - 1];
        }
        this.values.push('.');
    }

    removeAllDots() {
        let returnValue = [];
        let meaningOfDot = 'x';
        this.values.forEach((entry: string) => {
            if(entry === '.') {
                returnValue.push(meaningOfDot);
            } else {
                returnValue.push(entry);
                meaningOfDot = entry;
            }
        });
        return returnValue;
    }
}