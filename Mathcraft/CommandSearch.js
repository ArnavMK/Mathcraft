
export class CommandSearch {

    EventSystem;

    constructor () {

        this.EventSystem = new EventTarget();

        this.allCommands = [
            "Best Fit", "Remove All",
            "Get Tangents", "Roots",
            "Open", "Add Point", 
            "Differentiate", "Line Segment"
        ]

        this.resultBox = document.querySelector(".resultBox");
        this.ClearResultBox();
        this.inputBox = document.getElementById("inputBox");

        this.inputBox.onkeyup = (event) => {

            if (event.key != "Enter") {
                this.HandleAutoComplete();
            }
            else {
                this.HandleCommandDispatching();
            }
        }

        this.inputBox.onblur = () => {
            this.ClearResultBox()
        }

        document.onkeyup = (event) => {
            
            if (event.key == "s") {
                this.inputBox.focus();
            }
        }

        document.getElementById("EnterCommandButton").addEventListener("mousedown", () => {
            this.HandleCommandDispatching();
        });
    }

    ClearResultBox() {
        this.resultBox.style.display = "none";
        this.resultBox.innerHTML = "";
    }

    HandleCommandDispatching() {
        let input = this.inputBox.value;

        let counter = 0;
        for (let command of this.allCommands) {

            if (input.toLowerCase() === command.toLowerCase()) {
                counter++;
            }
        }
    
        if (counter == 0) {

            if (this.resultBox.childElementCount == 0) {
                window.errorLogger.ShowNewError(`The command "${input}" does not exist`);
                return;
            }
            
            input = this.resultBox.firstChild.firstChild.innerHTML;
        }

        this.EventSystem.dispatchEvent(new CustomEvent("commandEntered", {detail: {commandID: input}}))
    }

    HandleAutoComplete() {
        
        this.resultBox.style.display = "block";

        let result = [];
        let input = this.inputBox.value;

        if (input.length) {
            result = this.allCommands.filter((keyword) => {
                return keyword.toLowerCase().includes(input.toLowerCase());
            });
        }

        this.Display(result);

        if(!result.length) {
            this.ClearResultBox();
        }
    }

    Display(result) {
        let content = result.map((list) => {
            return `<li onclick=commandSearch.SelectInput(this)>${list}</li>`
        });

        this.resultBox.innerHTML = `<ul>${content.join("")}</ul>`
    }

    SelectInput(list) {
        this.inputBox.value = list.innerHTML;
        this.ClearResultBox();
        this.inputBox.focus();
    }

}