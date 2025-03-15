
export class Parser {


    TokenizeExpression(expression) {
        let tokens = [];
        let regex = /(\d+\.?\d*|\+|\-|\*|\/|\^|\(|\)|x|abs|ln|sin|cos|tan|sqrt|exp|log|E|acos|atan|asin)/g;
        let match;

        while ((match = regex.exec(expression)) !== null) {
            tokens.push(match[0]);
        }

        return tokens;
    }

    Parse(expression) {

        let tokens = this.TokenizeExpression(expression);
        let index = 0;
    
        // handles - and +
        function ParseExpression() {

            let node = ParseTerm();
            while (index < tokens.length && (tokens[index] === "+" || tokens[index] === "-")) {
                let operator = tokens[index]; index++;
                node = { type: "operator", value: operator, left: node, right: ParseTerm() };
            }
            return node;

        }
    
        // handles * and /
        function ParseTerm() {

            let node = ParseExponent();
            while (index < tokens.length && (tokens[index] === "*" || tokens[index] === "/")) {
                let operator = tokens[index]; index++;
                node = { type: "operator", value: operator, left: node, right: ParseExponent() };
            }
            return node;

        }
    
        // handles ^ exponents
        function ParseExponent() {

            let node = ParseFactor();
            while (index < tokens.length && tokens[index] === "^") {
                let operator = tokens[index]; index++;
                node = { type: "operator", value: operator, left: node, right: ParseFactor() };
            }
            return node;

        }

        // handles variables numbers functions etc.., this provides the bottom of the tree
        function ParseFactor() {

            // keeps track of the sign in the tokes so that other conditions ahead can use it to
            // ensures proper parsing of expression like -sin(x) or +3 with implicit signs
            let sign = 1;
            while (index < tokens.length && (tokens[index] === "+" || tokens[index] === "-")) {
                if (tokens[index] === "-") {
                    sign *= -1; // flip the sign
                }
                index++;
            }

            // if a bracket starts parser the inner expression and skip the ) bracket
            if (tokens[index] == "(") {
                index++;
                let node = ParseExpression();
                index++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            // handle variable
            if (tokens[index] == "x") {
                let node = { type: "variable", value: "x" };
                index++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }

            // handle the constant e which appears as a symbol but is a number.
            if (tokens[index] == "E") {
                let node = {type: "number", value: Math.E};
                index++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            // handles functions
            if (['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp', "ln", "E", "atan", "acos", "asin"].includes(tokens[index])) {
                let oldIndex = index; index++;
                let node = {
                    type: "function",
                    value: tokens[oldIndex],
                    argument: ParseFactor()
                };
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            // pure numbers like 3.545
            if (!isNaN(parseFloat(tokens[index]))) {
                let node = { type: "number", value: sign * parseFloat(tokens[index]) };
                index++;
                return node;
            }
        }
    
        return ParseExpression(); // starts the recursion
    }

    static ConvertTreeToString(node) {

        if (node.type === "number") {

            return node.value.toString();

        } else if (node.type === "variable") {

            return node.value;

        } else if (node.type === "operator") {

            const leftStr = Parser.ConvertTreeToString(node.left);
            const rightStr = Parser.ConvertTreeToString(node.right);
            return `(${leftStr} ${node.value} ${rightStr})`;

        } else if (node.type === "function") {

            const argStr = Parser.ConvertTreeToString(node.argument);
            return `${node.value}(${argStr})`;

        }
    }
}


