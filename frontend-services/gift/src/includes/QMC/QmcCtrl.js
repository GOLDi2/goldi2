/**
 * Created by Stephen Ahmad on 17.05.2015.
 */

var sqmc = function() {

    this.compute = function (equation, bits) {
        var i;
        var length = bits;
        var usednames = [];
        var usedcounter = 0;

        for (i = 0; i < length; i++) {
            if (equation.indexOf("x" + i) != -1) {
                usednames.push(i);
                equation = equation.replaceAll("x" + i, "x" + usedcounter);
                usedcounter++;
            }
        }

        var qmc = new QuineMcCluskey('', usedcounter, 1);
        qmc.init();


        var normalize = new EquationNormalizer();
        var vec = normalize.calculateTruthVector(equation, usedcounter);

        qmc.data.clear();

        for(i = 0; i < vec.length; i++){
            if(vec[i] == 1){
                qmc.data.activated(i);
            }
        }

        qmc.data.compute();
        equation = qmc.data.minimalTerm;

        for (i = 0; i < usedcounter; i++) {
            equation = equation.replaceAll("x" + i, "v" + usednames[i]);
        }
        equation = equation.replaceAll("v" , "x");

        return deleteOuterParenthesis(equation);
    };


    var deleteOuterParenthesis = function (expression) {
        if (expression.length < 3) {
            return expression;
        }

        expression = expression.trim();
        if (expression[0] == "(" && expression[expression.length - 1] == ")") {
            expression = expression.slice(1, expression.length - 1);
        }
        return expression;
    };




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

};


var testqmc = new sqmc();
var normalizetwo = new EquationNormalizer();
var testring = normalizetwo.normalizeToCDNF("x1*x2", 10);
var result = testqmc.compute(testring, 10);
console.log(testring);
console.log(result);
