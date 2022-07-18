/**
 * @module JK Flip-Flop
 */

/**
 * @class JKFlipFlop
 */

var JKFlipFlop = (function()
{

    /**
     * Creates a JK equations out of the datatype by getting the z equations
     * @method getEquation
     * @public
     * @param {Object} machine State Machine
     * @return {Array} 2-dimensional array in the form JK[0][0] = J0, JK[0][0]=K0, JK[1][0] = J1, JK[1][1]=K1.,.,.
     *
     */

    var getEquation = function (machine)
    {
        var save = machine.ReturnWithNames;
        machine.ReturnWithNames = false;

        var zEquation = "";
        var activeJKEquation = [];
        var allJKEquations = [];
        var aTransitionInEquation = false;
        var azWithReplacementVariables = [];

        for (var i=0; i<machine.StateBits; i++)
        {

            allJKEquations[i] = [];
            zEquation = machine.getZEquation("z"+ i,false,false,true,true).split("=")[1];

            if (zEquation.search("a") != -1){
                azWithReplacementVariables = extractAZ(zEquation);
                zEquation = azWithReplacementVariables[2];
                aTransitionInEquation = true;
            }

            if (zEquation == "0"){
                allJKEquations[i][0] = "0";
                allJKEquations[i][1] = "1";
                continue;
            }

            activeJKEquation = findAndReorderStateBit(zEquation, i);

            if (activeJKEquation[0] == "" && activeJKEquation[1] != ""){
                allJKEquations[i][0] = "0";
                allJKEquations[i][1] = "/(" + activeJKEquation[1] + ")";

            }

            else if (activeJKEquation[1] == "" && activeJKEquation[0] != ""){
                allJKEquations[i][0] = activeJKEquation[0];
                allJKEquations[i][1] = "1";
            }

            else{
                allJKEquations[i][0] = activeJKEquation[0];
                allJKEquations[i][1] = "/(" + activeJKEquation[1] + ")";
            }

            if(aTransitionInEquation == true){
                for(var j=0; j<azWithReplacementVariables[0].length; j++){
                    allJKEquations[i][0] = allJKEquations[i][0].replace(azWithReplacementVariables[1][j],azWithReplacementVariables[0][j]);
                    allJKEquations[i][1] = allJKEquations[i][1].replace(azWithReplacementVariables[1][j],azWithReplacementVariables[0][j]);
                }
            }


            allJKEquations[i][0] = machine.NormalEquationToEquation(allJKEquations[i][0]);
            allJKEquations[i][1] = machine.NormalEquationToEquation(allJKEquations[i][1]);
        }
        machine.ReturnWithNames = save;
        return allJKEquations;
    };



    /**
     * Extracts the z and the /z parts out of the equation
     * @method findAndReorderStateBit
     * @private
     * @param {string} equation Z equation
     * @param {int} index Index of the z equation
     * @return {Array} 2-dimensional array in the form JK[0][0] = J0, JK[0][0]=K0, JK[1][0] = J1, JK[1][1]=K1.,.,.
     *
     */
    var findAndReorderStateBit = function (equation, index)
    {
        var zEquation = Logic.evaluateExpression(equation);
        var zEquationSubExpressions = zEquation.splitexpressions;
        var zEquationsReplaceRegExp = new RegExp("\/*z" + index + "[\\*,\\+]*");
        var JK = [];
        JK[0] = [];
        JK[1] = [];


        for (var i=0; i<zEquationSubExpressions.length; i++)
        {
            if(zEquationSubExpressions[i].match("/z"+index)){
                zEquationSubExpressions[i] = zEquationSubExpressions[i].replace(zEquationsReplaceRegExp, "");
                JK[0].push(zEquationSubExpressions[i]);
            }

            else {
                zEquationSubExpressions[i] = zEquationSubExpressions[i].replace(zEquationsReplaceRegExp, "");
                JK[1].push(zEquationSubExpressions[i]);
            }
        }
        JK[0] = JK[0].join("+");
        JK[1] = JK[1].join("+");

        return JK;

    };


    /**
     * Extracts the largest indexes of the state variables each state equation
     * @method findTheLargestZIndexesInEquations
     * @private
     * @param {Object} machine State Machine
     * @return {Array} largestIndexes array with the number for each state equation (largestIndexes[0] = for z0=...,.)
     */

    var findTheLargestZIndexesInEquations = function (machine) {

        var zEquation;
        var largestIndexes = [];


        for (var i= 0; i<machine.StateBits; i++)
        {
            zEquation = machine.getZEquation("z" + i).split("=")[1];

            if (zEquation == "0"){
                largestIndexes[i] = 0;
                continue;
            }
            zEquation = zEquation.replace(/a\d+z\d+/g,"");
            largestIndexes[i] = zEquation.match(/z\d+/g);
            largestIndexes[i] = checkFunction.extractHighestVariable(largestIndexes[i]);
        }
        return largestIndexes;
    };


    /**
     * Extracts the state variables from other (parallel) machines (for example a1z2) and replaces them with a
     * "v" + counted number (starts by 0)
     *
     * @method extractAZ
     * @private
     * @param {Object} machine State Machine
     * @return {Array} 2-dimensional array with the original (aNzN) (AZVariables[0][..]) and the corresponding
     *                  "v"s (AZVariables[1][..]) and the z equation without the aNzNs ((AZVariables[2])
     */

    var extractAZ = function (equation){
        var equation = equation;
        var AZVariables = [];
        AZVariables[0] = [];
        AZVariables[1] = [];


        AZVariables[0] = equation.match(/[a]\d[z]\d/g);

        for (var i=0; i<AZVariables[0].length; i++){
            equation = equation.replace(AZVariables[0][i], "v"+i);
            AZVariables[1][i] = "v"+i;
        }
        AZVariables[2] = equation;
        return AZVariables;

    };






    return {getEquation: getEquation};
})();