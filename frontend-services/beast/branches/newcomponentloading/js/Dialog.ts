/**
 * Created by maximilian on 12.05.17.
 */

class DialogManager
{
    dialogs : Array<Dialog> = [];
    
    private updateDialogs(currentdialog : Dialog, remove? : boolean)
    {
        const newDialogs : Array<Dialog> = [];
        for (let dialog of this.dialogs)
        {
            if (dialog !== currentdialog)
            {
                newDialogs.push(dialog);
            }
        }
        if (!remove)
        {
            newDialogs.push(currentdialog);
        }
        // renumber z-index
        $.each(newDialogs, function(i)
        {
            newDialogs[i].setZIndex(i);
        });
        this.dialogs = newDialogs;
    };
    
    add(dialog: Dialog) {this.updateDialogs(dialog)};
    remove(dialog: Dialog) {this.updateDialogs(dialog, true)};
    toFront(dialog: Dialog) {this.updateDialogs(dialog)};
}
const dialogManager = new DialogManager();


abstract class Dialog
{
    protected dragPoint: {x: number, y:number};
    protected dialog : JQuery;
    protected closeButton : JQuery;
    protected title : JQuery;
    protected Content : JQuery;
    
    constructor()
    {
    }
    
    get isOpen():boolean{
        return $.contains(document.documentElement, this.dialog.get(0));
    }
    
    public show() {
        this.title       = this.createTitle();
        this.closeButton = this.createCloseButton();
        this.createDialog();
    }
    
    protected abstract getTitle() : string
    
    protected abstract getContent() : JQuery
    
    private createCloseButton() : JQuery
    {
        const r    = 16;
        const pad  = 4;
        const $btn = SVGGraphics.createSVG(r, r)
                                .attr('class', 'simcir-dialog-close-button');
        const g    = new SVGGraphics.SVGGraphics($btn);
        g.drawRect(0, 0, r, r);
        g.attr['class'] = 'simcir-dialog-close-button-symbol';
        g.moveTo(pad, pad);
        g.lineTo(r - pad, r - pad);
        g.closePath();
        g.moveTo(r - pad, pad);
        g.lineTo(pad, r - pad);
        g.closePath();
        return $btn;
    }
    
    private createTitle() : JQuery
    {
        return $('<div></div>')
            .addClass('simcir-dialog-title')
            .text(this.getTitle())
            .css('cursor', 'default')
            .on('mousedown', function(event)
            {
                event.preventDefault();
            });
    }
    
    mouseDownHandler = (event: JQueryMouseEventObject) =>
    {
        if (!$(event.target)
                .hasClass('simcir-dialog') &&
            !$(event.target)
                .hasClass('simcir-dialog-title'))
        {
            return;
        }
        event.preventDefault();
        //dialogManager.toFront(this);
        var off   = this.dialog.offset();
        this.dragPoint = {
            x : event.pageX - off.left,
            y : event.pageY - off.top
        };
        $(document).on('mousemove', this.mouseMoveHandler);
        $(document).on('mouseup', this.mouseUpHandler);
    };
    
    
    protected  moveTo(x:number, y:number)
    {
        this.dialog.css({left : x + 'px', top : y + 'px'});
    };
    
    mouseMoveHandler = (event: JQueryMouseEventObject) =>
    {
        this.moveTo(
            event.pageX - this.dragPoint.x,
            event.pageY - this.dragPoint.y);
    };
    
    mouseUpHandler = (event: JQueryMouseEventObject) =>
    {
        $(document).off('mousemove', this.mouseMoveHandler);
        $(document).off('mouseup', this.mouseUpHandler);
    };
    
    
    private createDialog()
    {
        this.dialog = $('<div></div>')
            .addClass('simcir-dialog')
            .css({position : 'absolute'})
            .append(this.title.css('float', 'left'))
            .append(this.closeButton.css('float', 'right'))
            .append($('<br/>')
                        .css('clear', 'both'));
        this.dialog.append(this.getContent());
        
        $('BODY').append(this.dialog);
        dialogManager.add(this);
    
    
        this.dialog.on("mousedown",(event: JQueryMouseEventObject) => this.mouseDownHandler(event));
        
        this.closeButton.on('mousedown', () => this.close());
    
        const w = this.dialog.width();
        const h = this.dialog.height();
        const cw     = $(window).width();
        const ch     = $(window).height();
        const x      = (cw - w) / 2 + $(document).scrollLeft();
        const y      = (ch - h) / 2 + $(document).scrollTop();
        
        this.moveTo(x, y);
        this.dialog.find("input").first().focus();
    }
    
    setZIndex(zindex : number)
    {
        this.dialog.css('z-index', String(zindex));
    }
    
    close() {
        this.dialog.remove();
        dialogManager.remove(this);
    }
    
}
