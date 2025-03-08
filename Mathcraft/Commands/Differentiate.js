import { Parser } from "../Parser.js";
import { Command } from "./Command.js";

export class Differentiate extends Command {

    Run() {

        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You have to select at least one equation")
            return;
        }
 
        let equation = Array.from(this.graph.selectedEquations.values())[0];
        let expression = equation.toString();  
        
        let parsedExpression = new Parser().Parse(expression);
        console.log(parsedExpression);

    }

}