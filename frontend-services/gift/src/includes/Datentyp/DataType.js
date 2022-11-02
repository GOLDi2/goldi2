

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};


/**
 * Contains classes for the internal representation of the data.
 * @module internal representation
 *
 */
/**
 * Contains the finite state machine data
 * @Class TTable
 */

/**
 * Creates a TTable object.
 * @method TTable
 * @param {integer} stateBits Number of bits used to encode a finite state machine.
 * @param {integer} inputnumber Number of input variables.
 * @param {integer} outputnumber Number of output variables.
 * @param {Array<string>} operatorslist Logical operators used in the equations as strings.
 * @param {GiftState} giftstate GiftState that will contain this machine.
 */
function TTable(stateBits,inputnumber,  outputnumber, empty , giftstate) {
    var stateNumber = Math.pow(2, stateBits);
    var transitionTable = createArray(stateNumber, stateNumber);
    var outputEquations = createArray(stateNumber, outputnumber);
    var zEquations = createArray(stateBits);
    var inputNames = [];
    var outputNames = [];
    var stateNames = [];
    var returnWithNames = false;
    var operators = giftstate.OperatorsList;
    var hReduce = "0";
    var inputnumber = inputnumber;
    var outputnumber = outputnumber;
    var graphStorage = null;
    var yEquations = createArray(outputnumber);
    var yEquationsminimized = createArray(outputnumber);
    var yEquationshreducedminimized = createArray(outputnumber);
    var statebits = stateBits;
    var maxstatebits = 4;
    var minstatebits = 1;
    var maxinputnumber = 6;
    var maxoutputnumber = 6;
    var zEquationsminimized = createArray(stateBits);
    var zEquationshreducedminimized = createArray(stateBits);
    var changed = true;
    var changearray = new ChangeStruct();
    var giftstate = giftstate;
    var machinenumber = 0;
    var machinename = null;

    /**
     * Contains the Name that belongs to the DataType.
     * @property Name
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'MachineName', {
        get: function () {
            return machinename;
        },
        set:function(val) {
            machinename = val;
        }
    });


    /**
     * Contains the MachineNumber that belongs to the DataType.
     * @property MachineNumber
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'MachineNumber', {
        get: function () {
            return machinenumber;
        },
        set:function(val) {
            machinenumber = val;
        }
    });



    /**
     * Contains the GiftState that belongs to the DataType.
     * @property GiftState
     * @type GiftState
     * @default ""
     */
    Object.defineProperty(this, 'GiftState', {
        get: function () {
            return giftstate;
        },
        set:function(val) {
            giftstate = val;
        }
    });

    /**
     * Contains the max number of state bits.
     * @property Maxstatebits
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'MaxStateBits', {
        get: function () {
            return maxstatebits;
        }
    });


    /**
     * Contains the min number of state bits.
     * @property MinStateBits
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'MinStateBits', {
        get: function () {
            return minstatebits;
        }
    });



    /**
     * Contains the max number of inputs.
     * @property MaxInputnumber
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'MaxInputNumber', {
        get: function () {
            return maxinputnumber;
        }
    });

    /**
     * Contains the max number of outputs.
     * @property MaxOutputNumber
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'MaxOutputNumber', {
        get: function () {
            return maxoutputnumber;
        }
    });





    /**
     * Contains the state bits of the Graph.
     * @property StateBits
     * @type integer
     * @default ""
     */
    Object.defineProperty(this, 'StateBits', {
        get: function () {
            return statebits;
        },
        set:function(val) {
            statebits = val;
        }
    });


    /**
     * Contains the changings of the components.
     * @property ChangeStruct
     * @type ChangeStruct
     * @default ""
     */
    Object.defineProperty(this, 'ChangeStruct', {
        get: function () {
            return changearray;
        },
        set:function(val) {
            changearray = val;
        }
    });




    /** Contains whether the TTable was changed or not.
    * @property Changed
    * @type boolean
    * @default ""
    */
    Object.defineProperty(this, 'Changed', {
        get: function () {
            return changed;
        },
        set:function(val) {
            changed = val;
        }
    });



    /**
     * Contains the storage of the Graph.
     * @property GraphStorage
     * @type string
     * @default ""
     */
    Object.defineProperty(this, 'GraphStorage', {
        get: function () {
            return graphStorage;
        },
        set:function(val) {
            graphStorage = val;
        }
    });


    /**
     * Contains the number of states the can be accessed by using the given number of statebits.
     * @property StateNumber
     * @type integer
     * @default 0
     */
    Object.defineProperty(this, 'StateNumber', {
        get: function () {
            return stateNumber;
        }//,
        // set:function(val) { alert('set value'); }
    });

    /**
     * Decides about whether renaming is used for the methods:
     *  <ul style="list-style-type:disc">
     *      <li>getTransition</li>
     *      <li>getOutputEquation</li>
     *      <li>getZEquation</li>
     *      <li>getMatrice</li>
     *  </ul>
     * @property ReturnWithNames
     * @type bool
     * @default false
     */
    Object.defineProperty(this, 'ReturnWithNames', {
        get: function () {
            return returnWithNames;
        },
        set: function (returnwithnames) {
            returnWithNames = returnwithnames;
        }
    });

    /**
     * Contains the number of input variables.
     * @property InputNumber
     * @type integer
     * @default 0
     */
    Object.defineProperty(this, 'InputNumber', {
        get: function () {
            return inputnumber;
        }
    });

    /**
     * Contains the number of output variables.
     * @property OutputNumber
     * @type integer
     * @default 0
     */
    Object.defineProperty(this, 'OutputNumber', {
        get: function () {
            return outputnumber;
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
     * Contains the names of the renamed states.
     * @property Inputnames
     * @type Array<string>
     * @default []
     */
    Object.defineProperty(this, 'Statenames', {
        get: function () {
            return stateNames;
        }, set: function (list) {
            stateNames = list;
        }
    });

    /**
     * Contains the names of the renamed input variables.
     * @property Inputnames
     * @type Array<string>
     * @default []
     * @example
     *      //renaming x1 to in1
     *      var table = new TTable(...);
     *
     *      //without adding new names (x1 = in1)
     *          table.setTransition("in1+x2", 1, 0);
     *          //--> Error
     *
     *      //with adding new names
     *          table.Inputnames.push("x1:in1");
     *          table.setTransition("in1+x2", 1, 0);
     *          //--> no Error
     *
     *------------------------------------------------ after adding new names
     *
     *      //getting transition equation without setting {{#crossLink "TTable/ReturnWithNames:property"}}<ReturnWithNames>{{/crossLink}} true
     *          table.ReturnWithNames = true;
     *          var equation = table.getTransition(1, 0);
     *          //-> equation = "in1*x2"
     *
     *      //getting transition equation with setting {{#crossLink "TTable/ReturnWithNames:property"}}<ReturnWithNames>{{/crossLink}} false
     *          table.ReturnWithNames = false;
     *          var equation = table.getTransition(1, 0);
     *          //-> equation = "x1*x2"
     *
     *      //setting zequations
     *          table.setZEquation(1, "z1=in1+x2");
     *
     *          //getting zequation without setting {{#crossLink "TTable/ReturnWithNames:property"}}<ReturnWithNames>{{/crossLink}} true
     *              table.ReturnWithNames = true;
     *              var zequation = table.getZEquation("z1");
     *              //->zequation = "xin1"
     *
     *
     */
    Object.defineProperty(this, 'Inputnames', {
        get: function () {
            return inputNames;
        }, set: function (list) {
            inputNames = list;
        }
    });

    /**
     * Contains the names of the renamed output variables.
     * @property Outputnames
     * @type Array<string>
     * @default []
     * @example
     *      //renaming y1 to out1
     *      var table = new TTable(...);
     *
     *      //without adding new names (y1 = out1)
     *          table.setOutputEquation(1, "out1=x1*x2");
     *          //--> Error
     *
     *      //with adding new names
     *          table.Outputnames.push("y1:out1");
     *          test.setOutputEquation(1, "out1=x1*x2");
     *          //--> no Error
     *
     *------------------------------------------------ after adding new names
     *
     *      //getting output equation without setting {{#crossLink "TTable/ReturnWithNames:property"}}<ReturnWithNames>{{/crossLink}} true
     *          table.ReturnWithNames = true;
     *          var equation = table.getOutputEquation(1, "out1");
     *          //or
     *          var equation = table.getOutputEquation(1, "y1");
     *          //-> equation = "out1=x1*x2"
     *
     *      //getting output equation with setting {{#crossLink "TTable/ReturnWithNames:property"}}<ReturnWithNames>{{/crossLink}} false
     *         table.ReturnWithNames = false;
     *         var equation = table.getOutputEquation(1, "out1");
     *          //or
     *          var equation = table.getOutputEquation(1, "y1");
     *          //-> equation = "y1=x1*x2"
     */
    Object.defineProperty(this, 'Outputnames', {
        get: function () {
            return outputNames;
        }, set: function (list) {
            outputNames = list;
        }
    });

    //-----------------------------------------//


    /**
     * Contains the h*(z) expression.
     * @property HReduce
     * @type string
     * @default ""
     */
    Object.defineProperty(this, 'HReduce', {
        get: function () {
            if (!returnWithNames) {
                return hReduce;
            }
            return this.NormalEquationToEquation(hReduce);
        },
        set: function (hreduce) {
            var newequation = this.EquationToNormalEquation(hreduce);
            this.checkHReduce(newequation);
            if(newequation != hReduce) {
                hReduce = newequation;
                undefineArray(yEquationshreducedminimized);
                undefineArray(zEquationshreducedminimized);
            }

        }
    });

    /**
     * Sets an edge in the table.
     * @method setTransition
     * @param {string}  transition Transtion from begin to end state.
     * @param {integer} begin Number of the state the edge is starting from.
     * @param {integer} end Number of the state the edge is ending to.
     */
    this.setTransition = function (expression, begin, end) {
        checkStatesExist(begin, end);
        expression = preformatEquation(expression);

        this.checkTransitionEquation(expression);

        expression = this.EquationToNormalEquation(expression);

        if(expression == "0" || expression == ""){
            transitionTable[begin][end] = undefined;
        }else {
            transitionTable[begin][end] = this.EquationToNormalEquation(expression);
        }
    };

    /**
     * Gets an edge in the table.
     * @method getTransition
     * @param {integer} begin Number of the state the edge is starting from.
     * @param {integer} end Number of the state the edge is ending to.
     * @return string
     */
    this.getTransition = function (begin, end) {
        checkStatesExist(begin, end);

        if (!returnWithNames) {
            return transitionTable[begin][end];
        }
        return this.NormalEquationToEquation(transitionTable[begin][end]);
    };

    /**
     * Sets and output equation for a certain state.
     * @method setOutputEquation
     * @param {integer} state The State the outputequation should be set for.
     * @param {string} equation Output equation for the state.
     * @example
     *      //setting output equation for state 1
     *      var table = new TTable(...);
     *
     *      table.setOutputEquation(1, "y1=x1*x2");
     *      //also see {{#crossLink "TTable/Outputnames:property"}}<Outputnames>{{/crossLink}} for renaming
     *      table.setOutputEquation(1, "out1=x1*x2");
     */
    this.setOutputEquation = function (state, equation) {

        if (stateNumber <= state) {
            throw new Error("State with state number " + state + " does not exist!");
        }

        equation = preformatEquation(equation);

        this.checkOutputEquation(equation);

        equation = this.EquationToNormalEquation(equation);

        var i;
        var length = outputnumber;
        var found = false;

        for (i = 0; i < length; i++) {
            if (StringStartsWith(equation, "y" + i)) {
                outputEquations[state][i] = equation;
                found = true;
                break;
            }
        }

        if (!found) {
            throw new Error("Wrong Equation. Couldn't find output variable! Is your output variable number bigger than the output number?");
        }

    };




    /**
     * Gets and output equation for a certain state.
     * @method getOutputEquation
     * @param {integer} state The State the outputequation should be gotten for.
     * @param {string} outputvariable Output variable the equation is wanted for.
     * @return {string} The equation of the output variable.
     * @example
     *      //setting output equation for state 1
     *      var table = new TTable(...);
     *
     *      table.setOutputEquation(1, "y1=x1*x2");
     *
     *      //getting output equation for state 1 and output variable y1
     *      var equation = table.getOutputEquation(1, "y1");
     *
     *      //also see {{#crossLink "TTable/Outputnames:property"}}<Outputnames>{{/crossLink}} for renaming
     *      table.setOutputEquation(1, "out1=x1*x2");
     *      table.getOutputEquation(1, "out");
     */
    this.getOutputEquation = function (state, outputvariable) {
        var i;
        var length = outputnumber;
        var variable = this.EquationToNormalEquation(outputvariable);
        for (i = 0; i < length; i++) {
            if (outputEquations[state][i] != undefined && StringStartsWith(outputEquations[state][i], variable)) {
                if (!returnWithNames) {
                    return outputEquations[state][i];
                }
                return this.NormalEquationToEquation(outputEquations[state][i]);
            }
        }

        throw new Error("Equation for \"" + outputvariable + "\" not defined!");

    };

    /**
     * Sets a Z equation for the FSM.
     * @method {string} setZEquation
     * @param equation The equation to be set.
     */
    this.setZEquation = function (equation, minimized, hreduced) {
        this.checkZEquation(equation);
        equation = this.EquationToNormalEquation(preformatEquation(equation));
        var equationnumber = extractEquationNumber(equation);
        if(minimized == undefined || minimized == false) {
            if(equation != zEquations[equationnumber]){
                zEquationsminimized[equationnumber] = undefined;
                zEquationshreducedminimized[equationnumber] = undefined;
            }
            zEquations[equationnumber] = this.EquationToNormalEquation(equation);
        }else if(hreduced == undefined || hreduced == false){
            if(equation != zEquationsminimized[equationnumber]){
                zEquationshreducedminimized[equationnumber] = undefined;
            }
            zEquationsminimized[equationnumber] = this.EquationToNormalEquation(equation);
        }else{
            zEquationshreducedminimized[equationnumber] = equation;
        }
    };

    /**
     * Gets a Z equation from the FSM.
     * @method getZEquation
     * @param {string} zvariable The variable of the Z equation wanted.
     * @returns string
     * @example
     *      getZEquation("z0"); //-> returns "z0=...."
     */
    this.getZEquation = function (zvariable, minimized, hreduced,filtered,sort) {
        var zeq;
        var zeqNames;
        var zarray;
        var AfterFiltered;

        if(minimized == undefined || minimized == false) {
            zarray = zEquations;
        }else if(hreduced == undefined || hreduced == false){
            zarray = zEquationsminimized;
        }else{
            zarray = zEquationshreducedminimized;
        }

        if (filtered == undefined || filtered == false) {
            AfterFiltered = zarray;
        } else {
            AfterFiltered = this.FilterEquationToEquation(zarray);
        }
        if (sort == undefined || sort == false) {
            zeq = AfterFiltered;
        } else {
            zeq = this.SortEquationToEquation(AfterFiltered,'+','*');
        }

        if (returnWithNames == false) {
            zeqNames =  zeq[extractEquationNumber(zvariable)];
        }else {
            zeqNames = this.NormalEquationToEquation(zeq[extractEquationNumber(zvariable)]);
        }

        return zeqNames;
    };


    /**
     * Gets all Z equations from the Machine if possible in minimized version
     * @returns Array of Strings containing all Z variables
     */
    this.getAllZEquation = function(named)
    {
        var equationsArray = new Array();
        for(var i = 0; i < zEquations.length;i++)
        {
            if(named){
                equationsArray[i] = this.NormalEquationToEquation(zEquations[i]);
            }
            else
            {
                equationsArray[i] = zEquations[i];
            }

        }
        return equationsArray;
    }

    /**
     * Gets all Y equations from the Machine if possible in minimized version
     * @returns Array of Strings containing all Y variables
     */
    this.getAllYEquation = function(named)
    {
        var equationsArray = new Array();
        for(var i = 0; i < yEquations.length;i++)
        {
            if(named)
            {
                equationsArray[i] = this.NormalEquationToEquation(yEquations[i]);
            }
            else
            {
                equationsArray[i] = yEquations[i];
            }
        }

        return equationsArray;
    }




    /**
     * Sets a Y equation for the FSM.
     * @method {string} setYEquation
     * @param equation The equation to be set.
     */
    this.setYEquation = function (equation, minimized, hreduced) {
        this.checkYEquation(equation);
        equation = this.EquationToNormalEquation((preformatEquation(equation)));
        var yarray;
        var equationnumber = extractEquationNumber(equation);

        if(minimized == undefined || minimized == false) {
            if(equation != yEquations[equationnumber]){
                yEquationsminimized[equationnumber] = undefined;
                yEquationshreducedminimized[equationnumber] = undefined;
            }
            yarray = yEquations;
        }else if(hreduced == undefined || hreduced == false){
            if(equation != yEquationsminimized[equationnumber]){
                yEquationshreducedminimized[equationnumber] = undefined;
            }
            yarray = yEquationsminimized;
        }else{
            yarray = yEquationshreducedminimized;
        }
        yarray[equationnumber] = equation;
    };

    /**
     * Gets a Y equation from the FSM.
     * @method getYEquation
     * @param {string} zvariable The variable of the Y equation wanted.
     * @returns string
     * @example
     *      getZEquation("y0"); //-> returns "y0=...."
     */
    this.getYEquation = function (yvariable, minimized, hreduced,filtered,sort) {
        var yeq;
        var yeqNames;
        var AfterFiltered;
        var yarray;

        if(minimized == undefined || minimized == false) {
            yarray = yEquations;
        }else if(hreduced == undefined || hreduced == false){
            yarray = yEquationsminimized;
        }else{
            yarray = yEquationshreducedminimized;
        }

        if (filtered == undefined || filtered == false) {
            AfterFiltered = yarray;
        } else {
            AfterFiltered = this.FilterEquationToEquation(yarray);
        }

        if (sort == undefined || sort == false) {
            yeq = AfterFiltered;
        } else {
            yeq = this.SortEquationToEquation(AfterFiltered,'+','*');
        }

        if (returnWithNames == false) {
            yeqNames =  yeq[extractEquationNumber(yvariable)];
        }else {
            yeqNames = this.NormalEquationToEquation(yeq[extractEquationNumber(yvariable)]);
        }

        return yeqNames;
    };

    /**
     * Returns the transition matrice.
     * @method getMatrice
     * @returns {Array<string>}
     * @example
     *
     *      var table = new TTable(...);
     *      table.setTransition(...);
     *      //with renaming
     *      table.ReturnWithNames = true;
     *      table.getMatrice();
     *
     *      //without renaming
     *      table.ReturnWithNames = false;
     *      table.getMatrice();
     *
     */
    this.getMatrice = function () {
        if (!returnWithNames) {
            return copyTransitionMatrice(transitionTable);
        }
        return renameTransitionMatrice(copyTransitionMatrice(transitionTable));
    };

    /**
     * Renames the transition matrices with the names from input values.
     * @method renameTransitionMatrice
     * @private
     * @param {Array<string>} matrice Matrice to be renamed.
     */
    function renameTransitionMatrice(matrice) {
        for (var i = 0; i < stateNumber; i++) {
            for (var e = 0; e < stateNumber; e++) {
                var tempstring = matrice[i][e];
                if (tempstring != undefined) {
                    tempstring = this.NormalEquationToEquation(tempstring);
                }
                matrice[i][e] = tempstring;
            }
        }
        return matrice;
    }


    this.EquationToNormalEquation = function(equation){
        return this.EquationToNormalEquation(equation);
    };

    this.NormalEquationToEquation = function(equation){
        return this.NormalEquationToEquation(equation);
    };

    /**
     * Renames all names of inputnames[] and outputnames[] with x and y names.
     * @method  EquationToNormalEquation
     * @private
     * @param {string} equation Equation to be renamed.
     * @returns string
     */
    this.EquationToNormalEquation = function (equation) {
        var i;
        var length;
        var tempinputnames = createArrayAndSortArrayByStringLength(inputNames);
        var tempoutputnames = createArrayAndSortArrayByStringLength(outputNames);
        var tempoperators = createArrayAndSortArrayByStringLength(operators);

        equation = equation.toString();
        var splitexp = equation.split("=");
        var renamendsplitexp = [];

        for(var z = 0; z < splitexp.length; z++){

            equation = splitexp[z];
            length = operators.length;
            for(i = 0; i < length; i++){
                equation = equation.replaceAll(extractRenaming(tempoperators[i]), "('''" + i +")");
            }
            for(i = 0; i < length; i++){
                equation = equation.replaceAll("('''" + i +")", extractName(tempoperators[i]));
            }

            var logicequation = Logic.evaluateExpression(equation);

            length = inputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable(extractRenaming(tempinputnames[i]), "('" + i +")");
            }
            length = outputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable(extractRenaming(tempoutputnames[i]), "(''" + i +")");
            }

            //-----------

            length = inputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable("('" + i +")", extractName(tempinputnames[i]));
            }
            length = outputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable("(''" + i +")", extractName(tempoutputnames[i]));
            }

            equation = logicequation.toString();
            renamendsplitexp.push(equation);
        }
        equation = renamendsplitexp.join("=");
        return equation;
    };

    /**
     * Renames all x and y names with the inputnames[] and outputnames[] names.
     * @method NormalEquationToEquation
     * @private
     * @param {string} equation Equation to be renamed.
     * @returns string
     */
    this.NormalEquationToEquation = function (equation) {
        var i;
        var length;

        var tempinputnames = createArrayAndSortArrayByStringLength(inputNames);
        var tempoutputnames = createArrayAndSortArrayByStringLength(outputNames);
        var tempoperators = createArrayAndSortArrayByStringLength(operators);

        if(equation == undefined){
            return undefined;
        }

        var splitexp = equation.split("=");
        var renamendsplitexp = [];

        for(var z = 0; z < splitexp.length; z++) {

            equation = splitexp[z];

            var logicequation = Logic.evaluateExpression(equation);

            length = inputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable(extractName(tempinputnames[i]), "('" + i + ")");
            }

            length = outputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable(extractName(tempoutputnames[i]), "(''" + i + ")");
            }

            //-------------------
            length = inputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable("('" + i + ")", extractRenaming(tempinputnames[i]));
            }

            length = outputNames.length;
            for (i = 0; i < length; i++) {
                logicequation.renameVariable("(''" + i + ")", extractRenaming(tempoutputnames[i]));
            }

            equation = logicequation.toString();

            length = operators.length;
            for (i = 0; i < length; i++) {
                equation = equation.replaceAll(extractName(tempoperators[i]), "('''" + i + ")");
            }
            for (i = 0; i < length; i++) {
                equation = equation.replaceAll("('''" + i + ")", extractRenaming(tempoperators[i]));
            }

            renamendsplitexp.push(equation);

        }
        equation = renamendsplitexp.join("=");
        return equation;
    };


    /*this.SortTest = function (logobject) {
        var SortedEquation = '';
        for (var i = 0; i < logobject.subexpressions.length; i++) {
            if (logobject.subexpressions[i].typ == 'expVariable') {

            } else if (logobject.subexpressions[i].typ == 'expAND') {
                console.log('2');
            } else if (logobject.subexpressions[i].typ == 'expOR') {
                console.log('3');
            } else if (logobject.subexpressions[i].typ == 'expNOT') {
                console.log('4');
            } else if (logobject.subexpressions[i].typ == 'expValue') {
                console.log('5');
            } else {
                console.log('6');
            }
        }
        console.log(logobject.symbol);
        console.log('--------');
    }*/

    this.SortTest = function (logobject,delimiterTwo) {
        var ReturnString='';
        var SortedEquation = new Array(logobject.splitexpressions.length);
            for (var j = 0; j < logobject.splitexpressions.length; j++) {
                var splittedParts = logobject.splitexpressions[j].split(delimiterTwo);
                var sortedPart = new Array(splittedParts.length);

                //Befülle neues Array mit zerlegten kleinen Problemen
                //Makiere negative Werte mit einer 1 [2D-Array]
                //Entferne für das anschließende Sortieren die '/' , da sonst als Sonderzeichen erkannt
                for (var k = 0; k < splittedParts.length; k++) {
                    sortedPart[k] = new Array(2);
                    if (splittedParts[k].indexOf('/') > -1) {
                        sortedPart[k][1] = 1;
                    } else {
                        sortedPart[k][1] = 0;
                    }
                    sortedPart[k][0] = splittedParts[k].replace('/', '');
                }

                sortedPart = sortedPart.sort(this.sortAlphaNum);
                //sortiere alphanumerisch, wobei alpha abwärts und numerisch aufwärts mit Priorität auf alpha

                SortedEquation[j] = '';
                for (var k = 0; k < sortedPart.length; k++) {
                    if (sortedPart[k][1] == 1) {
                        sortedPart[k][0] = '/' + sortedPart[k][0];
                    }
                    if (k==0) {
                        SortedEquation[j] += sortedPart[k][0];
                    } else {
                        SortedEquation[j] = SortedEquation[j] + delimiterTwo + sortedPart[k][0];
                    }
                }
            }
        for (var j = 0;j<SortedEquation.length;j++) {
            if (j==0) {
                ReturnString +=SortedEquation[j];
            } else {
                ReturnString += logobject.symbol +  SortedEquation[j];
            }
        }
            return ReturnString;
         }


    /**
     * Sort the equation -> First z-variables and then x-variables numerically sorted
     * @method SortEquationToEquation
     * @private
     * @param {Array} equation Equation to be sorted.
     * @returns Array
     */
    this.SortEquationToEquation = function (equation,delimiterOne,delimiterTwo) {
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == undefined) {
                equation[i] = undefined;
            } else if (equation[i] == 0) {
                equation[i] = 0;
            } else if (equation[i] == 1) {
                equation[i] = 1;
            } else {
                if (equation[i].indexOf('=') > -1) {
                    var equationBeforeEqualSign = equation[i].split("=")[0];
                    var equationAfterEqualSign = equation[i].split("=")[1];
                    var logicobject = Logic.evaluateExpression(equationAfterEqualSign);
                   // equation[i] =  equationBeforeEqualSign + '=' + this.SortTest(logicobject,delimiterTwo);
                }
            }
        }
        return equation;
        /* if (L_Variables_sort==true) {
            for (var i = 0; i < equation.length; i++) {
                var equationContentsEqual=true;

                if (equation[i] == undefined) {
                    equation[i] = undefined;
                } else if (equation[i] == 0) {
                    equation[i] = 0;
                } else if (equation[i] == 1) {
                    equation[i] = 1;
                } else {
                    if (equation[i].indexOf('=') > -1) {
                        equationContentsEqual=true;
                        var equationBeforeEqualSign = equation[i].split("=")[0];
                        var equationAfterEqualSign = equation[i].split("=")[1];
                    } else {
                        equationContentsEqual=false;
                        var equationBeforeEqualSign = '';
                        var equationAfterEqualSign = equation[i];
                    }

                    if (equationAfterEqualSign == 0) {
                        if (equationContentsEqual==true) {
                            if (equationBeforeEqualSign == '') {
                                equation[i] = 0;
                            } else {
                                equation[i] = equationBeforeEqualSign + '=' + 0; //Gelöstes Problem entspricht der Gleichung
                            }
                        } else {
                            equation[i] = 0; //Gelöstes Problem entspricht der Gleichung
                        }
                    } else if (equationAfterEqualSign == 1) {
                        if (equationContentsEqual==true) {
                            if (equationBeforeEqualSign == '') {
                                equation[i] = 1;
                            } else {
                                equation[i] = equationBeforeEqualSign + '=' + 1; //Gelöstes Problem entspricht der Gleichung
                            }
                        } else {
                            equation[i] = 1; //Gelöstes Problem entspricht der Gleichung
                        }
                    } else {
                        var parts = equationAfterEqualSign.split(delimiterOne);
                        var temp = '';
                        //equation[i] = equationBeforeEqualSign + '=';
                        for (var j = 0; j < parts.length; j++) {
                            var splittedParts = parts[j].split(delimiterTwo); //DAC - Teile bei  '*'-Zeichen und löse Einzelprobleme

                            for (var k = 0; k < splittedParts.length; k++) {
                                if (temp_parts[j].substring(0,1)=='(') {
                                    console.log(temp_parts[j]);
                                } else {
                                    console.log('NO: ' + temp_parts[j]);
                                }
                            }

                            var sortedPart = new Array(splittedParts.length);

                            //Befülle neues Array mit zerlegten kleinen Problemen
                            //Makiere negative Werte mit einer 1 [2D-Array]
                            //Entferne für das anschließende Sortieren die '/' , da sonst als Sonderzeichen erkannt
                            for (var k = 0; k < splittedParts.length; k++) {
                                sortedPart[k] = new Array(2);
                                if (splittedParts[k].indexOf('/') > -1) {
                                    sortedPart[k][1] = 1;
                                } else {
                                    sortedPart[k][1] = 0;
                                }
                                sortedPart[k][0] = splittedParts[k].replace('/', '');
                            }

                            sortedPart = sortedPart.sort(this.sortAlphaNum);
                            //sortiere alphanumerisch, wobei alpha abwärts und numerisch aufwärts mit Priorität auf alpha

                            var sortedPartfinished = '';
                            for (var k = 0; k < sortedPart.length; k++) {
                                if (sortedPart[k][1] == 1) {
                                    sortedPart[k][0] = '/' + sortedPart[k][0];
                                }
                                if (k==0) {
                                    sortedPartfinished += sortedPart[k][0];
                                } else {
                                    sortedPartfinished = sortedPartfinished + delimiterTwo + sortedPart[k][0];
                                }
                            }
                            //Füge in dem finalen Array die '/' an den makierten Stellen hinzu
                            if (j==0) {
                                temp += sortedPartfinished;
                            } else {
                                temp = temp + delimiterOne + sortedPartfinished;
                            }
                            //Füge Teilprobleme wieder zusammen

                        } // for-ende
                        if (equationContentsEqual==true) {
                            if (equationBeforeEqualSign == '') {
                                equation[i] = temp;
                            } else {
                                equation[i] = equationBeforeEqualSign + '=' + temp; //Gelöstes Problem entspricht der Gleichung
                            }
                        } else {
                            equation[i] = temp; //Gelöstes Problem entspricht der Gleichung
                        }
                    } // else ende 0-1-other

                }
            }
            return equation;
        } else {
            return equation;
        }*/
    };

    /**
     * Sort the input alphanumerically
     * @method sortAlphaNum
     * @private
     * @param {2DArray} 2D-Array to be sorted.
     * @returns 2DArray
     */
    this.sortAlphaNum = function (a,b) {
        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;
        var aA = a[0].replace(reA, "");
        var bA = b[0].replace(reA, "");
        if(aA === bA) {
            var aN = parseInt(a[0].replace(reN, ""), 10);
            var bN = parseInt(b[0].replace(reN, ""), 10);
            if (alphanumericsort_desc==true) {
                return aN === bN ? 0 : aN > bN ? -1 : 1; //Sortiere z0,z1 aufsteigend
            } else {
                return aN === bN ? 0 : aN > bN ? 1 : -1; //Sortiere z0,z1 aufsteigend
            }
        } else {
            return aA > bA ? -1 : 1; //Sortiere x hinter z ein (verkehrt herum sortiert da z>x)
        }
    };


    /**
     * Filter the equation -> Remove useless "*(1)" and "+(0)"
     * @method FilterEquationToEquation
     * @private
     * @param {Array} equation Equation to be filtered.
     * @returns Array
     */
    this.FilterEquationToEquation = function (equation) {
        if (L_Variables_filt==true) {
            for (var i = 0; i < equation.length; i++) {
                if (equation[i] == undefined) {
                    equation[i] = undefined;
                } else {
                    if (equation[i] == 0) {
                        equation[i] = 0;
                    } else if (equation[i] == 1) {
                        equation[i] = 1;
                    } else {
                        for (var j=0;j<inputnumber;j++) {
                            do {
                                equation[i] = equation[i].replace('(x'+j+')', 'x'+j);
                            } while (equation[i].indexOf('(x'+j+')') > -1);
                            do {
                                equation[i] = equation[i].replace('(/x'+j+')', '/x'+j);
                            } while (equation[i].indexOf('(/x'+j+')') > -1);
                        }
                        do {
                            equation[i] = equation[i].replace('*(1)', '');
                        } while (equation[i].indexOf('*(1)') > -1);
                        do {
                            equation[i] = equation[i].replace('+(0)', '');
                        } while (equation[i].indexOf('+(0)') > -1);
                        do {
                            equation[i] = equation[i].replace('(1)', '1');
                        } while (equation[i].indexOf('(1)') > -1);
                        do {
                            equation[i] = equation[i].replace('(0)', '0');
                        } while (equation[i].indexOf('(0)') > -1);
                    }
                }
            }
            // und 1 bzw. oder 0 ist �berfl�ssig
            return equation;
        } else {
            return equation;
        }
    };


    /**
     * Creates a copy of a transition matrice. This means creating a new array with new reference.
     * @method copyTransitionMatrice
     * @private
     * @param {Array<string>} matrice Matrice to copy.
     * @returns Array<string>
     */
    function copyTransitionMatrice(matrice) {
        var output = createArray(stateNumber, stateNumber);
        for (var i = 0; i < stateNumber; i++) {
            for (var e = 0; e < stateNumber; e++) {
                output[i][e] = matrice[i][e];
            }
        }
        return output;
    }

    /**
     * Checks whether an transition equation is in the correct form or not. This includes checking for unknown names(unknown to inputnames and outputnames)
     * and for unknown signs.
     * @method checkTransitionEquation
     * @private
     * @param {string} equation Equation to check.
     * @throws {InvalidTransitionEquation} Throws an exception that the transition equation is invalid.
     */
    this.checkTransitionEquation = function(equation) {
        var i, e;
        var error = false;
        var errorstring = "";

        equation = this.EquationToNormalEquation(equation);

        try {
            var expression = Logic.evaluateExpression(equation);
            expression.sortExp(true);
            var arguments = [];

            for (i = 0; i < inputnumber; i++) {
                arguments.push("x" + i + ":" + "1");
            }
            var machinecount = giftstate.getHighestMachineNumber();

            for(i = 0; i <= machinecount; i++){
                var currentmachine = giftstate.getMachine(i);
                var machinezcount = currentmachine.StateBits;
                for(e = 0; e < machinezcount; e++){
                    arguments.push("a" + i + "z" + e + ":" + "1");
                }
            }

            expression.computearray(arguments);

        }catch(err){
            error = true;
            var splitting = err.split(":");
            errorstring = splitting[splitting.length - 1].replaceAll("!", "");
        }

        if (error) {
            throw new Error("The expression is not valid! Please check it for errors or add new names or operators to the table! Unknown subexpression: " + errorstring);
        }

    };

    /**
     * Checks whether an output equation is in the correct form or not. This includes checking for unknown names(unknown to inputnames and outputnames)
     * and for unknown signs.
     * @method checkOutputEquation
     * @private
     * @param {string} equation Equation to check.
     * @throws {InvalidOutputEquation} Throws an exception that the output equation is invalid.
     */
    this.checkOutputEquation = function(equation) {
        var i,e;
        var error = false;
        var correctvariable = false;
        var errorstring = "";

        equation = this.EquationToNormalEquation(equation);

        var variable = equation.split("=")[0];

        for(var i = 0; i < outputnumber; i++){
            if(variable == "y" + i){
                correctvariable = true;
                break;
            }
        }

        if(!correctvariable){
            throw new Error("Missing correct y variable!");
        }


        var equation = equation.split("=")[1];

        var length = inputNames.length;
        for (i = 0; i < length; i++) {
            equation = equation.replaceAll(extractRenaming(inputNames[i]), "x" + i);
        }

        try {
            var expression = Logic.evaluateExpression(equation);
            expression.sortExp(true);
            var arguments = [];

            for (var i = 0; i < inputnumber; i++) {
                arguments.push("x" + i + ":" + "1");
            }
            var machinecount = giftstate.getHighestMachineNumber();

            for(i = 0; i <= machinecount; i++){
                var currentmachine = giftstate.getMachine(i);
                var machinezcount = currentmachine.StateBits;
                for(e = 0; e < machinezcount; e++){
                    arguments.push("a" + i + "z" + e + ":" + "1");
                }
            }


            expression.computearray(arguments);

        }catch(err){
            error = true;
            var splitting = err.split(":");
            errorstring = splitting[splitting.length - 1].replaceAll("!", "");
        }

        if (error) {
            throw new Error("The expression is not valid! Please check it for errors or add new names or operators to the table! Bad equation: " + errorstring);
        }
    };


    /**
     * Checks whether an z equation is in the correct form or not. This includes checking for unknown names(unknown to inputnames and outputnames)
     * and for unknown signs.
     * @method checkZEquation
     * @private
     * @param {string} equation Equation to check.
     * @throws {InvalidZEquation} Throws an exception that the z equation is invalid.
     */
    this.checkZEquation = function(equation) {
        var i,e;
        var error = false;
        var errorstring = "";
        var correctvariable = false;

        equation = this.EquationToNormalEquation(equation);

        var variable = equation.split("=")[0];

        for(var i = 0; i < statebits; i++){
            if(variable == "z" + i){
                correctvariable = true;
                break;
            }
        }

        if(!correctvariable){
            throw new Error("Missing correct z variable!");
        }


        equation = equation.split("=")[1];

        var length = inputNames.length;
        for (i = 0; i < length; i++) {
            var logicequation = Logic.evaluateExpression(equation);
            logicequation.renameVariable(extractRenaming(inputNames[i]), "x" + i);
            equation = logicequation.toString();
        }

        try {
            var expression = Logic.evaluateExpression(equation);
            expression.sortExp(true);
            var arguments = [];

            for (i = 0; i < inputnumber; i++) {
                arguments.push("x" + i + ":" + "1");
            }

            for (i = 0; i < statebits; i++) {
                arguments.push("z" + i + ":" + "1");
            }

            var machinecount = giftstate.getHighestMachineNumber();

            for(i = 0; i <= machinecount; i++){
                var currentmachine = giftstate.getMachine(i);
                var machinezcount = currentmachine.StateBits;
                for(e = 0; e < machinezcount; e++){
                    arguments.push("a" + i + "z" + e + ":" + "1");
                }
            }


            expression.computearray(arguments);

        }catch(err){
            error = true;
        }

        if (error) {
            throw new Error("The expression is not valid! Please check it for errors or add new names or operators to the table! Bad equation: " + errorstring);
        }

    };



    this.checkHReduce = function(equation){
        var i,e;
        var error = false;

        try {
            var expression = Logic.evaluateExpression(equation);
            var arguments = [];

            for (i = 0; i < inputnumber; i++) {
                arguments.push("x" + i + ":" + "1");
            }

            for (i = 0; i < statebits; i++) {
                arguments.push("z" + i + ":" + "1");
            }

            var machinecount = giftstate.getHighestMachineNumber();

            for(i = 0; i <= machinecount; i++){
                var currentmachine = giftstate.getMachine(i);
                var machinezcount = currentmachine.StateBits;
                for(e = 0; e < machinezcount; e++){
                    arguments.push("a" + i + "z" + e + ":" + "1");
                }
            }


            expression.computearray(arguments);

        }catch(err){
            error = true;
        }

        if (error) {
            throw new Error("The expression is not valid! Please check it for errors or add new names or operators to the table! Bad equation: " + errorstring);
        }
    };

    /**
     * Checks whether an y equation is in the correct form or not. This includes checking for unknown names(unknown to inputnames and outputnames)
     * and for unknown signs.
     * @method checkYEquation
     * @private
     * @param {string} equation Equation to check.
     * @throws {InvalidZEquation} Throws an exception that the y equation is invalid.
     */
    this.checkYEquation = function(equation) {
        var i,e;
        var error = false;
        var errorstring = "";
        var correctvariable = false;

        equation = this.EquationToNormalEquation(equation);

        var variable = equation.split("=")[0];

        for(var i = 0; i < outputnumber; i++){
            if(variable == "y" + i){
                correctvariable = true;
                break;
            }
        }

        if(!correctvariable){
            throw new Error("Missing correct y variable!");
        }

        equation = equation.split("=")[1];

        try {
            var expression = Logic.evaluateExpression(equation);
            expression.sortExp(true);
            var arguments = [];

            for (i = 0; i < inputnumber; i++) {
                arguments.push("x" + i + ":" + "1");
            }

            for (i = 0; i < statebits; i++) {
                arguments.push("z" + i + ":" + "1");
            }

            var machinecount = giftstate.getHighestMachineNumber();

            for(i = 0; i <= machinecount; i++){
                var currentmachine = giftstate.getMachine(i);
                var machinezcount = currentmachine.StateNumber;
                for(e = 0; e < machinezcount; e++){
                    arguments.push("a" + i + "z" + e + ":" + "1");
                }
            }


            expression.computearray(arguments);

        }catch(err){
            error = true;
        }

        if (error) {
            throw new Error("The expression is not valid! Please check it for errors or add new names or operators to the table! Unknown subexpression: " + equation);
        }
    };

    /**
     * Extracts the number of the z or y equation given to it.
     * @method extractEquationNumber
     * @private
     * @param {string} equation
     * @returns integer
     * @example
     *      extractEquationNumber("z0=z0+/z1+x1") // -> returns 0 because it's an equation for z0
     */
    function extractEquationNumber(equation) {
        var zystring = equation.split("=")[0];
        var i;
        var length = Math.max(outputnumber, statebits);

        for (i = 0; i < length; i++) {
            if (zystring == ("z" + i) || zystring == ("y" + i)) {
                return i;
            }
        }
        throw new Error("Equation number is not correct or to large!");
    }

    /**
     * Checks whether the states exist in the transition matrice.
     * @method checkStatesExist
     * @private
     * @param {integer} begin State to begin the edge.
     * @param {integer} end State to end the edge.
     * @throws {StateDoesNotExist} Throws an exception that the state does not exist.
     */
    function checkStatesExist(begin, end) {
        if (begin >= stateNumber) {
            throw new Error("State " + begin + " as an begin state does not exist!");
        } else if (end >= stateNumber) {
            throw new Error("State " + end + " as an end state does not exist!");
        }
    }

    /**
     * Extracts the new name for a variable.
     * @method extractRenaming
     * @private
     * @param {string} rename Contains the renaming.
     * @returns string
     * @example
     *      extractRenaming("x1:in1"); // -> return "in1"
     */
    function extractRenaming(rename) {
       if(rename != undefined){
           return rename.split(":")[1];
       }
       return "";
    }

    /**
     * Extracts the normal name for a variable.
     * @method extractName
     * @private
     * @param {string} rename Contains the renaming.
     * @returns string
     * @example
     *  extractRenaming("x1:in1"); // -> return "x1"
     */
    function extractName(rename) {
        return rename.split(":")[0];
    }

    /**
     * Checks whether a string starts with a certain substring.
     * @method StringStartsWith
     * @private
     * @param {string} inputstring String to check.
     * @param {string} startstring String that could be substring at the beginning of the inputstring.
     * @returns {boolean} True when the string starts with the substring.
     */
    function StringStartsWith(inputstring, startstring) {
        if (inputstring.indexOf(startstring) != 0) {
            return false;
        }
        return true;
    }

    /**
     * Removes whitespaces from a string.
     * @method preformatEquation
     * @private
     * @param {string} equation
     * @returns string
     */
    function preformatEquation(equation) {
        return equation.replace(/ /g, '').toLowerCase();
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


    function undefineArray(array){
        var length = array.length;

        for(var i = 0; i < length; i++){
            array[i] = undefined;
        }
    }

    function createArrayAndSortArrayByStringLength(array){
        var arr = [].concat(array);
        arr.sort(function(a,b){
            return a.length>b.length
        });
        return arr;
    }

	this.toJSON = function() {
        return {
            "stateNumber": stateNumber,
            "transitionTable": transitionTable,
            "outputEquations": outputEquations,
            "zEquations": zEquations,
            "inputNames": inputNames,
            "outputNames": outputNames,
            "stateNames": stateNames,
            "returnWithNames": returnWithNames,
            "operators": operators,
            "hReduce": hReduce,
            "inputnumber": inputnumber,
            "outputnumber": outputnumber,
            "graphStorage": graphStorage,
            "yEquations": yEquations,
            "statebits":statebits,
            "maxstatebits":maxstatebits,
            "minstatebits":minstatebits,
            "maxinputnumber":maxinputnumber,
            "maxoutputnumber":maxoutputnumber,
            "zEquationsminimized": zEquationsminimized,
            "zEquationshreducedminimized":zEquationshreducedminimized,
            "yEquationsminimized": yEquationsminimized,
            "yEquationshreducedminimized": yEquationshreducedminimized,
            "changed": changed,
            "changearray":changearray,
            "machinenumber": machinenumber,
            "machinename": machinename
        };
    };


    this.createOnData = function (data){
        stateNumber = data.stateNumber;
        transitionTable = replaceNullTransition(data.transitionTable);
        outputEquations = replaceNull(data.outputEquations);
        zEquations = replaceNull(data.zEquations);
        inputNames = data.inputNames;
        outputNames = data.outputNames;
        stateNames = data.stateNames;
        returnWithNames = data.returnWithNames ;
        operators = data.operators;
        hReduce  = data.hReduce;
        inputnumber = data.inputnumber;
        outputnumber = data.outputnumber;
        graphStorage = data.graphStorage;
        yEquations = data.yEquations;
        statebits = data.statebits;
        maxstatebits = data.maxstatebits;
        minstatebits = data.minstatebits;
        maxinputnumber = data.maxinputnumber;
        maxoutputnumber = data.maxoutputnumber;
        zEquationsminimized = data.zEquationsminimized;
        zEquationshreducedminimized = data.zEquationshreducedminimized;
        yEquationsminimized = data.yEquationsminimized;
        yEquationshreducedminimized = data.yEquationshreducedminimized;
        changed = data.changed;
        changearray = data.changearray;
        machinenumber = data.machinenumber;
        machinename = data.machinename;
    };


    function replaceNullTransition(matrice) {
        for (var i = 0; i < stateNumber; i++) {
            for (var e = 0; e < stateNumber; e++) {
                var tempstring = matrice[i][e];
                if (tempstring == null) {
                    tempstring = undefined;
                }
                matrice[i][e] = tempstring;
            }
        }
        return matrice;
    }

    function replaceNull(array) {
        for (var i = 0; i < array.length; i++) {
           if(array[i] == null){
               array[i] = undefined;
           }
        }
        return array;
    }

}


function ChangeStruct(){
    this.Inputs = new Array(4);
    this.Outputs = new Array(4);
    this.SimFlops = new Array(2);

    initArray(this.Inputs);
    initArray(this.Outputs);
    initArray(this.SimFlops);


    function initArray(arr){
        var i;
        for(i = 0; i < arr.length; i++){
            arr[i] = true;
        }
    }
}



function getYName(yvariable){
    var i = 0;
    var tempstring;
    for( i; i < machine.Outputnames.length; i++){
        tempstring  = machine.Outputnames[i].split(":")[0];
        if(tempstring == yvariable){
            return  machine.Outputnames[i].split(":")[1];
        }
    }
    return yvariable;

}

function  getHighestInputValue(){
    var i = 0, e = 0;
    var statenumber = machine.StateNumber;
    var returnwithnames = machine.ReturnWithNames;
    var highest = 0;
    var tempnumber;
    machine.ReturnWithNames = false;

    for(i; i < statenumber; i++){
        for(e; e < statenumber; e++){
            tempnumber = extractHighestInputValueOfEquation(machine.getTransition(i, e));
            if(tempnumber > highest){
                highest = tempnumber;
            }
        }
    }

    machine.ReturnWithNames = returnwithnames;
    return highest;



}


function getHighestOutputValue(){
    var i, e;
    var statenumber = machine.StateNumber;
    var outputnumber = machine.OutputNumber;
    var highest = 0;
    var tempequation = "";
    var tempequationright = "";
    for(i = 0; i <statenumber; i++){
        for(e = 0; e < outputnumber; e++){
            tempequation = machine.getOutputEquation(i, "y" + e);
            if(tempequation != undefined ){
                tempequationright = tempequation.split("=")[1];
                if(tempequationright != 0){
                    highest = e;
                }
            }
        }
    }
    return highest;
}


function extractHighestInputValueOfEquation(equation){
    var numberPattern = (/x\d+/g);

    equation = machine.EquationToNormalEquation(equation);


    var varnames = equation.match(numberPattern);
    if(varnames == null){
        return 0;
    }
    var varnumbers = [];
    var i;
    var maxnumber = 0;

    for(i = 0; i < varnames.length; i++){
        var temp = varnames[i].replaceAll("x", "");
        varnumbers.push(parseInt(temp));
    }
    if(varnumbers.length > 0){
        maxnumber = getMaxOfArray(varnumbers);
    }


    function getMaxOfArray(numArray) {
        return Math.max.apply(null, numArray);
    }

    return maxnumber;

}

