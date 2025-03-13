import { Command } from "./Command.js";

export class LineSegment extends Command {
    
    Run() {

        if (this.graph.selectedCoordinates.size != 2) {
            window.errorLogger.ShowNewError("Cant have more than two points selected for this command");
            return;
        }

        let points = Array.from(this.graph.selectedCoordinates.values())
        let segment = window.calculus.GetLineSegment(points);

        this.graph.TryAddEquation(segment);

        this.OnComplete();
    }

}