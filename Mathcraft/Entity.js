
export class Entity {

    color;
    originalColor;

    constructor(color = "cyan") {
        this.color = color;
        this.originalColor = color;
    }

    SetColor(colorString) {
        this.color = colorString;
    }

    GetColor() {
        return this.color;
    }

    GetOriginalColor() {
        return this.originalColor;
    }

    CanSelect(mouseMathPoint) {
        throw new Error("CanSelect method has to implemented by all child class");
    }

}