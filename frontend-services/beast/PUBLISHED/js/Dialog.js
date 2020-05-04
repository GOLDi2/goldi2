/**
 * Created by maximilian on 12.05.17.
 * Reworked by Dario Götze
 */
class Dialog {
    constructor(dialogOptions = {}) {
        this.buttons = [];
        this.keyListener = [];
        this.options = Object.assign({
            title: this.getTitle(),
            modal: true,
            show: true,
            hide: false,
            closeOnEscape: true,
            draggable: true,
            buttons: this.buttons,
            width: 'auto',
            close: () => this.close(),
            //A bit hacky
            open: () => $('.ui-button-icon.glyphicon')
                .removeClass('ui-button-icon ui-icon')
        }, dialogOptions);
    }
    /**
     *
     * @returns {boolean} true if the dialog is open
     */
    get isOpen() {
        return this.dialog && this._isOpen;
    }
    /**
     * Opens the dialog
     */
    show() {
        this.dialog = this.getContent()
            .dialog(this.options)
            .show();
        this.dialog.keypress((e) => {
            this.keyListener.forEach((value) => {
                value(e.which);
            });
        });
        if (this.options.modal) {
            Dialog.addOverlay();
        }
        this._isOpen = true;
    }
    /**
     * Adds a new dialog button
     * @param text button text
     * @param icon button icon
     * @param callback click callback
     * @param disabled button state
     */
    addButton(text, icon, callback, disabled = false) {
        if (icon == null) {
            throw 'Button icon is undefined!';
        }
        this.buttons.push({
            text: text,
            icon: icon,
            disabled: disabled,
            click: callback
        });
    }
    /**
     * Disable or enable a button
     * @param button button name
     * @param disabled true, if disable state
     */
    setButtonDisabled(button, disabled) {
        this.dialog
            .next('.ui-dialog-buttonpane')
            .find('button:contains("' + button + '")')
            .button('option', 'disabled', disabled);
    }
    /**
     * Adds a KeyListener
     * @param callBack callback with pressed key number
     */
    registerKeyListener(callBack) {
        this.keyListener.push(callBack);
    }
    simulateButtonClick(button) {
        this.dialog.find('button:contains("' + button + '")')
            .click();
    }
    /**
     * Close the dialog
     */
    close() {
        if (this.dialog) {
            if (this.options.modal) {
                Dialog.removeOverlay();
            }
            this.dialog.dialog('destroy');
            this._isOpen = false;
        }
    }
    /**
     * Adds the overlay
     */
    static addOverlay() {
        Dialog.overlayCount++;
        if (Dialog.overlayCount == 1) {
            this.overlay = $('<div class="beast-overlay"></div>')
                .appendTo('BODY');
            this.overlay.show();
        }
    }
    /**
     * Removes the overlay
     */
    static removeOverlay() {
        Dialog.overlayCount--;
        if (Dialog.overlayCount == 0) {
            this.overlay.remove();
        }
    }
}
Dialog.overlayCount = 0;
class InfoDialog extends Dialog {
    static showDialog(message) {
        new InfoDialog(message).show();
    }
    constructor(message) {
        super({ draggable: false });
        this.message = message;
    }
    getContent() {
        this.addButton('Ok', 'glyphicon glyphicon-ok', () => this.close());
        this.registerKeyListener((key) => {
            if (key == 13) {
                this.simulateButtonClick('Ok');
            }
        });
        return $('<p id="info-dialog"><b>' + this.message + '</b></p>');
    }
    getTitle() {
        return 'WARNING!';
    }
}
//# sourceMappingURL=Dialog.js.map