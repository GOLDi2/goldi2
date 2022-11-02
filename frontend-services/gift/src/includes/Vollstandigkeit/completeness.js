
/**
 * @class checkCompleteness
 */

var checkCompleteness = (function()
{
    var additionalInputs = 0;
    var parallelFSM = false;
    /**
     * Creates an output to use in machine table
     * @method createOutputForMachineTable
     * @public
     * @example
     *          t_matrix = [[x0,/x0]],[0,x0]];
     *          result = checkCompleteness.createOutputForMachineTable(t_matrix);
     *          -> result = [[1,1],[0,1]]
     * @param {Array} t_matrix Transition matrix
     * @return {Array} 2-dimensional array with results on completeness check for every state and every input combination (1-complete / 0-incomplete)
     */

    var createOutputForMachineTable = function(machine)
    {
        var save = machine.ReturnWithNames;
        machine.ReturnWithNames = false;
        var t_matrix = machine.getMatrice();
        var equations = createEquationsFromMatrix(t_matrix);
        var testEquation ="";
        var result = [];
        var bitCombinationForLogic = Util.createBinaryCombinationsXZA(machine);

        for (var i=0; i<t_matrix.length; i++)
        {
            result[i] = [];
            testEquation = Logic.evaluateExpression(equations[i]);

            for(var j=0; j<bitCombinationForLogic.length; j++)
            {
                result[i][j] = testEquation.computearray(bitCombinationForLogic[j]);

            }
       }
        machine.ReturnWithNames = save;
        return result;
    };



    /**
     * Creates an output to use in state graph
     * @method createOutputForMachineTable
     * @public
     * @example
     *          t_matrix = [[x0,/x0]],[0,x0]];
     *          result = checkCompleteness.createOutputForMachineTable(t_matrix);
     *          -> result = [1,0]
     * @param {Array} t_matrix Transition matrix
     * @return {Array} 1-dimensional array with results on completeness check for every state (1-complete / 0-incomplete)
     */

    var createOutputForStateGraph = function(machine)
    {
        var save = machine.ReturnWithNames;

        machine.ReturnWithNames = false;

        var t_matrix = machine.getMatrice();

        var result = createOutputForMachineTable(machine);

        result  = checkFunction.fromMatrixToList(result);

        machine.ReturnWithNames = save;

        return result;
    };



    /**
     * Creates an equation with all output transitions for a state AND combined
     * @method createEquationFromMatrix
     * @public
     * @param {Array} t_matrix Transition matrix
     * @return string activeEquation
     */

    var createEquationsFromMatrix = function(t_matrix)
    {
        var activeEquation;
        var result = [];

        for (var i = 0; i< t_matrix.length; i++)
        {
            for (var j = 0; j < t_matrix[0].length; j++)
            {
                if (t_matrix[i][j] == undefined)
                {
                    t_matrix[i][j] = 0;
                }

                if (j == 0)
                {
                    activeEquation = "(" + "(" + t_matrix[i][j] + ")";
                }

                else
                {
                    activeEquation = activeEquation + "+" + "(" + t_matrix[i][j] + ")";
                }
            }

            activeEquation = activeEquation + ")";

            result[i] = activeEquation;
        }
        return result;
    };






    return {
            createOutputForMachineTable: createOutputForMachineTable,
            createOutputForStateGraph: createOutputForStateGraph,
            createEquationsFromMatrix: createEquationsFromMatrix
           };

})();

