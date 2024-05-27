export class TimelineData {
    constructor(name, initValue) {
        this.name = name;
        this.values = [initValue];
        this.meaningOfDot = initValue; // not using the dots results in a WaveDrom rendering glitch
        this.isVisible = true;
    }
    valueNow() {
        if (this.values[this.values.length - 1] === '.') {
            return this.meaningOfDot;
        }
        else if (this.values[this.values.length - 1] === undefined) {
            return "";
        }
        else {
            return this.values[this.values.length - 1];
        }
    }
    updateValue(val) {
        if (val === this.meaningOfDot && this.values.length > 1) {
            this.values[this.values.length - 1] = '.';
        }
        else {
            this.values[this.values.length - 1] = val;
        }
    }
    nextEntry() {
        if (this.values[this.values.length - 1] !== '.') {
            this.meaningOfDot = this.values[this.values.length - 1];
        }
        this.values.push('.');
    }
    removeAllDots() {
        let returnValue = [];
        let meaningOfDot = 'x';
        this.values.forEach((entry) => {
            if (entry === '.') {
                returnValue.push(meaningOfDot);
            }
            else {
                returnValue.push(entry);
                meaningOfDot = entry;
            }
        });
        return returnValue;
    }
}
//# sourceMappingURL=TimelineData.js.map