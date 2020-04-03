/**
 * Created by maximilian on 12.05.17.
 */
class DialogManager {
    constructor() {
        this.dialogs = [];
    }
    updateDialogs(currentdialog, remove) {
        const newDialogs = [];
        for (let dialog of this.dialogs) {
            if (dialog !== currentdialog) {
                newDialogs.push(dialog);
            }
        }
        if (!remove) {
            newDialogs.push(currentdialog);
        }
        // renumber z-index
        $.each(newDialogs, function (i) {
            newDialogs[i].setZIndex(i);
        });
        this.dialogs = newDialogs;
    }
    ;
    add(dialog) { this.updateDialogs(dialog); }
    ;
    remove(dialog) { this.updateDialogs(dialog, true); }
    ;
    toFront(dialog) { this.updateDialogs(dialog); }
    ;
}
const dialogManager = new DialogManager();
class Dialog {
    constructor() {
        this.mouseDownHandler = (event) => {
            if (!$(event.target)
                .hasClass('simcir-dialog') &&
                !$(event.target)
                    .hasClass('simcir-dialog-title')) {
                return;
            }
            event.preventDefault();
            //dialogManager.toFront(this);
            var off = this.dialog.offset();
            this.dragPoint = {
                x: event.pageX - off.left,
                y: event.pageY - off.top
            };
            $(document).on('mousemove', this.mouseMoveHandler);
            $(document).on('mouseup', this.mouseUpHandler);
        };
        this.mouseMoveHandler = (event) => {
            this.moveTo(event.pageX - this.dragPoint.x, event.pageY - this.dragPoint.y);
        };
        this.mouseUpHandler = (event) => {
            $(document).off('mousemove', this.mouseMoveHandler);
            $(document).off('mouseup', this.mouseUpHandler);
        };
    }
    get isOpen() {
        return $.contains(document.documentElement, this.dialog.get(0));
    }
    show() {
        this.title = this.createTitle();
        this.closeButton = this.createCloseButton();
        this.createDialog();
    }
    createCloseButton() {
        const r = 16;
        const pad = 4;
        const $btn = SVGGraphics.createSVG(r, r)
            .attr('class', 'simcir-dialog-close-button');
        const g = new SVGGraphics.SVGGraphics($btn);
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
    createTitle() {
        return $('<div></div>')
            .addClass('simcir-dialog-title')
            .text(this.getTitle())
            .css('cursor', 'default')
            .on('mousedown', function (event) {
            event.preventDefault();
        });
    }
    moveTo(x, y) {
        this.dialog.css({ left: x + 'px', top: y + 'px' });
    }
    ;
    createDialog() {
        this.dialog = $('<div></div>')
            .addClass('simcir-dialog')
            .css({ position: 'absolute' })
            .append(this.title.css('float', 'left'))
            .append(this.closeButton.css('float', 'right'))
            .append($('<br/>')
            .css('clear', 'both'));
        this.dialog.append(this.getContent());
        $('BODY').append(this.dialog);
        dialogManager.add(this);
        this.dialog.on("mousedown", (event) => this.mouseDownHandler(event));
        this.closeButton.on('mousedown', () => this.close());
        const w = this.dialog.width();
        const h = this.dialog.height();
        const cw = $(window).width();
        const ch = $(window).height();
        const x = (cw - w) / 2 + $(document).scrollLeft();
        const y = (ch - h) / 2 + $(document).scrollTop();
        this.moveTo(x, y);
        this.dialog.find("input").first().focus();
    }
    setZIndex(zindex) {
        this.dialog.css('z-index', String(zindex));
    }
    close() {
        this.dialog.remove();
        dialogManager.remove(this);
    }
}
//# sourceMappingURL=Dialog.js.map