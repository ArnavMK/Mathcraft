import { Command } from "./Command.js";

export class RemoveAllSelectedPoints extends Command {

    Run() {

        for (let point of this.graph.selectedCoordinates) {
            this.graph.RemovePoint(point);
        }

        this.graph.DeselectSelectedEntities();
    }


}