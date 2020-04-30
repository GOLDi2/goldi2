const Task = require('./task');

class Queue {
    //the function thats given via the constructor is the function the worker uses
    //needs to be async, so we can allow the worker to work on one task at a time
    constructor(fn) {
        this._queue = Array();
        this._fn = async function(task){
            await fn(task); 
        };
        this._isWorking = false;
    }
    //adds new task and starts working if not already working
    push(language, files, parameters, upload, sessionId, experimentId, resStream) {
        let estimate = 0;
        let task = new Task(language, files, parameters, resStream, estimate, upload, sessionId, experimentId, this);
        this._queue.push(task);
        if (!this._isWorking){
            this.work();
        }
    }
    // (unfinished) this is supposed to completely clear the queue and tell all clients why (reason)
    clear(reason) {
        //TODO stop working, send message to all tasks (reason);
        //TODO test this
        for(let i = 1; i < this._queue.length; i++){
            this._queue.splice(1,1);
        };
        this._queue[0].emit('connectionEnded');
    }
    shift() {
        this._queue.shift();
    }
    //gets the estimated time until finish for a given task 
    getAccumulatedEstimate(task){
        let accEstimate = 0;
        for(let i = 0; i < this._queue.length; i++){
            accEstimate += this._queue[i].getEstimate();
            if(task === this._queue[i]){
                return accEstimate;
            }
        }
        return 0;
    }
    //gets the total load of the balancer
    getCurrentLoad(){
        let load = 0;
        for(let i = 0; i < this._queue.length; i++){
            load += this._queue[i].estimate;
        }
        return load;
    }
    //removes the given task, does not work if the given task is currently being worked on
    removeTask(task){  //cant remove current task
        let index = this._queue.indexOf(task);
        if (index != -1 && index != 0) {
            this._queue.splice(index,1);
        }
        if(index == 0){
            console.log('cant remove the current task from queue');
        }
    }
    //worker
    async work(){
        console.log('worker started');
        this._isWorking = true;
        while (this._queue.length > 0){
            let currentTask = this._queue[0];
            await this._fn(currentTask);
            currentTask.clear();
            this.shift();
        }
        this._isWorking = false;
        console.log('Queue finished working')
    }
}
module.exports = Queue;

//TODO implement something for the estimate here 