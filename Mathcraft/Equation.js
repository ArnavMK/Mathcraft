import { Entity } from "./Entity.js";
import { Point } from "./Point.js";


export class Equation extends Entity{
    
    #function;
    #domain; #centre;
    #type; #circleRadius
    #majorMinorAxisPoint

    hasValidSecondInfo;

    static DefaultColor = "cyan";

    constructor (expression, accompaniedInfo, type = "function", color = "cyan") {
        super(color);
        this.firstInfo = expression;
        this.accompaniedInfo = accompaniedInfo
        this.#type = type;

        this.#ParseGivenInfoBasedOnType();
    }
    
    static IsValid(equation) {

        if (equation == undefined) {
            return false;
        }

        if (equation.toString() == "" ) {
            window.errorLogger.ShowNewError("The input fields cant be empty")
            return false;
        }

        if (equation.GetType() == "function") {
            try {
                equation.GetValue(0);
                if (!equation.hasValidSecondInfo) throw new Error("Invalid tokens found in the inputs");
                return true;
            }
            catch (error) {
                window.errorLogger.ShowNewError(error.message);
                return false;
            }
        }
        else {
            try {
                if (!equation.hasValidSecondInfo || equation.accompaniedInfo == "") throw new Error("Invalid Inputs");
                return true;
            }
            catch (error) {
                window.errorLogger.ShowNewError(error.message);
                return false;
            }
        }  
    }
    
    GetValue(inputX) {
        return this.#function(inputX);
    }
    
    #ParseGivenInfoBasedOnType() {
        
        let typeParsingCalls = {
            "function" : () => this.FunctionTypeParsing(),
            "Circle" : () => this.CircleTypeParsing(),
            "Ellipse" : () => this.EllipseTypeParsing()
        }

        typeParsingCalls[this.GetType()]();

    }

    FunctionTypeParsing() {

        console.log(`Parsing the equation: ${this.toString()}`)

        try {

            let mathFunction = math.parse(this.firstInfo);
            console.log(mathFunction.toString())
            this.#function = new Function("x", `return ${this.firstInfo}`);
            this.#domain = this.#ParseDomain(this.accompaniedInfo);
        }
        catch(error) {
            console.error(error.message)
        }
        
        
    }

    IsPointOnEllipse(point) {
        if (this.#type != "Ellipse") {
            return new Error("TypeError: IsPointOnEllipse  can only be called if the equation is of type Ellipse");
        }

        let offset = Math.pow(point.x - this.#centre.x, 2)/(this.#majorMinorAxisPoint.x*this.#majorMinorAxisPoint.x) + Math.pow(point.y - this.#centre.y, 2)/(this.#majorMinorAxisPoint.y*this.#majorMinorAxisPoint.y)
        console.log(Math.abs(1 - offset));
        if (Math.abs(1 - offset) <= 0.1) {
            return true;
        }
        else {
            return false;
        }
    }

    CircleTypeParsing() {
        
        let centreString = "";

        for (let i of this.firstInfo) {
            if (!(i === "(" || i ===")")) {
                centreString += i;
            }
            
            if (i !== "," && isNaN(parseFloat(i))) {
                this.hasValidSecondInfo = false;
                return;
            }
        }

        
        let centreCoordinateList = centreString.split(',').map(Number);
        this.#centre = new Point(centreCoordinateList[0], centreCoordinateList[1]);

        if (isNaN(parseFloat(this.accompaniedInfo))) {
            this.hasValidSecondInfo = false;
            return;
        }

        this.hasValidSecondInfo = true;
        this.#circleRadius = parseFloat(this.accompaniedInfo);        
        
    }

    EllipseTypeParsing() {


        let centreString = ""; let bool1 = true; let bool2 = true;

        for (let i of this.accompaniedInfo) {
            if (!(i === "(" || i ===")")) {
                centreString += i;
            }
            
            if (i !== "," && isNaN(parseFloat(i))) {
                bool1 = false;
            }
        }


        let majorMinorAxisPointString = "";

        for (let i of this.firstInfo) {
            if (!(i === "(" || i ===")")) {
                majorMinorAxisPointString += i;
            }
            if (i !== "," && isNaN(parseFloat(i))) {
                bool2 = false;
            }
        }

        console.log(bool1, bool2)

        if ((bool1 && bool2)) {
            this.hasValidSecondInfo = true;
        }
        else {
            this.hasValidSecondInfo = false;
            return;
        }

        let majorMinorList = majorMinorAxisPointString.split(',').map(Number);
        this.#majorMinorAxisPoint = new Point(majorMinorList[0], majorMinorList[1]);
        let centreCoordinateList = centreString.split(',').map(Number);
        this.#centre = new Point(centreCoordinateList[0], centreCoordinateList[1]);
    }

    GetDomainExpression() {
        return this.accompaniedInfo
    }

    SetType(mode) {
        this.#type = mode;
    }

    GetType() {
        return this.#type;
    }

    GetCentre() {
        if (this.#type === "Circle" || this.#type === "Ellipse") {
            return this.#centre;
        }
        else {
            return new Error("TypeError: cannot get centre of an equation of type " + this.#type);
        }
    }

    GetRadius() {
        if (this.#type === "Circle") {
            return this.#circleRadius;
        }
        else {
            return new Error("TypeError: cannot get radius of an equation of type " + this.#type);
        }
    }

    GetMajorMinorAxisPoint() {
        if (this.#type === "Ellipse") {
            return this.#majorMinorAxisPoint;
        }
        else {
            return new Error("TypeError: cannot get major/minor of an equation of type " + this.#type);
        }
    }

    #ParseDomain(text) {

        if (text === "" || text === "Reals") {
            this.hasValidSecondInfo = true;
            return "Reals";
        }

        let domainString = "";

        for (let i of text) {

            if (!(i === "[" || i ==="]")) {
                domainString += i;
            }


            if (i !== "," && isNaN(parseFloat(i))) {
                this.hasValidSecondInfo = false;
                return;
            }
        }

        let domainList = domainString.split(',').map(Number);
        this.hasValidSecondInfo = true;
        return {
            min: domainList[0],
            max: domainList[1]
        };
    }

    GetDomain() {
        return this.#domain;
    }

    toString() {
        return this.firstInfo;
    }

    CanSelect(mouseMathPoint) {
        
        if (this.GetType() == "function") {
            let functionYValue = this.GetValue(mouseMathPoint.x);
            let actualClickedPoint = new Point(mouseMathPoint.x, functionYValue);

            if (Point.AreRoughlySamePoints(actualClickedPoint, mouseMathPoint)) return true;
        }
        else if (this.GetType() == "Circle") {

            let distanceFromClickedPointToCentre = Point.Distance(this.GetCentre(), mouseMathPoint);
            if (Math.abs(distanceFromClickedPointToCentre - this.GetRadius()) <= 0.1) return true;
        }
        else if (this.GetType() == "Ellipse") {
            if (this.IsPointOnEllipse(mouseMathPoint)) return true;
        }

        return false;
    }
}