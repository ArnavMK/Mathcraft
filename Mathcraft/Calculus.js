import { Equation } from "./Equation.js";
import { Graph } from "./Graph.js";
import { Point } from "./Point.js";
import {Parser} from "./Parser.js";

export class Calculus {

    /** @type {Graph}*/graph

    constructor (graph) {
        this.graph = graph;
        console.log("Methamatics is now on");
    }

    GetLineOfBestFit(decimalPlaces = 2) {


        let meanPoint = this.#GetMeanPointOfGraph();
        let slope = this.#GetAverageSlope(decimalPlaces, meanPoint.x, meanPoint.y);
        let yIntercept = parseFloat((meanPoint.y - (slope * meanPoint.x)).toFixed(decimalPlaces));

        let equation = new Equation(
            `${this.#GetStringRepresentationOf(slope)} * x ${this.#GetStringRepresentationOf(yIntercept)}`, 
            "Reals",
            "function",
            Equation.DefaultColor);

        return equation;
    }

    #GetMeanPointOfGraph() {

        let totalX = 0, totalY = 0;
        for (let point of this.graph.coordinates.values()) {
            totalX += point.x;
            totalY += point.y;
        }
        return new Point(totalX/this.graph.coordinates.size, totalY/this.graph.coordinates.size);
    }

    #GetAverageSlope(decimalPlaces, xMean, yMean) {

        let numerator = 0, denominator = 0;

        for (let point of this.graph.coordinates.values()) {
            numerator += (point.x - xMean) * (point.y - yMean);
            denominator += Math.pow(point.x - xMean, 2);
        }

        let result = parseFloat((numerator/denominator).toFixed(decimalPlaces))
        return result;
    }


    #GetStringRepresentationOf(number) {

        if (number >= 0) return " + " + number.toString();
        else return " - " + Math.abs(number)

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

    NumericalDifferentiation(equation, point, h = 0.00000000001) {
        return (equation.GetValue(point.x + h) - equation.GetValue(point.x))/h
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

        let equationString = `${m}*(x - ${point.x}) + ${point.y}`;
        return new Equation(equationString, "Reals", "function", Equation.DefaultColor);

    }

    GetDerivativeOf(equation) {

        let parsedExpression = new Parser().Parse(equation.toString());
        console.log(JSON.stringify(parsedExpression, null, 2));

        let derivative = this.SymbolicDifferentiation(parsedExpression);

        return new Equation(this.TreeToString(derivative), "Reals", "function", "#d941a6");
    }

    TreeToString(node) {

        console.log(node)

        if (node.type === "number") {

            return node.value.toString();

        } else if (node.type === "variable") {

            return node.value;

        } else if (node.type === "operator") {

            const leftStr = this.TreeToString(node.left);
            const rightStr = this.TreeToString(node.right);
            return `(${leftStr} ${node.value} ${rightStr})`;

        } else if (node.type === "function") {

            const argStr = this.TreeToString(node.argument);
            return `${node.value}(${argStr})`;

        }
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
        }
        return undefined;
    }

}