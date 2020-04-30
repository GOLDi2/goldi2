const ResponseHandler = require('./responseHandler');
const EventEmitter = require('events').EventEmitter;

class CompileTask extends EventEmitter{
    constructor (language, files, parameters, resStream, estimate, upload, sessionId, experimentId, queue) {
        super();
        this.language = language;
        this.files = files;
        this.parameters = parameters;
        this.resHandler = new ResponseHandler(resStream, this);
        this._estimate = estimate;
        this.upload = upload;
        this.sessionId = sessionId;
        this.experimentId = experimentId;
        this._queue = queue;

        this._sendAccumulatedEstimateInterval = setInterval(() => { //updates the estimate for this task every 2 seconds
            this.resHandler.estimate(this._queue.getAccumulatedEstimate(this));
        }, 2000);
    }
    setEstimate(newEstimate){
        this._estimate = newEstimate;
    }
    getEstimate(){
        return this._estimate;
    }
    clear(){ //clears the update Interval
        clearInterval(this._sendAccumulatedEstimateInterval);
    }
    removeFromQueue(){  //removes itself from queue, only works if its not the task thats currently being worked on
        this._queue.removeTask(this);
    }
    // not needed anymore (?)
    // connectionToClientEnded(){
    //     //TODO remove task from queue and stop working on it
    //     this.emit('connectionEnded');
    // }
}
module.exports = CompileTask;