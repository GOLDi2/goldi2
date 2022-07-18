/**
 * Created by Stephen on 16.11.2015.
 */

/**
 *
 * @param machinenumber
 * @constructor
 */
function GiftState(inputside,operatorslist){
    var machinearray = createArray(0);
    var highestmachinenumber = -1;
    var inputmode = 0;
    var currenttab = 0;
    var lastmachineused = -1;
    var inputside = inputside;
    var operators = operatorslist;
    var currentgraphtab = 0;
    var yequations = [];
    var yequationsminimized = [];

    /**
     * Contains the curret tab of the graph chosen.
     * @property CurrentGraphTab
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'CurrentGraphTab', {
        get: function () {
            return currentgraphtab;
        },
        set:function(val) {
            currentgraphtab = val;
        }
    });


    /**
     * Contains the operatorslist.
     * @property OperatorList
     * @type array
     */
    Object.defineProperty(this, 'OperatorsList', {
        get: function () {
            return operators;
        },
        set: function (list) {
            operators = list;
        }
    });


    /**
     * Contains wether the input is open or not.
     * @property InputSide
     * @type bool
     * @default ""
     */
    Object.defineProperty(this, 'InputSide', {
        get: function () {
            return inputside;
        }
    });

    /**
     * Contains the input mode of the gift system.
     * @property InputMode
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'InputMode', {
        get: function () {
            return inputmode;
        },
        set:function(val) {
            inputmode = val;
        }
    });


    /**
     * Contains the curret tab of the gift system.
     * @property CurrentTab
     * @type string
     * @default ""
     */
    Object.defineProperty(this, 'CurrentTab', {
        get: function () {
            return currenttab;
        },
        set:function(val) {
            currenttab = val;
        }
    });

    /**
     * Gets the highest machine number available.
     * @method getHighestMachineNumber
     * @return {integer} Machine number of the last machine added.
     * @example
     *      //assuming you already defined the machines: machine0 machine1 machine2
     *      var giftstate = new GiftState();
     *
     *      giftstate.pushMachine(machine0);
     *      giftstate.pushMachine(machine1);
     *      giftstate.pushMachine(machine2);
     *
     *      // Result will be 3
     *      var number = giftstate.getHighstMachineNumber();
     */
    this.getHighestMachineNumber = function () {
        return highestmachinenumber;
    };


    /**
     * Pushes a machine to the queue.
     * @method pushMachine
     * @param  {DataType} Machine to push to queue.
     * @example
     *      //assuming you already defined the machines: machine0 machine1 machine2
     *      var giftstate = new GiftState();
     *
     *      giftstate.pushMachine(machine0);
     *      giftstate.pushMachine(machine1);
     *      giftstate.pushMachine(machine2);
     *
     */
    this.pushMachine = function(machine){
        highestmachinenumber++;

        machine.MachineNumber = highestmachinenumber;
        machinearray.push(machine);
        resetYEquations();
    };


    /**
     * Gets the machine with the machine number given to the function.
     * @method getMachine
     * @param  {integer} Machine number of the machine wanted.
     * @return {DataType} Machine with the id wanted.
     * @example
     *      //assuming you already defined the machines: machine0 machine1 machine2
     *      var giftstate = new GiftState();
     *
     *      giftstate.pushMachine(machine0);
     *      giftstate.pushMachine(machine1);
     *      giftstate.pushMachine(machine2);
     *
     *
     *      // result is machine1
     *      var machine = giftstate.getMachine(1);
     *
     */
    this.getMachine = function (number){
        if(number > highestmachinenumber || highestmachinenumber < 0){
            throw new Error("No machine with this number found: " + number);
        }
        lastmachineused = number;

        return machinearray[number];
    };


    /**
     * Gets the last machine number which was returned by getMachine().
     * @method getMachineNumberLastUsed
     * @return {DataType} Last machine number used.
     * @example
     *      //assuming you already defined the machines: machine0 machine1 machine2
     *      var giftstate = new GiftState();
     *
     *      giftstate.pushMachine(machine0);
     *      giftstate.pushMachine(machine1);
     *      giftstate.pushMachine(machine2);
     *
     *
     *      // result is machinenumber = 1
     *      var machine = giftstate.getMachine(1);
     *      var machinenumber =giftstate.getMachineNumberLastUsed();
     *
     */
    this.getMachineNumberLastUsed = function(){
        if(lastmachineused == -1){
            throw new Error("No machine was used yet.");
        }
        return lastmachineused;
    };




    /**
     * Sets the machine with the machine number given to the function.
     * @method setMachine
     * @param  {DataType} Machine Machine to set with the chosen machine number.
     * @param  {integer} Machine number of the machine wanted.
     * @example
     *      //assuming you already defined the machines: machine0 machine1 machine2
     *      var giftstate = new GiftState();
     *
     *      giftstate.pushMachine(machine0);
     *      giftstate.pushMachine(machine1);
     *
     *
     *      // overrides machine1 with machine2
     *      giftstate.setMachine(machine2,1);
     *
     */
    this.setMachine = function(machine, machinenumber){
        if(machinenumber)
        machine.MachineNumber = machinenumber;
        machinearray[machinenumber] = machine;
        resetYEquations();
    };


    /**
     * Deletes the machine withe highest machine number from the queue.
     * @method popMachine
     * @example
     *      //assuming you already defined the machines: machine0 machine1 machine2
     *      var giftstate = new GiftState();
     *
     *      giftstate.pushMachine(machine0);
     *      giftstate.pushMachine(machine1);
     *      giftstate.pushMachine(machine2);
     *
     *
     *      // machine2 is deleted and removed from queue
     *      giftstate.popMachine();
     *
     */
    this.popMachine = function(){
        if(highestmachinenumber == -1){
            throw new Error("No machine in queue!");
        }

        machinearray.pop();
        highestmachinenumber--;
    };

    this.setYEquation = function(equation,equationNumber,minimized){
        if(minimized == true){
            yequationsminimized[equationNumber] = equation;
        }
        else{
            yequations[equationNumber] = equation;
        }
    };

    this.getYEquation = function(equationNumber,minimized){
        var tmpEquation;
        if(minimized == true){
            tmpEquation = yequationsminimized[equationNumber];
        }
        else {
            tmpEquation = yequations[equationNumber];
        }
    return tmpEquation;
    };

    function resetYEquations(){
        yequations = [];
        yequationsminimized = [];
    }

    /**
     * Creates an multidimensional array.
     * @method  createArray
     * @private
     * @param {...integer} dimensions dimension size of the array
     * @returns Array<T>
     */
    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = createArray.apply(this, args);
        }

        return arr;
    }

    /**
     * Helps to create JsonObject.
     * @returns {Object}
     */
    this.toJSON = function(){
        var obj = new Object();
        obj.OperatorsList = this.OperatorsList;
        obj.InputSide = this.InputSide;
        obj.InputMode = this.InputMode;
        obj.CurrentTab = this.CurrentTab;
        obj.MachineArray = machinearray;
        obj.HighestMachineNumber = highestmachinenumber;
        obj.LastMachineUsed = lastmachineused;
        obj.CurrentGraphTab = currentgraphtab;
        return obj;
    };

    this.createOnData = function (data){
        operators = data.OperatorsList;
        inputside = data.InputSide;
        inputmode = data.InputMode;
        currenttab = data.CurrentTab;
        machinearray = data.MachineArray;
        highestmachinenumber = data.HighestMachineNumber;
        lastmachineused = data.LastMachineUsed;
        currentgraphtab = data.CurrentGraphTab;

        for(var i = 0; i < machinearray.length; i++){
            var currenttable = new TTable(2,2,2,["+:+", "/:/", "*:*"], this);
            currenttable.createOnData(machinearray[i]);
            machinearray[i] = currenttable;
        }
    };

}