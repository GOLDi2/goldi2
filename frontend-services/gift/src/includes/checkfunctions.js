/**
 * @module Additional functions for checks
 */

/**
 * @class checkFunction
 */

var checkFunction = (function()
{

    /**
     * Creates an output with all bit combinations for n bits
     * @method getAllCombinations
     * @public
     * @param {int} n number of bits
     * @return {Array} 1-dimensional array contains all bit combinations
     */


    var getAllCombinations = function(n)
    {
        var result = [];

        for (var y = 0; y < Math.pow(2, n); y++)
        {
            result[y] = [];

            for (var x = 0; x < n; x++)
            {
                if ((y >> x) & 1)
                {
                    result[y][x] = 1;
                }

                else
                {
                    result[y][x] = 0;
                }
            }
        }
        return result;
    };



    /**
     * Extracts the highest variables (value) out the transition matrix
     * @public
     * @method extractHighestVariable
     * @param {Array} t_matrix Transition matrix
     * @return {int} largest highest variable
     */
    var extractHighestVariable = function(t_matrix)
    {
        var s_matrix = t_matrix.toString();
        var largest = Math.max.apply(null, s_matrix.match(/\d+/g));

        return largest;
    };



    /**
     * Creates an 2-dimensional array with all bit combinations to check for the logic function
     * @method getallCombinationsToCompute
     * @public
     * @example
     *      t_matrix = [[x0,x1],[/x1+x0,x0]]
     *      result = getAllCombinationsToCompute(t_matrix);
     *      -> result = [[x:0,x1:0],[x0:1,x1:0],[x0:0,x1:1],[x0:1,x1:1]]
     * @param {Array} t_matrix Transition matrix
     * @return {Array} 2-dimensional array with all bit combinations for the input variables
     */

    var getAllCombinationsToCompute = function(t_matrix)
    {
        var n = extractHighestVariable(t_matrix);
        var combinations = getAllCombinations((n + 1));
        var bitCombinationForLogic = [];

        for (var i = 0; i < combinations.length; i++)
        {
            bitCombinationForLogic[i] = [];

            for (var j = 0; j < combinations[0].length; j++)
            {
                bitCombinationForLogic[i].push("x" + j + ':' + combinations[i][j]);
            }
        }

        return bitCombinationForLogic;

    };



    /**
     * Creates all bit combinations to check a equation on the machine table with the Logic
     * @method getAllCombinationsToComputeForMachineTable
     * @public
     * @param {Object} machine state machine
     * @return {Array} Array with bit combinations to compute in specific input form
     */

    var getAllCombinationsToComputeForMachineTable = function(machine, additionalInputs)
    {
        var combinations = getAllCombinations((machine.InputNumber + additionalInputs));
        var bitCombinationForLogic = [];

        for (var i = 0; i < combinations.length; i++)
        {
            bitCombinationForLogic[i] = [];

            for (var j = 0; j < combinations[0].length; j++)
            {
                bitCombinationForLogic[i].push("x" + j + ':' + combinations[i][j]);
            }
        }

        return bitCombinationForLogic;

    };



    /**
     * Creates a list out of a matrix (just works with binary values)
     * @method fromMatrixToList
     * @public
     * @param {Array} matrix Specific matrix you want to convert
     * @return {Array} 1-dimensional array with values 1 (if all true) or 0 (if one false)
     */

    var fromMatrixToList = function(matrix)
    {
        var result = [];

        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] == 0) {
                    result[i] = 0;
                    break;
                }

                else {
                    result[i] = 1;
                }
            }
        }
        return result;
    };



    /**
     * Creates an NxN array initialized with a speficic value
     * @method initializeArrayWithValue
     * @public
     * @param {int} size Size of the array
     * @param {int}  value Value in every entry
     * @return {Array} Array with specific size and values
     */

    var initializeArrayWithValue = function (size,value)
    {
        var result = [];

        for (var i=0; i<size; i++)
        {
            result[i] = [];

            for (var j=0; j<size; j++)
            {
                result[i][j] = value;
            }
        }

        return result;
    };









    return {
            getAllCombinations: getAllCombinations,
            extractHighestVariable: extractHighestVariable,
            getAllCombinationsToCompute: getAllCombinationsToCompute,
            getAllCombinationsToComputeForMachineTable: getAllCombinationsToComputeForMachineTable,
            fromMatrixToList: fromMatrixToList,
            initializeArrayWithValue: initializeArrayWithValue
           };
})();