"use strict";

// Minimum resizable area
var minWidth = 10;
var minHeight = 10;

// Thresholds
var MARGINS = 4;

// End of what's configurable.
var clicked = null;
var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;



var b, x, y;

var mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
};

var rectangleElement = null;
var counter = 0;

var pane = null;
var targetElementId = null;

// Mouse events
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onUp);


function onMouseDown(e) {
    onDown(e);
    e.preventDefault();
}

function onDown(e) {
    calc(e);
    if (e.target.className != 'pane') {
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;
        rectangleElement = document.createElement('div');
        rectangleElement.className = 'pane';
        rectangleElement.id = `rect${counter++}`;
        document.body.appendChild(rectangleElement)
        document.body.style.cursor = "crosshair";
    } else {
        pane = document.getElementById(e.target.id);
        pane.style.zIndex = 2;
        targetElementId = e.target.id;
        var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

        clicked = {
            x: x,
            y: y,
            cx: e.clientX,
            cy: e.clientY,
            w: b.width,
            h: b.height,
            isResizing: isResizing,
            isMoving: !isResizing,
            onTopEdge: onTopEdge,
            onLeftEdge: onLeftEdge,
            onRightEdge: onRightEdge,
            onBottomEdge: onBottomEdge
        };
    }

}

function canMove() {
    return x > 0 && x < b.width && y > 0 && y < b.height
        && y < 30;
}

function calc(e) {
    mouse.x = e.clientX + document.body.scrollLeft;
    mouse.y = e.clientY + document.body.scrollTop;
    if (pane != null) {

        b = pane.getBoundingClientRect();
        x = e.clientX - b.left;
        y = e.clientY - b.top;
        onTopEdge = y < MARGINS;
        onLeftEdge = x < MARGINS;
        onRightEdge = x >= b.width - MARGINS;
        onBottomEdge = y >= b.height - MARGINS;
    }

}

var e;

function onMove(ee) {
    calc(ee);
    e = ee;

    if (!ee.target.id.includes('rect')) {
        pane = document.getElementById(targetElementId);
    } else {
        pane = document.getElementById(ee.target.id);
    }

    if (rectangleElement !== null) {
        rectangleElement.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
        rectangleElement.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
        rectangleElement.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
        rectangleElement.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
    }
}

function animate() {

    requestAnimationFrame(animate);
    if (pane != null) {

        if (clicked && clicked.isResizing) {

            if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
            if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + 'px';

            if (clicked.onLeftEdge) {
                var currentWidth = Math.max(clicked.cx - e.clientX + clicked.w, minWidth);
                if (currentWidth > minWidth) {
                    pane.style.width = currentWidth + 'px';
                    pane.style.left = e.clientX + 'px';
                }
            }

            if (clicked.onTopEdge) {
                var currentHeight = Math.max(clicked.cy - e.clientY + clicked.h, minHeight);
                if (currentHeight > minHeight) {
                    pane.style.height = currentHeight + 'px';
                    pane.style.top = e.clientY + 'px';
                }
            }
            return;
        }

        if (clicked && clicked.isMoving) {

            // moving
            pane.style.top = (e.clientY - clicked.y + document.body.scrollTop) + 'px';
            pane.style.left = (e.clientX - clicked.x + document.body.scrollLeft) + 'px';

            return;
        }

        // This code executes when mouse moves without clicking

        // style cursor
        if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
            pane.style.cursor = 'nwse-resize';
        } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
            pane.style.cursor = 'nesw-resize';
        } else if (onRightEdge || onLeftEdge) {
            pane.style.cursor = 'ew-resize';
        } else if (onBottomEdge || onTopEdge) {
            pane.style.cursor = 'ns-resize';
        } else {
            pane.style.cursor = 'move';
        }
    }

}

animate();

function onUp(e) {
    calc(e);
    clicked = null;
    pane.style.zIndex = 1
    rectangleElement = null;
    document.body.style.cursor = "default";
}
