
function createMathFunction(expr) {
    try {
       
        let jsCode = expr;
        const mathFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp'];
        mathFunctions.forEach(func => {
            jsCode = jsCode.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
        });

        console.log(jsCode)

        jsCode = jsCode.replace(/(\S+)\s*\^\s*(\S+)/g, "($1 ** $2)");

        console.log(jsCode)
        const jsFunction = new Function('Math', 'x', `return ${jsCode};`);

        return (x) => jsFunction(Math, x);
    } catch (error) {
        console.error('Invalid expression:', error.message);
        return null; // Return null if the expression is invalid
    }
}


const expression = '(x)^(x)';
const mathFunction = createMathFunction(expression);

if (mathFunction) {
    console.log('Expression is valid. Evaluating...');
    const result = mathFunction(5); 
    console.log('Result:', result); 
} else {
    console.log('Expression is invalid.');
}