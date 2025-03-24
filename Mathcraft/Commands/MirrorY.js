import { Equation } from "../Equation.js";
import { Command } from "./Command.js";
import { Point } from "../Point.js";

export class MirrorY extends Command {

    Run() {

        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You can only have one selected equation for this command");
            return;
        }

        let equation = this.graph.selectedEquations.values().next().value; 

        let lookUpObject = {
            "function": this.FunctionMirroring.bind(this),
            "Ellipse": this.EllipseMirroring.bind(this),
            "Circle": this.ConicMirroring.bind(this)
        }

        lookUpObject[equation.GetType()](equation);
        this.OnComplete();
    }

    FunctionMirroring(equation) {

        let expression = equation.toString().replace(/\bx\b/g, "(-x)");
        let newEquation = new Equation(expression, equation.GetAccompaniedInfo(), "function", equation.GetOriginalColor());
        
        this.graph.TryAddEquation(newEquation);

    }

    ConicMirroring(equation) {

        let currentCentre = equation.GetCentre();
        let newCentre = new Point(-currentCentre.x, currentCentre.y).toString();

        let newConic = new Equation(newCentre, `${equation.GetRadius()}`, "Circle", equation.GetOriginalColor());
        this.graph.TryAddEquation(newConic);
    }

    
    EllipseMirroring(equation) {

        let currentCentre = equation.GetCentre();
        let newCentre = new Point(-currentCentre.x, currentCentre.y).toString();

        let newConic = new Equation(equation.toString(), newCentre, "Ellipse", equation.GetOriginalColor());
        this.graph.TryAddEquation(newConic);
    }

}


