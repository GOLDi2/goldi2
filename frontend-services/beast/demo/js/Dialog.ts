/**
 * Created by maximilian on 12.05.17.
 * Reworked by Dario Götze
 */

abstract class Dialog
{
    protected buttons : Array<any>;
    protected keyListener : Array<Function>;
    protected dialog : JQuery;
    private _isOpen : boolean;
    protected options : any;
    
    private static overlay : JQuery;
    private static overlayCount : number = 0;
    
    constructor(dialogOptions : any = {})
        {
            this.buttons     = [];
            this.keyListener = [];
            this.options     = Object.assign({
                                                 title         : this.getTitle(),
                                                 modal         : true,
                                                 show          : true,
                                                 hide          : false,
                                                 closeOnEscape : true,
                                                 draggable     : true,
                                                 buttons       : this.buttons,
                                                 width         : 'auto',
                                                 close         : () =>
                                                 {
                                                     this.destroy();
                                                 },
                                                 open          : function()
                                                 {
                                                     //A bit hacky
                                                     $('.ui-button-icon.glyphicon')
                                                         .removeClass('ui-button-icon ui-icon');
                                                 }
                                             }, dialogOptions);
        }
    
    /**
     *
     * @returns {boolean} true if the dialog is open
     */
    get isOpen() : boolean
        {
            return this.dialog && this._isOpen;
        }
    
    /**
     * Opens the dialog
     */
    public show()
        {
            this.dialog = this.getContent()
                              .dialog(this.options)
                              .show();
            
            this.dialog.keypress((e) =>
                                 {
                                     this.keyListener.forEach((value) =>
                                                              {
                                                                  value(e.which);
                                                              });
                                 });
            if (this.options.modal)
            {
                Dialog.addOverlay();
            }
            this._isOpen = true;
        }
    
    /**
     * get the title of the dialog
     */
    protected abstract getTitle() : string
    
    /**
     * get the content of the dialog
     */
    protected abstract getContent() : JQuery
    
    /**
     * Adds a new dialog button
     * @param text button text
     * @param icon button icon
     * @param callback click callback
     * @param disabled button state
     */
    public addButton(text : string, icon : string, callback : () => void, disabled : boolean = false)
        {
            if (icon == null)
            {
                throw 'Button icon is undefined!';
            }
            this.buttons.push({
                                  text     : text,
                                  icon     : icon,
                                  disabled : disabled,
                                  click    : callback
                              });
        }
    
    /**
     * Disable or enable a button
     * @param button button name
     * @param disabled true, if disable state
     */
    public setButtonDisabled(button : string, disabled : boolean) : void
        {
            this.dialog
                .next('.ui-dialog-buttonpane')
                .find('button:contains("' + button + '")')
                .button('option', 'disabled', disabled);
        }
    
    /**
     * Adds a KeyListener
     * @param callBack callback with pressed key number
     */
    public registerKeyListener(callBack : (key : number) => void)
        {
            this.keyListener.push(callBack);
        }
    
    /**
     * Close the dialog
     */
    public close()
        {
            if (this.dialog)
            {
                this.dialog.dialog('close');
            }
        }
    
    /**
     * Destroy the dialog
     */
    private destroy()
        {
            if (this.options.modal)
            {
                Dialog.removeOverlay();
            }
            this.dialog.dialog('destroy');
            this._isOpen = false;
        }
    
    /**
     * Adds the overlay
     */
    private static addOverlay()
        {
            Dialog.overlayCount++;
            if (Dialog.overlayCount == 1)
            {
                this.overlay = $('<div class="beast-overlay"></div>')
                    .appendTo('BODY');
                this.overlay.show();
            }
        }
    
    /**
     * Removes the overlay
     */
    private static removeOverlay()
        {
            Dialog.overlayCount--;
            if (Dialog.overlayCount == 0)
            {
                this.overlay.remove();
            }
        }
    
}


class InfoDialog extends Dialog
{
    public static showDialog(message : string)
        {
            new InfoDialog(message).show();
        }
    
    private message : string;
    
    private constructor(message : string)
        {
            super({draggable : false});
            this.message = message;
        }
    
    protected getContent() : JQuery
        {
            this.addButton('Ok', 'glyphicon glyphicon-ok', () =>
            {
                this.close();
            });
            this.registerKeyListener((key : number) =>
                                     {
                                         if (key == 13)
                                         {
                                             this.close();
                                         }
                                     });
            return $('<p id="info-dialog"><b>' + this.message + '</b></p>');
        }
    
    protected getTitle() : string
        {
            return 'WARNING!';
        }
}
