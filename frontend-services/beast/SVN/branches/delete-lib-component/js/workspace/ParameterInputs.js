/**
 * Created by maximilian on 22.05.17.
 */
var workspace;
(function (workspace) {
    const RGBCOLOR_REGEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    /**
     * Represents a Parameter input
     */
    class ParameterInput {
        /** Is called after the ui of the ParameterInput is attached to the DOM */
        initInput() { }
    }
    workspace.ParameterInput = ParameterInput;
    /**
     * A ParameterInput for strings
     */
    class StringParameterInput extends ParameterInput {
        constructor(currenValue) {
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
    class MultilineStringInput extends ParameterInput {
        constructor(currenValue) {
            super();
            this.ui = $('<textarea rows="4" cols="50"></textarea>');
            this.ui.val(currenValue);
            //Prevent Enter from closing the dialog unless shift is pressed
            var keyDownHandler = function (event) {
                if (event.keyCode == 13 && !event.shiftKey)
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
    }
    ;
    class ColorParameterInput extends StringParameterInput {
        constructor(currentValue) {
            super(currentValue);
        }
        initInput() {
            this.input.spectrum({ color: this.input.val(),
                preferredFormat: "hex" });
        }
        isValid() {
            return RGBCOLOR_REGEX.test(this.input.val());
        }
    }
    /**
     * A ParameterInput for rational numbers
     */
    class NumberParameterInput extends StringParameterInput {
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
    class IntegerParameterInput extends StringParameterInput {
        isValid() {
            let val = this.input.val();
            return val == parseInt(val);
        }
        getValue() {
            return parseInt(this.input.val());
        }
    }
    workspace.INPUTTYPES = {
        "string": StringParameterInput,
        "multilinestring": MultilineStringInput,
        "color": ColorParameterInput,
        "number": NumberParameterInput,
        "integer": IntegerParameterInput
    };
})(workspace || (workspace = {}));
//# sourceMappingURL=ParameterInputs.js.map