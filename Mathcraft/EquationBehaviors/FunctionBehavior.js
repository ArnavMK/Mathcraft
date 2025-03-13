export class FunctionBehavior {
    
    #function;
    #domain;
    isValid;

    constructor(expression, domain) {
        this.#function = this.#ParseFunction(expression);
        this.#domain = this.#ParseDomain(domain);
        this.expressionString = expression;
        this.domainString = domain;
    }

    #ParseFunction(expression) {

        expression = expression.replace(/\blog\b/g, "log10");
        expression = expression.replace(/\bln\b/g, "log");

        // append Math. before functions
        let mathFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp', "log10", "E", "atan", "acos", "asin"];
        mathFunctions.forEach(func => {
            expression = expression.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
        });

        expression = expression.replace(/\^/g, "**"); // replaces ^ with **

    
        this.isValid = this.#ValidateFunctionExpression(expression);
        if (!this.isValid) return;

        console.log(expression)

        this.isValid = true;
        return new Function("x", `return ${expression}`);
    }

    #ValidateFunctionExpression(expression) {
        if (expression.indexOf(",") >= 0) {
            window.errorLogger.ShowNewError("Cant have punctuation in expression")
            return false;
        }

        if (expression.indexOf("log10") >= 0) {
            window.errorLogger.ShowNewError("log10 is undefined");
            return false;
        }

        return true;
    }

    #ParseDomain(text) {

        if (text === "" || text === "Reals") {
            this.isValid = true;
            return "Reals";
        }

        let domainString = text.replace(/[\[\]()]/g, "");
        let domainList = domainString.split(',').map(Number);

        console.log(domainList)

        if (domainList.length != 2) {
            window.errorLogger.ShowNewError("The domain expects two numbers eg: -1, 2");
            this.isValid = false;
            return;
        }

        if (domainList.some(isNaN)) {
            window.errorLogger.ShowNewError("All inputs have to be numbers");
            this.isValid = false;
            return; 
        }

        this.isValid = true;
        return { min: Math.min(...domainList), max: Math.max(...domainList)};
        
    }

    // this will be called to draw the function
    GetValue(x) {
        return this.#function(x);
    }

    IsPointOnCurve(point) {
        let distanceToCurve = Math.abs(this.#function(point.x) - point.y);
        return distanceToCurve <= 0.1;
    }

    GetDomain() {
        return this.#domain;
    }

    toString() {
        return this.expressionString;
    }

    IsValid() {
        try {
            if (this.#function == undefined) return false;
            this.GetValue(0);
            return this.isValid;
        }
        catch (error) {
            window.errorLogger.ShowNewError(error.message);
            return false;
        }
    }
}