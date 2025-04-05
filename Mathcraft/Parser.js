
export class Parser {


    TokenizeExpression(expression) {
        let tokens = [];
        let regex = /(\d+\.?\d*|\+|\-|\*|\/|\^|\(|\)|x|ln|sin|cos|tan|sqrt|log|E|acos|atan|asin)/g;
        let match;

        while ((match = regex.exec(expression)) !== null) {
            tokens.push(match[0]);
        }

        return tokens;
    }

    Parse(expression) {

        let tokens = this.TokenizeExpression(expression);
        let pointer = 0;
    
        // handles - and +
        function ParseExpression() {

            let node = ParseTerm();

            while (pointer < tokens.length && (tokens[pointer] == "+" || tokens[pointer] == "-")) {
                let operator = tokens[pointer]; pointer++;
                node = { type: "operator", value: operator, left: node, right: ParseTerm() };
            }

            return node;

        }
    
        // handles * and /
        function ParseTerm() {

            let node = ParseExponent();

            while (pointer < tokens.length && (tokens[pointer] === "*" || tokens[pointer] == "/")) {
                let operator = tokens[pointer]; pointer++;
                node = { type: "operator", value: operator, left: node, right: ParseExponent() };
            }

            return node;

        }
    
        // handles ^ exponents
        function ParseExponent() {

            let node = ParseFactor();

            while (pointer < tokens.length && tokens[pointer] == "^") {
                let operator = tokens[pointer]; pointer++;
                node = { type: "operator", value: operator, left: node, right: ParseFactor() };
            }

            return node;

        }

        // handles variables numbers functions etc.., this provides the bottom of the tree
        function ParseFactor() {

            // keeps track of the sign in the tokes so that other conditions ahead can use it to
            // ensures proper parsing of expression like -sin(x) or +3 with implicit signs
            let sign = 1;
            while (pointer < tokens.length && (tokens[pointer] === "+" || tokens[pointer] === "-")) {
                if (tokens[pointer] === "-") {
                    sign *= -1; // flip the sign
                }
                pointer++;
            }

            // if a bracket starts parser the inner expression and skip the ) bracket
            if (tokens[pointer] == "(") {
                pointer++;
                let node = ParseExpression();
                pointer++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            // handle variable
            if (tokens[pointer] == "x") {
                let node = { type: "variable", value: "x" };
                pointer++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }

            // handle the constant e which appears as a symbol but is a number.
            if (tokens[pointer] == "E") {
                let node = {type: "number", value: Math.E};
                pointer++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            // handles functions
            if (['sin', 'cos', 'tan', 'log', 'sqrt', "ln", "E", "atan", "acos", "asin"].includes(tokens[pointer])) {
                let oldIndex = pointer; pointer++;
                let node = {
                    type: "function",
                    value: tokens[oldIndex],
                    argument: ParseFactor()
                };
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            // pure numbers like 3.545
            if (!isNaN(parseFloat(tokens[pointer]))) {
                let node = { type: "number", value: sign * parseFloat(tokens[pointer]) };
                pointer++;
                return node;
            }
        }
    
        return ParseExpression(); // starts the recursion
    }

    static ConvertTreeToString(node) {


        if (node.type == "number") {

            return node.value.toString();

        } 
        else if (node.type == "variable") {

            return node.value;

        } 
        else if (node.type == "operator") {

            let leftString = Parser.ConvertTreeToString(node.left);
            let rightString = Parser.ConvertTreeToString(node.right);
            return `(${leftString} ${node.value} ${rightString})`;

        } 
        else if (node.type == "function") {

            let string = Parser.ConvertTreeToString(node.argument);
            return `${node.value}(${string})`;

        }
    }
}


