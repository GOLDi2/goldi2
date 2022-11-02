/**
 * Created by Stephen Ahmad on 04.05.2015.
 */



/**
 * Contains classes for computing equations.
 * @module computation
 *
 */

/**
 * Is an logic interpreter for boolean equations.<br>
 * Operators:
 *  <ul style="list-style-type:disc">
 *      <li>+ -> AND</li>
 *      <li>'*' -> OR</li>
 *      <li>/ -> NOT</li>
 *  </ul>
 *
 * @Class Logic
 */



var Logic = (function() {

    /**
     * Decides whether position is in parenthesis or not.
     * @method inParenthesis
     * @param {string} inpustring variable to search in
     * @param {integer} position  position to check
     * @return Boolean
     */
    var inParenthesis = function (inputstring, position) {
        var countparenthesis = 0;
        for (var i = 0; i < position; i++) {
            if (inputstring[i] == "(") {
                countparenthesis++;
            } else if (inputstring[i] == ")") {
                countparenthesis--;
            }
        }

        if (countparenthesis == 0) {
            return false;
        }
        return true;
    };

    /**
     * Deletes outer parenthesis.
     * @method deleteOuterParenthesis
     * @param {string} expression
     * @return string
     * @example
     *      "(x1+x2)" -> "x1+x2"
     *          or
     *      "x1+(x2*x3)" -> "x1+(x2*x3)"
     *
     *      -> only outer parenthesis
     */
    function deleteOuterParenthesis(expression) {
        if (expression.length < 3) {
            return expression;
        }


        expression = expression.trim();
        if (expression[0] == "(" && expression[expression.length - 1] == ")") {
            var i;
            var length = expression.length;
            var counter = 1;


            for (i = 1; i < length; i++) {
                if (expression[i] == '(') {
                    counter++;
                } else if (expression[i] == ')') {
                    counter--
                }
                if (counter == 0 && i != length - 1) {
                    return expression;
                }
            }
            expression = expression.slice(1, expression.length - 1);
        }

        return expression;
    };

    /**
     * Convert a string into a Value.
     * @method transformStringToValue
     * @param {string} expression
     * @return string
     * @example
     *      possible values:
     *      -> true/false
     *      -> 1/0
     *
     *      not case sensitiv
     */
    var transformStringToValue = function (input) {
        input = input.split(":")[1].toUpperCase().trim();
        if (input.indexOf("TRUE") != -1 || input.indexOf("FALSE") != -1) {
            if (input == "TRUE") {
                return true;
            } else if (input == "FALSE") {
                return false;
            }
        }
        if (input.indexOf("1") != -1 || input.indexOf("0") != -1) {
            if (input == "1") {
                return true;
            } else if (input == "0") {
                return false;
            }
        }
        throw new Error("Wrong input value form!");
    };

    /**
     * Sorts the {{#crossLink "Logic/expressions:property"}}expressions{{/crossLink}} array by priority.
     * @method transformStringToValue
     * @param {string} expression
     */
    var sortExpressionsByPriority = function ()  {
        function compare(a, b) {
            if (a.priority < b.priority)
                return -1;
            if (a.priority > b.priority)
                return 1;
            return 0;
        }

        expressions.sort(compare);
    };


    /**
     * Contains the expression objects the logic can handle.
     * @property expressions
     * @private
     * @type Array
     * @default null
     */
    var expressions;

    /**
     * Evaluates an expression for further computation.
     * @example
     *      var logicobject = Logic.evaluateExpression("(x1+/x2)*x2+x3");
     *      var result = logicobject.compute("x1:0", "x2:1", "x3:1");
     *      //      or
     *      var result = logicobject.compute("x1:false", "x2:true", "x3:true");
     *      //      or
     *      var result = logicobject.compute("x1:false", "x3:1","x2:1");
     * @method evaluateExpression
     * @param {string} expression
     * @return {Expression} Returns root expression object.
     */
    var evaluateExpression = function (expression) {


        expression = expression.replace(/\s/g, '');
        while(expression != deleteOuterParenthesis(expression)){
            expression = deleteOuterParenthesis(expression)
        }

        sortExpressionsByPriority();

        var i = 0;
        var found = true;
        while (!expressions[i].isExpression(expression)) {
            i++;
            if (i >= expressions.length) {
                found = false;
                break;
            }
        }

        if (found) {
            var result = expressions[i].create(expression);
            result.evaluate(expression);
            return result;
        }

        //throw new Error("Couldn't evaluate Expression!");

    };

    /**
     * @Class Expression
     */
    var Expression = function () {
        /**
         * Contains the strings of the current expression's subexpressions.
         * @property splitexpressions
         * @public
         * @type Array<String>
         * @default []
         */
        this.splitexpressions = [];
        /**
         * Contains the subexpressions of the current expression.
         * @property expressions
         * @public
         * @type Array<Expression>
         * @default []
         */
        this.subexpressions = [];

        /**
         * Contains the name of the current expression.
         * @property name
         * @type string
         * @default ""
         */
        Expression.prototype.name = "";
        /**
         * Contains the priority of the current expression. The priority is used to determine the order in which the expressions are to be interpreted.
         * @property priority
         * @type integer
         * @default 0
         */
        Expression.prototype.priority = 0;
        /**
         * Contains the symbol of the current expression. That's supposed to be operator of the current expression.
         * @property symbol
         * @type string
         * @default ""
         */
        Expression.prototype.symbol = "";
        /**
         * Contains the unsplit string given to the current expression by the super expression.
         * @property expression
         * @type string
         * @default ""
         */
        Expression.prototype.expression = "";

        /**
         * Contains the type of the current object.
         * @property type
         * @type string
         * @default ""
         */
        Expression.prototype.type = "";

        /**
         * Evaluates an expression for further computation.
         * @method evaluate
         * @param {string} expression
         * @return {Expression} Returns root {{#crossLink "Expression"}}expression{{/crossLink}} object.
         */
        this.evaluate = function () {
            var i = 0;
            var position = 0;
            var stringposition = 0;
            while (this.expression.indexOf(this.symbol, i) != -1) {
                position = this.expression.indexOf(this.symbol, i);
                if (!inParenthesis(this.expression, position)) {
                    this.splitexpressions.push(this.expression.slice(stringposition, position));
                    i = position + this.symbol.length;
                    stringposition = i;
                } else {
                    i = position + this.symbol.length;
                }

            }
            this.splitexpressions.push(this.expression.slice(stringposition, this.expression.length));

            for (var i = 0; i < this.splitexpressions.length; i++) {
                this.subexpressions.push(evaluateExpression(this.splitexpressions[i]));

            }
        };

        /**
         * Decides whether string contains this expression or not.
         * @method isExpression
         * @param {string} expression
         * @return Boolean
         */
        this.isExpression = function (expression) {
            var i = 0;
            var position = 0;
            while (expression.indexOf(this.symbol, i) != -1) {
                position = expression.indexOf(this.symbol, i);
                if (!inParenthesis(expression, position)) {
                    return true;
                } else {
                    i = position + this.symbol.length;
                }

            }
            return false;
        };

        /**
         * Calculates an expression. It is used for recursive function calls. The user calls the compute method.
         * @method calculate
         * @private
         * @param {Array<string>} values Values for the variables contained in the expression.
         * @return {integer} Returns calculated expression value.
         */
        this.calculate = function (expression) {
            throw new Error("Not implemented");
        };

        /**
         * Computes an expression.
         * @method computearray
         * @public
         * @param {Array<string>} values Values for the variables contained in the expression.
         * @return {integer} Returns computed expression value.
         */
        this.computearray = function(expressionarray){
            return this.calculate(expressionarray);
        };

        /**
         * Computes an expression.
         * @method compute
         * @public
         * @param {...string} values Values for the variables contained in the expression.
         * @return {integer} Returns computed expression value.
         */
        this.compute = function (){
            return this.calculate(arguments);
        };


        /**
         * Creates an expression object like the current expression object.
         * @method create
         * @public
         * @param {string} expression
         * @return {Expression} Returns created {{#crossLink "Expression"}}expression{{/crossLink}} object.
         */
        this.create = function () {
            throw new Error("Not implemented");
        };

        /**
         * Finds the next occurrence of an expression.
         * @method nextPosition
         * @param {string} expression
         * @param {string} position
         * @return {Expression} Returns created {{#crossLink "Expression"}}expression{{/crossLink}} object.
         */
        this.nextPosition = function (expression, position) {
            var i = position;
            var position = 0;
            while (expression.indexOf(this.symbol, i) != -1) {
                position = expression.indexOf(this.symbol, i);
                if (!inParenthesis(expression, position)) {
                    return position;
                } else {
                    i = position + this.symbol.length;
                }

            }
            return -1;
        };

        /**
         * @method ToString
         * @return {string} Returns expression as a string.
         */
        this.toString = function (){
            throw Error("Not implemented!");
        };

        /**
         * @method checkParenthesisNeeded
         * @param {Expression} innerexp Inner expression which may needs parenthesis.
         * @returns {boolean} Decides wether parenthesis around the inner one are needed.
         */
        this.checkParenthesisNeeded = function(innerexp){
            if(innerexp.priority < this.priority){
                return true;
            }
            return false;
        };

        /**
         * @method setInParenthesis
         * @param  {string} exp Expression to set in parenthesis.
         * @returns {string} Expression set in parenthesis.
         */
        this.setInParenthesis = function (exp){
            return "(" + exp + ")";
        };


        /**
         * @method renameVariable
         * @param {string} expvar Variable to rename.
         * @param {string} expvarrenamed Variable's new name.
         */
        this.renameVariable = function (expvar, expvarrenamed){
            var length = this.subexpressions.length;
            for(var i = 0; i < length ; i++){
                this.subexpressions[i].renameVariable(expvar, expvarrenamed);
            }
        };

        /**
         * @method findSubexpression
         * @param {string} subexp Subexpression to find.
         * @returns {boolean} True when expression is found.
         */
        this.findSubexpression = function(subexp){
            var length = this.subexpressions.length;
            if(this.toString() === subexp){
                return true;
            }
            
            for(var i = 0; i < length ; i++){
                    if(this.subexpressions[i].findSubexpression(subexp)){
                        return true;
                    }
            }
            return false;
        };
        

        /**
         * @method renameOperator
         * @param {string} expop Operator symbol to change.
         * @param {string} expoprenamed Symbol to change into.
         */
        this.renameOperator = function(expop, expoprenamed){
            if(this.symbol === expop){
                this.symbol = expoprenamed;
            }
            var length = this.subexpressions.length;
            for(var i = 0; i < length ; i++){
                this.subexpressions[i].renameOperator(expop, expoprenamed);
            }
        };

        /**
         *
         * @method sortExp
         * @param {bool} ascending Decides wether to sort ascending or not.
         */
        this.sortExp = function(ascending){
            var dict = [];
            var length = this.subexpressions.length;

            for(var i = 0; i < length; i++) {
                dict.push({
                    key: i,
                    value: this.subexpressions[i].sortExp(ascending)
                });
            }

            dict.sort(function (a, b) {
                if (a.value === b.value) {
                    return 0;
                }
                if(ascending) {
                    return a.value < b.value ? -1 : 1;
                }else{
                    return a.value > b.value ? -1 : 1;
                }
            });

            var newarr = new Array(length);

            for(var i = 0; i < length; i++){
                newarr[i] = this.subexpressions[dict[i].key];
            }

            this.subexpressions = newarr;
            if(ascending) {
                return dict[dict.length - 1].value;
            }else{
                return dict[0].value;
            }
        }

        /**
         * Reduces some unnecessary subexpressions.
         * Examples:
         *
         * x1+x2+1 => 1
         * x1+x2+0 => x1+x2
         *
         * x1*x2*0 => 0
         * x1*x2*1 => x1*x2
         *
         * /1 => 0
         * /0 => 1
         *
         * @method SimpleReduce
         *
         */
        this.SimpleReduce = function(){
            var type = this.Type();
            var subtype;
            var exp = new expValue();
            var length = this.subexpressions.length;
            if(length == 0){
                return this;
            }

            var createValueExp = function(value){
                var returnexp = exp.create(value);
                returnexp.evaluate(value);
                return returnexp;
            };

            for(var i = 0; i < length ; i++){
                this.subexpressions[i] = this.subexpressions[i].SimpleReduce();
                subtype = this.subexpressions[i].Type();
                if(type === "expOR"){
                    if(subtype === "expValue"){
                        if(this.subexpressions[i].compute() === 1){
                            return createValueExp("1");
                        }else{
                            this.subexpressions[i] = undefined;
                        }
                    }
                }else if(type === "expAND"){
                    if(subtype === "expValue"){
                        if(this.subexpressions[i].compute() === 0){
                            return createValueExp("0")
                        }else{
                            this.subexpressions[i] = undefined;
                        }
                    }
                }else if(type === "expNOT"){
                    if(subtype === "expValue"){

                        var exp = new expValue();

                        if(this.subexpressions[i].value === 1){
                            return createValueExp("0");
                        }else{
                            return createValueExp("1");
                        }
                    }
                }


            }
            var tempsubexpressions = [];

            for(var i = 0; i < length ; i++) {
                if(this.subexpressions[i] != undefined){
                    tempsubexpressions.push(this.subexpressions[i]);
                }
            }

            if(tempsubexpressions.length == 0){
                if(type == "expOR"){
                    tempsubexpressions.push(createValueExp(0));
                }else if(type == "expAND"){
                    tempsubexpressions.push(createValueExp(1));
                }
            }

            this.subexpressions = tempsubexpressions;

            return this;
        };

        /**
         * @method Type
         */
        this.Type = function(){
            return this.type;
        }

    };

    /**
     * @Class expAND
     * @uses Expression
     */
    var expAND = function (expression) {
        Expression.call(this);
        this.expression = expression;
        this.type = 'expAND';
        this.symbol = "*";
        this.priority = 1;

        /**
         * Creates an expression object like the current expAND object.
         * @method create
         * @param {string} expression
         * @return expAND
         */
        this.create = function (expression) {
            return new expAND(expression);
        };
        /**
         * Calculates an AND expression.
         * @method calculate
         * @param {integer} value
         * @return {integer} Returns computed expression value.
         */
        this.calculate = function (arguments) {
            var temp = true;
            for (var i = 0; i < this.subexpressions.length; i++) {
                temp = temp & this.subexpressions[i].calculate(arguments);
            }
            return temp;
        };

        this.toString = function (){
            var exp = "";
            var length = this.subexpressions.length;
            for(var i = 0; i < length; i++){
                var subexp = this.subexpressions[i].toString();
                if(subexp == "0") {
                    return "0";
                }
                if(length != 1 && this.checkParenthesisNeeded(this.subexpressions[i])){
                    exp += this.setInParenthesis(subexp);
                }else {
                    exp += subexp;
                }
                if(i != length - 1){
                    exp += this.symbol;
                }
            }
            return exp;
        };
    };

    /**
     * @Class expOR
     * @uses Expression
     */
    var expOR = function (expression) {
        Expression.call(this);
        this.expression = expression;
        this.type = 'expOR';
        this.symbol = "+";
        this.priority = 0;

        /**
         * Creates an expression object like the current expOR object.
         * @method create
         * @param {string} expression
         * @return expOR
         */
        this.create = function (expression) {
            return new expOR(expression);
        };

        /**
         * Calculates an OR expression.
         * @method calculate
         * @param {integer} value
         * @return {integer} Returns computed expression value.
         */
        this.calculate = function (arguments) {
            var temp = false;
            for (var i = 0; i < this.subexpressions.length; i++) {
                temp = temp | this.subexpressions[i].calculate(arguments);
            }
            return temp;
        };

        this.toString = function (){
            var exp = "";
            var length = this.subexpressions.length;
            for(var i = 0; i < length; i++){
                var subexp = this.subexpressions[i].toString();
                if(subexp == "1") {
                    return "1";
                }
                if(length != 1 && this.checkParenthesisNeeded(this.subexpressions[i])){
                    exp += this.setInParenthesis(subexp);
                }else {
                    exp += subexp;
                }
                if(i != length - 1){
                    exp += this.symbol;
                }
            }
            return exp;
        }

    };

    /**
     * @Class expNOT
     * @uses Expression
     */
    var expNOT = function (expression) {
        Expression.call(this);
        this.expression = expression;
        this.symbol = "/";
        this.type = 'expNOT';
        this.priority = 98;

        /**
         * Creates an expression object like the current expNOT object.
         * @method create
         * @param {string} expression
         * @return expNOT
         */
        this.create = function (expression) {
            return new expNOT(expression);
        };

        /**
         * Decides whether string contains this expression or not.
         * @method isExpression
         * @param {string} expression
         * @return Boolean
         */
        this.isExpression = function (expression) {
            if(expression.indexOf(this.symbol, 0) != 0){
                return false;
            }
            return true;
        };

        /**
         * Evaluates an expression for further computation.
         * @method evaluate
         * @param {string} expression
         * @return {Expression} Returns root {{#crossLink "Expression"}}expression{{/crossLink}} object.
         */
        this.evaluate = function () {
            var position = this.expression.indexOf(this.symbol);
            var smallest = Number.MAX_VALUE;
            for (var i = 0; i < expressions.length; i++) {
                var currentpos = expressions[i].nextPosition(this.expression, position + this.symbol.length);
                if (currentpos != -1 && currentpos < smallest) {
                    smallest = currentpos;
                }
            }
            if (currentpos = -1) {
                currentpos = this.expression.length;
            }
            this.splitexpressions.push(this.expression.slice(position + this.symbol.length, currentpos));

            for (var i = 0; i < this.splitexpressions.length; i++) {
                this.subexpressions.push(evaluateExpression(this.splitexpressions[i]));
            }
        };

        /**
         * Calculates a NOT expression.
         * @method calculate
         * @param {integer} value
         * @return {integer} Returns computed expression value.
         */
        this.calculate = function (arguments) {
            return Number(!this.subexpressions[0].calculate(arguments));
        };

        this.toString = function () {
            var exp = this.symbol + this.subexpressions[0].toString();
            if(this.subexpressions[0].type == 'expAND' || this.subexpressions[0].type == 'expOR'){
                exp = this.symbol +  "(" + this.subexpressions[0].toString() + ")";
            }
            return exp;
        };

        this.sortExp = function(ascending){
            return this.subexpressions[0].sortExp(ascending);
        }

    };

    /**
     * @Class expValue
     * @uses Expression
     */
    var expValue = function (expression) {
        Expression.call(this);
        this.expression = expression;
        this.symbol = "";
        this.type = 'expValue';
        this.value = undefined;
        this.priority = 99;

        /**
         * Creates an expression object like the current expvariable object.
         * @method create
         * @param {string} expression
         * @return expValue
         */
        this.create = function (expression) {
            return new expValue(expression);
        };

        /**
         * Decides whether string contains this expression or not.
         * @method isExpression
         * @param {string} expression
         * @return Boolean
         */
        this.isExpression = function (expression) {
            if (expression == "1" || expression == "0") {
                return true;
            }
            return false;
        };

        /**
         * Evaluates an expression for further computation.
         * @method evaluate
         * @param {string} expression
         * @return {Expression} Returns root {{#crossLink "Expression"}}expression{{/crossLink}} object.
         */
        this.evaluate = function(expression){
            this.value = Number(expression);
        };

        /**
         * Calculates a value expression.
         * @method calculate
         * @param {integer} value
         * @return {integer} Returns computed expression value.
         */
        this.calculate = function (){
            return this.value;
        };

        this.toString = function (){
            var exp = this.value.toString();
            return exp;
        };

        this.sortExp = function(ascending){
            return this.value;
        };

        this.renameOperator = function(expop, expoprenamed){
            return;
        };
        
        this.findSubexpression = function (subexp) {
            if(subexp === this.expression){
                return true;
            }
            return false;
        };
    };


        /**
     * @Class expVariable
     * @uses Expression
     */
    var expVariable = function (symbol, expression) {
        Expression.call(this);
        this.expression = symbol;
        this.symbol = symbol;
        this.priority = 100;
        this.type = 'expVariable';
        this.value;


        /**
         * Evaluates an expression for further computation.
         * @method evaluate
         * @param {string} expression
         * @return {Expression} Returns root {{#crossLink "Expression"}}expression{{/crossLink}} object.
         */
        this.evaluate = function () {
            this.splitexpressions.push(this.expression);
        };

        /**
         * Decides whether string contains this expression or not.
         * @method isExpression
         * @param {string} expression
         * @return Boolean
         */
        this.isExpression = function (expression) {
            //if(expression.replace(/^\s*([0-9a-zA-Z]*)\s*$/gi,'') == '') {
                return true;
            //}
            //return false;
        };

        /**
         * Creates an expression object like the current expVariable object.
         * @method create
         * @param {string} expression
         * @return expVariable
         */
        this.create = function (expression) {
            return new expVariable(expression);
        };

        /**
         * Calculates an variable expression.
         * @method calculate
         * @param {integer} value
         * @return {integer} Returns computed expression value.
         */
        this.calculate = function (arguments) {
            if(this.symbol === "0" || this.symbol === "1"){
                return Number(this.symbol);
            }

            var found = false;
            var length = arguments.length;
            for (var i = 0; i < length; i++) {
                if (this.symbol == extractName(arguments[i])) {
                    this.value = transformStringToValue(arguments[i]);
                    found = true;
                }
            }

            if(this.symbol == ""){
                found = false;
            }
            if(!found){
             throw new Error("Missing value for: " + this.symbol + " or syntax error in this expression: \"" + this.symbol) + "\"!";
            }
            return Number(this.value);
        };


        this.toString = function (){
            return this.symbol;
        };

        this.renameVariable = function(expvar, expvarrenamed){
          if(this.symbol == expvar)      {
              this.symbol = expvarrenamed;
          }
        };

        this.renameOperator = function(expop, expoprenamed){
           return;
        };
            

        this.sortExp = function (ascending){
            return this.symbol;
        };

        this.findSubexpression = function (subexp) {
            if(subexp === this.symbol){
                return true;
            }
            return false;
        };
            

    };


    expressions = [new expAND(), new expOR(), new expNOT(), new expValue(), new expVariable()];

    function extractName(expression){
        return expression.split(":")[0];
    }

    return{
        evaluateExpression: evaluateExpression,
        compute : Expression.compute,
        computearray : Expression.computearray
    };
})();



