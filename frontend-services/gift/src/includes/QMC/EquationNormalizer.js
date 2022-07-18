

var  EquationNormalizer = function(){

    this.normalizeToCDNF = function(expression, inputnumber){

        var startstring = "";
        if(expression.indexOf("=") != -1){
            startstring = expression.split("=")[0] + "=";
            equation = expression.split("=")[1];
        }else{
            equation = expression;
        }
        var equation;
        var input = 0;
        var i;
        var e;
        var value;
        var tempequation;
        var cdnf = "";
        var term = "";


        for(i = 0; i < Math.pow(2,inputnumber); i++){
            tempequation = equation;
            for(e = 0; e < inputnumber; e++){
                value = "" + ((input >> e) & 1);
                tempequation = tempequation.replaceAll("x" + e, value);
            }
            var tempequation = Logic.evaluateExpression(tempequation);
            if(tempequation.compute() == 1) {
                for (e = 0; e < inputnumber; e++) {
                    value = "" + ((input >> e) & 1);
                    if (value == 1) {
                        term += "x" + e + "*";
                    } else {
                        term += "/x" + e + "*";
                    }
                }
                term = term.slice(0, term.length - 1);
                cdnf += term + "+";
                term = "";
            }
            input++;
        }
        cdnf = startstring + cdnf.slice(0, cdnf.length - 1);
        return cdnf;
    };

    this.normalizeToCCNF = function(expression, inputnumber){
        var startstring = "";
        if(expression.indexOf("=") != -1){
            startstring = expression.split("=")[0] + "=";
            equation = expression.split("=")[1];
        }else{
            equation = expression;
        }
        var equation;
        var input = 0;
        var i;
        var e;
        var value;
        var tempequation;
        var ccnf = "";
        var term = "";


        for(i = 0; i < Math.pow(2,inputnumber); i++){
            tempequation = equation;
            for(e = 0; e < inputnumber; e++){
                value = "" + ((input >> e) & 1);
                tempequation = tempequation.replaceAll("x" + e, value);
            }
            var tempequation = Logic.evaluateExpression(tempequation);
            if(tempequation.compute() == 0) {
                for (e = 0; e < inputnumber; e++) {
                    value = "" + ((input >> e) & 1);
                    if (value == 1) {
                        term += "x" + e + "+";
                    } else {
                        term += "/x" + e + "+";
                    }
                }
                term = "(" + term.slice(0, term.length - 1) + ")";
                ccnf += term + "*";
                term = "";
            }
            input++;
        }
        ccnf = startstring + ccnf.slice(0, ccnf.length - 1);
        return ccnf;
    };

    this.normalizeZToCDNF = function(expression, inputnumber, znumber){
        var i;
        var e;
        var length = inputnumber + znumber;
        var equation = expression.split("=")[1];
        var variable = expression.split("=")[0];
        var result;
        for(i = inputnumber, e = 0; i < length; i++, e++){
            equation = equation.replaceAll("z" + e, "x" + i);
        }
        result = this.normalizeToCDNF(variable + "=" + equation, length);
        for(i = inputnumber, e = 0; i < length; i++, e++){
            result = result.replaceAll("x" + i, "z" + e);
        }
        result = machine.FilterEquationToEquation([result,undefined])[0];
        //Filtere unnötige Elemente z.b. *1 , sowie Klammern
        result = machine.SortEquationToEquation([result,undefined],'+','*')[0];
        //Sortieren mittels divide and conquer
        // Zerlege zuerst am '+' und dann am '*'
        return result;

    };

    this.normalizeZToCCNF = function(expression, inputnumber, znumber){
        var i;
        var e;
        var length = inputnumber + znumber;
        var equation = expression.split("=")[1];
        var variable = expression.split("=")[0];
        var result;
        for(i = inputnumber, e = 0; i < length; i++, e++){
            equation = equation.replaceAll("z" + e, "x" + i);
        }
        result = this.normalizeToCCNF(variable + "=" + equation, length);

        for(i = inputnumber, e = 0; i < length; i++, e++){
            result = result.replaceAll("x" + i, "z" + e);
        }
        result = machine.FilterEquationToEquation([result,undefined])[0];
        //Filtere unnötige Elemente z.b. *1 , sowie Klammern
        result = machine.SortEquationToEquation([result,undefined],'*','+')[0];
        //Sortieren mittels divide and conquer
        // Zerlege zuerst am '*' und dann am '+'
        return result;

    };

    this.calculateTruthVector = function(expression, inputnumber){
        if(expression.indexOf("=") != -1){

            equation = expression.split("=")[1];
        }else{
            equation = expression;
        }
        var equation;
        var input = 0;
        var i;
        var e;
        var value;
        var tempequation;
        var vectorlength = Math.pow(2,inputnumber);
        var vector = new Array(vectorlength);


        for(i = 0; i < vectorlength; i++){
            tempequation = Logic.evaluateExpression(equation);
            for(e = 0; e < inputnumber; e++) {
                value = "" + ((input >> e) & 1);
                tempequation.renameVariable("x" + e, value);
            }
            if(tempequation.compute() == 1) {
                vector[i] = 1;
            }else{
                vector[i] = 0;
            }

            input++;
        }

        return vector;
    };

};





