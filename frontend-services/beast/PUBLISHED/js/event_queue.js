/**
 * Created by mseeber on 5/11/17.
 */
class EventQueue {
    constructor() {
        this.delay = 50; // ms
        this.limit = 40; // ms
        this.nextQueue = null;
        this.lateCallbackQueue = [];
        this.paused = false;
        this.timerHandler();
    }
    postEvent(event) {
        if (this.nextQueue == null) {
            this.nextQueue = [];
        }
        this.nextQueue.push(event);
    }
    ;
    postLateCallback(callback) {
        this.lateCallbackQueue.push(callback);
    }
    dispatchEvent() {
        let queue = this.nextQueue;
        this.nextQueue = null;
        while (queue.length > 0) {
            let e = queue.shift();
            e.target.trigger(e.type);
        }
    }
    ;
    getTime() {
        return new Date().getTime();
    }
    ;
    timerHandler() {
        let start = this.getTime();
        if (!this.paused) {
            let iterations = 0;
            //modified for better debugging: made timing-independant
            //replaced with a static iterations limit to prevent freezing caused by instable circuits
            while (this.nextQueue != null && iterations < 100) {
                this.dispatchEvent();
                iterations += 1;
            }
            for (const cb of this.lateCallbackQueue)
                cb();
            this.lateCallbackQueue = [];
        }
        window.setTimeout(() => this.timerHandler(), Math.max(this.delay - this.limit, this.delay - (this.getTime() - start)));
    }
    ;
}
//# sourceMappingURL=event_queue.js.map