import { Command } from "./Command.js";
import { Point } from "../Point.js";

export class Roots extends Command {

    Run() {
        if (this.graph.selectedEquations.size < 1) {
            window.errorLogger.ShowNewError("You have to select at least one equation");
            return;
        }

        for (let equation of this.graph.selectedEquations.values()) {
            let rootFunctionCalls = {
                "function": this.FunctionRootPlotter.bind(this),
                "Circle": this.CircleRootPlotter.bind(this),
                "Ellipse": this.EllipseRootFinder.bind(this)
            };

            rootFunctionCalls[equation.GetType()](equation);
        }

        this.OnComplete();
    }

    FunctionRootPlotter(equation) {
        let domain = equation.GetDomain();
    
        if (domain === "Reals") {
            domain = {
                min: -35,
                max: 35
            };
        }
    
        let sampleRate = 0.01; // Smaller sample rate for high-density roots
        let rootContainingDomains = [];
        let x = domain.min;
        let signChanges = 0; // Counter for sign changes
        const maxSignChanges = 1000; // Threshold for "too many roots"
    
        while (x <= domain.max) {
            // Skip discontinuities (e.g., near tan(x) asymptotes)
            if (Math.abs(x - (Math.PI / 2 + Math.floor((x + Math.PI / 2) / Math.PI) * Math.PI)) < 0.1) {
                x += sampleRate;
                continue;
            }
    
            let currentPoint = { x: x, y: equation.GetValue(x) };
            let nextPoint = { x: x + sampleRate, y: equation.GetValue(x + sampleRate) };
    
            // Check for root in the current interval
            if (Math.abs(currentPoint.y) < 1e-7) {
                let d = { min: x - sampleRate, max: x + sampleRate };
                rootContainingDomains.push(d);
                signChanges++;
                x += sampleRate;
                continue;
            }
    
            if (currentPoint.y * nextPoint.y < 0) {
                let d = { min: x, max: x + sampleRate };
                rootContainingDomains.push(d);
                signChanges++;
            }
    
            x += sampleRate;
    
            // If too many sign changes, stop and show a message
            if (signChanges > maxSignChanges) {
                window.errorLogger.ShowNewError("This function has too many roots to compute. Please reduce the domain or use a different method.");
                return;
            }
        }
    
        // Find roots using the Bisection Method
        rootContainingDomains.forEach((domain) => {
            try {
                let root = this.BisectionMethod(domain, equation);
                this.graph.TryAddPoint(root); // Add the root point to the graph
            } catch (e) {
                console.log(`Failed to find root in interval [${domain.min}, ${domain.max}]: ${e.message}`);
            }
        });
    
    }

    CircleRootPlotter(equation) {

        let roots = window.calculus.GetRootsOfCircle(equation);

        if (!roots) {
            window.errorLogger.ShowNewError("Could not find any roots for this circle");
            return;
        }

        roots.forEach((root) => { this.graph.TryAddPoint(root); });
    }

    EllipseRootFinder(equation) {
        let roots = window.calculus.GetRootsOfEllipse(equation);

        if (!roots) {
            window.errorLogger.ShowNewError("Could not find any roots for this ellipse");
            return; 
        }

        roots.forEach((root) => {this.graph.TryAddPoint(root)});
    }

    BisectionMethod(initialDomain, equation) {
        const tolerance = 1e-7; // Tolerance for the root
        const maxIterations = 100; // Maximum number of iterations
        let a = initialDomain.min;
        let b = initialDomain.max;
        let iteration = 0;

        // Check if the function changes sign over the interval
        if (equation.GetValue(a) * equation.GetValue(b) >= 0) {
            throw new Error("The function does not change sign over the interval. Bisection method cannot be applied.");
        }

        while (iteration < maxIterations) {
            let c = (a + b) / 2; // Midpoint
            let fc = equation.GetValue(c);

            // Check if the midpoint is the root
            if (Math.abs(fc) < tolerance) {
                return new Point(c, fc); // Return the root as a Point
            }

            // Update the interval
            if (equation.GetValue(a) * fc < 0) {
                b = c; // Root is in [a, c]
            } else {
                a = c; // Root is in [c, b]
            }

            iteration++;
        }

        // If the loop ends without finding a root, return the best approximation
        let c = (a + b) / 2;
        return new Point(c, equation.GetValue(c));
    }
}