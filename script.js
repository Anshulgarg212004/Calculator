
const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    display.value = expression || "0";
}

function clearCalculator() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function addValue(value) {
    const operators = ["+", "-", "*", "/", "%"];

    if (justCalculated) {
        if (!operators.includes(value) && value !== ".") {
            expression = "";
        }
        justCalculated = false;
    }

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/%]/).pop();

        if (currentNumber.includes(".")) return;

        if (currentNumber === "") {
            expression += "0";
        }
    }

    const lastChar = expression.slice(-1);

    if (operators.includes(value)) {
        if (expression === "" && value !== "-") return;

        if (operators.includes(lastChar)) {
            if (value === "-" && lastChar !== "-") {
                expression += value;
                updateDisplay();
                return;
            }

            expression = expression.slice(0, -1);
        }
    }

    expression += value;
    updateDisplay();
}

// Safe arithmetic parser
function calculateExpression(input) {
    const tokens = input.match(
        /(?:\d+\.?\d*|\.\d+)|[+\-*/%]/g
    );

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parseNumber() {
        let sign = 1;

        if (tokens[position] === "-") {
            sign = -1;
            position++;
        } else if (tokens[position] === "+") {
            position++;
        }

        const token = tokens[position++];

        if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
            throw new Error("Invalid number");
        }

        let value = sign * Number(token);

        while (tokens[position] === "%") {
            value /= 100;
            position++;
        }

        return value;
    }

    function parseTerm() {
        let value = parseNumber();

        while (["*", "/"].includes(tokens[position])) {
            const operator = tokens[position++];
            const right = parseNumber();

            if (operator === "/" && right === 0) {
                throw new Error("Cannot divide by zero");
            }

            value = operator === "*"
                ? value * right
                : value / right;
        }

        return value;
    }

    function parseSum() {
        let value = parseTerm();

        while (["+", "-"].includes(tokens[position])) {
            const operator = tokens[position++];
            const right = parseTerm();

            value = operator === "+"
                ? value + right
                : value - right;
        }

        return value;
    }

    const result = parseSum();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}

function calculate() {
    if (!expression) return;

    try {
        const result = calculateExpression(expression);

        expression = String(
            Number(result.toPrecision(12))
        );

        justCalculated = true;
        updateDisplay();
    } catch {
        display.value = "Error";
        expression = "";
        justCalculated = false;
    }
}

// Handle button clicks
buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        clearCalculator();
    } else if (action === "delete") {
        deleteLast();
    } else if (action === "calculate") {
        calculate();
    } else if (value !== undefined) {
        addValue(value);
    }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9.+\-*/%]$/.test(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape" || key === "Delete") {
        clearCalculator();
    }
});

updateDisplay();
