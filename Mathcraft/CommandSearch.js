
export class CommandSearch {

    EventSystem;

    constructor () {

        this.EventSystem = new EventTarget();

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
        for (let command of window.allCommands) {

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
        this.ClearResultBox();
    }

    HandleAutoComplete() {
        
        this.resultBox.style.display = "block";

        let result = [];
        let input = this.inputBox.value;

        if (input.length) {
            result = window.allCommands.filter((keyword) => {
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
        console.log(this.inputBox.value)
        this.inputBox.focus();
    }

}