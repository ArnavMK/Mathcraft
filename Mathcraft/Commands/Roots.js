import { Command } from "./Command.js";
import { Point } from "../Point.js";

export class Roots extends Command {

    Run() {

        if (this.graph.selectedEquations.size < 1) {
            window.errorLogger.ShowNewError("You have to select at least one equation");
            return;
        }

        for (let equation of this.graph.selectedEquations.values()) {
            let rootFunctionCalls = {
                "function": this.FunctionRootPlotter.bind(this),
                "Circle": this.CircleRootPlotter.bind(this),
                "Ellipse": this.EllipseRootFinder.bind(this)
            };

            rootFunctionCalls[equation.GetType()](equation);
        }

        this.OnComplete();
    }

    FunctionRootPlotter(equation) {

        let xValueRoots = window.calculus.GetRootsOfEquation(equation, this.graph);

        if (xValueRoots.length == 0) {
            window.errorLogger.ShowNewError("Could not find any roots for this equation.");
            return;
        }

        for (let x of xValueRoots) {
            this.graph.TryAddPoint(new Point(x, equation.GetValue(x)));
        }

    }

    CircleRootPlotter(equation) {

        let roots = window.calculus.GetRootsOfCircle(equation);

        if (!roots) {
            window.errorLogger.ShowNewError("Could not find any roots for this circle");
            return;
        }

        roots.forEach((root) => { this.graph.TryAddPoint(root); });
    }

    EllipseRootFinder(equation) {
        let roots = window.calculus.GetRootsOfEllipse(equation);

        if (!roots) {
            window.errorLogger.ShowNewError("Could not find any roots for this ellipse");
            return; 
        }

        roots.forEach((root) => {this.graph.TryAddPoint(root)});
    }

}