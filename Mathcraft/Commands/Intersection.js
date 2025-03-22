import { Equation } from "../Equation.js";
import { Point } from "../Point.js";
import { Command } from "./Command.js";

export class Intersection extends Command {
    
    Run() {

        if (this.graph.selectedEquations.size != 2) {
            window.errorLogger.ShowNewError("You have to select two equations of same type");
            return;
        }

        let equation1 = this.graph.selectedEquations.values().next().value;
        let equation2;
        for (let equation of this.graph.selectedEquations.values()) {
            equation2 = equation; // last value
        }

        if (equation1.GetType() !== equation2.GetType()) {
            window.errorLogger.ShowNewError("The selected equations have to be of the same type");
        }

        let rootFunctionCalls = {
            "function": this.FunctionIntersection.bind(this),
            "Circle": this.CircleIntersection.bind(this),
            "Ellipse": this.EllipseIntersection.bind(this)
        };

        rootFunctionCalls[equation1.GetType()](equation1, equation2);
    }

    FunctionIntersection(equation1, equation2) {

        let fx = equation1.toString();
        let gx = equation2.toString();
        let hx = `(${fx}) - (${gx})`;

        let hxEquation = new Equation(hx, "Reals", "function");
        let xRoots = window.calculus.GetRootsOfEquation(hxEquation, this.graph);

        if (xRoots.length === 0) {
            window.errorLogger.ShowNewError("These two equations do not intersect");
            return;
        }

        for (let x of xRoots) {
            this.graph.AddPoint(new Point(x, equation1.GetValue(x)));
        }
    }

    CircleIntersection() {

    }

    EllipseIntersection() {

    }
}

