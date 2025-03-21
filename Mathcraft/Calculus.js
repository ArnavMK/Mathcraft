import { Equation } from "./Equation.js";
import { Graph } from "./Graph.js";
import { Point } from "./Point.js";
import {Parser} from "./Parser.js";
import { GraphGL } from "./GraphGL.js";

export class Calculus {

    /** @type {Graph}*/graph

    constructor (graph) {
        this.graph = graph;
    }

    GetLineOfBestFit(decimalPlaces = 2) {

        let meanPoint = this.#GetMeanPointOfGraph();
        let slope = this.#GetAverageSlope(decimalPlaces, meanPoint.x, meanPoint.y);
        let yIntercept = parseFloat((meanPoint.y - (slope * meanPoint.x)).toFixed(decimalPlaces));

        return this.GetSlopePointFormLinearEquation(slope, new Point(0, yIntercept));
    }

    #GetMeanPointOfGraph() {

        let totalX = 0, totalY = 0;

        let coordinates = this.graph.selectedCoordinates.size === 0 ? this.graph.coordinates.values() : this.graph.selectedCoordinates.values();

        for (let point of coordinates) {
            totalX += point.x;
            totalY += point.y;
        }
        return new Point(totalX/this.graph.coordinates.size, totalY/this.graph.coordinates.size);
    }

    #GetAverageSlope(decimalPlaces, xMean, yMean) {

        let numerator = 0, denominator = 0;

        let coordinates = this.graph.selectedCoordinates.size === 0 ? this.graph.coordinates.values() : this.graph.selectedCoordinates.values();
        
        for (let point of coordinates) {
            numerator += (point.x - xMean) * (point.y - yMean);
            denominator += Math.pow(point.x - xMean, 2);
        }

        let result = parseFloat((numerator/denominator).toFixed(decimalPlaces))
        return result;
    }


    GetRootsOfCircle(equation) {

        let r = equation.GetRadius();
        let centre = equation.GetCentre();

        let x1 = centre.x + Math.sqrt(r*r - centre.y*centre.y);
        let x2 = centre.x - Math.sqrt(r*r - centre.y*centre.y);

        if ([x1, x2].some(isNaN)) {
            return undefined;
        } 

        if (x1 == x2) {
            return [new Point(x1, 0)];
        }

        return [new Point(x1, 0), new Point(x2, 0)];

    }

    GetRootsOfEllipse(equation) {

        let axes = equation.GetMajorMinorAxisPoint();
        let centre = equation.GetCentre();

        let x1 = centre.x + Math.sqrt((axes.x**2/axes.y**2) * (axes.y**2 - centre.y**2));
        let x2 = centre.x - Math.sqrt((axes.x**2/axes.y**2) * (axes.y**2 - centre.y**2));

        if ([x1, x2].some(isNaN)) {
            return undefined;
        }

        if (x1 == x2) {
            return [new Point(x1, 0)];
        }

        return [new Point(x1, 0), new Point(x2, 0)];
    }

    NumericalDifferentiation(equation, point, h = 1e-20) {
        return (equation.GetValue(point.x + h) - equation.GetValue(point.x))/h
    }

    SecondNumericalDifferentiation(equation, point, h = 1e-20) {
        return (
            ((this.NumericalDifferentiation(equation, new Point(point.x+h, 0))) -
            (this.NumericalDifferentiation(equation, new Point(point.x, 0))))/
            h
        );
    }

    GetTangentAtPoint(equation, point) {

        function FunctionType(thisClass) {
            let m = thisClass.NumericalDifferentiation(equation, point);
            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        function CircleType(thisClass) {

            let centre = equation.GetCentre();
            let radiusSlope = (point.y - centre.y)/(point.x - centre.x);
            let m = -1/radiusSlope;

            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        function EllipseType(thisClass) {
            
            let axes = equation.GetMajorMinorAxisPoint();
            let centre = equation.GetCentre();

            let b = axes.y; let a = axes.x; let h = centre.x; let k = centre.y;
            let m = (b**2)/(a**2) * ((point.x - h)/(k - point.y));

            return thisClass.GetSlopePointFormLinearEquation(m, point);
        }

        let lookupObject = {
            "function": FunctionType,
            "Circle": CircleType,
            "Ellipse": EllipseType
        }

        return lookupObject[equation.GetType()](this);
    }
    GetRootsOfEquation(equation, graph) {
        let domain = equation.GetDomain();
        let screenCapacityPoint = graph.renderer.GetGridLinesNumbers();
    
        if (domain === "Reals") {
            domain = {
                min: -screenCapacityPoint.x - 1,
                max: screenCapacityPoint.x + 1
            };
        }
    
        let sampleRate = 0.02;
        let rootContainingDomains = [];
        let x = domain.min;
        let roots = [];
        let signChanges = 0;
        const maxSignChanges = 2000;
    
        while (x <= domain.max) {
            let currentPoint = { x: x, y: equation.GetValue(x) };
            let nextPoint = { x: x + sampleRate, y: equation.GetValue(x + sampleRate) };
    
            // Skip points where the function value is too large (asymptotic behavior)
            if (Math.abs(currentPoint.y) > 2 * screenCapacityPoint.y) {
                x += sampleRate;
                continue;
            }
    
            // Check for root in the current interval
            if (Math.abs(currentPoint.y) < 1e-7) {

                // Check if the function touches the x-axis (derivative is zero)
                let derivativeAtX = this.NumericalDifferentiation(equation, currentPoint);
                let secondDerivativeAtX = this.SecondNumericalDifferentiation(equation, currentPoint);
    
                
                if (Math.abs(derivativeAtX) < 1e-7 && Math.abs(secondDerivativeAtX) > 1e-7) {
                    roots.push(currentPoint.x);

                } else if (Math.abs(derivativeAtX) > 1e-7) {
                    roots.push(currentPoint.x);
                }

                x += sampleRate;
                continue;
            }
    
            // Check for sign change (function crosses the x-axis)
            if (currentPoint.y * nextPoint.y < 0) {
                let d = { min: x, max: x + sampleRate };
                rootContainingDomains.push(d);
                signChanges++;
            }
    
            x += sampleRate;
    
            if (signChanges > maxSignChanges) {
                window.errorLogger.ShowNewError("This function has too many roots to compute. Please reduce the domain.");
                return;
            }
        }
    
        rootContainingDomains.forEach((domain) => {
            roots.push(this.BisectionMethod(domain, equation));
        });
    
        return roots;
    }
    
    BisectionMethod(initialDomain, equation) {

        const tolerance = 1e-7;
        const maxIterations = 100;
        let a = initialDomain.min;
        let b = initialDomain.max;
        let iteration = 0;
    
        while (iteration < maxIterations) {
            let c = (a + b) / 2;
            let fc = equation.GetValue(c);
    
            if (Math.abs(fc) < tolerance) {
                return c;
            }
    
            if (equation.GetValue(a) * fc < 0) {
                b = c;
            } else {
                a = c;
            }
    
            iteration++;
        }
    
        let c = (a + b) / 2;
        return c;
    }

    GetRandomPointOnClosedCurve(equation, howManyPoints) {

        let centreX = equation.GetCentre().x;
        let xRange = equation.GetType() === "Circle" ? equation.GetRadius() : equation.GetMajorMinorAxisPoint().x / 2;

        let domain = {min: centreX - xRange, max: centreX + xRange};
        let randomXs = this.GetRandomNumbersWithMinDistance(domain.min, domain.max, xRange/1.4, howManyPoints);

        let randomPoints = randomXs.map(x => new Point(x, equation.GetValue(x)[this.GetRandomInteger(0, 1)]));

        return randomPoints;
    }

    GetRandomNumbersWithMinDistance(min, max, minDistance, numberOfPoints) {

        let range = max - min;
        let gridSize = Math.ceil(range / minDistance);
    
        // Check if the grid can accommodate the required number of points
        if (gridSize < numberOfPoints) {
            console.error("Not enough space to fit all points with the required minimum distance.");
            return [];
        }
    
        let pointsFound = [];
        for (let i = 0; i < numberOfPoints; i++) {
            // Calculate the cell's starting position
            let cellStart = min + (i % gridSize) * minDistance;
            let cellEnd = cellStart + minDistance;
    
            // Generate a random point within the cell
            let point = this.GetRandomNumber(cellStart, cellEnd);
            pointsFound.push(point);
        }
    
        return pointsFound;

    }

    GetRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    GetRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    GetTangentFromPoint(equation, point) {

        function CircleType(thisClass) {

            let centre = equation.GetCentre();
            let r = equation.GetRadius();
            let d = Point.Distance(centre, point);

            let M = (point.y - centre.y)/(point.x - centre.x);
            let alpha = r/(Math.sqrt(d**2 - r**2))

            let m1 = (M - alpha)/(1 + M*alpha);
            let m2 = (M + alpha)/(1 - M*alpha);

            if ([m1, m2].some(isNaN)) {
                return undefined;
            }

            if (![m1, m2].some(isFinite)) {
                return undefined;
            }

            return [thisClass.GetSlopePointFormLinearEquation(m1, point), thisClass.GetSlopePointFormLinearEquation(m2, point)];
        }

        function EllipseType(thisClass) {
            let axes = equation.GetMajorMinorAxisPoint();
            let a = axes.x; 
            let b = axes.y; 
            let center = equation.GetCentre();
            let h = center.x; 
            let k = center.y; 
        
            let X0 = point.x - h;
            let Y0 = point.y - k;
        
            let A = a**2 - X0**2;
            let B = 2 * X0 * Y0;
            let C = b**2 - Y0**2;
        
            let discriminant = B**2 - 4 * A * C;
        
            if (discriminant <= 0) return undefined;            

            let m1 = (-B + Math.sqrt(discriminant)) / (2 * A);
            let m2 = (-B - Math.sqrt(discriminant)) / (2 * A);
                
            if (![m1, m2].some(isFinite)) {
                return undefined;
            }
    
            return [
                thisClass.GetSlopePointFormLinearEquation(m1, point),
                thisClass.GetSlopePointFormLinearEquation(m2, point)
            ];
        }

        // TODO: implement this after differentiation
        function FunctionType(thisClass) {
            return undefined;
        }

        let lookupObject = {
            "function": FunctionType,
            "Circle": CircleType,
            "Ellipse": EllipseType
        }

        return lookupObject[equation.GetType()](this);
    }

    GetSlopePointFormLinearEquation(m, point){

        let xTerm = point.x < 0 ? `(x + ${Math.abs(point.x)})` : `(x - ${point.x})`;
        let yTerm = point.y < 0 ? ` - ${Math.abs(point.y)}` : ` + ${point.y};`
        
        let equationString = `${m} * ${xTerm}${yTerm}`;

        console.log(equationString)

        return new Equation(equationString, "Reals", "function", Equation.DefaultColor);

    }

    GetDerivativeOf(equation) {

        if (equation.GetType() != "function") {
            window.errorLogger.ShowNewError("Cannot get the derivative of equation of type: " + equation.GetType())
            return;
        }

        let parsedExpression = new Parser().Parse(equation.toString());
        let derivative = this.SymbolicDifferentiation(parsedExpression);

        if (!derivative) return undefined;

        return new Equation(Parser.ConvertTreeToString(derivative), "Reals", "function", GraphGL.GetRandomColor());
    }

    SymbolicDifferentiation(node) {

        if (node.type === "variable") {
            return {type: "number", value: 1};
        }

        if (node.type === "number") {
            return {type: "number", value: 0};
        }

        if (node.type === "operator") {

            // Addition and subtraction
            if (node.value === "+" || node.value === "-") {

                return {
                    type: "operator",
                    value: node.value,
                    left : this.SymbolicDifferentiation(node.left),
                    right : this.SymbolicDifferentiation(node.right)
                }

            }

            // Multiplication: the u*v rule
            if (node.value === "*") {

                let u = node.left; let v = node.right;

                return {
                    type: "operator",
                    value: "+",
                    left : {
                        type: "operator", 
                        value: "*",
                        left: u,
                        right: this.SymbolicDifferentiation(v)
                    },
                    right: {
                        type: "operator",
                        value: "*",
                        left: v,
                        right: this.SymbolicDifferentiation(u)
                    }
                }
            }

            // Division: the u/v rule
            if (node.value === "/") {

                let u = node.left; let v = node.right;
                
                return {
                    type: "operator",
                    value: "/",
                    left: {
                        type: "operator",
                        value: "-",
                        left: {
                            type: "operator",
                            value: "*",
                            left: v,
                            right: this.SymbolicDifferentiation(u)
                        },
                        right: {
                            type: "operator",
                            value: "*",
                            left: u,
                            right: this.SymbolicDifferentiation(v)
                        }
                    },
                    right: {
                        type: "operator",
                        value: "^",
                        left: v,
                        right: {
                            type: "number",
                            value: 2
                        }
                    }
                }
            }

            // Exponential cases
            if (node.value === "^") {

                let base = node.left; let exponent = node.right;

                if (base.type === "number" && base.value === Math.E) {

                    if (exponent.type === "variable") {
                        return node;
                    }

                    return {
                        type: "operator",
                        value: "*",
                        left: node,
                        right: this.SymbolicDifferentiation(exponent)
                    }

                }

                // x^f(x) cases
                if (exponent.type === "number") {

                    return {
                        type: "operator",
                        value: "*",
                        left: {
                            type: "operator",
                            value: "*",
                            left: exponent,
                            right: {
                                type: "operator",
                                value: "^",
                                left: base,
                                right: {
                                    type:"number",
                                    value: exponent.value - 1
                                }
                            }
                        },
                        right: this.SymbolicDifferentiation(base)
                    }
                }




                // a^f(x) cases
                if (base.type === "number") {

                    return {
                        type : "operator",
                        value: "*",
                        left: {
                            type: "operator",
                            value: "*",
                            left: {
                                type: "operator",
                                value: "^",
                                left: base,
                                right: exponent
                            },
                            right: {
                                type: "function",
                                value: "ln",
                                argument: base
                            }
                        },
                        right: this.SymbolicDifferentiation(exponent)
                    }
                }

                // f(x)^g(x) cases;
                if ((base.type === "operator" || base.type === "variable" || base.type === "function") &&
                    (exponent.type === "operator" || exponent.type === "variable" || exponent.type === "function")) {

                    return {
                        type: "operator",
                        value: "*", 
                        left: node,
                        right: {
                            type: "operator",
                            value: "+",
                            left :{
                                type: "operator",
                                value: "/",
                                left: {
                                    type: "operator",
                                    value: "*",
                                    left: exponent,
                                    right: this.SymbolicDifferentiation(base)
                                },
                                right: base
                            },
                            right: {
                                type: "operator",
                                value: "*",
                                left: this.SymbolicDifferentiation(exponent),
                                right: {
                                    type: "function",
                                    value: "ln",
                                    argument: base
                                }
                            }
                        }
                    }

                }
            }
        }


        if (node.type === "function") {

            if (node.value === "sin") {
                
                return {
                    type: "operator",
                    value: "*",
                    left: {
                        type: "function",
                        value: "cos",
                        argument: node.argument,
                    },
                    right: this.SymbolicDifferentiation(node.argument)
                }

            }

            if (node.value == "cos") {

                return {
                    type: "operator",
                    value: "*",
                    left: {
                        type: "operator",
                        value: "*",
                        left: {
                            type: "number",
                            value: -1
                        },
                        right: {
                            type: "function",
                            value: "sin",
                            argument: node.argument
                        }
                    },
                    right: this.SymbolicDifferentiation(node.argument)
                }
            }

            if (node.value === "tan") {
                
                return {
                    type: "operator",
                    value: "/",
                    left: this.SymbolicDifferentiation(node.argument),
                    right: {
                        type: "operator",
                        value: "^",
                        left: {
                            type: "function",
                            value: "cos",
                            argument: node.argument
                        },
                        right: {
                            type: "number",
                            value: 2
                        }
                    }
                }

            }

            if (node.value === "ln") {

                return {
                    type: "operator",
                    value: "/",
                    left: this.SymbolicDifferentiation(node.argument),
                    right: node.argument
                }

            }

            // log to the base 10: log(f(x)) cases
            if (node.value === "log") {

                return {
                    type: "operator",
                    value: "/",
                    left: this.SymbolicDifferentiation(node.argument),
                    right: {
                        type: "operator",
                        value: "*",
                        left: node.argument,
                        right: {
                            type: "number",
                            value: Math.log(10)
                        }
                    }
                }
            }

            if (node.value === "sqrt") {

                return {
                    type: "operator",
                    value: "/",
                    left: this.SymbolicDifferentiation(node.argument),
                    right: {
                        type: "operator",
                        value: "*",
                        left: {
                            type: "number",
                            value: 2
                        },
                        right: node
                    }
                }
            }

            if (node.value === "asin") {

                return {
                    type: "operator",
                    value: "/",
                    left: {type: "number", value: 1},
                    right: {
                        type: "function",
                        value: "sqrt",
                        argument: {
                            type: "operator",
                            value: "-",
                            left: {type: "number", value: 1},
                            right: {
                                type:"operator",
                                value: "^",
                                left: {type: "variable", value: "x"},
                                right: {type: "number", value: 2}
                            }
                        }
                    }
                }

            }

            if (node.value === "acos") {

                return {
                    type: "operator",
                    value: "/",
                    left: {type: "number", value: -1},
                    right: {
                        type: "function",
                        value: "sqrt",
                        argument: {
                            type: "operator",
                            value: "-",
                            left: {type: "number", value: 1},
                            right: {
                                type:"operator",
                                value: "^",
                                left: {type: "variable", value: "x"},
                                right: {type: "number", value: 2}
                            }
                        }
                    }
                }
            }

            if (node.value === "atan") {

                return {
                    type: "operator",
                    value: "/",
                    left: {type: "number", value: 1},
                    right: {
                        type: "operator",
                        value: "+",
                        left: {type: "number", value: 1},
                        right: {
                            type:"operator",
                            value: "^",
                            left: {type: "variable", value: "x"},
                            right: {type: "number", value: 2}
                        }
                    }
                }
            }
        }
        
        return undefined;
    }

    GetLineSegment(points) {

        let domainString = `${points[0].x}, ${points[1].x}`
        let m = (points[0].y - points[1].y)/(points[0].x - points[1].x);
        let expression = `${m}*(x - ${points[0].x}) + ${points[0].y}`

        return new Equation(expression, domainString, "function");

    }
}
