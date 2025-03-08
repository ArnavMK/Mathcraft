import { Equation } from "../Equation.js";
import { Command } from "./Command.js";

export class Tangents extends Command {

    // !: for now it can only handle tangents at a curve using a point on the curve. only functions for now

    Run() {
        console.log("Tangents");

        this.HandleErrorChecking();

        let selectedEquation = this.graph.selectedEquations.values().next().value;
        let selectedPoint = this.graph.selectedCoordinates.values().next().value;

        this.IsPointOnCurve = Equation.IsPointOnCurve(selectedPoint, selectedEquation);

        if (this.IsPointOnCurve) {
            this.PlotTangentsAtPoint(selectedEquation, selectedPoint);
        }
        else {
            this.PlotTangentsFromPoint(selectedEquation, selectedPoint);
        }
    }

    PlotTangentsAtPoint(equation, point) {

        let tangent = window.calculus.GetTangentAtPoint(equation, point);

        this.graph.TryAddEquation(tangent);
    }

    HandleErrorChecking() {
        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You have to select one equation.");
            return;
        }

        if (this.graph.selectedCoordinates.size != 1) {
            window.errorLogger.ShowNewError("You have to select one point on the curve");
            return;
        }

    }

}