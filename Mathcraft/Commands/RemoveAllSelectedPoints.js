import { Command } from "./Command.js";

export class RemoveAllSelectedPoints extends Command {
    Run() {

        for (let point of this.graph.selectedCoordinates.values()) {
            this.graph.RemovePoint(point);
        }

        for (let equation of this.graph.selectedEquations.values()) {
            this.graph.RemoveEquation(equation);
        }

        this.OnComplete();        
    }


}