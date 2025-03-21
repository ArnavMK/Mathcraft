import { Equation } from "../Equation.js";
import { Command } from "./Command.js";


export class MirrorY extends Command {

    Run() {
        
        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You can only have one selected equation for this command");
            return;
        }

        let equation = this.graph.selectedEquations.values().next().value; 

        if (equation.GetType() != "function") {
            window.errorLogger.ShowNewError("Cannot mirror equation of type: " + equation.GetType());
            return;
        }

        let expression = equation.toString().replace(/\bx\b/g, "(-x)");
        let newEquation = new Equation(expression, equation.GetAccompaniedInfo(), "function", equation.GetOriginalColor());

        this.graph.TryAddEquation(newEquation);

        this.OnComplete();
    }

}