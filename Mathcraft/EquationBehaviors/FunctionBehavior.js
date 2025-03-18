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
    
    // this methods gets called thousands of times to render this equation
    GetValue(x) {
        return this.#function(x);
    }

    #ParseFunction(expression) {

        // replace the log -> log10 and ln -> log according to Math class in JS
        expression = expression.replace(/\blog\b/g, "log10");
        expression = expression.replace(/\bln\b/g, "log");

        // append Math. before functions
        let symbols = ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp', "log10", "E", "atan", "acos", "asin"];
        for (let symbol of symbols) {
            expression = expression.replace(new RegExp(`\\b${symbol}\\b`, 'g'), `Math.${symbol}`);
        }

        expression = expression.replace(/\^/g, "**"); // replaces ^ with **

        // runs project specific error checks
        this.isValid = this.#ValidateFunctionExpression(expression);
        if (!this.isValid) return;

        // makes the function
        try {
            let func = new Function("x", `return ${expression}`);
            this.isValid = true; return func;
        }
        catch (error) {
            this.isValid = false;
            // displays any errors that may appear in making a new function (l:34)
            window.errorLogger.ShowNewError(error.message);
            return undefined;
        }
    }

    #ValidateFunctionExpression(expression) {
        if (expression.indexOf(",") >= 0) {
            window.errorLogger.ShowNewError("Cant have punctuation in expression")
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


    IsPointOnCurve(point) {
        
        if (!this.IsPointInDomain(point)) return false;

        let distanceToCurve = Math.abs(this.#function(point.x) - point.y);
        return distanceToCurve <= 0.1;
    }

    IsPointInDomain(point) {
        

        if (this.#domain === "Reals") return true;

        return (point.x <= this.#domain.max) && (point.x >= this.#domain.min);
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