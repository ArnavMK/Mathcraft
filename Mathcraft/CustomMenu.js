
export class CustomMenu {

    /** @type {Map}*/ #commandDivs;
    #menuDiv;
    /** @type {EventTarget} */ OnAnyCommandClicked = new EventTarget();

    constructor(commands = [], htmlClass = "controls") {
        
        this.#menuDiv = document.createElement("div");
        this.SetActive(false);
        this.#menuDiv.setAttribute("id", "custom-menu");
        this.#menuDiv.setAttribute("class", htmlClass);
        document.body.appendChild(this.#menuDiv);

        this.#commandDivs = new Map();

        for (let command of commands) {
            this.AddCommand(command);
        }

        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.OnContextMenuCalled(event);
        });

        document.addEventListener("click", this.OnClick_AnyWhere.bind(this));
    }

    OnClick_AnyWhere(event) {
        
        if (event.target.id == "context-menu") {
            return;
        }

        if (event.target.className == "menuElement") {

            let eventArgs = {
                command: event.target,
                commandID : event.target.id
            }

            this.OnAnyCommandClicked.dispatchEvent(new CustomEvent("click", {detail : eventArgs}));
            this.SetActive(false);
            return;
        }

        this.SetActive(false);

    }

    OnContextMenuCalled(event) {

        if (this.#commandDivs.size == 0) {
            return;
        }

        this.SetMenuToCursor(event);
        this.SetActive(true);
    }

    SetMenuToCursor(event) {
        this.#menuDiv.style.left = `${event.pageX}px`;
        this.#menuDiv.style.top = `${event.pageY}px`;
    }

    SetActive(boolean) {
        boolean == true ? this.#menuDiv.style.display = "block" : this.#menuDiv.style.display = "none";
    }

    AddCommand(command) {

        if (this.#commandDivs.has(command)) {
            return
        }

        let newCommandDiv = document.createElement("div");
        newCommandDiv.setAttribute("id", command);
        newCommandDiv.setAttribute("class", "menuElement");
        newCommandDiv.innerHTML = command;

        this.#menuDiv.appendChild(newCommandDiv);
        this.#commandDivs.set(command, newCommandDiv);
    }

    RemoveCommand(command) {

        if (!this.#commandDivs.has(command)) {
            return;
        }

        this.#menuDiv.removeChild(this.#commandDivs.get(command));
        this.#commandDivs.delete(command);
    }
}