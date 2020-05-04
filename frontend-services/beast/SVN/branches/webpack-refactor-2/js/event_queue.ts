/**
 * Created by mseeber on 5/11/17.
 */


class EventQueue
{
    delay          = 50; // ms
    limit          = 40; // ms
    //TODO rewrite it so this is never null, maybe use "double buffering"
    private nextQueue = null;
    
    constructor()
    {
        this.timerHandler()
    }
    
    public postEvent(event)
    {
        if (this.nextQueue == null)
        {
            this.nextQueue = [];
        }
        this.nextQueue.push(event);
    };
    
    private dispatchEvent()
    {
        let queue   = this.nextQueue;
        this.nextQueue = null;
        while (queue.length > 0)
        {
            let e = queue.shift();
            e.target.trigger(e.type);
        }
    };
    
    private getTime()
    {
        return new Date().getTime();
    };
    
    private timerHandler()
    {
        let start      = this.getTime();
        let iterations = 0;
        //modified for better debugging: made timing-independant
        //replaced with a static iterations limit to prevent freezing caused by instable circuits
        while (this.nextQueue != null && iterations < 100)
        { //original code:  && getTime() - start < limit
            this.dispatchEvent();
            iterations += 1;
        }
        window.setTimeout(() =>this.timerHandler(),
                          Math.max(this.delay - this.limit, this.delay - (this.getTime() - start)));
    };
    
}

