class ResponseHandler {
    constructor(responseStream){
        if (isWriteableStream(responseStream)){
            this.res = responseStream;
        } else {
            console.log('Got a non writeable stream')
            throw new Error('non writeable stream detected')
        }
    }
    sendError(message){
        let msg = {
            'error':message
        }
        this.res.write(JSON.stringify(msg));
    }
    sendStdout(message){
        let msg = {
            'stdout':message
        }
        this.res.write(JSON.stringify(msg));
    }
    end(message){
        this.res.end(message);
    }
    setProgress(progress){

    }
    sendEstimate(progress){
        let msg = {
            'progress':progress
        }
        this.res.write(JSON.stringify(msg))
    }
    //TODO only for testing, remove later
    write(message){ 
        this.res.write(message);
    }
}
module.exports = ResponseHandler;

function isWriteableStream(obj) {
    return typeof obj.write === 'function' && typeof obj.end === 'function'
}