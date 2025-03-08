import { Point } from "../Point.js";
import { Command } from "./Command.js";
import { Equation } from "../Equation.js";

export class BestFit extends Command    {

    Run() {

        if (this.graph.coordinates.length < 2) {
            window.errorLogger.ShowNewError("There are not enough points in the graph");
        }
        
        let line = window.calculus.GetLineOfBestFit(2);
        this.graph.TryAddEquation(line);
    }


}