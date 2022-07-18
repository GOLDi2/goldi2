var HDotZX = (function()
{
    /**
     * Creates the h?(z,x) equation out of the current transition matrix
     * @method getEquation
     * @public
     * @param {object} machine the current running machine
     * @return {String} the h?(z,x) equation
     */

    var getEquation = function(machine)
    {
        var save = machine.ReturnWithNames;
        machine.ReturnWithNames = false;

        var t_matrix = machine.getMatrice();
        var completenessEquations = checkCompleteness.createEquationsFromMatrix(t_matrix);
        var consistencyEquations = checkConsistency.getEquationsOfTransitionPairs(t_matrix);
        var QMCObject = new QMC();
        var activeEquation = "";
        var minimizedEquation = "";
        var hDotZX = "";
        var checkVar = false;
        var count = 0;

        for (var i = 0; i < completenessEquations.length; i++) {
            completenessEquations[i] = QMCObject.compute(completenessEquations[i]);
            consistencyEquations[i] = QMCObject.compute(consistencyEquations[i]);


            activeEquation = "(/(" + completenessEquations[i] + ")+(" + consistencyEquations[i] + "))";
            minimizedEquation = QMCObject.compute(activeEquation);

            /*   while ((minimizedEquation.search("*")!=-1) && (minimizedEquation.search("+")!=-1) && (minimizedEquation.search("/")!=-1))
             {

             }*/



            if (minimizedEquation != 0) {
                if (minimizedEquation == 1) {
                    hDotZX = hDotZX + getZVariablesForState(i, t_matrix.length) + "+";
                }

                else {
                    hDotZX = hDotZX + getZVariablesForState(i, t_matrix.length) + "*" +"(" + minimizedEquation + ")" + "+";
                }
                checkVar = true;
            }
        }
        hDotZX = hDotZX.slice(0, hDotZX.length - 1);

        if (checkVar == false)
        {
            hDotZX = "0";
        }
        hDotZX= machine.NormalEquationToEquation(hDotZX);
        machine.ReturnWithNames = save;

        return hDotZX;
    };



    /**
     * Creates a expression with z-variables for a specific state.
     * The amount of used z-variables is up to the entered length of the transition matrix.
     * @method getZVariablesForState
     * @private
     * @param {int} stateNumber Number of the specific state
     * @param {int} t_matrix_length Length of the transition matrix
     * @return {String} State number in z variables
     */

    var getZVariablesForState = function (stateNumber,t_matrix_length)
    {
        var numberOfVariables = Math.log(t_matrix_length)/Math.log(2);
        var numberInBinary = toBinary(stateNumber, numberOfVariables);
        var zVariablesForState = [];

        for (var i=0; i<numberInBinary.length; i++)
        {
            if (numberInBinary.charAt(i)==0)
            {
                zVariablesForState.push ("/" + "z" + (numberInBinary.length-i-1));
            }

            else
            {
                zVariablesForState.push ("z"+ (numberInBinary.length-i-1));
            }
        }
        zVariablesForState = zVariablesForState.join("*");


        return zVariablesForState;
    };



    /**
     * Converts a decimal number to binary with a specific length
     * @method getZVariablesForState
     * @private
     * @param {int} number the number you want to convert to binary
     * @param {int} length how many bits should be used to represent the number
     * @return {String} State number in z variables
     */

    var toBinary = function (number,length)
    {
        var j;
        binary = number.toString(2);
        binaryPrefix = "";
        for (j = binary.length; j <= length-1; j++){
            binaryPrefix  += "0";
        }
        binary = binaryPrefix + binary;
        return binary;
    };


    return {getEquation: getEquation};
})();