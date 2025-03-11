
import { Graph } from "./Graph.js";
import { GraphGL } from "./GraphGL.js";
import { Equation } from "./Equation.js";
import {ErrorLogger} from "./ErrorLogger.js"
import { Calculus } from "./Calculus.js";

let graph = new Graph(new GraphGL(document.getElementById("canvas")));
window.errorLogger = new ErrorLogger(Array.from(document.querySelectorAll(".ErrorLogger")));
window.calculus = new Calculus(graph);

let equationModal = document.getElementById("EquationDialog");
let equationText = document.getElementById("EquationDialog_equation");
let domainText = document.getElementById("EquationDialog_domain");
let colorPicker = document.getElementById("EquationDialog_colorPicker");

// event subscriptions
document.getElementById("NewEquation").addEventListener('click', NewEquationCommand);
document.getElementById("EquationDialog_save").addEventListener("click", SaveEquationInformation);
document.getElementById("EquationDialog_cancel").addEventListener("click", () => equationModal.close())
graph.OnEditEquationRequestReceived.addEventListener("edit", EditEquationSequence);

let existingEquation;


function EditEquationSequence(event) {
    existingEquation = event.detail.equation;
    graph.RefreshInformationModalWithGivenMode(existingEquation.GetType());

    equationText.value = existingEquation.toString();
    domainText.value =  existingEquation.GetAccompaniedInfo();
    colorPicker.value = existingEquation.GetOriginalColor();
    equationModal.showModal();
}

function SaveEquationInformation() {

    if (existingEquation != undefined) {
        graph.RemoveEquation(existingEquation);
        existingEquation = undefined;
        equationModal.close();
    }

    let equation = new Equation(equationText.value, domainText.value, graph.GetMode(), colorPicker.value);

    if (!graph.TryAddEquation(equation)) return;
    equationModal.close();

}

function NewEquationCommand() {

    graph.RefreshInformationModalWithGivenMode(graph.GetMode());
    
    equationText.value = "";
    domainText.value = "";
    
    equationModal.showModal();
}
