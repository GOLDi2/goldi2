/**
 * Created by maximilian on 22.05.17.
 */

namespace workspace {
    const RGBCOLOR_REGEX  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    
    /**
     * Represents a Parameter input
     */
    export abstract class ParameterInput {
        ui: JQuery;
    
        /** Is called after the ui of the ParameterInput is attached to the DOM */
        initInput() {}
    
        /**
         * Is called to check whether the entered value is valid for this ParameterInput
         */
        abstract isValid(): boolean
    
        /**
         * Is called to get the current value
         */
        abstract getValue(): any
    }
    
    /**
     * Defines the constructor of a ParameterInput
     */
    export interface ParameterInputClass {
        new (currentValue: any): ParameterInput
    }
    
    /**
     * A ParameterInput for strings
     */
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
    
    class MultilineStringInput extends ParameterInput{
        constructor(currenValue: any) {
            super();
            this.ui = $('<textarea rows="4" cols="50"></textarea>');
            this.ui.val(currenValue);
    
            //Prevent Enter from closing the dialog unless shift is pressed
            var keyDownHandler = function (event) {
                if( event.keyCode == 13 && !event.shiftKey )
                    event.stopPropagation();
            };
            this.ui.on("keydown", keyDownHandler);
        }
    
        isValid() {
            return true;
        }
    
        getValue() {
            return this.ui.val();
        }
    };
    
    class ColorParameterInput extends StringParameterInput{
        constructor(currentValue: any) {
            super(currentValue);
        }
        initInput() {
            this.input.spectrum(
                {color: this.input.val(),
                 preferredFormat: "hex"});
        }
        isValid() {
            return RGBCOLOR_REGEX.test(this.input.val());
        }
    }
    
    /**
     * A ParameterInput for rational numbers
     */
    class NumberParameterInput extends StringParameterInput{
        isValid() {
            return !isNaN(this.input.val());
        }
        getValue() {
            return parseFloat(this.input.val());
        }
    }
    
    /**
     * A integer ParameterInput
     */
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
        "multilinestring": MultilineStringInput,
        "color": ColorParameterInput,
        "number": NumberParameterInput,
        "integer": IntegerParameterInput};
}
