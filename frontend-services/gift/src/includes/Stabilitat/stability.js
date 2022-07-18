/**
 * @module Stability Check
 */

/**
 * @class checkStability
 */

var checkStability = (function()
{
    var additionalInputs = 0;

    /**
     * Creates an output with the stability status for all states and input combinations
     * @method createOutputForMachineTable
     * @public
     * @param {Array} t_matrix Transition matrix
     * @return {Array} result 2-dimensional array with 1 or 0 (1-stable 0-unstable)
     */

    var createOutputForMachineTable = function (machine)
    {
        var result = [];
        var stateTransition = [];
        var inputTransition = [];
        var Transitions = [];
        var modifiedEquations;
        var save = machine.ReturnWithNames;
        machine.ReturnWithNames = false;
        var t_matrix = machine.getMatrice();
        t_matrix = deleteUndefinedEntries(t_matrix);

        var combinations = Util.createBinaryCombinationsXZA(machine);


        for (var i = 0; i < t_matrix[0].length; i++)
        {
            stateTransition = checkCombinationsOnEquation("(" + t_matrix[i][i] + ")", machine);
            inputTransition = checkCombinationsOnEquation(getInputEquation(t_matrix, i), machine);
            
            result[i] = [];

            for (var j = 0; j < combinations.length; j++)
            {

                if (t_matrix[i][i] == 0)
                {
                    result[i][j] = 0;
                }


                else if ((stateTransition[j] == 1) && (inputTransition[j] == 1))
                {
                    result[i][j] = 1;
                }

                else if ((t_matrix[i][i] != 0) && (checkExistenceOfInputTransitions(t_matrix,i)==false))
                {
                    result[i][j] = 1;
                }


                else
                {
                    result[i][j] = 0;
                }

            }
        }
        machine.ReturnWithNames = save;
        return result;
    };



    /**
     * Creates an output with the stability status for all states
     * @method createOutputForStateGraph
     * @public
     * @param {Array} t_matrix Transition matrix
     * @return {Array} 1-dimensional array with 1 or 0 (1-stable 0-unstable)
     */

    var createOutputForStateGraph = function (machine)
    {
        var save = machine.ReturnWithNames;

        machine.ReturnWithNames = false;

        var result = createOutputForMachineTable(machine);

        result = fromMatrixToList(result);

        machine.ReturnWithNames = save;

        return result;
    };



    /**
     * Creates an equation without the state transition
     * @method getInputEquation
     * @private
     * @param {Array} t_matrix Transition matrix
     * @param {int} position Number of state
     * @return {string} equation of all incoming transitions except the state transition
     */

    var getInputEquation = function (t_matrix, position)
    {
        var result = "(";

        for (var i = 0; i < t_matrix.length; i++)
        {

            if (i == position)
            {
                continue;
            }

            result = result + "(" + t_matrix[i][position] + ")" + "+";

        }
        result = result.slice(0, result.length - 1);
        result = result + ")";

        return result;
    };



    /**
     * Checks all input combinations on a equation
     * @method checkCombinationsOnEquation
     * @private
     * @param {string} equation
     * @param {Array} t_matrix
     * @return {Array} 1-dimensional array with
     */

    var checkCombinationsOnEquation = function (equation, machine)
    {
        var bitCombinationsForLogic = Util.createBinaryCombinationsXZA(machine);
        var equationObject = Logic.evaluateExpression(equation);
        var result = [];

        for (var i = 0; i < bitCombinationsForLogic.length; i++)
        {
            result[i] = equationObject.computearray(bitCombinationsForLogic[i]);
        }
        return result;
    };



    /**
     * Sets all undefined values in the matrix to 0
     * @method deleteUndefinedEntries
     * @private
     * @param {Array} t_matrix Transition matrix
     * @return {Array}
     */

    var deleteUndefinedEntries = function (t_matrix)
    {
        for (var i=0; i<t_matrix.length; i++)
        {
            for (var j=0; j<t_matrix.length; j++)
            {
                if (t_matrix[i][j] == undefined)
                {
                    t_matrix[i][j] = 0;
                }
            }
        }
        return t_matrix;
    };



    /**
     * Creates a list out of a matrix and sets value to 2 or undefined (needed to tag instability in the  state graph)
     * @method fromMatrixToList
     * @private
     * @param {Array} t_matrix Transition matrix
     * @return {Array} Array with 2 or undefined in entries
     */

    var fromMatrixToList = function(matrix)
    {
        var result = [];

        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] == 0)
                {
                    result[i] = 2;
                }

                else
                {
                    result[i] = undefined;
                    break;
                }
            }
          }
        return result;
    };


    var checkExistenceOfInputTransitions = function(t_matrix, index)
    {
        var count = 0;

        for (var i=0; i<t_matrix.length; i++)
        {
            if (i == index)
            {
                continue;
            }

            else if (t_matrix[i][index] == 0)
            {
                count++;
            }
        }

        if (count == t_matrix.length-1)
        {
            return false;
        }

        else
        {
            return true;
        }
    };


    return  {
            createOutputForStateGraph: createOutputForStateGraph,
            createOutputForMachineTable: createOutputForMachineTable
            };

})();


