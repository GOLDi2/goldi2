/**
 * @module ConsistencyCheck
 */

/**
 * @class checkConsistency
 */
var checkConsistency = (function() {

        var additionalInputs = 0;

        /**
        * Creates output for combined tested to set the bit
        * @method createOutputForCombinedTest
        * @public
        * @param {Object} machine machine
        * @return {Array} 1-dimensional array contains 1 (consistent) or 0 (not consistent) for every state
        */
        var createOutputForCombinedTests = function (machine)
        {
            var t_matrix = machine.getMatrice();
            var combinationsToCompute = checkFunction.getAllCombinationsToCompute(t_matrix);
            var allTransitionPairs = getAllTransitionPairs(t_matrix, machine.inputnumber);
            var tempResult1 = "";
            var tempResult2 = 0;
            var result = [];


            for (var i=0; i<t_matrix.length; i++)
            {
                result[i] = 1;

                for (var j=0; j<allTransitionPairs[i].length; j++)
                {
                    tempResult1 = Logic.evaluateExpression(allTransitionPairs[i][j]);

                    for(var k=0; k<combinationsToCompute.length; k++)
                    {
                        tempResult2= tempResult1.computearray(combinationsToCompute[k]);

                        if (tempResult2 == 1)
                        {
                            result[i] = 0;
                            break;
                        }
                    }
                }

            }
            return result;
        };



        /**
        * Creates output to in machine table form
        * @method createOutputForMachineTable
         *@public
        * @param {Object} machine
        * @return {Array} 2-dimensional with entries 1 (consistent for the input) or 0 (not consistent)
        */

        var createOutputForMachineTable = function (machine)
        {
            var save = machine.ReturnWithNames;
            machine.ReturnWithNames = false;
            var t_matrix = machine.getMatrice();
            var equations = getEquationsOfTransitionPairs(t_matrix, machine.InputNumber);
            var combinations = Util.createBinaryCombinationsXZA(machine);
            var result = [];
            var tempResult = 0;

            for (var i = 0; i < equations.length; i++)
            {
                result[i] = [];
                equations[i] = Logic.evaluateExpression(equations[i]);

                for (var j = 0; j < combinations.length; j++) {
                    tempResult = equations[i].computearray(combinations[j]);

                    if (tempResult == 1)
                    {
                        result[i][j] = 0;
                    }

                    else
                    {
                        result[i][j] = 1;
                    }
                }
            }
            machine.ReturnWithNames = save;
            return result;
        };



        /**
        * Creates output for state graph to color non consistent transitions
        * @method createOutputForStateGraph
        * @public
        * @param {Object} machine Machine
        * @return {Array} 2-dimensional array with consistent transition pairs (0) and non consistent (1)
        */

        var createOutputForStateGraph = function(machine)
        {
            var save = machine.ReturnWithNames;
            machine.ReturnWithNames = false;
            var t_matrix = machine.getMatrice();
            var indexes = getIndexForTransitionPairs(t_matrix);
            var transitionPairs = getAllTransitionPairs(t_matrix);
            var combinations = Util.createBinaryCombinationsXZA(machine);
            var tempResult = "";
            var result = checkFunction.initializeArrayWithValue(t_matrix.length,0);

            for (var i=0; i<transitionPairs.length; i++)
            {

              for (var j=0; j<transitionPairs[i].length; j++)
              {
                  transitionPairs[i][j] = Logic.evaluateExpression(transitionPairs[i][j]);

                  for (var k=0; k<combinations.length; k++)
                  {
                      tempResult = transitionPairs[i][j].computearray(combinations[k]);

                      if (tempResult == 1)
                      {
                          result[i][indexes[2*j]] = 1;
                          result[i][indexes[2*j+1]] = 1;
                          break;
                      }
                }
              }
            }
            machine.ReturnWithNames = save;
            return result;
        };



        /**
        * Returns the indexes of all the used transition matrix entries to create the transition pairs
        * @method getIndexForTransitionPairs
        * @private
        * @param {Array} t_matrix Transition matrix
        * @return {Array} 1-dimensional array with all indexes
        */

        var getIndexForTransitionPairs = function(t_matrix)
        {
            var result = [];

            for (var i=0; i < t_matrix.length; i++)
            {
                for (var j=(i+1); j < t_matrix.length; j++)
                {
                    result.push(i);
                    result.push(j);
                }
            }
            return result;
        };



        /**
        * Creates all transition pairs from matrix without doubles
        * @private
        * @method getAllTransitionPairs
        * @param {Array} t_matrix Transition matrix
        * @param {int}inputNumber number of inputs in the active state machine
        * @return {Array} 2-dimensional array with all transition combinations for every state
        */

        var getAllTransitionPairs = function(t_matrix)
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



                        result[i].push("((" + t_matrix[i][j] + ")*(" + t_matrix[i][k] + "))");
                    }

                }
            }
            return result;
        };



        /**
        * Creates equations out of all transition pairs per state
        * @method getEquationsOfTransitionPairs
        * @public
        * @param {Array} t_matrix Transition matrix
        * @param {int} inputNumber number of inputs in the active state machine
        * @return {Array} 1-dimensional array with equations linked transition pairs with OR
        */

        var getEquationsOfTransitionPairs = function(t_matrix)
        {
            var transitionPairs = getAllTransitionPairs(t_matrix);
            var result = [];

            for (var i = 0; i < transitionPairs.length; i++)
            {
                result[i] = "(";

                for (var j = 0; j < transitionPairs[0].length; j++)
                {
                    result[i] = result[i] + transitionPairs[i][j] + "+";
                }
                result[i] = result[i].slice(0, result[i].length - 1);
                result[i] = result[i] + ")";
            }
            return result;

        };






    return {
            createOutputForStateGraph: createOutputForStateGraph,
            createOutputForMachineTable: createOutputForMachineTable,
            createOutputForCombinedTests: createOutputForCombinedTests,
            getEquationsOfTransitionPairs: getEquationsOfTransitionPairs
            };
})();