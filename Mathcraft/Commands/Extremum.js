import { Point } from "../Point.js";
import { Command } from "./Command.js";


export class Extremum extends Command {

    Run() {

        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You have to select only one equation");
            return;
        }
        let equation = this.graph.selectedEquations.values().next().value;
        
        let rootFunctionCalls = {
            "function": this.FunctionType.bind(this),
            "Circle": this.CircleType.bind(this),
            "Ellipse": this.EllipseType.bind(this)
        };

        rootFunctionCalls[equation.GetType()](equation);

        this.OnComplete();
    }

    FunctionType(equation) {
        let derivative = window.calculus.GetDerivativeOf(equation);
        let xValueRoots = window.calculus.GetRootsOfEquation(derivative);

        if (xValueRoots.length === 0) {
            window.errorLogger.ShowNewError("Could not find any turning points for this equation");
            return;
        }

        for (let x of xValueRoots) {
            this.graph.AddPoint(new Point(x, equation.GetValue(x)));
        }

    }

    CircleType(equation) {

        let y1 = equation.GetCentre().y + equation.GetRadius();
        let y2 = equation.GetCentre().y - equation.GetRadius();

        let x = equation.GetCentre().x;
        
        this.graph.AddPoint(new Point(x, y1));
        this.graph.AddPoint(new Point(x, y2));

    }

    EllipseType(equation) {

        let y1 = equation.GetCentre().y + equation.GetMajorMinorAxisPoint().y;
        let y2 = equation.GetCentre().y - equation.GetMajorMinorAxisPoint().y;

        let x = equation.GetCentre().x;
        
        this.graph.AddPoint(new Point(x, y1));
        this.graph.AddPoint(new Point(x, y2));

    }


}