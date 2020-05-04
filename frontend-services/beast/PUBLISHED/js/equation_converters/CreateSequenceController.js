///<reference path="../d_ts/jquery.d.ts" />
///<reference path="../d_ts/jqueryui.d.ts" />
class CreateSequenceController {
    constructor() {
        this.equationsState = [];
        this.equationsOutput = [];
        this.dialog = new SequenceComponentCreationDialog();
    }
    setListeners() {
        // if (this.areListenersAdded) return;
        // this.areListenersAdded = true;
        const content = this.dialog.content;
        content.find("#AddStateButton")
            .on('click', this.addStatesLine.bind(this));
        content.find('#RemoveStateButton')
            .on('click', this.removeStatesLine.bind(this));
        content.find("#AddOutputButton")
            .on('click', () => { this.addOutputsLine(); });
        content.find('#RemoveOutputButton')
            .on('click', this.removeOutputsLine.bind(this));
        content.find('#SequenceReadyBtn')
            .on('click', this.retrieveEquations.bind(this));
        content.find('#outputsTabBtn')
            .on('click', this.showOutputs);
        content.find('#statesTabBtn')
            .on('click', this.showStates);
        content.find('#SequenceCancelBtn')
            .on('click', this.close.bind(this));
    }
    show() {
        // $('#sequence-params').show();
        this.dialog.show();
        this.setListeners();
    }
    close() {
        $('#sequence-params').hide();
        this.dialog.close();
        this.clear();
    }
    addOutputsLine() {
        this.equationsOutput.push('');
        this.redraw();
    }
    addStatesLine() {
        this.equationsState.push('');
        this.redraw();
    }
    removeOutputsLine() {
        if (this.equationsOutput.length < 1) {
            return;
        }
        this.equationsOutput.pop();
        this.redraw();
    }
    removeStatesLine() {
        if (this.equationsState.length < 1) {
            return;
        }
        this.equationsState.pop();
        this.redraw();
    }
    redraw() {
        let content = '';
        for (let i = 0; i < this.equationsOutput.length; i++) {
            content += '<div class="input-group">';
            content += '<span class="input-group-addon">y' + i + ' =&nbsp</span>';
            content += '<input rows="1" value="' + this.equationsOutput[i] + '" placeholder="Expression" style="display:inline-block; width:85%" type="text" ' +
                'class="form-control expression" data-name="' + i + '" data-type="output"></input>';
            content += '</div><br>';
        }
        this.dialog.content.find('#OutputEquationsWrapper').html(content);
        content = '';
        for (let i = 0; i < this.equationsState.length; i++) {
            content += '<div class="input-group">';
            content += '<span class="input-group-addon">z' + i + ' =&nbsp</span>';
            content += '<input rows="1" value="' + this.equationsState[i] + '" placeholder="Expression" style="display:inline-block; width:85%" type="text" ' +
                'class="form-control expression" data-name="' + i + '" data-type="state"></input>';
            content += '</div><br>';
        }
        this.dialog.content.find('#StateEquationsWrapper').html(content);
        const eqO = this.equationsOutput;
        const eqS = this.equationsState;
        $(".expression").on("change paste keyup", function () {
            const elem = $(this);
            if (elem.data('type') === 'output') {
                eqO[elem.data('name')] = elem.val();
            }
            else if (elem.data('type') === 'state') {
                eqS[elem.data('name')] = elem.val();
            }
        });
    }
    retrieveEquations() {
        const errors = this.checkForErrors();
        if (errors.length > 0) {
            this.onError(errors);
            return;
        }
        const equations = {
            z: [],
            y: []
        };
        this.equationsOutput.forEach((value, index) => {
            equations.y.push({
                name: 'y' + index,
                expression: value
            });
        });
        this.equationsState.forEach((value, index) => {
            equations.z.push({
                name: 'z' + index,
                expression: value
            });
/*            equations.y.push({
                name: 'z' + index,
                expression: 'z' + index
            });*/
        });
        this.onSubmit($('#ComponentNameInput').val(), equations);
    }
    checkForErrors() {
        let errors = [];
        if (this.equationsOutput.length < 1) {
            errors.push('There should be at least 1 output expression');
        }
        if (this.equationsState.length < 1) {
            errors.push('There should be at least 1 state expression');
        }
        this.equationsOutput.forEach((value, index) => {
            if (value.length < 1) {
                errors.push('Expression y' + index + ' can\'t be empty');
                return;
            }
        });
        this.equationsState.forEach((value, index) => {
            if (value.length < 1) {
                errors.push('Expression z' + index + 'can\'t be empty');
                return;
            }
        });
        if ($('#ComponentNameInput').val().length < 1) {
            errors.push('Component should have a name');
        }
        return errors;
    }
    showOutputs() {
        $('#outputs')
            .show();
        $('#states')
            .hide();
    }
    showStates() {
        $('#states')
            .show();
        $('#outputs')
            .hide();
    }
    clear() {
        this.equationsState = [];
        this.equationsOutput = [];
        this.redraw();
    }
}
class SequenceComponentCreationDialog extends Dialog {
    constructor() {
        super({
            width: '80%',
            height: 700
        });
        this.confimedEvent = () => {
            const val = this.nameInput.val();
            if (val.length != 0) {
                this.close();
            }
        };
    }
    getTitle() {
        return 'Create new component';
    }
    getContent() {
        this.content = $('<div></div>');
        this.content.append(' <div id="sequence-params">\n' +
            '            <!-- Nav tabs -->\n' +
            '            <ul class="nav nav-tabs nav-justified" role="tablist">\n' +
            '               \t<li class="active"><a id="outputsTabBtn" href="#outputs" role="tab" data-toggle="tab">Outputs y</a></li>\n' +
            '                <li><a id="statesTabBtn" href="#states" role="tab" data-toggle="tab">States z</a></li>\n' +
            '            </ul>\n' +
            '\n' +
            '            <div class="sequence-wrapper">\n' +
            '                <div class="equations-wrapper">\n' +
            '                <div class="tab-pane fade in active" id="outputs" >\n' +
            '                    <div id="OutputEquationsWrapper" class="equationsGroup"></div>\n' +
            '                    <div class="btn-group controlButtons">\n' +
            '                        <button id="AddOutputButton" type="button" class="btn btn-default" >\n' +
            '                            <span class="glyphicon glyphicon-plus"></span>\n' +
            '                        </button>\n' +
            '                        <button id="RemoveOutputButton" type="button" class="btn btn-default" >\n' +
            '                            <span class="glyphicon glyphicon-remove"></span>\n' +
            '                        </button>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div id="states">\n' +
            '                    <div id="StateEquationsWrapper" class="equationsGroup"></div>\n' +
            '                    <div class="btn-group controlButtons">\n' +
            '                        <button id="AddStateButton" type="button" class="btn btn-default">\n' +
            '                            <span class="glyphicon glyphicon-plus"></span>\n' +
            '                        </button>\n' +
            '                        <button id="RemoveStateButton" type="button" class="btn btn-default" >\n' +
            '                            <span class="glyphicon glyphicon-remove"></span>\n' +
            '                        </button>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                </div>\n' +
            '                <div id="SubmitSequenceWrapper">\n' +
            '                    <input type="text" placeholder="Component name" class="form-control" id="ComponentNameInput" >\n' +
            '                    <button id="SequenceReadyBtn" type="button" class="btn btn-default" style="display:inline-block"\n' +
            '                            title="Submit">Submit</button>\n' +
            '                    <button id="SequenceCancelBtn" type="button" class="btn btn-default" style="display:inline-block"\n' +
            '                            title="Cancel">Cancel</button>\n' +
            '                </div>\n' +
            '\n' +
            '            </div>\n' +
            '\n' +
            '    </div>');
        return this.content;
    }
}
//# sourceMappingURL=CreateSequenceController.js.map