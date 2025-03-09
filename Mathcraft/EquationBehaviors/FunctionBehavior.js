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

        // append Math. before functions
        const mathFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp'];
        mathFunctions.forEach(func => {
            expression = expression.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
        });

        expression = expression.replace(/(\S+)\s*\^\s*(\S+)/g, "($1 ** $2)"); // replace the ^ with **
        
        return new Function("x", `return ${expression}`);
    }

    #ParseDomain(text) {

        if (text === "" || text === "Reals") {
            this.isValid = true;
            return "Reals";
        }

        let domainString = text.replace(/[\[\]]/g, "");
        let domainList = domainString.split(',').map(Number);

        if (domainList.some(isNaN)) {
            this.isValid = false;
            return;
        }

        this.isValid = true;
        return { min: domainList[0], max: domainList[1] };
        
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
            this.GetValue(0);
            return this.isValid;
        }
        catch (error) {
            window.errorLogger.ShowNewError(error.message);
            return false;
        }
    }
}