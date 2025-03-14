
import { Command } from "./Command.js";


export class BestFit extends Command    {

    Run() {

        if (this.graph.coordinates.size < 2) {
            window.errorLogger.ShowNewError("There are not enough points in the graph");
            return;
        }
        
        let line = window.calculus.GetLineOfBestFit(2);
        this.graph.TryAddEquation(line);
    }


}