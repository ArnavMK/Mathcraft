import { Graph } from "./Graph.js";
import { GraphGL } from "./GraphGL.js";
import { Equation } from "./Equation.js";

let graph = new Graph(new GraphGL(document.getElementById("canvas")));

let equationModal = document.getElementById("EquationDialog");
let equationText = document.getElementById("EquationDialog_equation");
let domainText = document.getElementById("EquationDialog_domain");
let colorPickerButton = document.getElementById("EquationDialog_colorPicker");

// event subscriptions
document.getElementById("NewEquation").addEventListener('click', NewEquationCommand);
document.getElementById("EquationDialog_save").addEventListener("click", SaveEquationInformation);
colorPickerButton.addEventListener("click", ShuffleColorPicker); ShuffleColorPicker();
graph.OnEditEquationRequestReceived.addEventListener("edit", EditEquationSequence);


function EditEquationSequence(event) {
    let equation = event.detail.equation;
    graph.RefreshInformationModalWithGivenMode(equation.GetType());

    equationText.value = equation.toString();
    domainText.value =  equation.GetDomainExpression();
    graph.RemoveEquation(equation);
    equationModal.showModal();
}

function SaveEquationInformation() {

    let equation = new Equation(equationText.value, domainText.value, graph.GetMode(), colorPickerButton.style.backgroundColor);

    if (!graph.TryAddEquation(equation)) return;
    equationModal.close();

}

function ShuffleColorPicker() {
    let colors = ["red", "cyan", "blue", "pink", "purple", "magenta", "yellow"];
    colorPickerButton.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
}

function NewEquationCommand() {

    graph.RefreshInformationModalWithGivenMode(graph.GetMode());
    
    equationText.value = "";
    domainText.value = "";
    
    equationModal.showModal();
}
