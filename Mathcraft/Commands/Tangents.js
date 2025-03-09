import { Equation } from "../Equation.js";
import { Command } from "./Command.js";

export class Tangents extends Command {

    // !: for now it can only handle tangents at a curve using a point on the curve. only functions for now

    Run() {

        if (this.AreThereAnyErrors()) return;

        let selectedEquation = this.graph.selectedEquations.values().next().value;
        let selectedPoint = this.graph.selectedCoordinates.values().next().value;

        this.IsPointOnCurve = selectedEquation.IsPointOnCurve(selectedPoint);

        if (this.IsPointOnCurve) {
            this.PlotTangentsAtPoint(selectedEquation, selectedPoint);
        }
        else {
            window.errorLogger.ShowNewError("Can only handle tangents at point, yet!!");return;
            //this.PlotTangentsFromPoint(selectedEquation, selectedPoint);
        }
    }

    PlotTangentsAtPoint(equation, point) {
        let tangent = window.calculus.GetTangentAtPoint(equation, point);
        console.log(tangent);
        this.graph.TryAddEquation(tangent);
    }

    AreThereAnyErrors() {
        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You have to select one equation.");
            return true;
        }

        if (this.graph.selectedCoordinates.size != 1) {
            window.errorLogger.ShowNewError("You have to select one point on the curve");
            return true;
        }

        return false;

    }

}