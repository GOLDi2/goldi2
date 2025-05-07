// Code from: https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
export class SvgToPngConverter {

    private canvas: HTMLCanvasElement;
    private imgPreview: HTMLImageElement;
    private canvasCtx: CanvasRenderingContext2D;

    constructor() {
        this._init = this._init.bind(this);
        this._cleanUp = this._cleanUp.bind(this);
        this.convertFromInput = this.convertFromInput.bind(this);
    }

    _init() {
        this.canvas = document.createElement("canvas");
        this.imgPreview = document.createElement("img");
        // @ts-ignore
        this.imgPreview.style = "position: absolute; top: -9999px";

        document.body.appendChild(this.imgPreview);
        this.canvasCtx = this.canvas.getContext("2d");
    }

    _cleanUp() {
        document.body.removeChild(this.imgPreview);
    }

    convertFromInput(input, callback) {
        this._init();
        let _this = this;
        this.imgPreview.onload = function() {
            const img = new Image();
            _this.canvas.width = _this.imgPreview.clientWidth;
            _this.canvas.height = _this.imgPreview.clientHeight;
            img.crossOrigin = "anonymous";
            img.src = _this.imgPreview.src;
            img.onload = function() {
                _this.canvasCtx.drawImage(img, 0, 0);
                let imgData = _this.canvas.toDataURL("image/png");
                if(typeof callback == "function"){
                    callback(imgData)
                }
                _this._cleanUp();
            };
        };

        this.imgPreview.src = input;
    }
}