import { Command } from "./Command.js";
import { Point } from "../Point.js";

export class Roots extends Command {

    Run() {

        if (this.graph.selectedEquations.size < 1) {
            window.errorLogger.ShowNewError("You have to select at least one equation");
            return;
        }
        
        // finds the roots of all selected equations.
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

        let xValueRoots = window.calculus.GetRootsOfEquation(equation);

        if (xValueRoots == undefined) {
            window.errorLogger.ShowNewError(`${equation.toString()} either has too many or no roots`);
            return;
        }

        if (xValueRoots.length == 0) {
            window.errorLogger.ShowNewError(`${equation.toString()} either has too many or no roots`);
            return;
        }

        for (let x of xValueRoots) {
            this.graph.AddPoint(new Point(x, equation.GetValue(x)));
        }

    }

    CircleRootPlotter(equation) {

        let roots = window.calculus.GetRootsOfCircle(equation);

        if (!roots) {
            window.errorLogger.ShowNewError(`Could not find any roots for ${equation.toIdentifierString()}`);
            return;
        }

        roots.forEach((root) => { this.graph.AddPoint(root); });
    }

    EllipseRootFinder(equation) {
        let roots = window.calculus.GetRootsOfEllipse(equation);

        if (!roots) {
            window.errorLogger.ShowNewError(`Could not find any roots for ${equation.toIdentifierString()}`);
            return; 
        }

        roots.forEach((root) => {this.graph.AddPoint(root)});
    }

}
