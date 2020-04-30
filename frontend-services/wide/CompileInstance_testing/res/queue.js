class Queue {
    constructor (fn) {
        this.queue = Array();
        this.fn = async function(task){
            await fn(task);
        };
        this._isWorking = false;
    }
    addTask (task) {
        task = generateTaskValue(task);
        this.push(task);
        task.resStream.sendStdout('task arrived at Queue');
        if (!this._isWorking){
            this.work();
        }
    }
    clear () {
        this.queue = Array();
    }
    push (task) {
        this.queue.push(task);
    }
    // TODO needs testing when id is implemented in request
    removeTask (id) {
        for(let i = 0; i < this.getLength; i++) {
            if(this.queue[0].id == id) {
                this.queue.splice(i, 1);
            } 
        }
    }
    getLength () {
        return this.queue.length;
    }
    getValue () {
        let value = 0;
        for(let i = 0; i < this.getLength(); i++){
            value += this.queue[i].Estimate;
        }
        return value;
    }
    shift () {
        this.queue.shift();
    }
    async work() {
        this._isWorking = true;
        while(this.getLength() > 0){
            let currentTask = this.queue[0]
            console.log('starting a task')
            await this.fn(currentTask);
            this.shift();
            console.log('finished a task')
        }
        this._isWorking = false;
    }
    getAccumulatedEstimate (task) {
        let value = 0;
        for(let i = 0; i < this.queue.length; i++){
            value += this.queue[i].Estimate;
            if (task == this.queue[i]){
                return value;
            }
        }
        throw new Error('couldnt find the task in the queue');
    }
    getCurrentLoad() {
        let value = 0;
        for(let i = 0; i < this.queue.length; i++){
            value += this.queue[i].Estimate;
        }    
        return value;
    }
}
module.exports = Queue;


//Auslagern in .conf datei oder ähnliches
function generateTaskValue(task) {
    console.log('task.language: ' + task.language);
    switch (task.language) {
        case 'arduino':
            console.log('New task for arduino found, setting value to 10');
            task.updateEstimate(10);
            break;
        default: 
            console.log('language not implemented in valueGenerator, setting to default of 10');
            task.updateEstimate(10);
    }
    return task;
}