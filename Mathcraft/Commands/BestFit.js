
import { Command } from "./Command.js";


export class BestFit extends Command    {

    Run() {

        if (this.graph.coordinates.size < 2) {
            window.errorLogger.ShowNewError("A minimum of 2 points are required for this command");
            return;
        }
        
        let line = window.calculus.GetLineOfBestFit(2);
        this.graph.TryAddEquation(line);
    }


}