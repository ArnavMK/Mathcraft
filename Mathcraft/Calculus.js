import { Equation } from "./Equation.js";
import { Graph } from "./Graph.js";
import { Point } from "./Point.js";

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

        console.log(equation)

        function FunctionMode(thisClass) {
            let m = thisClass.NumericalDifferentiation(equation, point);
            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        function CircleMode(thisClass) {

            let centre = equation.GetCentre();
            let radiusSlope = (point.y - centre.y)/(point.x - centre.x);
            let m = -1/radiusSlope;

            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        function EllipseMode(thisClass) {
            return new Equation("x", "Reals", "function", "red");
        }

        let lookupObject = {
            "function": FunctionMode,
            "Circle": CircleMode,
            "Ellipse": EllipseMode
        }

        console.log("Getting the tangents")

        return lookupObject[equation.GetType()](this);
    }

    GetSlopePointFormLinearEquation(m, point){
        let equationString = `${m}*(x - ${point.x}) + ${point.y}`;
        return new Equation(equationString, "Reals", "function", Equation.DefaultColor);
    }
}