/**
 * Created by maximilian on 22.05.17.
 */

namespace workspace {
    const RGBCOLOR_REGEX  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    
    
    export abstract class ParameterInput {
        ui: JQuery;
        abstract isValid(): boolean
        abstract getValue(): any
    }
    
    export interface ParameterInputClass {
        new (currentValue: any): ParameterInput
    }
    
    class StringParameterInput extends ParameterInput{
        input: JQuery;
        
        constructor(currenValue: any) {
            super();
            this.ui = this.input = $('<input type="text">');
            this.input.val(currenValue);
        }
        
        isValid() {
            return true;
        }
        
        getValue() {
            return this.input.val();
        }
    }
    
    class ColorParameterInput extends StringParameterInput{
        isValid() {
            return RGBCOLOR_REGEX.test(this.input.val());
        }
    }
    
    class NumberParameterInput extends StringParameterInput{
        isValid() {
            return !isNaN(this.input.val());
        }
        getValue() {
            return parseFloat(this.input.val());
        }
    }
    
    class IntegerParameterInput extends StringParameterInput{
        isValid() {
            let val = this.input.val();
            return val == parseInt(val);
        }
        getValue() {
            return parseInt(this.input.val());
        }
    }
    
    export const INPUTTYPES = {
        "string": StringParameterInput,
        "color": ColorParameterInput,
        "number": NumberParameterInput,
        "integer": IntegerParameterInput};
}
