import { Command } from "./Command.js";

export class RemoveAllSelectedPoints extends Command {

    Run() {

        for (let point of this.graph.selectedCoordinates.values()) {
            this.graph.RemovePoint(point);
        }

        this.graph.DeselectSelectedEntities();
    }


}