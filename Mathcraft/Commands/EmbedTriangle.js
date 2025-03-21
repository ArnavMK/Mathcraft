import { Command } from "./Command.js";

export class EmbedTriangle extends Command {

    Run() {

        if (this.graph.selectedEquations.size != 1) {
            window.errorLogger.ShowNewError("You Have to select at least one closed equation");
            return;
        }

        this.equation = this.graph.selectedEquations.values().next().value;

        if (this.equation.GetType() === "function") {
            window.errorLogger.ShowNewError("This command cannot take equations made in function mode");
            return;
        }


        let pointsOnCurve = window.calculus.GetRandomPointOnClosedCurve(this.equation, 3);

        for (let point of pointsOnCurve) this.graph.TryAddPoint(point);

        for (let i = 0; i < pointsOnCurve.length; i++) {

            let currentPoint = pointsOnCurve[i];
            let nextPoint = i == pointsOnCurve.length - 1 ? pointsOnCurve[0] : pointsOnCurve[i + 1];

            let LineSegment = window.calculus.GetLineSegment([currentPoint, nextPoint]);
            this.graph.TryAddEquation(LineSegment);
        }

        this.OnComplete();
    
    }  

}