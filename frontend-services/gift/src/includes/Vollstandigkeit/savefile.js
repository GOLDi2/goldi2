/**
 * Created by Sönke on 07.12.2015.
 */
/**
 * Extracts the parts with transitions from other state graphs and replaces them with x variables
 * @method modifyTransitionPair
 * @private
 * @param {string} transitionPair transition pair
 * @param {int} inputNumber number of inputs in the active state machine
 * @return {string} modified transition pair
 */

var modifyTransitionPair= function(transitionPair, inputNumber)
{
    transitionPair = transitionPair.toString();
    var index = 0;
    var newInputs = 0;
    var maxIndex = Math.max.apply(null, transitionPair.match(/\d+/g));

    while (transitionPair.search('a') != -1)
    {
        if (transitionPair.search('a' + index) != -1) {
            for (var i = 0; i <= maxIndex; i++) {
                if(transitionPair.search('a' + index + 'z' + i) != -1)  {
                    var matchExp = new RegExp("a" + index + "[z]" + i, "g");
                    transitionPair = transitionPair.replace(matchExp, "x" + inputNumber);
                    inputNumber += 1;
                    newInputs += 1;
                }
            }
        }
        index += 1;
    }

    if (additionalInputs < newInputs){
        additionalInputs = newInputs;
    }

    return transitionPair;
};




/**
 * Extracts the parts with transitions from other state graphs and replaces them with x variables
 * @method modifyEquation
 * @private
 * @param {string} activeEquation equation
 * @param {int} inputNumber number of inputs in the active state machine
 * @return {string} equation modified equation
 */

var modifyEquation= function(activeEquation, inputNumber)
{
    var index = 0;
    var newInputs = 0;
    var maxIndex = Math.max.apply(null, activeEquation.match(/\d+/g));

    while (activeEquation.search('a') != -1)
    {
        if (activeEquation.search('a' + index) != -1) {
            for (var i = 0; i <= maxIndex; i++) {
                if(activeEquation.search('a' + index + 'z' + i) != -1)  {
                    var matchExp = new RegExp("a" + index + "[z]" + i, "g");
                    activeEquation = activeEquation.replace(matchExp, "x" + inputNumber);
                    inputNumber += 1;
                    newInputs += 1;
                }
            }

        }
        index += 1;
    }

    if (additionalInputs < newInputs)
    {
        additionalInputs = newInputs;
    }

    return activeEquation;
};



var replaceStatesWithXVariables= function(inputEquation1 , inputEquation2, inputNumber, additionalInputs) {
    var result = [];
    var inputEquations;
    (inputEquation2 != 0) ? inputEquations = inputEquation1.toString() + "|" + inputEquation2.toString() : inputEquations = inputEquation1.toString();
    var index = 0;
    var newInputs = 0;
    var maxIndex = Math.max.apply(null, inputEquations.match(/\d+/g));

    while (inputEquations.search('a') != -1) {
        if (inputEquations.search('a' + index) != -1) {
            for (var i = 0; i <= maxIndex; i++) {
                if (inputEquations.search('a' + index + 'z' + i) != -1) {
                    var matchExp = new RegExp("a" + index + "[z]" + i, "g");
                    inputEquations = inputEquations.replace(matchExp, "x" + inputNumber);
                    inputNumber += 1;
                    newInputs += 1;
                }
            }
        }
        index += 1;
        additionalInputs += 1;
    }

    if (inputEquation2 == 0) {
        result[0] = inputEquations.split('|')[0];
        result[1] = inputEquations.split('|')[1];
        result[2] = inputNumber;
    } else {
        result[0] = inputEquations;
        result[2] = inputNumber;
    }

    return result;
};





var getAllTransitionPairs = function(t_matrix, inputNumber)
{

    var result = [];
    var tempResult;

    for (var i = 0; i < t_matrix.length; i++)
    {
        result[i] = [];

        for (var j = 0; j < t_matrix.length; j++)
        {
            for (var k = (j + 1); k < t_matrix.length; k++)
            {
                if (t_matrix[i][j] == undefined)
                {
                    t_matrix[i][j] = 0;
                }

                if (t_matrix[i][k] == undefined)
                {
                    t_matrix[i][k] = 0;
                }


                tempResult = checkFunction.replaceStatesWithXVariables(t_matrix[i][j], t_matrix[i][k], inputNumber, additionalInputs);
                t_matrix[i][j] = tempResult[0];
                t_matrix[i][k] = tempResult[1]
                (tempResult[2]>additionalInputs)? additionalInputs=tempResult[2]: true;


                result[i].push("((" + t_matrix[i][j] + ")*(" + t_matrix[i][k] + "))");
            }

        }
    }
    return result;
};

