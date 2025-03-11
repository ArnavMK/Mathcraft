import { Command } from "./Command.js";

export class Differentiate extends Command {

    Run() {

        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You have to select an equation")
            return;
        }
 
        let equation = this.graph.selectedEquations.values().next().value;
        
        let derivative = window.calculus.SymbolicDifferentiation(equation);

        console.log(derivative);
    }

}