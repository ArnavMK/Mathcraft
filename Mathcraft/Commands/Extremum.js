import { Point } from "../Point.js";
import { Command } from "./Command.js";


export class Extremum extends Command {

    Run() {

        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You have to select only one equation");
            return;
        }
        
        let equation = this.graph.selectedEquations.values().next().value;
        let derivative = window.calculus.GetDerivativeOf(equation);
        let xValueRoots = window.calculus.GetRootsOfEquation(derivative, this.graph);

        if (xValueRoots.length === 0) {
            window.errorLogger.ShowNewError("Could not find any turning points for this equation");
            return;
        }

        for (let x of xValueRoots) {
            this.graph.AddPoint(new Point(x, equation.GetValue(x)));
        }

        this.OnComplete();
    }

}