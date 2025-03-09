import { Point } from "../Point.js";
import { Command } from "./Command.js";


export class Roots extends Command {

    Run() {
        console.log("Getting the roots");

        if (this.graph.selectedEquations.size < 1) {
            window.errorLogger.ShowNewError("You have to select at least one equation")
        }
        
        for (let equation of this.graph.selectedEquations.values()) {
            
            let rootFunctionCalls = {
                "function": this.FunctionRootPlotter.bind(this),
                "Circle" : this.CircleRootPlotter.bind(this),
                "Ellipse": this.EllipseRootFinder.bind(this)
            }

            rootFunctionCalls[equation.GetType()](equation);

        }
    }   

    FunctionRootPlotter(equation) {
        let domain = equation.GetDomain();
            
        if (domain === "Reals") {
            
            domain = {
                min: -35,
                max: 35
            }
        }

        let sampleRate = 0.2;
        let rootContainingDomains = [];
        let x = domain.min;

        while (x <= domain.max) {

            let currentPoint = {x: x, y: equation.GetValue(x)}
            let nextPoint = {x: x + sampleRate, y: equation.GetValue(x + sampleRate)};
            let nextNextPoint = {x: x + sampleRate + sampleRate, y: equation.GetValue(x + sampleRate + sampleRate)};

            if (Math.abs(currentPoint.y) < 1e-7) {
                let previousPoint = {x: x - sampleRate, y: equation.GetValue(x - sampleRate)};
                let d = {min: previousPoint.x, max: nextPoint.y};
                rootContainingDomains.push(d);
                x = nextPoint.x;
                continue;
            }

            if (Math.abs(nextPoint.y) < 1e-7) {
                let d = {min: currentPoint.x, max: nextNextPoint.x}
                rootContainingDomains.push(d);
                x = nextNextPoint.x;
                continue;
            }

            if (currentPoint.y * nextPoint.y < 0) {
                let d = {min: currentPoint.x, max: nextPoint.x};
                rootContainingDomains.push(d);
            }

            
            x = nextPoint.x;
        }

        rootContainingDomains.forEach((domain) => {
            this.graph.TryAddPoint(new Point(domain.min, equation.GetValue(domain.min)));
            this.graph.TryAddPoint(new Point(domain.max, equation.GetValue(domain.max)));
            
            let root = this.BisectionMethod(domain, equation);
            //this.graph.TryAddPoint(root);
        });
    }

    CircleRootPlotter(equation) {

        let r = equation.GetRadius();
        let centre = equation.GetCentre();

        console.log(r)
        console.log(centre)

        let x1 = centre.x + Math.sqrt(r*r - centre.y*centre.y);
        let x2 = centre.x - Math.sqrt(r*r - centre.y*centre.y);

        console.log(x1, x2);

        this.graph.TryAddPoint(new Point(x1, 0));
        this.graph.TryAddPoint(new Point(x2, 0));

    }

    EllipseRootFinder(equation) {

    }

    BisectionMethod(initialDomain, equation) {

        let start = initialDomain.min;
        let end = initialDomain.max;

        
    }
}