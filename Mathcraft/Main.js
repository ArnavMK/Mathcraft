
import { Graph } from "./Graph.js";
import { GraphGL } from "./GraphGL.js";
import { Equation } from "./Equation.js";
import {ErrorLogger} from "./ErrorLogger.js"
import { Calculus } from "./Calculus.js";

let graph = new Graph(new GraphGL(document.getElementById("canvas")));

// properties global to the entire codebase
window.errorLogger = new ErrorLogger(Array.from(document.querySelectorAll(".ErrorLogger")));
window.calculus = new Calculus(graph);
window.allCommands = [
    "Best Fit", "Remove All",
    "Get Tangents", "Roots",
    "Open", "Add Point", 
    "Differentiate", "Line Segment",
    "Extremum", "Intersection",
    "Mirror Along X", "Mirror Along Y"
];

let equationModal = document.getElementById("EquationDialog");
let equationText = document.getElementById("EquationDialog_equation");
let domainText = document.getElementById("EquationDialog_domain");
let colorPicker = document.getElementById("EquationDialog_colorPicker");
let existingEquation = undefined;

// event subscriptions
document.getElementById("NewEquation").addEventListener('click', NewEquationCommand);
document.getElementById("EquationDialog_save").addEventListener("click", SaveEquationInformation);
document.getElementById("EquationDialog_cancel").addEventListener("click", () => {
   existingEquation = undefined;
   equationModal.close();
});
equationModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    existingEquation = undefined;
    equationModal.close();
})
graph.OnEditEquationRequestReceived.addEventListener("edit", EditEquationSequence);



function EditEquationSequence(event) {

    existingEquation = event.detail.equation;
    graph.RefreshInformationModalWithGivenMode(existingEquation.GetType());
    
    equationText.value = existingEquation.toString();
    domainText.value =  existingEquation.GetAccompaniedInfo();
    colorPicker.value = existingEquation.GetOriginalColor();
    equationModal.showModal();

}

function SaveEquationInformation() {

    console.log("existing: ", existingEquation);
        
    let mode = graph.GetMode();
    if (existingEquation != undefined) {
        mode = existingEquation.GetType();
    }

    let equation = new Equation(equationText.value, domainText.value, mode, colorPicker.value);
    
    if (Equation.IsValidEquation(equation)) {
        
        if (existingEquation != undefined) {
            graph.RemoveEquation(existingEquation);
            existingEquation = undefined;
        }

        graph.TryAddEquation(equation);
        equationModal.close();
    }

}

function NewEquationCommand() {

    graph.RefreshInformationModalWithGivenMode(graph.GetMode());
    
    equationText.value = "";
    domainText.value = "";
    
    equationModal.showModal();
}
