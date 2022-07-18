/**
 * Created by Stephen Ahmad on 17.05.2015.
 */


String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

/**
 * @module computation
 *
 */

/**
 * @Class QMC
 */
var QMC = function () {


    /**
     * Reduces a boolean equation.
     * @method compute
     * @param {string} Equation to reduce.
     * @return {string} Returns reduced equation.
     * @example
     *      var qmc = new QMC();
     *      var result = qmc.compute("x0+x1*x0+/x1");
     *
     *      //-> result == "x0"
     */
    this.compute = function (equation) {
        this.compute(equation, null);
    };

    /**
     * Reduces a boolean equation.
     * @method compute
     * @param {string} Equation to reduce.
     * @param {hreduce} Equation of h* used to reduce further.
     * @return {string} Returns reduced equation.
     * @example
     *      var qmc = new QMC();
     *      var result = qmc.compute("x0+x1*x2+x3* x1+/x0");
     *
     *      //-> result == "x0"
     */
    this.compute = function (equation, hreduce) {
        var i;
        var length;
        var equationame;
        var reducecase;
        if (hreduce != null || hreduce != undefined) {
            reducecase = true;
        }

        if (equation.indexOf("=") != -1) {
            equationame = equation.split("=")[0];
            equation = equation.split("=")[1];
        }

        if (reducecase && hreduce.indexOf("=") != -1) {
            hreduce = hreduce.split("=")[1];
            hreduce = Logic.evaluateExpression(hreduce);
        }else if(reducecase){
            hreduce = Logic.evaluateExpression(hreduce);
        }


        var numberPattern = /z\d+|x\d+|a\d+z\d+/g;
        var varnames = equation.match(numberPattern);
        if (varnames != undefined) {
            equation = Logic.evaluateExpression(equation);

            varnames = UniqueArrayItems(varnames);
            length = varnames.length;

            for (i = 0; i < length; i++) {
                equation.renameVariable(varnames[i], "v" + i);
                if (reducecase) {
                    hreduce.renameVariable(varnames[i], "v" + i);
                }
            }

            equation = equation.toString().replaceAll("v", "x");

            if(reducecase) {
                hreduce = hreduce.toString();
            }

            if (reducecase && hreduce.indexOf("x") == -1 && hreduce.indexOf("z") == -1) {
                hreduce = hreduce.replaceAll("v", "x");
            } else if (reducecase) {
                reducecase = !reducecase;
            }

            var qmc = new QuineMcCluskey(length);
            qmc.init();


            var normalize = new EquationNormalizer();
            var vec = normalize.calculateTruthVector(equation, length);

            qmc.data.clear();

            for (i = 0; i < vec.length; i++) {
                if (vec[i] == 1) {
                    qmc.data.setFuncData(i, 1);
                }
            }

            if (reducecase) {
                vec = normalize.calculateTruthVector(hreduce, length);
                for (i = 0; i < vec.length; i++) {
                    if (vec[i] == 1) {
                        qmc.data.setFuncData(i, 2);
                    }
                }
            }


            qmc.data.compute();
            equation = qmc.data.minimalTerm;
            var expression = Logic.evaluateExpression(equation);
            for (i = 0; i < length; i++) {
                expression.renameVariable("x" + i,varnames[i] + "(#§)");
            }
            equation = expression.toString().replaceAll("(#§)","");

        }else{
            return String(Logic.evaluateExpression(equation).compute());
        }

        if (equationame != undefined) {
            equation = equationame + "=" + equation;
        }


        return deleteOuterParenthesis(equation);
    };

    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = createArray.apply(this, args);
        }

        return arr;
    }

    function UniqueArrayItems(a) {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;
        for (var i = 0; i < len; i++) {
            var item = a[i];
            if (seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }
        return out;
    }

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

    function QuineMcCluskey(columns) {

        this.cols = columns + 1;
        this.rows = Math.pow(2, columns);
        this.data = new QuineMcCluskeyDataCtrl();
        var that = this;


        this.init = function () {

            this.data.init(columns);

        };

        this.setNoOfVars = function (vars) {
            var c = parseInt(vars);
            if (c < 1 && c > 6)
                return;
            this.cols = c + 1;
            this.rows = Math.pow(2, c);
            this.data.init(c);

        };

        this.genRandom = function () {
            this.data.random();

        };

        this.allowDontCares = function (type) {
            if (type > 0) {
                this.data.allowDontCare = true;
            } else {
                this.data.allowDontCare = false;
            }
            this.data.clear();

        };


        function PetrickMethod() {
            this.problem;
            this.maxProblemSize = 1000;
            this.solution;
            this.log = "";
            var that = this;

            this.test = function () {
                var andArray = new Array();
                var orArray;
                var monomA;
                var monomB;
                orArray = new Array();
                monomA = new Object(); // using objects ensures that (x and x) = x
                monomA[1] = 1;
                orArray.push(monomA);
                monomB = new Object();
                monomB[2] = 2;
                orArray.push(monomB);
                andArray.push(orArray);
                orArray = new Array();
                monomA = new Object();
                monomA[3] = 3;
                orArray.push(monomA);
                monomB = new Object();
                monomB[4] = 4;
                orArray.push(monomB);
                andArray.push(orArray);
                orArray = new Array();
                monomA = new Object();
                monomA[1] = 1;
                orArray.push(monomA);
                monomB = new Object();
                monomB[3] = 3;
                orArray.push(monomB);
                andArray.push(orArray);
                orArray = new Array();
                monomA = new Object();
                monomA[5] = 5;
                orArray.push(monomA);
                monomB = new Object();
                monomB[6] = 6;
                orArray.push(monomB);
                andArray.push(orArray);
                orArray = new Array();
                monomA = new Object();
                monomA[2] = 2;
                orArray.push(monomA);
                monomB = new Object();
                monomB[5] = 5;
                orArray.push(monomB);
                andArray.push(orArray);
                orArray = new Array();
                monomA = new Object();
                monomA[4] = 4;
                orArray.push(monomA);
                monomB = new Object();
                monomB[6] = 6;
                orArray.push(monomB);
                andArray.push(orArray);
                /*orArray = new Array();
                 monomA = new Object();
                 monomA[4] = 4;
                 orArray.push(monomA);
                 monomB = new Object();
                 monomB[4] = 4;
                 orArray.push(monomB);
                 andArray.push(orArray);*/

                this.solve(andArray);
            };

            this.solve = function (eq) {

                this.problem = eq;
                this.log = "";

                //printEqnArray(eq);
                printEqnArrayFancy(eq);

                // multiply out
                var andArray = eq;
                var loopCounter = 0;
                while (andArray.length > 1) {
                    var newAndArray = new Array();
                    for (var i = 1; i < andArray.length; i += 2) {

                        var orTermA = andArray[i - 1];
                        var orTermB = andArray[i];
                        var newOrArray = new Array();
                        for (var a = 0; a < orTermA.length; a++) {
                            for (var b = 0; b < orTermB.length; b++) {
                                var monom1 = orTermA[a];
                                var monom2 = orTermB[b];
                                var resultingMonom = new Object();
                                for (var m in monom1) {
                                    resultingMonom[monom1[m]] = monom1[m];
                                }
                                for (var n in monom2) {
                                    resultingMonom[monom2[n]] = monom2[n];
                                }
                                newOrArray.push(resultingMonom);
                            }
                        }

                        newAndArray.push(newOrArray);
                    }
                    // if uneven copy last and-term
                    if (andArray.length % 2 === 1) {
                        newAndArray.push(andArray[andArray.length - 1]);
                    }
                    //printEqnArray(newAndArray);
                    printEqnArrayFancy(newAndArray);

                    andArray.length = 0;
                    // simplify or-term
                    for (var i = 0; i < newAndArray.length; i++) {
                        var orTerm = newAndArray[i];
                        var newOrTerm = simplifyOrTerm(orTerm);
                        if (newOrTerm.length > 0) {
                            andArray.push(newOrTerm);
                        }
                    }

                    var problemSize = eqnArrayProblemSize(andArray);
                    if (problemSize > this.maxProblemSize) {
                        console.log("Error: The cyclic covering problem is too large to be solved with Petrick's method (increase maxProblemSize). Size=" + problemSize);
                        return false;
                    }

                    //printEqnArray(andArray);
                    printEqnArrayFancy(andArray);
                    loopCounter++;
                }
                this.solution = andArray;
                return true;
            };

            function simplifyOrTerm(orTerm) {
                // find a monom that is the same or simpler than another one
                var newOrTerm = new Array();
                var markedForDeletion = new Object();
                for (var a = 0; a < orTerm.length; a++) {
                    var keepA = true;
                    var monomA = orTerm[a];
                    for (var b = a + 1; b < orTerm.length && keepA; b++) {
                        var monomB = orTerm[b];
                        var overlapBoverA = 0;
                        var lengthA = 0;
                        for (var m in monomA) {
                            if (monomB[m] in monomA) {
                                overlapBoverA++;
                            }
                            lengthA++;
                        }

                        var overlapAoverB = 0;
                        var lengthB = 0;
                        for (var m in monomB) {
                            if (monomA[m] in monomB) {
                                overlapAoverB++;
                            }
                            lengthB++;
                        }

                        if (overlapBoverA === lengthB) {
                            keepA = false;
                        }

                        if (lengthA < lengthB && overlapAoverB === lengthA) {
                            markedForDeletion[b] = b;
                        }

                    }
                    if (keepA) {
                        if (a in markedForDeletion) {
                            // do nothing
                        } else
                            newOrTerm.push(orTerm[a]);
                    }
                }
                return newOrTerm;
            }


            function printEqnArrayFancy(andArray) {
                var str = "";
                for (var i = 0; i < andArray.length; i++) {
                    var first = true;
                    str += "(";
                    var orArray = andArray[i];
                    for (var j = 0; j < orArray.length; j++) {
                        if (!first)
                            str += " &or; ";
                        var monom = orArray[j];
                        for (var k in monom) {
                            str += "<i>p</i><sub><small>" + monom[k] + "</small></sub>";
                        }
                        first = false;
                    }
                    str += ")";
                }
                if (that.log.length > 0) {
                    that.log += "<p>&hArr;&nbsp;" + str + "</p>";
                } else {
                    that.log += "<p>" + str + "</p>";
                }
            }

            function eqnArrayProblemSize(andArray) {
                var monomCounter = 0;
                for (var i = 0; i < andArray.length; i++) {
                    var orArray = andArray[i];
                    monomCounter += orArray.length;
                }
                return monomCounter;
            }


            function printEqnArray(andArray) {
                var str = "";
                for (var i = 0; i < andArray.length; i++) {
                    var first = true;
                    str += "(";
                    var orArray = andArray[i];
                    for (var j = 0; j < orArray.length; j++) {
                        if (!first)
                            str += " or ";
                        var monom = orArray[j];
                        for (var k in monom) {
                            str += monom[k];
                        }
                        first = false;
                    }
                    str += ")";
                }
                console.log(str);
            }

        }

        function PrimTerm() {
            this.implicant = -1;
            this.termString = "";
            this.color = [0, 0, 0];
            this.coloredTermString = "";
            this.used = false;
            this.neededByVar = new Object;
        }

        function Implicant() {
            this.imp = new Object();
            this.isPrim = false;
            this.isOnlyDontCare = false;
            this.bitMask = 0;
        }

        function ImplicantGroup() {
            this.group = new Array;
            this.order = -1;
        }

        function PrimTermTable(ord) {
            this.essentialPrimTerms = new Array();
            this.order = ord;
            this.remainingVars = new Array();
            ;
            this.remainingPrimTerms = new Array();
            this.supersededPrimTerms = new Array();
        }

        function hsvToRgb(h, s, v) {

            var r, g, b;
            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0:
                    r = v, g = t, b = p;
                    break;
                case 1:
                    r = q, g = v, b = p;
                    break;
                case 2:
                    r = p, g = v, b = t;
                    break;
                case 3:
                    r = p, g = q, b = v;
                    break;
                case 4:
                    r = t, g = p, b = v;
                    break;
                case 5:
                    r = v, g = p, b = q;
                    break;
            }

            return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
        }

        function QuineMcCluskeyDataCtrl() {
            this.noOfVars = -1;
            this.funcdata = new Array;
            this.primTerms = new Array;
            this.implicantGroups = new Array;
            this.minimalTerm = "";
            this.coloredMinimalTerm = "";
            this.minimalTermPrims = new Array;
            this.primTermTables = new Array;
            this.petrickSolver = new PetrickMethod();
            this.petrickTermPrims = new Array;
            this.allowDontCare = false;

            this.init = function (no) {
                this.noOfVars = no;
                this.funcdata.length = 0;
                this.primTerms.length = 0;
                this.implicantGroups.length = 0;
                this.minimalTerm = "0";
                this.coloredMinimalTerm = "0";
                this.minimalTermPrims.length = 0;
                this.primTermTables.length = 0;
                this.petrickTermPrims.length = 0;

                var noOfFuncData = Math.pow(2, this.noOfVars);
                for (var i = 0; i < noOfFuncData; i++) {
                    this.funcdata.push(0);
                }

                this.compute();
                //this.petrickSolver.test();

            };

            this.setFuncData = function (i, val) {
                if (i < 0 || i >= this.funcdata.length)
                    return;
                this.funcdata[i] = val;
            };

            this.activated = function (i) {
                if (i < 0 || i >= this.funcdata.length)
                    return;

                this.funcdata[i] += 1;
                if (this.allowDontCare) {
                    if (this.funcdata[i] > 2) this.funcdata[i] = 0;
                } else {
                    if (this.funcdata[i] > 1) this.funcdata[i] = 0;
                }
            };

            this.random = function () {
                for (var i = 0; i < this.funcdata.length; i++) {
                    if (this.allowDontCare) {
                        this.funcdata[i] = Math.floor(Math.random() * 3);
                    } else {
                        this.funcdata[i] = Math.floor(Math.random() * 2);
                    }
                }
                this.compute();
            };

            this.clear = function () {
                for (var i = 0; i < this.funcdata.length; i++) {
                    this.funcdata[i] = 0;
                }
                this.compute();
            };

            function bitCount(value) {
                var counter = 0;
                while (value > 0) {
                    if ((value & 1) === 1) counter++;
                    value >>= 1;
                }
                return counter;
            }

            this.compute = function () {
                this.primTerms.length = 0;
                this.implicantGroups.length = 0;
                this.minimalTerm = "0";
                this.coloredMinimalTerm = "0";
                this.minimalTermPrims.length = 0;
                this.primTermTables.length = 0;
                this.petrickTermPrims.length = 0;

                var counter = 0;
                var lastIg = -1;
                var continueLoop = true;
                while (continueLoop) {

                    continueLoop = false;
                    var ig = new ImplicantGroup();
                    if (counter === 0) {
                        for (var i = 0; i < this.funcdata.length; i++) {
                            if (this.funcdata[i] > 0) {
                                var impl = new Implicant();
                                impl.imp[i] = i;
                                impl.isPrim = true;
                                ig.group.push(impl);
                                continueLoop = true;
                            }
                        }
                    } else {
                        for (var i = 0; i < lastIg.group.length; i++) {
                            for (var j = i + 1; j < lastIg.group.length; j++) {
                                var imp1 = lastIg.group[i];
                                var imp2 = lastIg.group[j];

                                if (imp1.bitMask === imp2.bitMask) {

                                    var found = false;
                                    var xor = -1;
                                    for (var m in imp1.imp) {
                                        for (var n in imp2.imp) {
                                            var i1 = imp1.imp[m];
                                            var i2 = imp2.imp[n];
                                            //console.log(i1 + "<->" + i2);
                                            xor = (i1 ^ i2) & (~imp1.bitMask);
                                            if (bitCount(xor) === 1) {
                                                //console.log("found merge candidate" + i1 + "<->" + i2);
                                                found = true;
                                            }
                                            break;
                                        }
                                        break;
                                    }
                                    if (found) {
                                        imp1.isPrim = false;
                                        imp2.isPrim = false;

                                        var impl = new Implicant();
                                        impl.isPrim = true;
                                        impl.bitMask = imp1.bitMask | xor;
                                        for (var m in imp1.imp)
                                            impl.imp[m] = parseInt(m);
                                        for (var n in imp2.imp)
                                            impl.imp[n] = parseInt(n);

                                        var foundMatch = false; // determine if this combination is already there
                                        for (var k = 0; k < ig.group.length; k++) {
                                            var exist = ig.group[k];
                                            var isTheSame = true;
                                            for (var m in impl.imp) {
                                                var found = false;
                                                for (var n in exist.imp) {
                                                    if (parseInt(m) === parseInt(n)) {
                                                        found = true;
                                                    }
                                                }
                                                if (!found) {
                                                    isTheSame = false;
                                                    break;
                                                }
                                            }
                                            if (isTheSame) {
                                                foundMatch = true;
                                                break;
                                            }
                                        }
                                        if (!foundMatch) {
                                            ig.group.push(impl);
                                            continueLoop = true;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (continueLoop) this.implicantGroups.push(ig);
                    lastIg = ig;
                    counter++;
                }

                // collect primterms
                this.primTerms.length = 0;
                this.minimalTermPrims.length = 0;
                var color = 0.0;
                for (var i = this.implicantGroups.length - 1; i >= 0; i--) {
                    //console.log((1 - (i/this.implicantGroups.length))*100 + '%');
                    var g = this.implicantGroups[i].group;

                    for (var j = 0; j < g.length; j++) {
                        if (g[j].isPrim) {

                            // prim terms introduced by don't cares
                            // must have at least one 1
                            var containsOne = false;
                            var allFuncPrimTerm = g[j].imp;
                            for (var kk in allFuncPrimTerm) {
                                var k = allFuncPrimTerm[kk];
                                if (this.funcdata[k] === 1) {
                                    containsOne = true;
                                }
                            }

                            if (!containsOne) {
                                g[j].isOnlyDontCare = true;
                            } else {
                                var primTerm = new PrimTerm();
                                primTerm.implicant = g[j];

                                // extract minTerm as string
                                for (var thisVal in primTerm.implicant.imp) {
                                    var minTerm = "";
                                    var one = 1;
                                    var needed = (~primTerm.implicant.bitMask);
                                    var v;
                                    for (v = 0; v < this.noOfVars; v++) {
                                        if ((needed & one) === one) {
                                            if ((thisVal & one) === one) {
                                                minTerm = "*x" + v + minTerm;
                                            } else {
                                                minTerm = "*/x" + v + minTerm;
                                            }
                                        }
                                        one = one << 1;
                                    }
                                    minTerm = minTerm.slice(1, minTerm.length + 1);

                                    if (primTerm.implicant.bitMask === Math.pow(2, this.noOfVars) - 1)
                                        minTerm = "1";
                                    primTerm.color = hsvToRgb(color, 1.0, 0.5);
                                    color += 0.22;
                                    color = color % 1.0;


                                    primTerm.termString = minTerm;
                                    var colorStr = "rgb(" + primTerm.color[0] + "," + primTerm.color[1] + "," + primTerm.color[2] + ")";
                                    primTerm.coloredTermString = "<span style='color:" + colorStr + "'>" + minTerm + "</span>";
                                    break;
                                }

                                this.primTerms.push(primTerm);
                            }
                        }
                    }
                }


                // looking for essential prime implicants
                var remaining = new Object();
                for (var i = 0; i < this.funcdata.length; i++) {
                    if (this.funcdata[i] === 1) {
                        remaining[i] = i;
                    }
                }

                this.primTermTables.length = 0;
                var primTableLoop = 0;
                var primTableFound = (this.primTerms.length > 0);
                var cyclicCoveringFound = false;
                var primTermTable;
                while (primTableFound) {

                    primTableFound = false;

                    primTermTable = new PrimTermTable(primTableLoop);
                    for (var r in remaining) {
                        primTermTable.remainingVars.push(remaining[r]);
                    }

                    if (primTableLoop === 0) {
                        for (var j = 0; j < this.primTerms.length; j++) {
                            primTermTable.remainingPrimTerms.push(this.primTerms[j]);
                        }
                    } else {
                        // remove rows
                        var prevTable = this.primTermTables[primTableLoop - 1];
                        for (var k = 0; k < prevTable.remainingPrimTerms.length; k++) {
                            if (!prevTable.remainingPrimTerms[k].used) {

                                var superseded = false;
                                var impA = prevTable.remainingPrimTerms[k].implicant.imp;
                                var varCover = new Object;
                                var countA = 0;
                                for (var r in remaining) {
                                    var v = remaining[r];
                                    if (v in impA) {
                                        varCover[v] = v;
                                        countA++;
                                    }
                                }

                                for (var l = 0; l < prevTable.remainingPrimTerms.length && !superseded; l++) {
                                    if (!prevTable.remainingPrimTerms[l].used && k !== l) {
                                        var impB = prevTable.remainingPrimTerms[l].implicant.imp;
                                        var countB = 0;
                                        for (var r in varCover) {
                                            var v = varCover[r];
                                            if (v in impB) {
                                                countB++;
                                            }
                                        }
                                        if (countA === countB) {
                                            var countBInRemaining = 0;
                                            for (var r in remaining) {
                                                var v = remaining[r];
                                                if (v in impB) {
                                                    countBInRemaining++;
                                                }
                                            }
                                            if (countBInRemaining > countA) {
                                                superseded = true;
                                            } else {
                                                if (k > l) {
                                                    superseded = true;
                                                }
                                            }
                                        }

                                    }
                                }

                                if (!superseded) {
                                    primTermTable.remainingPrimTerms.push(prevTable.remainingPrimTerms[k]);
                                } else {
                                    prevTable.supersededPrimTerms.push(prevTable.remainingPrimTerms[k]);
                                }
                            }
                        }
                    }

                    if (primTermTable.remainingPrimTerms.length > 0) {
                        this.primTermTables.push(primTermTable);
                        var currentTerms = primTermTable.remainingPrimTerms;

                        var toBeRemoved = new Object();

                        for (var r in remaining) {
                            var i = remaining[r];
                            var count = 0;
                            var term = -1;
                            for (var j = 0; j < currentTerms.length && count < 2; j++) {
                                if (i in currentTerms[j].implicant.imp) {
                                    term = j;
                                    count++;
                                }
                            }

                            if (count === 1) {
                                currentTerms[term].neededByVar[i] = primTableLoop;
                                if (!currentTerms[term].used) {
                                    this.minimalTermPrims.push(currentTerms[term]);
                                    currentTerms[term].used = true;
                                    primTermTable.essentialPrimTerms.push(currentTerms[term]);
                                    primTableFound = true;

                                    for (var r in remaining) {
                                        var ii = remaining[r];
                                        if (ii in currentTerms[term].implicant.imp) {
                                            toBeRemoved[ii] = ii;
                                        }
                                    }
                                }
                            }
                        }

                        // remove columns
                        var tmpRemaining = new Object();
                        for (var e in remaining) {
                            var ee = remaining[e];
                            tmpRemaining[ee] = ee;
                            delete remaining[e];
                        }
                        var remainingCount = 0;
                        for (var r in tmpRemaining) {
                            var t = tmpRemaining[r];
                            if (!(t in toBeRemoved)) {
                                remaining [t] = t;
                                remainingCount++;
                            }
                        }
                    }

                    if (remainingCount === 0) {
                        primTableFound = false; // break loop
                    } else {
                        if (!primTableFound) {
                            cyclicCoveringFound = true;
                        }
                    }

                    primTableLoop++;
                }

                var solutionFound = true;

                // Petrick's Method
                if (cyclicCoveringFound) {
                    //console.log("Cyclic covering found");

                    var andArray = new Array();

                    for (var r in remaining) {
                        var ii = remaining[r];
                        var orArray = new Array();

                        for (var k = 0; k < primTermTable.remainingPrimTerms.length; k++) {
                            var imp = primTermTable.remainingPrimTerms[k].implicant.imp;
                            if (ii in imp) {
                                var monom = new Object();
                                monom[k] = k;
                                orArray.push(monom);
                            }
                        }
                        andArray.push(orArray);
                    }

                    solutionFound = this.petrickSolver.solve(andArray);

                    if (solutionFound) {
                        var solutions = this.petrickSolver.solution[0];

                        var bestSolution = -1;
                        var bestCount = 10000000;
                        var bestVarCount = 10000000;
                        for (var i = 0; i < solutions.length; i++) {
                            var count = 0;
                            for (var j in solutions[i]) {
                                count++;
                            }
                            if (count <= bestCount) { // first sort accoring to monom length

                                var foundBest = true;
                                if (count === bestCount) {
                                    var bestVarCountNew = 0;
                                    for (var j in solutions[i]) {
                                        for (var v in primTermTable.remainingPrimTerms[j].implicant.imp) {
                                            bestVarCountNew++;
                                        }
                                    }
                                    if (bestVarCountNew >= bestVarCount)
                                        foundBest = false;
                                }

                                if (foundBest) {
                                    bestCount = count;
                                    bestSolution = i;
                                    bestVarCount = 0;
                                    for (var j in solutions[bestSolution]) {
                                        for (var v in primTermTable.remainingPrimTerms[j].implicant.imp) {
                                            bestVarCount++;
                                        }
                                    }
                                }
                            }
                        }
                        //console.log("Best solution " + bestSolution);

                        var best = solutions[bestSolution];
                        for (var b in best) {
                            var addPrimTerm = primTermTable.remainingPrimTerms[best[b]];
                            this.minimalTermPrims.push(addPrimTerm);
                            this.petrickTermPrims.push(addPrimTerm);
                        }
                    }
                }

                if (solutionFound) {
                    this.minimalTerm = "";
                    this.coloredMinimalTerm = "";
                    var firstL = true;
                    for (var i = 0; i < this.minimalTermPrims.length; i++) {
                        if (!firstL) {
                            this.minimalTerm += "+";
                            this.coloredMinimalTerm += " &or; ";
                        }
                        this.minimalTerm += this.minimalTermPrims[i].termString;
                        this.coloredMinimalTerm += this.minimalTermPrims[i].coloredTermString;
                        firstL = false;
                    }

                    if (this.minimalTermPrims.length === 0) {
                        this.minimalTerm = "0";
                        this.coloredMinimalTerm = "0";
                    }
                } else {
                    this.minimalTerm = 'Error: The cyclic covering problem is too large (increase the "maxProblemSize" parameter)';
                    this.coloredMinimalTerm = 'Error: The cyclic covering problem is too large (increase the "maxProblemSize" parameter)';
                }
            };
        }

    }

};
/*
 var testqmc = new QMC();
 var result = testqmc.compute("x0+x1*x2+x3* x1+/x0");
 console.log(result);
 */