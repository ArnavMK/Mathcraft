import { Point } from "../Point.js";
import { Command } from "./Command.js";
import { Equation } from "../Equation.js";

export class BestFit extends Command    {

    Run() {
        this.GetLineOfBestFit();
    }

    GetLineOfBestFit(decimalPlaces = 2) {

        if (this.graph.coordinates.length < 2) {
            throw new Error("IncompleteGraphData: there are not enough points in the graph");
        }
        
        let meanPoint = this.#GetMeanPointOfGraph();
        let slope = this.#GetAverageSlope(decimalPlaces, meanPoint.x, meanPoint.y);
        let yIntercept = parseFloat((meanPoint.y - (slope * meanPoint.x)).toFixed(decimalPlaces));

        let equation = new Equation(
            `${this.#GetStringRepresentationOf(slope)} * x ${this.#GetStringRepresentationOf(yIntercept)}`, 
            "Reals",
            "function",
            Equation.DefaultColor);

        this.graph.TryAddEquation(equation);
    }

    #GetMeanPointOfGraph() {

        if (this.graph.selectedCoordinates.length > 1) {
            let totalX = 0, totalY = 0;
            for (let point of this.graph.selectedCoordinates) {
                totalX += point.x;
                totalY += point.y;
            }
            return new Point(totalX/this.graph.selectedCoordinates.length, totalY/this.graph.selectedCoordinates.length);
        }
        
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

}