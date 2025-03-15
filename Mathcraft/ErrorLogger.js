

export class ErrorLogger {

    isFree;

    constructor(loggerElements) {

        this.loggerElements = loggerElements;
        this.errorList = new Map();
        this.isFree = true;
        
        for (let element of loggerElements) {
            element.style.opacity = "0";
            element.style.display = "none";
        }
    }

    ShowNewError(errorMessage) {

        this.errorList.set(errorMessage, errorMessage);

        if (this.isFree) {

            for (let element of this.loggerElements) {
                element.style.display = "flex";
                element.style.opacity = "1";
                element.children[0].innerHTML = errorMessage
            }
            setTimeout(() => this.#HideErrorLogger(errorMessage), 5000);
            this.isFree = false;

        }
        
    }

    #HideErrorLogger(errorMessage) {

        this.errorList.delete(errorMessage);
        
        for (let element of this.loggerElements) {
            element.style.opacity = "0";
        }

        this.isFree = true;

        if (this.errorList.size > 0) {
            // to give enough time for the animation to complete
            setTimeout(() =>  this.ShowNewError(this.errorList.entries().next().value[0]), 202);
        }
        
        setTimeout(() => {

            for (let element of this.loggerElements) {
                element.style.display = "none";
            }

        }, 200)
    }
}
