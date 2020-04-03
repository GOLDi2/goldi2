/**
 * Created by maximilian on 22.05.17.
 */
var workspace;
(function (workspace) {
    const RGBCOLOR_REGEX = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    class ParameterInput {
    }
    workspace.ParameterInput = ParameterInput;
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
    class ColorParameterInput extends StringParameterInput {
        isValid() {
            return RGBCOLOR_REGEX.test(this.input.val());
        }
    }
    class NumberParameterInput extends StringParameterInput {
        isValid() {
            return !isNaN(this.input.val());
        }
        getValue() {
            return parseFloat(this.input.val());
        }
    }
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
        "color": ColorParameterInput,
        "number": NumberParameterInput,
        "integer": IntegerParameterInput
    };
})(workspace || (workspace = {}));
//# sourceMappingURL=ParameterInputs.js.map