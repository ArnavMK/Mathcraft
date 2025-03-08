import { equation } from "./equation.js";
import { Point } from "../Point.js";

export class FunctionEquation extends equation{

    #function;
    #domain

    constructor (expression, domain, color = equation.DefaultColor) {
        super("function", color);
        this.expressionString = expression;
        this.domainString = domain;
        this.#ParseFunction();
    }

    GetValue(x) {
        return this.#function(x);
    }

    GetDomainExpression() {
        return this.domainString
    }

    GetDomain() {
        return this.#domain;
    }
    
    #ParseFunction() {

        console.log(`Parsing the equation: ${this.toString()}`)

        try {
            
            let expr = this.expressionString;
            const mathFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp'];
            mathFunctions.forEach(func => {
                expr = expr.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
            });
    
            expr = expr.replace(/(\S+)\s*\^\s*(\S+)/g, "($1 ** $2)");    

            this.#function = new Function("x", `return ${expr}`);
            this.#domain = this.#ParseDomain();
        }
        catch(error) {
            console.error(error.message)
        }
    }

    #ParseDomain() {

        if (this.domainString === "" || this.domainString === "Reals") {
            this.isValid = true;
            return "Reals";
        }

        let domainString = this.domainString.replace(/[\[\]]/g, ""); // removes brackets
        let domainList = domainString.split(',').map(Number);

        if (domainList.some(isNaN)) { // if any number is NaN then return.
            this.isValid = false;
            return;
        }

        this.isValid = true;
        return { min: domainList[0], max: domainList[1] };

    }

    Validate() {

        try {
            this.GetValue(0);
            return this.isValid;

        } catch (error) {

            window.errorLogger.ShowNewError(error.message);
            return false;

        }
    }

    CanSelect(mouseMathPoint) {

        let functionYValue = this.GetValue(mouseMathPoint.x);
        let actualClickedPoint = new Point(mouseMathPoint.x, functionYValue);

        return Point.AreRoughlySamePoints(actualClickedPoint, mouseMathPoint);
    }

    IsPointOnCurve(point) {

        let distanceToCurve = Math.abs(this.GetValue(point.x) - point.y);
        return distanceToCurve <= 0.1;

    }

    toString() {
        return this.expressionString;
    }
}