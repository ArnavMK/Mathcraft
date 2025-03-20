
import { Equation } from "./Equation.js";
import { Point } from "./Point.js";


export class GraphGL {

    static defaultSelectedEntityColor = "white";
    
    /** @type {Map}*/ #coordinates;
    /** @type {Map}*/ #equations;
    /** @type {Map}*/ #entities;
    /** @type {HTMLCanvasElement}*/ gridCanvas;
    /** @type {CanvasRenderingContext2D} */ gridC;
    /** @type {HTMLCanvasElement}*/ pointCanvas;
    /** @type {CanvasRenderingContext2D} */ pointC;
    /** @type {HTMLCanvasElement}*/ equationCanvas;
    /** @type {CanvasRenderingContext2D} */ equationC;
    /** @type {HTMLCanvasElement}*/ miscCanvas;
    /** @type {CanvasRenderingContext2D} */ miscC;
    /** @type {Set}*/ #selectedEquations;
    /** @type {Set}*/ #selectedEntities;
    #selectedPoints
    scale;
    #pointDisplay;
    #isGridVisible = true;
    #Axis = {x: true, y: false};
    #canDrawSelectionRect = false;
    #canPointDisplayAppear = false;
    #theme
    MAX_SCALE_VALUE = 320;
    MIN_SCALE_VALUE = 35;

    constructor (canvas, scale = 35,) {

        this.#entities = new Map();
        this.#coordinates = new Map();
        this.#equations = new Map();
        this.#selectedPoints = new Set();
        this.#selectedEquations = new Set();
        this.#selectedEntities = new Set();

        this.gridCanvas = canvas;
        this.gridC = this.gridCanvas.getContext("2d");
        this.scale = scale;
        this.#theme = {
            selectionColor: "white",
            translucentColor: "rgba(255, 255, 255, 0.14)",
            themeName: "dark"
        };
        let canvasDiv = document.getElementById("canvases");

        this.pointCanvas = document.createElement("canvas");
        this.pointC = this.pointCanvas.getContext("2d");
        this.pointCanvas.setAttribute("id", "pointCanvas")
 
        this.equationCanvas = document.createElement("canvas");
        this.equationC = this.equationCanvas.getContext("2d");
        this.equationCanvas.setAttribute("id", "equationCanvas");
        
        this.miscCanvas = document.createElement("canvas");
        this.miscC = this.miscCanvas.getContext("2d");
        this.miscCanvas.setAttribute("id", "miscCanvas");

        canvasDiv.appendChild(this.pointCanvas);
        canvasDiv.appendChild(this.equationCanvas);
        canvasDiv.appendChild(this.miscCanvas);

        this.#ResizeEntireGraph();
    
        window.addEventListener("resize", () => this.#ResizeEntireGraph());

        document.addEventListener("wheel", this.#OnScrollWheelActive.bind(this));

        let gridToggleButton = document.getElementById("ToggleGridButton");
        let themeToggleButton = document.getElementById("ToggleTheme");        
        if (gridToggleButton != null) {
            gridToggleButton.addEventListener("click", () => {
                this.ToggleGridVisibility();
            });
        }
        if (themeToggleButton != null) {
            themeToggleButton.addEventListener("click", () => {
                this.ToggleTheme(themeToggleButton);
            });
        }

        this.#pointDisplay = document.getElementById("pointDisplay");

        if (this.#pointDisplay != null) { 
            
            document.addEventListener("mousemove", this.#UpdatePointDisplayPositionWithMouse.bind(this));
            document.addEventListener("mouseup", (event) => this.#pointDisplay.innerHTML = "");
        
        }

        this.pointCanvas.addEventListener("mousemove", this.#OnMouseMovementDetected.bind(this));
    }
    

    #OnMouseMovementDetected(event) {
        if (this.#canDrawSelectionRect) {
            let currentMousePoint = new Point(event.offsetX, event.offsetY);
            this.#DrawSelectionRectVisual(this.initialMousePositionWhenRightClicked, currentMousePoint);
        }
    }
 
    #UpdatePointDisplayPositionWithMouse(event) {
        
        let mouseCanvasPoint = new Point(event.offsetX, event.offsetY);

        if (mouseCanvasPoint.y >= 17) this.#pointDisplay.style.top = `${mouseCanvasPoint.y - 34}px`;
        if (mouseCanvasPoint.x + 90 <= this.pointCanvas.width) this.#pointDisplay.style.left = `${mouseCanvasPoint.x}px`;

        if (this.#canPointDisplayAppear) {
            let mouseMathPoint = Point.GetMathPoint(mouseCanvasPoint, this.pointCanvas, this.scale);
            this.#pointDisplay.innerHTML = mouseMathPoint.toString();
            this.#RenderMouseConnectionToAxes(mouseCanvasPoint);
        }
    }

    EnableSelectionRect(initialMousePoint) {
        this.initialMousePositionWhenRightClicked = initialMousePoint;
        this.#canDrawSelectionRect = true;
    }

    DisableSelectionRect(event) {
        this.#RefreshMiscLayerOfGraph();
        this.#canDrawSelectionRect = false;

        return new SelectionRect(
            Point.GetMathPoint(this.initialMousePositionWhenRightClicked, this.pointCanvas, this.scale),
            Point.GetMathPoint(new Point(event.offsetX, event.offsetY), this.pointCanvas, this.scale)
        );
    }

    EnablePointDisplayRendering(event) {
        this.#canPointDisplayAppear = true;
        this.#UpdatePointDisplayPositionWithMouse(event);
    }

    DisablePointDisplayRendering() {
        this.#canPointDisplayAppear = false;
        this.#RefreshMiscLayerOfGraph();
    }

    RenderPoint(mathPoint, color = mathPoint.GetColor()) {
        this.#coordinates.set(mathPoint.toString(), mathPoint);
        this.#entities.set(mathPoint.toString(), mathPoint);
        this.#DrawPoint(mathPoint,Point.Radius, color);
        this.#RefreshPointLayerOfGraph();
    }
    
    SelectPoint(point) {
        point.SetColor(this.#theme.selectionColor);
        this.#selectedPoints.add(point);
        this.#selectedEntities.add(point);
        this.#RefreshPointLayerOfGraph();
    }

    SelectEquation(equation) {
        equation.SetColor(this.#theme.selectionColor);  
        this.#selectedEquations.add(equation);
        this.#selectedEntities.add(equation);
        this.#RefreshEquationLayerOfGraph();
    }
    

    DeselectEquation(equation) {
        equation.SetColor(equation.GetOriginalColor());
        this.#selectedEquations.delete(equation.toString());
        this.#selectedEntities.delete(equation.toString());
        this.#RefreshEquationLayerOfGraph();
    }

    SelectPoints(points) {

        for (let point of points.values()) {
            point.SetColor(this.#theme.selectionColor);
            this.#selectedEntities.add(point);
            this.#selectedPoints.add(point);
        }

        this.#RefreshPointLayerOfGraph();
    }

    DeselectEntities() {

        let equationCounter = 0; let pointCounter = 0;

        // sets the original color showing the entity (point or equation) is deselected
        this.#selectedEntities.forEach((entity) => {
            entity.SetColor(entity.GetOriginalColor());
            if (entity instanceof Point) pointCounter ++;
            else equationCounter ++;
        });

        // clean up
        this.#selectedPoints.clear();
        this.#selectedEquations.clear();
        this.#selectedEntities.clear();

        // refreshes the layers without changing others
        if (pointCounter > 0) this.#RefreshPointLayerOfGraph();
        if (equationCounter > 0) this.#RefreshEquationLayerOfGraph();
    }

    ClearPoint(mathPoint) {

        this.#coordinates.delete(mathPoint.toString());
        this.#entities.delete(mathPoint.toString());
        this.#DrawPoint(mathPoint, Point.Radius + 1, "black");
        this.#RefreshPointLayerOfGraph();

    }

    RenderEquation(equation) {
        this.#equations.set(equation.toString(), equation);
        this.#entities.set(equation.toString(), equation);
        this.#DrawCurve(equation);
    }

    ClearEquation(equationID, equationUIDiv) {

        this.#equations.delete(equationID);
        this.#entities.delete(equationID);
        equationUIDiv.remove();
        this.#RefreshEquationLayerOfGraph();

    }

    #DrawSelectionRectVisual(initialMousePoint, currentMousePoint) {

        this.#RefreshMiscLayerOfGraph();

        this.miscC.strokeStyle = this.#theme.selectionColor;
        this.miscC.lineWidth = 1;
        this.miscC.setLineDash([5, 8]); 

        this.miscC.beginPath();

            this.miscC.moveTo(initialMousePoint.x, initialMousePoint.y);
            this.miscC.lineTo(currentMousePoint.x, initialMousePoint.y);
            this.miscC.lineTo(currentMousePoint.x, currentMousePoint.y);
            this.miscC.lineTo(initialMousePoint.x, currentMousePoint.y);
            this.miscC.lineTo(initialMousePoint.x, initialMousePoint.y);

        this.miscC.stroke();
    }

    #RenderMouseConnectionToAxes(mouseCanvasPoint) {

        this.#RefreshMiscLayerOfGraph();

        this.miscC.strokeStyle = this.#theme.selectionColor;
        this.miscC.lineWidth = 1;
        this.miscC.setLineDash([5, 8]); 

        this.miscC.beginPath();

            this.miscC.moveTo(mouseCanvasPoint.x, mouseCanvasPoint.y);
            this.miscC.lineTo(this.pointCanvas.width/2, mouseCanvasPoint.y);
            this.miscC.moveTo(mouseCanvasPoint.x, mouseCanvasPoint.y);
            this.miscC.lineTo(mouseCanvasPoint.x, this.pointCanvas.height/2);

        this.miscC.stroke();
    }

    ToggleGridVisibility() {
        this.#isGridVisible = !this.#isGridVisible; 
        this.#RefreshGridLayerOfGraph();  
    }

    ToggleTheme(themeToggleButton) {
        
        if (this.#theme.themeName === "light") {
            this.#theme.selectionColor = "white";
            this.#theme.themeName = "dark";
            this.#theme.translucentColor = "rgba(255, 255, 255, 0.14)";
            themeToggleButton.style.backgroundColor = "white";
        }
        else {
            this.#theme.selectionColor = "black";
            this.#theme.themeName = "light"
            this.#theme.translucentColor = "rgba(0, 0, 0, 0.14)";
            themeToggleButton.style.backgroundColor = "black";
        }

        document.body.classList.toggle("light-theme");

        let pointCounter = 0; let equationCounter = 0;

        if (this.#selectedEntities.size > 0) {

            this.#selectedEntities.forEach((entity) => {
                entity.SetColor(this.#theme.selectionColor);
                entity instanceof Point ? pointCounter++ : equationCounter++;
            });

            console.log(pointCounter, equationCounter);

            this.#RefreshPointLayerOfGraph();
            this.#RefreshEquationLayerOfGraph();
        }

        this.#RefreshGridLayerOfGraph();
    }

    #DrawPoint(mathPoint, pointRadius = Point.Radius, color = mathPoint.GetColor()) {
        let canvasPoint = Point.GetCanvasPoint(mathPoint, this.pointCanvas, this.GetScale());
        this.pointC.beginPath();
        this.pointC.arc(canvasPoint.x, canvasPoint.y, pointRadius, 0, Math.PI * 2, false);
        this.pointC.fillStyle = color;
        this.pointC.fill();

    }

    #DrawXAxis(gridLineNumbers) {

        this.gridC.beginPath();
        this.gridC.strokeStyle = this.#theme.selectionColor;
        this.gridC.moveTo(0, this.gridCanvas.height/2);
        this.gridC.lineTo(this.gridCanvas.width, this.gridCanvas.height/2);
        this.gridC.stroke();

        if (this.#isGridVisible) return; // ! this is repeated for the grid toggle function to work

        let start = new Point(0, 0);
        while (start.x <= gridLineNumbers.x) {

            start.x++;
            let posPoint = start;
            let negPoint = new Point(-start.x, 0);

            this.#DrawNumberAt(
                Point.GetCanvasPoint(posPoint, this.gridCanvas, this.scale), 
                Point.GetCanvasPoint(negPoint, this.gridCanvas, this.scale),
                posPoint.x.toString(), 
                this.#Axis.x);
        }
    }

    
    #DrawYAxis(gridLineNumbers) {
        this.gridC.beginPath();
        this.gridC.strokeStyle = this.#theme.selectionColor;
        this.gridC.moveTo(this.gridCanvas.width/2, 0);
        this.gridC.lineTo(this.gridCanvas.width/2, this.gridCanvas.height);
        this.gridC.stroke();
        
        if (this.#isGridVisible) return; // ! this is repeated for the grid toggle function to work

        let start = new Point(0, 0);
        while (start.y <= gridLineNumbers.y) {

            start.y++;
            let posPoint = start;
            let negPoint = new Point(0, -start.y);

            this.#DrawNumberAt(Point.GetCanvasPoint(posPoint, this.gridCanvas, this.scale), 
                Point.GetCanvasPoint(negPoint, this.gridCanvas, this.scale),
                posPoint.y.toString(), 
                this.#Axis.y);
        }
    }
    
    
    #DrawVertGridLineAndNumberAt(posPoint, negPoint) {
        let canvasPosPoint = Point.GetCanvasPoint(posPoint, this.gridCanvas, this.scale);
        
        this.gridC.beginPath();
        this.gridC.strokeStyle = this.#theme.translucentColor;
        this.gridC.moveTo(canvasPosPoint.x, canvasPosPoint.y);
        this.gridC.lineTo(canvasPosPoint.x, 0);
        this.gridC.moveTo(canvasPosPoint.x, canvasPosPoint.y);
        this.gridC.lineTo(canvasPosPoint.x, this.gridCanvas.height);
        this.gridC.stroke();

        let canvasNegPoint = Point.GetCanvasPoint(negPoint, this.gridCanvas, this.scale);
        this.gridC.beginPath();
        this.gridC.strokeStyle = this.#theme.translucentColor;
        this.gridC.moveTo(canvasNegPoint.x, canvasNegPoint.y);
        this.gridC.lineTo(canvasNegPoint.x, 0);
        this.gridC.moveTo(canvasNegPoint.x, canvasNegPoint.y);
        this.gridC.lineTo(canvasNegPoint.x, this.gridCanvas.height);
        this.gridC.stroke(); 
        
        this.#DrawNumberAt(canvasPosPoint, canvasNegPoint, posPoint.x.toString(), true);
        
    }

    #DrawHorGridLineAndNumberAt(posPoint, negPoint) {
        // grid lines
        let canvasPosPoint = Point.GetCanvasPoint(posPoint, this.gridCanvas, this.scale);
        this.gridC.beginPath();
        this.gridC.strokeStyle = this.#theme.translucentColor;
        this.gridC.moveTo(canvasPosPoint.x, canvasPosPoint.y);
        this.gridC.lineTo(0, canvasPosPoint.y);
        this.gridC.moveTo(canvasPosPoint.x, canvasPosPoint.y);
        this.gridC.lineTo(this.gridCanvas.width, canvasPosPoint.y);
        this.gridC.stroke();
        
        let canvasNegPoint = Point.GetCanvasPoint(negPoint, this.gridCanvas, this.scale);
        this.gridC.beginPath();
        this.gridC.strokeStyle = this.#theme.translucentColor;
        this.gridC.moveTo(canvasNegPoint.x, canvasNegPoint.y);
        this.gridC.lineTo(0, canvasNegPoint.y);
        this.gridC.moveTo(canvasNegPoint.x, canvasNegPoint.y);
        this.gridC.lineTo(this.gridCanvas.width, canvasNegPoint.y);
        this.gridC.stroke();
        
        this.#DrawNumberAt(canvasPosPoint, canvasNegPoint, posPoint.y.toString(), false);
    }

    DynamicCircleRendering(mouseDownPoint, event) {
    
        this.#RefreshMiscLayerOfGraph();

        let mouseDownMathPoint = Point.GetMathPoint(mouseDownPoint, this.equationCanvas, this.scale);
        let currentMouseMathPoint = Point.GetMathPoint(new Point(event.offsetX, event.offsetY), this.equationCanvas, this.scale);
        let currentRadius = Point.Distance(mouseDownMathPoint, currentMouseMathPoint);

        this.#DrawCircleWithCentreAndRadius_Misc(mouseDownMathPoint, currentRadius);

        return new Equation(`(${mouseDownMathPoint.x}, ${mouseDownMathPoint.y})`, currentRadius.toString(), "Circle");
    }

    DynamicEllipseRendering(ellipseCentreCanvasPoint, event) {
        
        this.#DrawSelectionRectVisual(ellipseCentreCanvasPoint, new Point(event.offsetX, event.offsetY));

        let mouseDownMathPoint = Point.GetMathPoint(ellipseCentreCanvasPoint, this.miscCanvas, this.scale);
        let currentMouseMathPoint = Point.GetMathPoint(new Point(event.offsetX, event.offsetY), this.miscCanvas, this.scale)
     
        return this.#DrawEllipseWithCentreAndLengths_Misc(mouseDownMathPoint, currentMouseMathPoint);
    }

    #DrawNumberAt(canvasPosPoint, canvasNegPoint, numberToBeDrawn, isXAxis) {

        this.gridC.font = "10px monospace";
        this.gridC.textAlign = "start";
        this.gridC.textBaseline = "top";
        this.gridC.strokeStyle = this.#theme.selectionColor;

        if (isXAxis) {
            this.gridC.strokeText(numberToBeDrawn.toString(), canvasPosPoint.x, canvasPosPoint.y + 3);
            this.gridC.strokeText("-" + numberToBeDrawn.toString(), canvasNegPoint.x, canvasNegPoint.y + 3);
        }
        else {
            this.gridC.strokeText(numberToBeDrawn.toString(), canvasPosPoint.x + 3, canvasPosPoint.y);
            this.gridC.strokeText("-" + numberToBeDrawn.toString(), canvasNegPoint.x + 3, canvasNegPoint.y);
        }
    }

    #RefreshEntireGraph() {
        this.#RefreshGridLayerOfGraph();
        this.#RefreshEquationLayerOfGraph();
        this.#RefreshPointLayerOfGraph();
        this.#RefreshMiscLayerOfGraph();    
    }

    #DrawCurve(equation) {
                
        let DrawCalls = {
            "function" : () => {
                this.#DrawFunction(equation);
            },

            "Circle" : () => {
                this.#DrawCircle(equation);
            },

            "Ellipse" : () => {
                this.#DrawEllipse(equation);
            }
        }        

        DrawCalls[equation.GetType()]();
    }

    #DrawFunction(/** @type {Equation}*/ equation, baseCurveFactor = 0.01) {
        let domain = equation.GetDomain();
        let screenCapacityPoint = this.GetGridLinesNumbers();
    
        if (domain === "Reals") {
            domain = {
                min: -screenCapacityPoint.x - 1,
                max: screenCapacityPoint.x + 1
            };
        }
    
        this.equationC.beginPath();
        this.equationC.strokeStyle = equation.color;
        this.equationC.lineWidth = 2;
    
        let isDrawing = false; // Track whether we are currently drawing a segment
        let previousSlope = null; // Track the slope direction of the previous segment
    
        for (let x = domain.min; x < domain.max;) {
            let currentPoint = new Point(x, equation.GetValue(x));
            let nextX = x + baseCurveFactor;
            let nextPoint = new Point(nextX, equation.GetValue(nextX));
    
            // Skip if the current or next point is undefined (NaN)
            if ([nextPoint.y, currentPoint.y].some(isNaN)) {
                x = nextX;
                isDrawing = false; // Stop drawing if we encounter NaN
                continue;
            }
    
            // Calculate the slope (derivative) of the current segment
            let currentSlope = nextPoint.y - currentPoint.y;
    
            // Check if the slope direction has changed significantly
            if (previousSlope !== null && Math.sign(currentSlope) !== Math.sign(previousSlope)) {
                // Slope direction has changed, likely indicating an asymptote
                if (isDrawing) {
                    this.equationC.stroke(); // End the current path
                    this.equationC.beginPath(); // Start a new path
                    isDrawing = false;
                }
                x = nextX;
                previousSlope = null; // Reset slope tracking
                continue;
            }
    
            // Update the previous slope
            previousSlope = currentSlope;
    
            // Convert points to canvas coordinates
            let currentCanvasPoint = Point.GetCanvasPoint(currentPoint, this.equationCanvas, this.scale);
            let nextCanvasPoint = Point.GetCanvasPoint(nextPoint, this.equationCanvas, this.scale);
    
            if (!isDrawing) {
                // Start a new path if we weren't drawing
                this.equationC.moveTo(currentCanvasPoint.x, currentCanvasPoint.y);
                isDrawing = true;
            }
    
            // Draw the line segment
            this.equationC.lineTo(nextCanvasPoint.x, nextCanvasPoint.y);
    
            // Adjust step size based on the derivative
            let derivative = Math.abs(equation.GetValue(x + baseCurveFactor) - currentPoint.y);
            let newCurveFactor = Math.min(baseCurveFactor / (1 + (derivative)), baseCurveFactor);
            newCurveFactor = Math.max(newCurveFactor, baseCurveFactor * 0.01); // Ensure step size doesn't become too small
            x += newCurveFactor;
        }
    
        // Finalize the drawing
        if (isDrawing) {
            this.equationC.stroke();
        }
    }
    #DrawCircle(/** @type {Equation}*/circle) {

        if (circle.GetType() != "Circle") {
            return new Error("TypeError: cannot draw a circle with an equation of type " + circle.GetType());
        }

        let circleCentreCanvasPoint = Point.GetCanvasPoint(circle.GetCentre(), this.equationCanvas, this.scale);

        this.equationC.beginPath();

            this.equationC.strokeStyle = circle.color;
            this.equationC.arc(circleCentreCanvasPoint.x, circleCentreCanvasPoint.y, circle.GetRadius() * this.scale, 0, Math.PI * 2);

        this.equationC.stroke();
    }

    #DrawEllipse(ellipse, context = this.equationC) {
        
        if (ellipse.GetType() != "Ellipse") {
            return new Error("TypeError: cannot draw an ellipse with an equation of type " + ellipse.GetType());
        }

        let ellipseCentreCanvasPoint = Point.GetCanvasPoint(ellipse.GetCentre(), this.equationCanvas, this.scale);
        let majorMinorAxisPoint = ellipse.GetMajorMinorAxisPoint();

        context.beginPath();
        context.strokeStyle = ellipse.color;
        context.ellipse(ellipseCentreCanvasPoint.x, ellipseCentreCanvasPoint.y, majorMinorAxisPoint.x*this.scale, majorMinorAxisPoint.y*this.scale, 0, 0, Math.PI * 2);
        context.stroke();
    }

    #DrawEllipseWithCentreAndLengths_Misc(initialMouseMAthPoint, currentMouseMathPoint) {

        let centreX = (currentMouseMathPoint.x + initialMouseMAthPoint.x)/2;
        let centreY = (currentMouseMathPoint.y + initialMouseMAthPoint.y)/2;
        let axes = new Point(
            Math.abs((currentMouseMathPoint.x - initialMouseMAthPoint.x)/2),
            Math.abs((currentMouseMathPoint.y - initialMouseMAthPoint.y)/2)
        )

        let centre = new Point(centreX, centreY);
        let ellipse = new Equation(
            `${axes.x}, ${axes.y}`,
            `${centre.x}, ${centre.y}`,
            "Ellipse"
        );

        this.#DrawEllipse(ellipse, this.miscC);

        return ellipse;
    }

    #DrawCircleWithCentreAndRadius_Misc(centre, radius) {

        let canvasCentre = Point.GetCanvasPoint(centre, this.equationCanvas, this.scale);

        this.miscC.beginPath();

            this.miscC.strokeStyle = Point.defaultColor;
            this.miscC.arc(canvasCentre.x, canvasCentre.y, radius * this.scale, 0, Math.PI * 2);
        
        this.miscC.stroke();
    }

    #ResizeEntireGraph() {
        this.#ResizeCanvas(this.gridCanvas);
        this.#ResizeCanvas(this.pointCanvas);
        this.#ResizeCanvas(this.equationCanvas);
        this.#ResizeCanvas(this.miscCanvas);
        this.#RefreshEntireGraph();
    }

    #RefreshPointLayerOfGraph() {
        
        this.#ResetPointLayer();

        // redrawing the points
        for (let mathPoint of this.#coordinates.values()) {
            this.#DrawPoint(mathPoint);
        }

    }

    #RefreshGridLayerOfGraph() {

        this.#ResetGridLayer();

        let gridLineNumbers = this.GetGridLinesNumbers();
        this.#DrawXAxis(gridLineNumbers); this.#DrawYAxis(gridLineNumbers);

        if (this.#isGridVisible) {

            let start = new Point(0, 0);
            while (start.x <= gridLineNumbers.x) {

                start.x++;
                let posPoint = start;
                let negPoint = new Point(-start.x, 0);
                this.#DrawVertGridLineAndNumberAt(posPoint, negPoint)
                
            }
            
            start = new Point(0, 0);
            while (start.y <= gridLineNumbers.y) {

                start.y++;
                let posPoint = start;
                let negPoint = new Point(0, -start.y);
                this.#DrawHorGridLineAndNumberAt(posPoint, negPoint)
            }
        }
    }

    #RefreshEquationLayerOfGraph() {
        
        this.#ResetEquationLayer();

        for (let equation of this.#equations.values()) {
            this.#DrawCurve(equation);
        }
    }

    #RefreshMiscLayerOfGraph() {
        this.#ResetMiscLayer();
    }

    #ResizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    Clamp(value, min, max) {
        if (value > max) return max;
        if (value < min) return min;
        return value;
    }

    #ResetGridLayer() {
        this.gridC.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    }

    #ResetPointLayer() {
        this.pointC.clearRect(0, 0, this.pointCanvas.width, this.pointCanvas.height);
    }
    
    #ResetEquationLayer() {
        this.equationC.clearRect(0, 0, this.equationCanvas.width, this.equationCanvas.height);
    }

    #ResetMiscLayer() {
        this.miscC.clearRect(0, 0, this.miscCanvas.width, this.miscCanvas.height);
    }
    
    SetScale(scale) {
        this.scale = scale;
    }

    GetScale() {
        return this.scale;
    }

    GetGridLinesNumbers() {
        let gridNumberX = Math.floor(this.gridCanvas.width/(this.scale * 2));
        let gridNumberY = Math.floor(this.gridCanvas.height/(this.scale * 2));
        return new Point(gridNumberX, gridNumberY);
    }

    #OnScrollWheelActive(event) {
        let scaleDelta = 10;

        if (event.deltaY < 0) this.IncreaseScale(scaleDelta);
        else this.DecreaseScale(scaleDelta);
    }

    DecreaseScale(amount) {
        this.scale = this.Clamp(this.scale - amount, this.MIN_SCALE_VALUE, this.MAX_SCALE_VALUE);
        this.#RefreshEntireGraph();
    }

    IncreaseScale(amount) {
        this.scale = this.Clamp(this.scale + amount, this.MIN_SCALE_VALUE, this.MAX_SCALE_VALUE);
        this.#RefreshEntireGraph();
    }  
    
    GetClickableCanvas() {
        return this.pointCanvas;
    }
    
    InstantiateEquationUIElement(equation, OnRemoveClickedCallback, OnEditClickedCallBack, OnSelectClickedCallBack) {

        let equationContainerDiv = document.getElementById("EquationContainer");

        // create equation div
        let equationUIdiv = document.createElement("div");
        equationUIdiv.setAttribute("class", "EquationUI");
        equationUIdiv.setAttribute("id", equation.toString());
        equationContainerDiv.appendChild(equationUIdiv);

        // create edit button
        let editButton = document.createElement("button");

            editButton.setAttribute("class", "SquareButtons_Image");
            editButton.setAttribute("id", "Edit_" + equation.toString());
            editButton.setAttribute("title", "Edit the equation");
            editButton.addEventListener("click", OnEditClickedCallBack);
            
        equationUIdiv.appendChild(editButton);

        // create remove button
        let removeButton = document.createElement("button");

            removeButton.setAttribute("class", "SquareButtons_Remove");
            removeButton.setAttribute("id", "Remove_" + equation.toString());
            removeButton.setAttribute("title", "Remove the equation");
            removeButton.addEventListener("click", OnRemoveClickedCallback);

        equationUIdiv.appendChild(removeButton);

        // create select equation button
        let selectButton = document.createElement("button");

            selectButton.setAttribute("class", "SquareButtons_Select");
            selectButton.setAttribute("id", "Select_" + equation.toString());
            selectButton.setAttribute("title", "Select the equation");
            selectButton.addEventListener("click", OnSelectClickedCallBack);

        equationUIdiv.appendChild(selectButton);

        // create equation area
        let equationName = document.createElement("button");

            equationName.setAttribute("class", "EquationName");
            equationName.setAttribute("title", "Expression of the equation");
            equationName.innerHTML = equation.toString();
            equationName.style.color = equation.color;
            
        equationUIdiv.appendChild(equationName);

        return equationUIdiv;
    }
}

export class SelectionRect {
    
    constructor(diagonalPointA, diagonalPointB) {

        let comparison = Point.Compare(diagonalPointA, diagonalPointB);
        
        this.greaterXDiagonalPoint = comparison.greaterX;
        this.smallerXDiagonalPoint = comparison.smallerX;
        this.greaterYDiagonalPoint = comparison.greaterY;
        this.smallerYDiagonalPoint = comparison.smallerY;

    }

}
