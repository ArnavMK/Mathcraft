import { CommandSelector } from "./Commands/CommandSelector.js";
import { CustomMenu } from "./CustomMenu.js";
import { Equation } from "./Equation.js";
import { GraphGL, SelectionRect } from "./GraphGL.js";
import { Point } from "./Point.js";


export class Graph {

    /** @type {Map}*/ coordinates;
    /** @type {Map}*/ equations;
    /** @type {Map}*/ circleEquations;
    /** @type {GraphGL} */ renderer;   
    /** @type {Array}*/ selectedCoordinates;
    /** @type {Array}*/ selectedEquations;
    /** @type {EventTarget}*/OnEditEquationRequestReceived = new EventTarget();
    /** @type {EventTarget}*/#whenSignificantChangesHappen = new EventTarget();
    /** @type {EventTarget}*/#whenSignificantChangesHappen_Event = new CustomEvent("changes", {detail : {}});
    /** @type {HTMLDialogElement}*/ #informationModal;

    #debugEnable = false;

    #currentGraphMode;
    #currentPlottingMode = "Remove";
    

    constructor (renderer, mode = "function", startUpPoints = []) {

        this.coordinates = new Map();
        this.equations = new Map();
        this.circleEquations = new Map();

        this.selectedCoordinates = [];
        this.selectedEquations = [];

        this.renderer = renderer;
        this.#currentGraphMode = mode;
        this.customMenu = new CustomMenu(["Add Point"]);

        for(let point of startUpPoints) this.TryAddPoint(point);   

        this.renderer.GetClickableCanvas().addEventListener("mousedown", (event) => {
            let onMouseDownFunctionCalls = {2 : this.#OnRightMouseButtonDown.bind(this), 0 : this.#OnLeftMouseButtonDown.bind(this)}
            onMouseDownFunctionCalls[event.button](event);
        });

        this.renderer.GetClickableCanvas().addEventListener("mouseup", (event) => {
            let onMouseUpFunctionCalls = {2 : this.#OnRightMouseButtonUp.bind(this), 0 : this.#OnLeftMouseButtonUp.bind(this)};
            onMouseUpFunctionCalls[event.button](event);
        });

        document.addEventListener("mousemove", this.#OnMouseMove.bind(this));

        this.renderer.GetClickableCanvas().addEventListener("click", this.HandlePointEntryExitSelection_OnClick.bind(this));

        this.customMenu.OnAnyCommandClicked.addEventListener("click", (e) => {
            this.OnAnyCommandClicked(e)
        });

        this.#whenSignificantChangesHappen.addEventListener("changes", this.#OnSignificantChangesHappen.bind(this));

        document.getElementById("PlottingModeSelector").onchange = (event) => this.#currentPlottingMode = event.target.value;
        document.getElementById("ModeSelector").onchange = (event) => this.#currentGraphMode = event.target.value;

        this.#informationModal = document.getElementById("EquationDialog");
    }
    
    OnAnyCommandClicked(e) {

        const clickedCommand = new CommandSelector(this).GetCommand(e.detail.commandID);
        clickedCommand.Run();   
        this.DeselectSelectedEntities();
    }

    ChangeModeTo(mode) {
        this.#currentGraphMode = mode;
    }

    GetMode() {
        return this.#currentGraphMode;
    }
    
    GetInformationModal() {
        return this.#informationModal;
    }

    RefreshInformationModalWithGivenMode(mode) {
        
        // change the default equation and domain crap to radius and centre for circle mode
        
        let currentModeEquationInfo = {
            "function" : {
                Label1: "Equation: ",
                Label2: "Domain: ",
                input1PlaceHolder: "Math.sin(x)",
                input2PlaceHolder: "Reals"
            },
            
            "Circle" : {
                Label1: "Centre: ",
                Label2: "Radius: ",
                input1PlaceHolder: "(0,0)",
                input2PlaceHolder: "5"
            },

            "Ellipse" : {
                Label1: "Major/Minor: ",
                Label2: "Centre: ",
                input1PlaceHolder: "5,2",
                input2PlaceHolder: "(0,0)"
            },

            "Point" : {
                Label1: "x: ",
                Label2: "y: ",
                input1PlaceHolder : "0",
                input2PlaceHolder : "0"
            }
        }
        
        for (let child of this.#informationModal.children) {
            if (child.id === "Label1") {
                child.innerHTML = currentModeEquationInfo[mode].Label1;
            }
            else if (child.id === "Label2") {
                child.innerHTML = currentModeEquationInfo[mode].Label2;
            }
            else if (child.id === "EquationDialog_equation") {
                child.placeholder = currentModeEquationInfo[mode].input1PlaceHolder;
            }
            else if (child.id === "EquationDialog_domain") {
                child.placeholder = currentModeEquationInfo[mode].input2PlaceHolder;
            }
        }
        
    }

    #OnSignificantChangesHappen() {

        this.coordinates.size >= 1 && this.selectedCoordinates.length == 0 ? 
            this.customMenu.AddCommand("Remove") : this.customMenu.RemoveCommand("Remove");

        if (this.selectedCoordinates.length > 0) 
            this.customMenu.AddCommand("Remove All"); else this.customMenu.RemoveCommand("Remove All");

        this.coordinates.size >= 2 ? 
            this.customMenu.AddCommand("Best Fit") : this.customMenu.RemoveCommand("Best Fit");

        this.coordinates.size > 0 &&  this.circleEquations.size > 0 ?
            this.customMenu.AddCommand("Get Tangents") : this.customMenu.RemoveCommand("Get Tangents");

        this.equations.size > 0 ?
            this.customMenu.AddCommand("Roots") : this.customMenu.RemoveCommand("Roots");

        if (this.selectedCoordinates.length == 1)
            this.customMenu.AddCommand("Open"); else this.customMenu.RemoveCommand("Open");
    }

    #OnMouseMove(event) {
        if (this.#currentGraphMode == "Circle" && this.isLeftMouseDown) {
            this.dynamicCircleEquationByUserDrag = this.renderer.DynamicCircleRendering(this.initialMousePositionWhenLeftClicked, event);
        }

        if (this.#currentGraphMode == "Ellipse" && this.isLeftMouseDown) {
            this.dynamicEllipseEquationByDrag = this.renderer.DynamicEllipseRendering(this.initialMousePositionWhenLeftClicked, event);
        }
    }
    
    #OnRightMouseButtonDown(event) {
        let currentMousePoint = new Point(event.offsetX, event.offsetY);
        this.renderer.EnableSelectionRect(currentMousePoint);
    }
    
    #OnRightMouseButtonUp(event) {
        let selectionRect = this.renderer.DisableSelectionRect(event);
        this.SelectPointsUnderRect(selectionRect);
    }
    
    #OnLeftMouseButtonUp(event) {
        this.renderer.DisablePointDisplayRendering();
        this.isLeftMouseDown = false;
        this.TryAddEquation(this.dynamicCircleEquationByUserDrag); // no equation will be added when the Rad(circle) is undefined
    }
    
    #OnLeftMouseButtonDown(event) {
        this.isLeftMouseDown = true;
        this.initialMousePositionWhenLeftClicked = new Point(event.offsetX, event.offsetY);
        this.renderer.EnablePointDisplayRendering(event);
    }
    
    DeselectSelectedEntities() {

        if (this.selectedCoordinates.length == 0 && this.selectedEquations.length == 0) {
            return;
        }   

        this.selectedCoordinates = [];
        this.selectedEquations = [];
        this.renderer.DeselectEntities();
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    SelectPointsUnderRect(/** @type {SelectionRect}*/rect) {

        for (let point of this.coordinates.values()) {

            if (point.IsUnderThisSelectionRect(rect)) {
                this.selectedCoordinates.push(point);
            }            
        }

        this.renderer.SelectPoints(this.selectedCoordinates, GraphGL.defaultColorSelectedEntityColor);
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    ContainsThisPoint(point) {
        return this.coordinates.has(point.toString());
    }

    TrySelectEntityUnderMouse(mousePoint) {

        let mouseMathPoint = Point.GetMathPoint(mousePoint, this.renderer.GetClickableCanvas(), this.renderer.GetScale());
        let selectedPoint = null;
        let selectedEquation = null;

        for (let point of this.coordinates.values()) {
            
            if (Point.AreRoughlySamePoints(mouseMathPoint, point)) {
                selectedPoint = point;
            }
        }

        for (let equation of this.equations.values()) { 
            
            if (equation.GetType() == "function") {
                let functionYValue = equation.GetValue(mouseMathPoint.x);
                let actualClickedPoint = new Point(mouseMathPoint.x, functionYValue);

                if (Point.AreRoughlySamePoints(actualClickedPoint, mouseMathPoint)) {
                    selectedEquation = equation;
                }
            }
            else if (equation.GetType() == "Circle") {

                let distanceFromClickedPointToCentre = Point.Distance(equation.GetCentre(), mouseMathPoint);
                if (Math.abs(distanceFromClickedPointToCentre - equation.GetRadius()) <= 0.1) {
                    selectedEquation = equation;
                }
            }
            else if (equation.GetType() == "Ellipse") {
                if (equation.IsPointOnEllipse(mouseMathPoint)) {
                    selectedEquation = equation;
                }
            }
        }   

        if (selectedEquation != null) {
            this.selectedEquations.push(selectedEquation);
            this.renderer.SelectEquation(selectedEquation, GraphGL.defaultColorSelectedEntityColor);
            return true;
        }

        if (selectedPoint != null) {
            this.selectedCoordinates.push(selectedPoint);
            this.renderer.SelectPoint(selectedPoint, GraphGL.defaultColorSelectedEntityColor);
            return true;
        }

        if (selectedPoint == null && selectedEquation == null) {
            return false;
        }

    }

    TryAddPoint(mathPoint, color = mathPoint.GetColor()) {
        
        if (!Point.IsValid(mathPoint)) {
            throw new Error(`InvalidPoint: the point: ${mathPoint.toString()} is invalid`);
        }

        let oldLength = this.coordinates.size;
        this.coordinates.set(mathPoint.toString(), mathPoint);
    
        if (!(this.coordinates.size > oldLength)) {
            throw new Error("DuplicatePointException: Point already exists.");
        }

        this.renderer.RenderPoint(mathPoint, color);
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    TryAddEquation(equation) {
    
        if (!Equation.IsValid(equation)) {
            return new Error("InvalidEquation: the equation " + equation + " is undefined");
        }
        

        if (this.equations.has(equation.toString())) {
            throw new Error(`The equation: ${equation.toString()} is already present in the graph.`);
        }

        this.equations.set(equation.toString(), equation);
        this.renderer.InstantiateEquationUIElement(equation, this.OnAnyRemoveButtonClicked.bind(this), this.OnAnyEditButtonClicked.bind(this));
        this.renderer.RenderEquation(equation);

        if (this.#currentGraphMode === "Circle" && equation != undefined) {
            this.TryAddPoint(equation.GetCentre(), equation.GetOriginalColor());
            this.dynamicCircleEquationByUserDrag = undefined;
        }

        if (equation.GetType() == "Circle") {
            this.circleEquations.set(equation.toString(), equation);
        }

        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    HandlePointEntryExitSelection_OnClick(event) {

        let mousePoint = new Point(event.offsetX, event.offsetY);
        let mouseMathPoint = Point.GetMathPoint(mousePoint, this.renderer.GetClickableCanvas(), this.renderer.GetScale());

        if (this.#currentPlottingMode == "Remove") {
            for (let point of this.coordinates.values()) {
                
                if (Point.AreRoughlySamePoints(mouseMathPoint, point)) {
                    this.RemovePoint(point); return;
                }
            }
        }
        else {
            if (this.TrySelectEntityUnderMouse(mousePoint)) {
                return;
            }
            else {
                this.DeselectSelectedEntities();
            }
        }
    
        this.TryAddPoint(mouseMathPoint);
    }


    RemovePoint(point) {
        if (this.ContainsThisPoint(point)) {
            this.coordinates.delete(point.toString());
        }

        this.renderer.ClearPoint(point);
    }

    RemoveEquation(equation) {
        this.equations.delete(equation.toString());
        this.renderer.ClearEquation(equation.toString(), document.getElementById(equation.toString()));

        if (equation.GetType() === "Circle") {
            this.RemovePoint(equation.GetCentre());
        }

        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    toString() {
        let result = ""
        for (let x of this.coordinates.keys()) {
            result += " " + x
        }
        return result;
    }
   
    OnAnyRemoveButtonClicked(event) {
        
        let sender = event.target.parentElement

        if (!this.equations.has(sender.id)) return;

        this.RemoveEquation(this.equations.get(sender.id))
    }
   
    OnAnyEditButtonClicked(event) {

        let equation = this.equations.get(event.target.parentElement.id);

        let eventArgs = {
            equation: equation,
        }

        this.OnEditEquationRequestReceived.dispatchEvent(new CustomEvent("edit", { detail: eventArgs }));

    }

    Debug(string) {
        if (!this.#debugEnable) return;
        document.getElementById("debug").innerText = string;
    }

    AppendDebug(string) {
        if (!this.#debugEnable) return;
        document.getElementById("debug").innerHTML += "<br>" + string;
    }
}
