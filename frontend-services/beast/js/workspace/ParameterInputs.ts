/**
 * Created by maximilian on 22.05.17.
 */

namespace workspace {
    const RGBCOLOR_REGEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

    /**
     * Represents a Parameter input
     */
    export abstract class ParameterInput {
        readonly ui: JQuery;
        readonly validateFct: (value: any) => boolean;

        protected constructor(ui: JQuery, validateFct: (value: any) => boolean = () => true) {
            this.ui = ui;
            this.validateFct = validateFct;
        }

        /** Is called after the ui of the ParameterInput is attached to the DOM */
        initInput() {
        }

        /**
         * Is called to check whether the entered value is valid for this ParameterInput
         */
        isValid(): boolean {
            return this.validateFct(this.getValue());
        }

        /**
         * Is called to get the current value
         */
        abstract getValue(): any
    }

    /**
     * Defines the constructor of a ParameterInput
     */
    export interface ParameterInputClass {
        new(currentValue: any, validateFct: (value: any) => boolean): ParameterInput
    }

    /**
     * A ParameterInput for strings
     */
    class StringParameterInput extends ParameterInput {

        constructor(currentValue: any, validateFct?: (value: any) => boolean) {
            super($('<input type="text">'), validateFct);
            this.ui.val(currentValue);
        }

        getValue(): any {
            return this.ui.val();
        }
    }

    class MultiLineStringInput extends ParameterInput {
        constructor(currentValue: any, validateFct?: (value: any) => boolean) {
            super($('<textarea rows="4" cols="50"></textarea>'), validateFct);
            this.ui.val(currentValue);
            //Prevent Enter from closing the dialog unless shift is pressed
            this.ui.on("keydown", (event) => {
                if (event.keyCode == 13 && !event.shiftKey)
                    event.stopPropagation();
            });
        }

        getValue() {
            return this.ui.val();
        }
    };

    class ColorParameterInput extends StringParameterInput {
        initInput() {
            this.ui.spectrum(
                {
                    color: this.getValue(),
                    preferredFormat: "hex"
                });
        }

        isValid() {
            return RGBCOLOR_REGEX.test(this.getValue()) && super.isValid();
        }
    }

    /**
     * A ParameterInput for rational numbers
     */
    class NumberParameterInput extends StringParameterInput {
        isValid() {
            return !isNaN(this.getValue()) && super.isValid();
        }

        getValue() {
            return parseFloat(this.ui.val());
        }
    }

    /**
     * A integer ParameterInput
     */
    class IntegerParameterInput extends StringParameterInput {
        isValid() {
            const val = this.ui.val();
            return val == parseInt(val) && super.isValid();
        }

        getValue() {
            return parseInt(this.ui.val());
        }
    }

    export const INPUT_TYPES = {
        "string": StringParameterInput,
        "multilinestring": MultiLineStringInput,
        "color": ColorParameterInput,
        "number": NumberParameterInput,
        "integer": IntegerParameterInput
    };
}
