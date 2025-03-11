import { Equation } from "./Equation.js";
import { Graph } from "./Graph.js";
import { Point } from "./Point.js";
import {Parser} from "./Parser.js";

export class Calculus {

    /** @type {Graph}*/graph

    constructor (graph) {
        this.graph = graph;
        console.log("Methamatics is now on");
    }

    GetLineOfBestFit(decimalPlaces = 2) {


        let meanPoint = this.#GetMeanPointOfGraph();
        let slope = this.#GetAverageSlope(decimalPlaces, meanPoint.x, meanPoint.y);
        let yIntercept = parseFloat((meanPoint.y - (slope * meanPoint.x)).toFixed(decimalPlaces));

        let equation = new Equation(
            `${this.#GetStringRepresentationOf(slope)} * x ${this.#GetStringRepresentationOf(yIntercept)}`, 
            "Reals",
            "function",
            Equation.DefaultColor);

        return equation;
    }

    #GetMeanPointOfGraph() {

        let totalX = 0, totalY = 0;
        for (let point of this.graph.coordinates.values()) {
            totalX += point.x;
            totalY += point.y;
        }
        return new Point(totalX/this.graph.coordinates.size, totalY/this.graph.coordinates.size);
    }

    #GetAverageSlope(decimalPlaces, xMean, yMean) {

        let numerator = 0, denominator = 0;

        for (let point of this.graph.coordinates.values()) {
            numerator += (point.x - xMean) * (point.y - yMean);
            denominator += Math.pow(point.x - xMean, 2);
        }

        let result = parseFloat((numerator/denominator).toFixed(decimalPlaces))
        return result;
    }


    #GetStringRepresentationOf(number) {

        if (number >= 0) return " + " + number.toString();
        else return " - " + Math.abs(number)

    }

    NumericalDifferentiation(equation, point, h = 0.00000000001) {
        return (equation.GetValue(point.x + h) - equation.GetValue(point.x))/h
    }

    GetTangentAtPoint(equation, point) {

        function FunctionType(thisClass) {
            let m = thisClass.NumericalDifferentiation(equation, point);
            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        function CircleType(thisClass) {

            let centre = equation.GetCentre();
            let radiusSlope = (point.y - centre.y)/(point.x - centre.x);
            let m = -1/radiusSlope;

            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        function EllipseType(thisClass) {
            
            let axes = equation.GetMajorMinorAxisPoint();
            let centre = equation.GetCentre();

            let b = axes.y; let a = axes.x; let h = centre.x; let k = centre.y;
            let m = (b**2)/(a**2) * ((point.x - h)/(k - point.y));

            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        let lookupObject = {
            "function": FunctionType,
            "Circle": CircleType,
            "Ellipse": EllipseType
        }

        return lookupObject[equation.GetType()](this);
    }

    GetTangentFromPoint(equation, point) {

        function CircleType(thisClass) {

            let centre = equation.GetCentre();
            let r = equation.GetRadius();
            let d = Point.Distance(centre, point);

            let M = (point.y - centre.y)/(point.x - centre.x);
            let alpha = r/(Math.sqrt(d**2 - r**2))

            let m1 = (M - alpha)/(1 + M*alpha);
            let m2 = (M + alpha)/(1 - M*alpha);

            if ([m1, m2].some(isNaN)) {
                return undefined;
            }

            return [thisClass.GetSlopePointFormLinearEquation(m1, point), thisClass.GetSlopePointFormLinearEquation(m2, point)];
        }

        function EllipseType(thisClass) {
            let axes = equation.GetMajorMinorAxisPoint();
            let a = axes.x; // Semi-major axis
            let b = axes.y; // Semi-minor axis
            let center = equation.GetCentre();
            let h = center.x; // x-coordinate of the center
            let k = center.y; // y-coordinate of the center
        
            // Shift the point relative to the ellipse center
            let X0 = point.x - h;
            let Y0 = point.y - k;
        
            let A = a**2 - X0**2;
            let B = 2 * X0 * Y0;
            let C = b**2 - Y0**2;
        
            let discriminant = B**2 - 4 * A * C;
        
            if (discriminant <= 0) return undefined;            

            let m1 = (-B + Math.sqrt(discriminant)) / (2 * A);
            let m2 = (-B - Math.sqrt(discriminant)) / (2 * A);
        
            // Return the equations of the tangent lines in slope-point form
            return [
                thisClass.GetSlopePointFormLinearEquation(m1, point),
                thisClass.GetSlopePointFormLinearEquation(m2, point)
            ];
        }

        // TODO: implement this after differentiation
        function FunctionType(thisClass) {
            return undefined;
        }

        let lookupObject = {
            "function": FunctionType,
            "Circle": CircleType,
            "Ellipse": EllipseType
        }

        return lookupObject[equation.GetType()](this);
    }

    GetSlopePointFormLinearEquation(m, point){
        let equationString = `${m}*(x - ${point.x}) + ${point.y}`;
        return new Equation(equationString, "Reals", "function", Equation.DefaultColor);
    }

    SymbolicDifferentiation(equation) {

        console.log("Implement differentiation");

    }

}