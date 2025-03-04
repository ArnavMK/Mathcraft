
function createMathFunction(expr) {
    try {
       
        const parsed = math.parse(expr);

        let jsCode = parsed.toString();


        const mathFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp'];
        mathFunctions.forEach(func => {
            jsCode = jsCode.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
        });

        
        const jsFunction = new Function('Math', 'x', `return ${jsCode};`);

        return (x) => jsFunction(Math, x);
    } catch (error) {
        console.error('Invalid expression:', error.message);
        return null; // Return null if the expression is invalid
    }
}


const expression = 'sin(log(x))';
const mathFunction = createMathFunction(expression);

if (mathFunction) {
    console.log('Expression is valid. Evaluating...');
    const result = mathFunction(Math.PI / 2); 
    console.log('Result:', result); 
} else {
    console.log('Expression is invalid.');
}