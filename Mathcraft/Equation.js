import { Entity } from "./Entity.js";
import { Point } from "./Point.js";


export class Equation extends Entity{
    
    #function;
    #domain; #centre;
    #type; #circleRadius
    #majorMinorAxisPoint

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

        if (equation.toString() == "") {
            window.errorLogger.ShowNewError("The input fields cant be empty")
            return false;
        }

        if (equation.GetType() == "function") {
            try {
                equation.GetValue(0);
                return true;
            }
            catch (error) {
                window.errorLogger.ShowNewError(error.message);
                return false;
            }
        }

        return true;    
    }
    
    GetValue(inputX) {
        let scope = {x: inputX};
        return this.#function.evaluate(scope);
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

        try {
            this.#function = math.parse(this.firstInfo);
        }
        catch(error) {
            console.error(error.message)
        }
        
        this.#domain = this.#ParseDomain(this.accompaniedInfo);
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
        }

        let centreCoordinateList = centreString.split(',').map(Number);
        this.#centre = new Point(centreCoordinateList[0], centreCoordinateList[1]);

        this.#circleRadius = parseFloat(this.accompaniedInfo);        

    }

    EllipseTypeParsing() {
        let centreString = "";

        for (let i of this.accompaniedInfo) {
            if (!(i === "(" || i ===")")) {
                centreString += i;
            }
        }

        let centreCoordinateList = centreString.split(',').map(Number);
        this.#centre = new Point(centreCoordinateList[0], centreCoordinateList[1]);

        let majorMinorAxisPointString = "";

        for (let i of this.firstInfo) {
            if (!(i === "(" || i ===")")) {
                majorMinorAxisPointString += i;
            }
        }

        let majorMinorList = majorMinorAxisPointString.split(',').map(Number);
        this.#majorMinorAxisPoint = new Point(majorMinorList[0], majorMinorList[1]);
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

        console.log(text)

        if (text === "" || text === "Reals") {
            return "Reals";
        }

        let domainString = "";

        for (let i of text) {

            if (!(i === "[" || i ==="]")) {
                domainString += i;
            }
        }

        let domainList = domainString.split(',').map(Number);

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