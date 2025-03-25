
import { CommandSelector } from "./Commands/CommandSelector.js";
import { CommandSearch } from "./CommandSearch.js";
import { CustomMenu } from "./CustomMenu.js";
import { Equation } from "./Equation.js";
import { GraphGL, SelectionRect } from "./GraphGL.js";
import { Point } from "./Point.js";


export class Graph {

    /** @type {Map}*/ coordinates;
    /** @type {Map}*/ entities;
    /** @type {Map}*/ equations;
    /** @type {GraphGL} */ renderer;   
    /** @type {Map}*/ selectedCoordinates;
    /** @type {Map}*/ selectedEquations;
    /** @type {EventTarget}*/OnEditEquationRequestReceived = new EventTarget();
    /** @type {EventTarget}*/#whenSignificantChangesHappen = new EventTarget();
    /** @type {EventTarget}*/#whenSignificantChangesHappen_Event = new CustomEvent("changes", {detail : {}});
    /** @type {HTMLDialogElement}*/ #informationModal;

    #debugEnable = false;
    #currentGraphMode;
    #currentPlottingMode = "Select";
    

    constructor (renderer, mode = "function", startUpPoints = []) {

        this.coordinates = new Map();
        this.entities = new Map();
        this.equations = new Map();

        this.selectedCoordinates = new Map();
        this.selectedEquations = new Map();

        this.renderer = renderer;
        this.#currentGraphMode = mode;
        this.customMenu = new CustomMenu(["Add Point", "Differentiate", "Line Segment"]);
        this.searchBar = new CommandSearch();
        window.commandSearch = this.searchBar;

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

        // when the user clicks the command
        this.customMenu.OnAnyCommandClicked.addEventListener("click", (e) => {
            this.OnAnyCommandClicked(e)
        });

        this.searchBar.EventSystem.addEventListener("commandEntered", (e) => {
            this.OnAnyCommandClicked(e);
        })

        this.#whenSignificantChangesHappen.addEventListener("changes", this.#OnSignificantChangesHappen.bind(this));

        document.getElementById("ModeSelector").onchange = (event) => this.ChangeModeTo(event.target.value);

        this.#informationModal = document.getElementById("EquationDialog");
    }
    
    OnAnyCommandClicked(e) {
        const clickedCommand = new CommandSelector(this).GetCommand(e.detail.commandID);
        clickedCommand.Run(); // run the command.
    }
    
    ChangeModeTo(mode) {
        this.#currentGraphMode = mode;
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
                input1PlaceHolder: "sin(x)",
                input2PlaceHolder: "Reals",
                divInfo: "Enter the expression and hit save"
            },
            
            "Circle" : {
                Label1: "Centre: ",
                Label2: "Radius: ",
                input1PlaceHolder: "(0,0)",
                input2PlaceHolder: "5",
                divInfo: "Enter the centre and radius and hit save"
            },

            "Ellipse" : {
                Label1: "Major/Minor: ",
                Label2: "Centre: ",
                input1PlaceHolder: "5,2",
                input2PlaceHolder: "(0,0)",
                divInfo: "Enter the values and hit save"
            },

            "Point" : {
                Label1: "x: ",
                Label2: "y: ",
                input1PlaceHolder : "0",
                input2PlaceHolder : "0",
                divInfo: "Enter the numbers and hit save"
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
            else if (child.id === "EquationDialog_modalInfo") {
                child.innerHTML = currentModeEquationInfo[mode].divInfo;
            }
        }
        
    }

    // this is the state machine that keeps track of the state of the graph. This is used to determine which commands can show up in the
    // command selector
    #OnSignificantChangesHappen() {
        
        if (this.selectedCoordinates.size > 0) 
            this.customMenu.AddCommand("Remove All"); else this.customMenu.RemoveCommand("Remove All");

        this.coordinates.size >= 2 ? 
            this.customMenu.AddCommand("Best Fit") : this.customMenu.RemoveCommand("Best Fit");

        this.coordinates.size > 0 &&  this.equations.size > 0 ?
            this.customMenu.AddCommand("Get Tangents") : this.customMenu.RemoveCommand("Get Tangents");

        this.equations.size > 0 ?
            this.customMenu.AddCommand("Roots") : this.customMenu.RemoveCommand("Roots");

        if (this.selectedCoordinates.size == 1)
            this.customMenu.AddCommand("Open"); else this.customMenu.RemoveCommand("Open");

        this.equations.size > 0 ?
            this.customMenu.AddCommand("Intersection") : this.customMenu.RemoveCommand("Intersection")

        if (this.selectedEquations.size > 0) {
            this.customMenu.AddCommand("Extremum");
            this.customMenu.AddCommand("Mirror Along X");
            this.customMenu.AddCommand("Mirror Along Y");
        }
        else {
            this.customMenu.RemoveCommand("Extremum");
            this.customMenu.RemoveCommand("Mirror Along X");
            this.customMenu.RemoveCommand("Mirror Along Y");
        }
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
        this.SelectPointsUnderRect(selectionRect);
    }
    
    #OnLeftMouseButtonUp(event) {
        this.renderer.DisablePointDisplayRendering();
        this.isLeftMouseDown = false;
        this.#HandleEntitySelectionOnClick(event); 
        this.TryAddEquation(this.dynamicCircleEquationByUserDrag);
        this.TryAddEquation(this.dynamicEllipseEquationByDrag)
    }
    
    #OnLeftMouseButtonDown(event) {
        this.isLeftMouseDown = true;
        this.initialMousePositionWhenLeftClicked = new Point(event.offsetX, event.offsetY);
        this.renderer.EnablePointDisplayRendering(event);
    }
    
    DeselectSelectedEntities() {

        if (this.selectedCoordinates.size == 0 && this.selectedEquations.size == 0) {
            return;
        }   

        this.selectedCoordinates.clear();
        this.selectedEquations.clear();
        this.renderer.DeselectEntities(); 
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    SelectPointsUnderRect(/** @type {SelectionRect}*/rect) {

        for (let point of this.coordinates.values()) {

            if (point.IsUnderThisSelectionRect(rect)) {
                this.selectedCoordinates.set(point.toString(), point);
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
                this.selectedCoordinates.set(selectedEntity.toString(), selectedEntity);
                this.renderer.SelectPoint(selectedEntity, GraphGL.defaultSelectedEntityColor);
            }
            else {
                this.SelectEquation(selectedEntity);
            }
            return true;
        } 
        return false;

    }

    
    SelectEquation(selectedEntity) {

        if (this.selectedEquations.has(selectedEntity.toIdentifierString())) {
            this.selectedEquations.delete(selectedEntity.toIdentifierString());
            this.renderer.DeselectEquation(selectedEntity);
            return;
        }

        this.selectedEquations.set(selectedEntity.toIdentifierString(), selectedEntity);
        this.renderer.SelectEquation(selectedEntity, GraphGL.defaultSelectedEntityColor);
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

        if (this.dynamicCircleEquationByUserDrag != undefined || this.dynamicEllipseEquationByDrag != undefined) {
            return false;
        }

        this.AddPoint(mathPoint, color);
        return true;
    }

    AddPoint(mathPoint, color = mathPoint.GetColor()) {
        this.coordinates.set(mathPoint.toString(), mathPoint);
        this.entities.set(mathPoint.toString(), mathPoint);
        this.renderer.RenderPoint(mathPoint, color);
        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

    TryAddEquation(equation) {
        
        if (!this.CanAddEquation(equation)) {
            return false;
        }

        this.equations.set(equation.toIdentifierString(), equation);
        this.entities.set(equation.toIdentifierString(), equation);

        this.renderer.InstantiateEquationUIElement(
            equation, 
            this.#OnAnyRemoveButtonClicked.bind(this), 
            this.#OnAnyEditButtonClicked.bind(this),
            this.#OnAnySelectButtonClicked.bind(this)
        );

        this.renderer.RenderEquation(equation);

        if (equation.GetType() === "Circle" && equation != undefined) {
            this.dynamicCircleEquationByUserDrag = undefined;
        }
        else if (equation.GetType() === "Ellipse" && equation != undefined) {
            this.dynamicEllipseEquationByDrag = undefined;
        }

        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
        return true;
    }

    CanAddEquation(equation) {

        if (equation == undefined) {
            return false;
        }
        
        if (this.equations.has(equation.toIdentifierString())) {
            window.errorLogger.ShowNewError(`${equation.toIdentifierString()}. This equation already exists`);
            return false;
        }
        
        return true;
    }

    #HandleEntitySelectionOnClick(event) {

        let mousePoint = new Point(event.offsetX, event.offsetY);
        let mouseMathPoint = Point.GetMathPoint(mousePoint, this.renderer.GetClickableCanvas(), this.renderer.GetScale());

        
        if (this.TrySelectEntityUnderMouse(mousePoint)) {
            return;
        }
        this.DeselectSelectedEntities();

        this.TryAddPoint(mouseMathPoint);
    }


    RemovePoint(point) {
        if (this.ContainsThisPoint(point)) {
            this.coordinates.delete(point.toString());
        }

        this.renderer.ClearPoint(point);
    }

    RemoveEquation(equation) {

        if (this.selectedEquations.has(equation.toIdentifierString())) {
            this.selectedEquations.delete(equation.toIdentifierString());
        }

        this.equations.delete(equation.toIdentifierString());
        this.renderer.ClearEquation(equation.toIdentifierString(), document.getElementById(equation.toIdentifierString()));

        this.#whenSignificantChangesHappen.dispatchEvent(this.#whenSignificantChangesHappen_Event);
    }

   
    #OnAnyRemoveButtonClicked(event) {
        
        let sender = event.target.parentElement

        if (!this.equations.has(sender.id)) return;

        this.RemoveEquation(this.equations.get(sender.id));
    }

    IsEquationInGraph(equation) {
        return this.equations.has(equation.toIdentifierString());
    }

    #OnAnySelectButtonClicked(event) {

        let sender = event.target.parentElement;
        if (!this.equations.has(sender.id)) return;
        this.SelectEquation(this.equations.get(sender.id));

    }
   
    #OnAnyEditButtonClicked(event) {

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
