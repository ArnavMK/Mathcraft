import { Command } from "./Command.js";
import { Point } from "../Point.js";

export class Open extends Command {
    
    selectedPoint;
    informationModalStats;

    Run() {

        this.graph.RefreshInformationModalWithGivenMode("Point");
        
        this.informationModal = this.graph.GetInformationModal();
        this.selectedPoint = Array.from(this.graph.selectedCoordinates.values())[0];
        this.informationModalStats = {}


        for (let child of this.informationModal.children) {

            if (child.id === "EquationDialog_equation") {

                child.value = this.selectedPoint.x.toString();
                this.informationModalStats["x"] = child;

            }
            else if (child.id === "EquationDialog_domain") {

                child.value = this.selectedPoint.y.toString();
                this.informationModalStats["y"] = child;

            }
            else if (child.id === "EquationDialog_colorPicker") {

                child.value = this.selectedPoint.GetOriginalColor();
                this.informationModalStats["color"] = child;

            }
            else if (child.id === "EquationDialog_save") {

                this.newPointSaveButton = document.createElement("button");
                this.newPointSaveButton.setAttribute("id", "EquationDialog_save");
                this.newPointSaveButton.setAttribute("class", "SquareButtons");
                this.newPointSaveButton.innerHTML = "Save";
                this.newPointSaveButton.addEventListener("click", this.OnPointSaveButtonClicked.bind(this));
                this.informationModal.replaceChild(this.newPointSaveButton, child);
                this.originalPointSaveButton = child;

            }

        }

        this.informationModal.showModal();
    }

    OnPointSaveButtonClicked() {

        this.graph.RemovePoint(this.selectedPoint);
        this.graph.TryAddPoint(new Point(
            parseFloat(this.informationModalStats["x"].value),
            parseFloat(this.informationModalStats["y"].value),
            this.informationModalStats["color"].value
        ));

        this.informationModal.replaceChild(this.originalPointSaveButton, this.newPointSaveButton);
        this.graph.GetInformationModal().close();
    }

}