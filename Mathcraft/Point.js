import { Entity } from "./Entity.js";

export class Point extends Entity{
    x; y;
    static Radius = 3.2;
    static defaultColor = "#00ffff";

    constructor (x, y, color = "cyan") {
        super(color);
        this.x = x;
        this.y = y;
    }

    static IsValid(point) {        
        return (point != undefined && isFinite(point.x) && isFinite(point.y));
    }


    static AreRoughlySamePoints(mousePoint, point) {
        let minimumRemoveDistance = 0.06;
        return Point.Distance(mousePoint, point) <= minimumRemoveDistance; 
    }

    static GetCanvasPoint(point, canvas, scale) {

        let originX = canvas.width / 2 , originY = canvas.height / 2;

        let canvasX = originX + (point.x * scale);
        let canvasY = originY - (point.y * scale);

        return new Point(canvasX,  canvasY);
    }

    static GetMathPoint(point, canvas, scale) {
     
        let originX = canvas.width / 2 , originY = canvas.height / 2;

        let pointX = parseFloat(((point.x - originX)/scale).toFixed(2));
        let pointY = parseFloat((-(point.y - originY)/scale).toFixed(2));

        return new Point(pointX, pointY);
    }
    
    static Distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    CanSelect(mouseMathPoint) {
        return Point.AreRoughlySamePoints(mouseMathPoint, this);
    }

    static Compare(a, b) {
        let gx, sx, gy, sy;

        if (a.x > b.x) {
            gx = a;
            sx = b;
        }
        else {
            gx = b;
            sx = a;
        }

        
        if (a.y > b.y) {
            gy = a;
            sy = b;
        }
        else {
            gy = b;
            sy = a;
        }

        return {greaterX : gx, smallerX : sx, smallerY : sy, greaterY : gy};
    }

    static CompareY(a, b) {
        let g, s;

        return {greater : g, smaller : s};
    }

    IsUnderThisSelectionRect(rect) {
        return (this.x < rect.greaterXDiagonalPoint.x && this.x > rect.smallerXDiagonalPoint.x) && (this.y < rect.greaterYDiagonalPoint.y && this.y > rect.smallerYDiagonalPoint.y);
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}
