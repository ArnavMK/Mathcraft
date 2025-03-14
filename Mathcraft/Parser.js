
export class Parser {

    /** @type {Array}*/allFunctions;


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
    
        function ParseExpression() {
            let node = ParseTerm();
            while (index < tokens.length && (tokens[index] === "+" || tokens[index] === "-")) {
                let operator = tokens[index]; index++;
                node = { type: "operator", value: operator, left: node, right: ParseTerm() };
            }
            return node;
        }
    
        function ParseTerm() {
            let node = ParseExponent();
            while (index < tokens.length && (tokens[index] === "*" || tokens[index] === "/")) {
                let operator = tokens[index]; index++;
                node = { type: "operator", value: operator, left: node, right: ParseExponent() };
            }
            return node;
        }
    
        function ParseExponent() {
            let node = ParseFactor();
            while (index < tokens.length && tokens[index] === "^") {
                let operator = tokens[index]; index++;
                node = { type: "operator", value: operator, left: node, right: ParseFactor() };
            }
            return node;
        }

        function ParseFactor() {

            let sign = 1;
            while (index < tokens.length && (tokens[index] === "+" || tokens[index] === "-")) {
                if (tokens[index] === "-") {
                    sign *= -1;
                }
                index++;
            }

            if (tokens[index] == "(") {
                index++;
                let node = ParseExpression();
                index++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            if (tokens[index] == "x") {
                let node = { type: "variable", value: "x" };
                index++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }

            if (tokens[index] == "E") {
                let node = {type: "number", value: Math.E};
                index++;
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            if (['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp', "ln", "E", "atan", "acos", "asin"].includes(tokens[index])) {
                let oldIndex = index; index++;
                let node = {
                    type: "function",
                    value: tokens[oldIndex],
                    argument: ParseFactor()
                };
                return sign === 1 ? node : { type: "operator", value: "*", left: { type: "number", value: -1 }, right: node };
            }
    
            if (!isNaN(parseFloat(tokens[index]))) {
                let node = { type: "number", value: sign * parseFloat(tokens[index]) };
                index++;
                return node;
            }
        }
    
        return ParseExpression();
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
