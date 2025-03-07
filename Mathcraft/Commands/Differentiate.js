import { Parser } from "../Parser.js";
import { Command } from "./Command.js";

export class Differentiate extends Command {

    Run() {

        if (this.graph.selectedEquations.length != 1) {
            window.errorLogger.ShowNewError("You have to select at least one equation")
            return;
        }
 
        let equation = this.graph.selectedEquations[0];
        let expression = equation.toString();


        let parser = new Parser();
        let parsedExpression = parser.Parse(expression) // x^2


        this.graph.TryAddEquation(derivative);

    }

}