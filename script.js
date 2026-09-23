/* =========================================
   MOGIBARA VENN DIAGRAM MAKER
   ========================================= */


/* ================= ELEMENTS ================= */

const expressionInput =
    document.getElementById("expression");

const generateBtn =
    document.getElementById("generateBtn");

const vennSvg =
    document.getElementById("vennSvg");

const diagramGroup =
    document.getElementById("diagramGroup");

const circleA =
    document.getElementById("circleA");

const circleB =
    document.getElementById("circleB");

const labelA =
    document.getElementById("labelA");

const labelB =
    document.getElementById("labelB");

const background =
    document.getElementById("background");

const canvasContainer =
    document.getElementById("canvasContainer");

const contextMenu =
    document.getElementById("contextMenu");

const sizePanel =
    document.getElementById("sizePanel");

const sizeSlider =
    document.getElementById("sizeSlider");

const sizeValue =
    document.getElementById("sizeValue");

const widthInput =
    document.getElementById("widthInput");

const heightInput =
    document.getElementById("heightInput");

const modeText =
    document.getElementById("modeText");

const zoomText =
    document.getElementById("zoomText");

const message =
    document.getElementById("message");

const themeBtn =
    document.getElementById("themeBtn");


/* ================= BUTTONS ================= */

const moveBtn =
    document.getElementById("moveBtn");

const sizeBtn =
    document.getElementById("sizeBtn");

const zoomInBtn =
    document.getElementById("zoomInBtn");

const zoomOutBtn =
    document.getElementById("zoomOutBtn");

const resetBtn =
    document.getElementById("resetBtn");

const menuMove =
    document.getElementById("menuMove");

const menuSize =
    document.getElementById("menuSize");

const menuZoomIn =
    document.getElementById("menuZoomIn");

const menuZoomOut =
    document.getElementById("menuZoomOut");

const menuReset =
    document.getElementById("menuReset");


/* ================= STATE ================= */

let currentMode = "move";

let zoom = 1;

let overallSize = 1;

let isDragging = false;

let dragStartX = 0;

let dragStartY = 0;

let groupX = 0;

let groupY = 0;

let lastTouchDistance = null;

let longPressTimer = null;

let startTouchX = 0;

let startTouchY = 0;


/* ================= DEFAULT VALUES ================= */

const defaultState = {
    width: 700,
    height: 500,
    zoom: 1,
    overallSize: 1,
    groupX: 0,
    groupY: 0
};


/* ================= MESSAGE ================= */

function showMessage(text) {

    message.textContent = text;

    message.classList.add("show");

    setTimeout(() => {

        message.classList.remove("show");

    }, 1500);
}


/* ================= MODE ================= */

function setMode(mode) {

    currentMode = mode;

    document
        .querySelectorAll(".tool")
        .forEach(button => {
            button.classList.remove("active");
        });

    if (mode === "move") {

        moveBtn.classList.add("active");

        modeText.textContent =
            "Mode: Move";

        vennSvg.style.cursor =
            "grab";

    }

    if (mode === "size") {

        sizeBtn.classList.add("active");

        modeText.textContent =
            "Mode: Size";

        vennSvg.style.cursor =
            "nwse-resize";

        sizePanel.classList.add("show");

    } else {

        if (mode !== "move") {
            sizePanel.classList.remove("show");
        }
    }
}


/* ================= SIZE MODE BUTTON ================= */

sizeBtn.addEventListener("click", () => {

    if (sizePanel.classList.contains("show")) {

        sizePanel.classList.remove("show");

        setMode("move");

    } else {

        setMode("size");

        sizePanel.classList.add("show");

    }

});


moveBtn.addEventListener("click", () => {

    setMode("move");

    sizePanel.classList.remove("show");

});


/* ================= ZOOM ================= */

function updateZoom() {

    vennSvg.style.transform =
        `scale(${zoom})`;

    zoomText.textContent =
        `Zoom: ${Math.round(zoom * 100)}%`;

}


function zoomIn() {

    zoom += 0.1;

    if (zoom > 3) {
        zoom = 3;
    }

    updateZoom();

}


function zoomOut() {

    zoom -= 0.1;

    if (zoom < 0.4) {
        zoom = 0.4;
    }

    updateZoom();

}


zoomInBtn.addEventListener(
    "click",
    zoomIn
);

zoomOutBtn.addEventListener(
    "click",
    zoomOut
);


/* ================= SIZE ================= */

function updateSize() {

    const width =
        Number(widthInput.value);

    const height =
        Number(heightInput.value);

    vennSvg.setAttribute(
        "width",
        width
    );

    vennSvg.setAttribute(
        "height",
        height
    );

    background.setAttribute(
        "width",
        width
    );

    background.setAttribute(
        "height",
        height
    );

    vennSvg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    sizeValue.textContent =
        `${Math.round(overallSize * 100)}%`;

    applyOverallSize();

}


function applyOverallSize() {

    diagramGroup.style.transform =
        `translate(${groupX}px, ${groupY}px)
         scale(${overallSize})`;

}


widthInput.addEventListener(
    "input",
    updateSize
);


heightInput.addEventListener(
    "input",
    updateSize
);


sizeSlider.addEventListener(
    "input",
    () => {

        overallSize =
            Number(sizeSlider.value) / 100;

        updateSize();

    }
);


/* ================= MOVE ================= */

function startDrag(x, y) {

    if (currentMode !== "move") {
        return;
    }

    isDragging = true;

    dragStartX = x - groupX;

    dragStartY = y - groupY;

    vennSvg.classList.add("dragging");

}


function moveDrag(x, y) {

    if (!isDragging) {
        return;
    }

    groupX =
        x - dragStartX;

    groupY =
        y - dragStartY;

    applyOverallSize();

}


function stopDrag() {

    isDragging = false;

    vennSvg.classList.remove("dragging");

}


/* ================= MOUSE EVENTS ================= */

vennSvg.addEventListener(
    "mousedown",
    event => {

        if (event.button !== 0) {
            return;
        }

        startDrag(
            event.clientX,
            event.clientY
        );

    }
);


window.addEventListener(
    "mousemove",
    event => {

        moveDrag(
            event.clientX,
            event.clientY
        );

    }
);


window.addEventListener(
    "mouseup",
    stopDrag
);


/* ================= TOUCH HELPERS ================= */

function distanceBetweenTouches(touches) {

    const x =
        touches[0].clientX -
        touches[1].clientX;

    const y =
        touches[0].clientY -
        touches[1].clientY;

    return Math.sqrt(
        x * x + y * y
    );

}


/* ================= TOUCH EVENTS ================= */

vennSvg.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        if (event.touches.length === 2) {

            lastTouchDistance =
                distanceBetweenTouches(
                    event.touches
                );

            return;
        }

        if (event.touches.length === 1) {

            const touch =
                event.touches[0];

            startTouchX =
                touch.clientX;

            startTouchY =
                touch.clientY;

            if (currentMode === "move") {

                startDrag(
                    touch.clientX,
                    touch.clientY
                );

            }

            longPressTimer =
                setTimeout(() => {

                    openContextMenu(
                        touch.clientX,
                        touch.clientY
                    );

                }, 650);

        }

    },
    {
        passive: false
    }
);


vennSvg.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();

        clearTimeout(
            longPressTimer
        );

        if (event.touches.length === 2) {

            const newDistance =
                distanceBetweenTouches(
                    event.touches
                );

            if (lastTouchDistance !== null) {

                const difference =
                    newDistance -
                    lastTouchDistance;

                zoom += difference * 0.005;

                if (zoom < 0.4) {
                    zoom = 0.4;
                }

                if (zoom > 3) {
                    zoom = 3;
                }

                updateZoom();

            }

            lastTouchDistance =
                newDistance;

            return;
        }

        if (
            event.touches.length === 1 &&
            currentMode === "move"
        ) {

            const touch =
                event.touches[0];

            moveDrag(
                touch.clientX,
                touch.clientY
            );

        }

    },
    {
        passive: false
    }
);


vennSvg.addEventListener(
    "touchend",
    event => {

        clearTimeout(
            longPressTimer
        );

        lastTouchDistance = null;

        stopDrag();

    }
);


/* ================= RIGHT CLICK ================= */

vennSvg.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

        openContextMenu(
            event.clientX,
            event.clientY
        );

    }
);


function openContextMenu(x, y) {

    contextMenu.classList.add("show");

    const menuWidth =
        contextMenu.offsetWidth;

    const menuHeight =
        contextMenu.offsetHeight;

    let left = x;

    let top = y;

    if (
        left + menuWidth >
        window.innerWidth
    ) {

        left =
            window.innerWidth -
            menuWidth -
            10;

    }

    if (
        top + menuHeight >
        window.innerHeight
    ) {

        top =
            window.innerHeight -
            menuHeight -
            10;

    }

    contextMenu.style.left =
        `${left}px`;

    contextMenu.style.top =
        `${top}px`;

}


function closeContextMenu() {

    contextMenu.classList.remove(
        "show"
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            !contextMenu.contains(event.target)
        ) {

            closeContextMenu();

        }

    }
);


/* ================= CONTEXT BUTTONS ================= */

menuMove.addEventListener(
    "click",
    () => {

        setMode("move");

        closeContextMenu();

    }
);


menuSize.addEventListener(
    "click",
    () => {

        setMode("size");

        sizePanel.classList.add(
            "show"
        );

        closeContextMenu();

    }
);


menuZoomIn.addEventListener(
    "click",
    () => {

        zoomIn();

        closeContextMenu();

    }
);


menuZoomOut.addEventListener(
    "click",
    () => {

        zoomOut();

        closeContextMenu();

    }
);


menuReset.addEventListener(
    "click",
    () => {

        resetDiagram();

        closeContextMenu();

    }
);


/* ================= RESET ================= */

function resetDiagram() {

    widthInput.value =
        defaultState.width;

    heightInput.value =
        defaultState.height;

    zoom =
        defaultState.zoom;

    overallSize =
        defaultState.overallSize;

    groupX =
        defaultState.groupX;

    groupY =
        defaultState.groupY;

    sizeSlider.value = 100;

    updateSize();

    updateZoom();

    setMode("move");

    showMessage(
        "Diagram reset"
    );

}


resetBtn.addEventListener(
    "click",
    resetDiagram
);


/* ================= EXPRESSION ================= */

function normalizeExpression(expression) {

    return expression
        .replace(/\s+/g, "")
        .replace(/∩/g, "&")
        .replace(/∪/g, "|")
        .replace(/-/g, "-")
        .replace(/'/g, "'")
        .toUpperCase();

}


/*
    This function decides which parts
    of the Venn diagram should be shown.

    Supported examples:

    A
    B
    A'
    B'
    A-B
    B-A
    A&B
    A|B
    A&B'
    A'&B
    A'&B'
    A|B
*/


function generateDiagram() {

    const raw =
        expressionInput.value;

    const expression =
        normalizeExpression(raw);

    if (!expression) {

        showMessage(
            "Enter a set expression"
        );

        return;
    }


    /* Default visibility */

    circleA.style.opacity = "1";

    circleB.style.opacity = "1";

    circleA.style.fill =
        "rgba(59, 130, 246, 0.35)";

    circleB.style.fill =
        "rgba(239, 68, 68, 0.32)";


    /*
        A
    */

    if (expression === "A") {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.60)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.10)";

    }


    /*
        B
    */

    else if (expression === "B") {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.10)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.60)";

    }


    /*
        A'
    */

    else if (expression === "A'") {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.08)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.08)";

        background.style.fill =
            "rgba(34, 197, 94, 0.28)";

    }


    /*
        B'
    */

    else if (expression === "B'") {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.08)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.08)";

        background.style.fill =
            "rgba(34, 197, 94, 0.28)";

    }


    /*
        A-B
    */

    else if (
        expression === "A-B" ||
        expression === "A\\B"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.65)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.10)";

    }


    /*
        B-A
    */

    else if (
        expression === "B-A" ||
        expression === "B\\A"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.10)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.65)";

    }


    /*
        A ∩ B
    */

    else if (
        expression === "A&B" ||
        expression === "A∩B"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.30)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.30)";

        showMessage(
            "Intersection A ∩ B"
        );

        return;
    }


    /*
        A ∪ B
    */

    else if (
        expression === "A|B"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.45)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.45)";

    }


    /*
        A ∩ B'
    */

    else if (
        expression === "A&B'"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.65)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.08)";

    }


    /*
        A' ∩ B
    */

    else if (
        expression === "A'&B"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.08)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.65)";

    }


    /*
        A' ∩ B'
    */

    else if (
        expression === "A'&B'"
    ) {

        circleA.style.fill =
            "rgba(59, 130, 246, 0.08)";

        circleB.style.fill =
            "rgba(239, 68, 68, 0.08)";

        background.style.fill =
            "rgba(34, 197, 94, 0.30)";

    }


    else {

        showMessage(
            "Expression recognized with basic Venn display"
        );

    }


    background.style.fill = "";

    applyOverallSize();

    showMessage(
        `Generated: ${raw}`
    );

}


/* ================= GENERATE ================= */

generateBtn.addEventListener(
    "click",
    generateDiagram
);


expressionInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            generateDiagram();

        }

    }
);


/* ================= EXAMPLE BUTTONS ================= */

document
    .querySelectorAll(".examples button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                expressionInput.value =
                    button.dataset.expression;

                generateDiagram();

            }
        );

    });


/* ================= THEME ================= */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        if (
            document.body.classList.contains(
                "dark"
            )
        ) {

            themeBtn.textContent = "☀";

        } else {

            themeBtn.textContent = "☾";

        }

    }
);


/* ================= KEYBOARD ================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "+") {
            zoomIn();
        }

        if (event.key === "-") {
            zoomOut();
        }

        if (event.key === "Escape") {
            closeContextMenu();
        }

    }
);


/* ================= INITIALIZE ================= */

updateSize();

updateZoom();

setMode("move");

generateDiagram();
