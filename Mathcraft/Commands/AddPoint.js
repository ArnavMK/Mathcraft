import { Command } from "./Command.js";
import { Point } from "../Point.js";

export class AddPoint extends Command {
    
    informationModalStats;

    Run() {

        this.graph.RefreshInformationModalWithGivenMode("Point");
        
        this.informationModal = this.graph.GetInformationModal();
        this.informationModalStats = {}
        let isSelectedEquationPresent = this.graph.selectedEquations.size == 1;

        if (isSelectedEquationPresent) {
            
            this.selectedEquation = Array.from(this.graph.selectedEquations.values())[0];
        }

        if (this.graph.selectedEquations.size > 1) {
            window.errorLogger.ShowNewError("Add point command will only work with one or no selected equations")
            return;
        }


        for (let child of this.informationModal.children) {

            if (child.id === "EquationDialog_domain" && isSelectedEquationPresent) {
                child.placeholder = this.selectedEquation.toString(); child.value = "";
                child.disabled = true;
            }

            if (child.id === "EquationDialog_equation") {
                this.informationModalStats["x"] = child;
            }
            else if (child.id === "EquationDialog_domain") {
                this.informationModalStats["y"] = child;
            }
            else if (child.id === "EquationDialog_colorPicker") {
                child.value = Point.defaultColor;
                this.informationModalStats["color"] = child;
            }
            else if (child.id === "EquationDialog_save") {

                this.newPointSaveButton = document.createElement("button");
                this.newPointSaveButton.setAttribute("id", "EquationDialog_save");
                this.newPointSaveButton.setAttribute("class", "SquareButtons");
                this.newPointSaveButton.innerHTML = "Save";

                this.newPointSaveButton.addEventListener("click", () =>{
                    if (!isSelectedEquationPresent) this.AddGeneralPointOnSave();
                    else this.AddPointOnCurve();
                });

                this.informationModal.replaceChild(this.newPointSaveButton, child);
                this.originalSaveButton = child;

            }

        }

        this.informationModal.showModal();
    }

    AddPointOnCurve() {

        let x = parseFloat(this.informationModalStats["x"].value);
        let y = this.selectedEquation.GetValue(x);
        let color = this.informationModalStats["color"].value;
    
        if (y instanceof Array) { // if there are more than one values (circle);

            if (y.some(isNaN)) {window.errorLogger.ShowNewError(`There are no values for x = ${x} on this circle`); return;}

            y.forEach((value) => {
                this.AddPoint(x, value, color, "Invalid inputs. x has to be a number");
            });
            return; 
        }

        this.AddPoint(x,y,color, "Invalid inputs. x has to be a number");
    }

    AddGeneralPointOnSave() {

        let x = parseFloat(this.informationModalStats["x"].value);
        let y = parseFloat(this.informationModalStats["y"].value);
        let color = this.informationModalStats["color"].value;

        this.AddPoint(x,y,color, "Invalid input for a point. Both x and y have to be numbers");
    }

    AddPoint(x, y, color, errorMessage) {

        if (isNaN(x) || isNaN(y)) {
            window.errorLogger.ShowNewError(errorMessage);
            return;
        }

        this.graph.TryAddPoint(new Point(x, y, color));

        try {
            this.informationModal.replaceChild(this.originalSaveButton, this.newPointSaveButton);
        } catch (e) {}
        
        this.informationModalStats["y"].disabled = false;
        this.graph.GetInformationModal().close();
    }

}