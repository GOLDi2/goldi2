class ResponseHandler {
    constructor (resstream, task) {
        this._res = resstream;
        this._task = task
        this._res.writeHead(200, {
            'Content-Type': 'application/json',
            //TODO send trailer after compilation ended
            'Trailer':'Compilation-Result-Code' 
        });
        this._res.on('close', () => { // Connection to client ended, also happens if the task is finished 
            console.log('Verbindung zu Client unterbrochen/beendet')
            this._task.emit('connectionEnded');
            this._task.removeFromQueue();
        })
    }
    end(string){
        this._task.clear();
        this._res.end(string);
    }
    stdout(stdout){
        this._write('stdout', stdout);
    }
    error(error){
        this._write('error', error);
    }
    estimate(estimate){
        this._write('estimate', estimate);
    }
    setEstimate(newEstimate){
        this._task.setEstimate(newEstimate);
    }
    getEstimate(){
        return this._task.getEstimate();
    }
    _write(type, message){
        let obj = {};
        obj[type] = message;
        this._res.write(JSON.stringify(obj));
    }
}
module.exports = ResponseHandler;