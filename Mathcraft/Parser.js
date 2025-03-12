
export class Parser {

    /** @type {Array}*/allFunctions;

    constructor () {

        this.allFunctions = ["sin", "cos", "tan", "abs", "log"]; // for now;

    }

    TokenizeExpression(expression) {
        let tokens = [];
        let regex = /(\d+\.?\d*|\+|\-|\*|\/|\^|\(|\)|x|abs|log|sin|cos|tan)/g;
        let match;
        
        while ((match = regex.exec(expression)) !== null) {
            tokens.push(match[0]);
        }
    
        return tokens;
    }

    Parse(expression) {

        let tokens = this.TokenizeExpression(expression);
        let index = 0;
        console.log(tokens)

        function ParseExpression() {

            let node = ParseTerm(); // if not null, it will return a node and increment index by one
            
            // while loop will only start if the node is not null, and the index hasn't reached the end of the expression
            while (index < tokens.length && (tokens[index] === "+" || tokens[index] === "-")) {
                let operator = tokens[index]; index++;
                node = {type: "operator", operator: operator, left: node, right: ParseTerm()}
            }
            
            return node; // this will either be the final node or for the expression inside (brackets)
        }

        function ParseTerm() {

            let node = ParseExponent();

            while (index < tokens.length && (tokens[index] === "*" || tokens[index] === "/")) {
                let operator = tokens[index]; index++;
                node = {type: "operator", operator: operator, left: node, right: ParseExponent()}
            }

            return node;
        }

        function ParseExponent() {

            let node = ParseFactor();

            while (index < tokens.length && (tokens[index] === "^")) {
                let operator = tokens[index]; index++;
                node = {type: "operator", operator: operator, left: node, right: ParseFactor()}
            }

            return node;
        }

        function ParseFactor() {
            
            // this will not handle +, -, *, / etc.. it will return undefined so that 
            // the while loops in the other functions can ultimately call this function again.

            if (tokens[index] == "(") {
                index++;
                let node = ParseExpression(); // assuming this will take the index to the end of the bracket
                index++;
                return node;
            }

            if (tokens[index] == "x") {
                let node = {type: "variable", value: "x"};
                index++;
                return node;
            }

            if (["sin", "cos", "tan", "abs", "log"].includes(tokens[index])) {

                // the parseFactor needs to move ahead but the value has to be accessed from the current index
                let oldIndex = index; index++;

                let node = {
                    type: "function",
                    value: tokens[oldIndex],
                    arguments: ParseFactor() // to deal with the expression inside the brackets (will call ParseExpression)
                }

                return node;
            }

            if (!isNaN(parseFloat(tokens[index]))) {
                let node = {
                    type: "number",
                    value: parseFloat(tokens[index])
                }
                index++;
                
                return node;
            }

        }

        let parsed =  ParseExpression();

        return parsed;
    }

    

}