const expressionInput = document.getElementById("expression");
const generateBtn = document.getElementById("generateBtn");
const stepsBox = document.getElementById("steps");
const diagramBox = document.getElementById("diagram");


// --------------------------------------------------
// SYMBOL NORMALIZATION
// --------------------------------------------------

function normalizeExpression(input) {

    return input
        .replace(/\s+/g, "")
        .replace(/U/g, "∪")
        .replace(/u/g, "∪")
        .replace(/I/g, "∩")
        .replace(/i/g, "∩")
        .replace(/'/g, "'")
        .replace(/−/g, "-")
        .replace(/×/g, "∩");
}


// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

function validateExpression(exp) {

    if (!exp) {
        throw new Error("Please enter an expression.");
    }

    const allowed = /^[A-Za-z0-9()∪∩\-']+$/;

    if (!allowed.test(exp)) {
        throw new Error(
            "Expression contains an unsupported symbol."
        );
    }

    let balance = 0;

    for (const char of exp) {

        if (char === "(") balance++;

        if (char === ")") balance--;

        if (balance < 0) {
            throw new Error("Brackets are not balanced.");
        }
    }

    if (balance !== 0) {
        throw new Error("Brackets are not balanced.");
    }
}


// --------------------------------------------------
// TOKENIZER
// --------------------------------------------------

function tokenize(exp) {

    const tokens = [];

    for (let i = 0; i < exp.length; i++) {

        const char = exp[i];

        if (/[A-Za-z0-9]/.test(char)) {

            let name = char;

            while (
                i + 1 < exp.length &&
                /[A-Za-z0-9]/.test(exp[i + 1])
            ) {
                name += exp[++i];
            }

            tokens.push({
                type: "set",
                value: name
            });

        }

        else if ("∪∩-()'".includes(char)) {

            tokens.push({
                type: char,
                value: char
            });

        }

        else {

            throw new Error(
                "Unknown character: " + char
            );

        }
    }

    return tokens;
}


// --------------------------------------------------
// PARSER
// --------------------------------------------------

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.position = 0;

    }


    current() {

        return this.tokens[this.position];

    }


    eat(type) {

        const token = this.current();

        if (!token || token.type !== type) {

            throw new Error(
                `Expected "${type}".`
            );

        }

        this.position++;

        return token;
    }


    parse() {

        const node = this.parseUnion();

        if (this.position < this.tokens.length) {

            throw new Error(
                "Unexpected symbol near the end."
            );

        }

        return node;
    }


    // UNION
    parseUnion() {

        let node = this.parseIntersection();

        while (this.current()?.type === "∪") {

            this.eat("∪");

            node = {
                type: "union",
                left: node,
                right: this.parseIntersection()
            };

        }

        return node;
    }


    // INTERSECTION
    parseIntersection() {

        let node = this.parseDifference();

        while (this.current()?.type === "∩") {

            this.eat("∩");

            node = {
                type: "intersection",
                left: node,
                right: this.parseDifference()
            };

        }

        return node;
    }


    // DIFFERENCE
    parseDifference() {

        let node = this.parseUnary();

        while (this.current()?.type === "-") {

            this.eat("-");

            node = {
                type: "difference",
                left: node,
                right: this.parseUnary()
            };

        }

        return node;
    }


    // COMPLEMENT
    parseUnary() {

        let node;

        if (this.current()?.type === "(") {

            this.eat("(");

            node = this.parseUnion();

            this.eat(")");

        }

        else if (this.current()?.type === "set") {

            node = {
                type: "set",
                name: this.eat("set").value
            };

        }

        else {

            throw new Error(
                "Expected a set or opening bracket."
            );

        }


        while (this.current()?.type === "'") {

            this.eat("'");

            node = {
                type: "complement",
                value: node
            };

        }

        return node;
    }
}


// --------------------------------------------------
// TREE → TEXT
// --------------------------------------------------

function nodeToString(node) {

    switch (node.type) {

        case "set":
            return node.name;

        case "complement":
            return nodeToString(node.value) + "'";

        case "difference":
            return (
                "(" +
                nodeToString(node.left) +
                "-" +
                nodeToString(node.right) +
                ")"
            );

        case "intersection":
            return (
                "(" +
                nodeToString(node.left) +
                "∩" +
                nodeToString(node.right) +
                ")"
            );

        case "union":
            return (
                "(" +
                nodeToString(node.left) +
                "∪" +
                nodeToString(node.right) +
                ")"
            );

        default:
            return "";
    }
}


// --------------------------------------------------
// STEP GENERATOR
// --------------------------------------------------

function generateSteps(node, steps = []) {

    if (node.type === "set") {

        return node;
    }


    if (node.type === "complement") {

        const child = generateSteps(
            node.value,
            steps
        );

        steps.push({
            expression: nodeToString(node),
            explanation:
                `${nodeToString(node.value)}' means the complement of ${nodeToString(node.value)} — everything outside ${nodeToString(node.value)}.`
        });

        return node;
    }


    if (node.type === "difference") {

        generateSteps(node.left, steps);

        generateSteps(node.right, steps);

        steps.push({
            expression: nodeToString(node),
            explanation:
                `${nodeToString(node.left)} - ${nodeToString(node.right)} means the elements that are in ${nodeToString(node.left)} but not in ${nodeToString(node.right)}.`
        });

        return node;
    }


    if (node.type === "intersection") {

        generateSteps(node.left, steps);

        generateSteps(node.right, steps);

        steps.push({
            expression: nodeToString(node),
            explanation:
                `${nodeToString(node.left)} ∩ ${nodeToString(node.right)} means the common region of both sets.`
        });

        return node;
    }


    if (node.type === "union") {

        generateSteps(node.left, steps);

        generateSteps(node.right, steps);

        steps.push({
            expression: nodeToString(node),
            explanation:
                `${nodeToString(node.left)} ∪ ${nodeToString(node.right)} means everything belonging to either set.`
        });

        return node;
    }


    return node;
}


// --------------------------------------------------
// REMOVE DUPLICATE STEPS
// --------------------------------------------------

function removeDuplicateSteps(steps) {

    const result = [];
    const seen = new Set();

    for (const step of steps) {

        if (!seen.has(step.expression)) {

            seen.add(step.expression);

            result.push(step);

        }

    }

    return result;
}


// --------------------------------------------------
// DISPLAY STEPS
// --------------------------------------------------

function displaySteps(steps, finalExpression) {

    stepsBox.innerHTML = "";

    steps.forEach((step, index) => {

        const div = document.createElement("div");

        div.className = "step";

        div.innerHTML = `
            <div class="step-number">
                ${index + 1}
            </div>

            <div class="step-content">

                <div class="step-expression">
                    ${escapeHTML(step.expression)}
                </div>

                <div class="step-explanation">
                    ${escapeHTML(step.explanation)}
                </div>

            </div>
        `;

        stepsBox.appendChild(div);

    });


    const final = document.createElement("div");

    final.className = "step";

    final.innerHTML = `
        <div class="step-number">✓</div>

        <div class="step-content">

            <div class="step-expression">
                Final: ${escapeHTML(finalExpression)}
            </div>

            <div class="step-explanation">
                This is the final Venn-diagram region described by the expression.
            </div>

        </div>
    `;

    stepsBox.appendChild(final);
}


// --------------------------------------------------
// SIMPLE VENN DIAGRAM
// --------------------------------------------------

function drawDiagram(expression) {

    const sets = [
        ...new Set(
            expression.match(/[A-Za-z]/g) || []
        )
    ].slice(0, 3);


    diagramBox.innerHTML = "";


    if (sets.length === 0) {

        diagramBox.innerHTML =
            "<p class='empty'>No sets detected.</p>";

        return;
    }


    const venn = document.createElement("div");

    venn.className = "venn";


    sets.forEach((set, index) => {

        const circle = document.createElement("div");

        circle.className =
            "circle circle-" +
            String.fromCharCode(97 + index);

        circle.innerHTML =
            `<span class="set-label">${set}</span>`;

        venn.appendChild(circle);

    });


    diagramBox.appendChild(venn);
}


// --------------------------------------------------
// HTML SAFETY
// --------------------------------------------------

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// --------------------------------------------------
// GENERATE
// --------------------------------------------------

function generate() {

    try {

        let expression =
            normalizeExpression(
                expressionInput.value
            );

        validateExpression(expression);


        const tokens =
            tokenize(expression);


        const parser =
            new Parser(tokens);


        const tree =
            parser.parse();


        const steps = [];

        generateSteps(tree, steps);


        const cleanSteps =
            removeDuplicateSteps(steps);


        displaySteps(
            cleanSteps,
            nodeToString(tree)
        );


        drawDiagram(expression);

    }

    catch (error) {

        stepsBox.innerHTML = `
            <div class="error">
                ${escapeHTML(error.message)}
            </div>
        `;

        diagramBox.innerHTML = "";

    }
}


// --------------------------------------------------
// BUTTON
// --------------------------------------------------

generateBtn.addEventListener(
    "click",
    generate
);


// ENTER KEY

expressionInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            generate();

        }

    }
);


// --------------------------------------------------
// EXAMPLE BUTTONS
// --------------------------------------------------

document
    .querySelectorAll(".example-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                expressionInput.value =
                    this.textContent;

                generate();

            }
        );

    });
