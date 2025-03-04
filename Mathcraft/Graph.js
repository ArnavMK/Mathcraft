import { CommandSelector } from "./Commands/CommandSelector.js";
import { CustomMenu } from "./CustomMenu.js";
import { Equation } from "./Equation.js";
import { GraphGL, SelectionRect } from "./GraphGL.js";
import { Point } from "./Point.js";


export class Graph {

    /** @type {Map}*/ coordinates;
    /** @type {Map}*/ entities;
    /** @type {Map}*/ equations;
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
        this.entities = new Map();
        this.equations = new Map();

        this.selectedCoordinates = [];
        this.selectedEquations = [];

        this.renderer = renderer;
        this.#currentGraphMode = mode;
        this.customMenu = new CustomMenu(["Add Point"]);

        for(let point of startUpPoints) this.TryAddPoint(point);   

        // setting up events like on left mouse button down
        this.renderer.GetClickableCanvas().addEventListener("mousedown", (event) => {
            let onMouseDownFunctionCalls = {2 : this.#OnRightMouseButtonDown.bind(this), 0 : this.#OnLeftMouseButtonDown.bind(this)}
            onMouseDownFunctionCalls[event.button](event);
        });

        // setting up events like on left mouse button up
        this.renderer.GetClickableCanvas().addEventListener("mouseup", (event) => {
            let onMouseUpFunctionCalls = {2 : this.#OnRightMouseButtonUp.bind(this), 0 : this.#OnLeftMouseButtonUp.bind(this)};
            onMouseUpFunctionCalls[event.button](event);
        });

        // setting up on mouse move event, treated like the update method in unity.
        document.addEventListener("mousemove", this.#OnMouseMove.bind(this));

        // to either add or remove points (based on the graph state), when user clicked the screen
        this.renderer.GetClickableCanvas().addEventListener("click", this.HandlePointEntryExitSelection_OnClick.bind(this));

        // when the user clicks the command
        this.customMenu.OnAnyCommandClicked.addEventListener("click", (e) => {
            this.OnAnyCommandClicked(e)
        });

        this.#whenSignificantChangesHappen.addEventListener("changes", this.#OnSignificantChangesHappen.bind(this));

        document.getElementById("PlottingModeSelector").onchange = (event) => this.ChangePlottingModeTo(event.target.value);
        document.getElementById("ModeSelector").onchange = (event) => this.ChangeModeTo(event.target.value);

        this.#informationModal = document.getElementById("EquationDialog");
    }
    
    OnAnyCommandClicked(e) {

        // get the clicked command based on the command ID (the name of the command)
        const clickedCommand = new CommandSelector(this).GetCommand(e.detail.commandID);
        clickedCommand.Run(); // run the command.
        this.DeselectSelectedEntities(); // deselect if any selected entities exists (as the focus has been changed)
    }

    ChangeModeTo(mode) {
        this.#currentGraphMode = mode;
    }

    ChangePlottingModeTo(mode) {
        this.#currentPlottingMode = mode;
    }

    GetMode() {
        return this.#currentGraphMode;
    }
    
    GetPlottingMode() {
        return this.#currentPlottingMode;
    }

    GetInformationModal() {
        return this.#informationModal;
    }

    RefreshInformationModalWithGivenMode(mode) {
        
        // whenever the user triggers any event that brings up the modal, we need to make sure that the labels and information in the 
        // modal correspond to the mode of the graph
        
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

    // this is the state machine that keeps track of the state of the graph. This is used to determine which commands can show up in the
    // command selector
    #OnSignificantChangesHappen() {
        
        if (this.selectedCoordinates.length > 0) 
            this.customMenu.AddCommand("Remove All"); else this.customMenu.RemoveCommand("Remove All");

        this.coordinates.size >= 2 ? 
            this.customMenu.AddCommand("Best Fit") : this.customMenu.RemoveCommand("Best Fit");

        this.coordinates.size > 0 &&  this.equations.size > 0 ?
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
        this.renderer.EnableSelectionRect(currentMousePoint); // flags the renderer to start drawing the selection rect until the mouse is up
    }
    
    #OnRightMouseButtonUp(event) {
        let selectionRect = this.renderer.DisableSelectionRect(event);
        if (this.GetPlottingMode() !== "Select") return;
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
        this.renderer.DeselectEntities(); // basically tells the renderer to change the visuals of all the selected entities back to normal
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    SelectPointsUnderRect(/** @type {SelectionRect}*/rect) {

        for (let point of this.coordinates.values()) {

            if (point.IsUnderThisSelectionRect(rect)) {
                this.selectedCoordinates.push(point);
            }            
        }

        this.renderer.SelectPoints(this.selectedCoordinates, GraphGL.defaultSelectedEntityColor);
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    ContainsThisPoint(point) {
        return this.coordinates.has(point.toString());
    }

    TrySelectEntityUnderMouse(mousePoint) {

        let mouseMathPoint = Point.GetMathPoint(mousePoint, this.renderer.GetClickableCanvas(), this.renderer.GetScale());
        let selectedEntity = null;
        let entities = [...this.coordinates.values(), ...this.equations.values()];

        for (let entity of entities) {
            if (entity.CanSelect(mouseMathPoint)) {
                selectedEntity = entity;
            }
        }

        if (selectedEntity != null) {

            if (selectedEntity instanceof Point) {
                this.selectedCoordinates.push(selectedEntity);
                this.renderer.SelectPoint(selectedEntity, GraphGL.defaultSelectedEntityColor);
            }
            else {
                this.selectedEquations.push(selectedEntity);
                this.renderer.SelectEquation(selectedEntity, GraphGL.defaultSelectedEntityColor);
            }
            return true;
        } 
        return false;

    }

    
    TryAddPoint(mathPoint, color = mathPoint.GetColor()) {
        
        if (!Point.IsValid(mathPoint)) {
            window.errorLogger.ShowNewError(`InvalidPoint: the point: ${mathPoint.toString()} is invalid`);
            return false;
        }

        if (this.coordinates.has(mathPoint.toString())) {
            window.errorLogger.ShowNewError(`${mathPoint.toString()}. This point already exists`);
            return false;
        }

        this.coordinates.set(mathPoint.toString(), mathPoint);
        this.entities.set(mathPoint.toString(), mathPoint);
        this.renderer.RenderPoint(mathPoint, color);
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
        return true;
    }

    TryAddEquation(equation) {
    
        if (!Equation.IsValid(equation)) {
            return false;
        }

        if (this.equations.has(equation.toString())) {
            window.errorLogger.ShowNewError(`${equation.toString()}. This equation already exists`);
            return false;
        }

        this.equations.set(equation.toString(), equation);
        this.entities.set(equation.toString(), equation);
        this.renderer.InstantiateEquationUIElement(equation, this.OnAnyRemoveButtonClicked.bind(this), this.OnAnyEditButtonClicked.bind(this));
        this.renderer.RenderEquation(equation);

        if (this.#currentGraphMode === "Circle" && equation != undefined) {
            this.TryAddPoint(equation.GetCentre(), equation.GetOriginalColor());
            this.dynamicCircleEquationByUserDrag = undefined;
        }

        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
        return true;
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
