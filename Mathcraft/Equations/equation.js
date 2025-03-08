import { Entity } from "../Entity.js";

export class equation extends Entity {
    
    #type;
    #centre;
    static DefaultColor = "cyan";

    constructor(type, color = Equation.DefaultColor) {
        super(color);
        this.#type = type;
    }

    static IsValid(equation) {

        if (!equation) {
            return false;
        }

        if (equation.toString() === "") {
            window.errorLogger.ShowNewError("The input fields can't be empty");
            return false;
        }

        return equation.Validate();

    }

    Validate() {
        throw new Error("Validate method must be implemented by subclasses");
    }

    GetType() {
        return this.#type;
    }

    GetCentre() {
        return this.#centre;
    }

    SetCentre(centre) {
        this.#centre = centre;
    }

    CanSelect(mouseMathPoint) {
        throw new Error("CanSelect method must be implemented by subclasses");
    }

    IsPointOnCurve(point) {
        throw new Error("IsPointOnCurve method must be implemented by subclasses");
    }

    toString() {
        throw new Error("toString method must be implemented by subclasses");
    }
}