var canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d'),
    bgRectangle = new Path2D(),
    startX,
    startY,
    shadowRect = {},
    peeledRect = {},
    dragHeight,
    drag = false,
    leftDeformer, rightDeformer,
    stickerCounter = 0,
    newSticker;
    var btmRightxDeformer = 0;
    var btmLeftxDeformer = 0;


init();

class Sticker {
    constructor(startX, startY, width, height) {
        this.x = startX;
        this.y = startY;
        this.w = width;
        this.h = height;
    }
}


function init() {
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
}

var stickerContainer = [];
var activeSticker;
var brandNewSticker;


function mouseDown(e) {
    drag = true;
    startX = e.pageX;
    startY = e.pageY;

    let stickerHit = checkforExistingSticker(e.pageX, e.pageY);
    if (stickerHit == null) { //create a new sticker
        console.log('create new sticker');
        newSticker = true;
        stickerCounter++;
        stickerContainer.push(new Sticker(startX, startY, 0, 0));
    } else {
        newSticker = false;
        brandNewSticker = true;
        activeSticker = stickerContainer[stickerHit]; // The returned value of the func stickerCheck is the active sticker
    };
}


function checkforExistingSticker(mouseX, mouseY) {
    for (i = 0; i < stickerContainer.length; i++) {
        if (mouseX >= stickerContainer[i].x && mouseX <= stickerContainer[i].endX || mouseX <= stickerContainer[i].x && mouseX >= stickerContainer[i].endX) {
            if (mouseY >= stickerContainer[i].y && mouseY <= stickerContainer[i].endY || mouseY <= stickerContainer[i].y && mouseY >= stickerContainer[i].endY) {
                return i;
            }
        }
    }
}


function mouseUp() {
    if (drag && newSticker) { //if we've been resizing the sticker,update the end coordinates

        stickerContainer[stickerCounter - 1].endX = stickerContainer[stickerCounter - 1].x + stickerContainer[stickerCounter - 1].w;
        stickerContainer[stickerCounter - 1].endY = stickerContainer[stickerCounter - 1].y + stickerContainer[stickerCounter - 1].h;

        let lastSticker = stickerContainer[stickerContainer.length - 1];
        if (lastSticker.w < 0) {
            lastSticker.x = lastSticker.x + lastSticker.w;
            lastSticker.w = Math.abs(lastSticker.w);
            lastSticker.endX = lastSticker.x + lastSticker.w;
        }
        if (lastSticker.h < 0) {
            lastSticker.y = lastSticker.y + lastSticker.h;
            lastSticker.h = Math.abs(lastSticker.h);
            lastSticker.endY = lastSticker.y + lastSticker.h;
        }
    }
    drag = false;
    draw();
}

function mouseMove(e) {
    if (drag) {
        if (newSticker) {
            let currentSticker = stickerCounter - 1;
            stickerContainer[currentSticker].w = e.pageX - startX;
            stickerContainer[currentSticker].h = e.pageY - startY;
            ctx.fillStyle = "#0000D6";
            ctx.fillRect(stickerContainer[currentSticker].x, stickerContainer[currentSticker].y, stickerContainer[currentSticker].w, stickerContainer[currentSticker].h);
            draw();
        } else {
            if (brandNewSticker) { //establish initial offsets
                offsetTop = (e.pageY - activeSticker.y);
                offsetLeft = (e.pageX - activeSticker.x);
                brandNewSticker = false;
            }
            calculateDeformation(e);
            draw();
        }
    }
}


function draw() {

    if (activeSticker != null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (i = 0; i < stickerContainer.length; i++) { //draw existing sticker BG's
            let obj = stickerContainer[i];
            ctx.fillStyle = '#0000D6';
            ctx.fillRect(stickerContainer[i].x, stickerContainer[i].y, stickerContainer[i].w, stickerContainer[i].h);
        }

        ////*************** SHADOW STICKER ******************
        ctx.fillStyle = "#99ECFF";
        ctx.beginPath();
        ctx.moveTo(activeSticker.x, activeSticker.y); //TOP LEFT
        ctx.lineTo(activeSticker.endX, activeSticker.y); //TOP RIGHT
        ctx.lineTo(activeSticker.endX, shadowRect.bottomRighty); //BOTTOM RIGHT
        ctx.lineTo(activeSticker.x, shadowRect.bottomLefty); //BOTTOM LEFT
        ctx.closePath();
        ctx.fill();

        ////*************** FRONT STICKER ******************
        ctx.fillStyle = '#F73C3C';
        ctx.beginPath();
        ctx.moveTo(activeSticker.x, peeledRect.topLefty); //TOP LEFT
        ctx.lineTo(activeSticker.endX, peeledRect.topRighty); //TOP RIGHT
        ctx.lineTo(peeledRect.bottomRightx, peeledRect.bottomRighty); //BOTTOM RIGHT
        ctx.lineTo(peeledRect.bottomLeftx, peeledRect.bottomLefty); //BOTTOM LEFT
        ctx.closePath();
        ctx.fill();

        if (!drag) { //MOUSE UP return animation
            if (peeledRect.bottomRighty >= activeSticker.y + 1) {
                returnStickerAnimation();
            }
        }
    }
}




function calculateDeformation(e) {

    let yhorizontaldeformer;

    dragHeight = clamp(((e.pageY - offsetTop) - activeSticker.y), 0, (activeSticker.endY));
    // let clampedDragHeight = clamp(dragHeight, 0, )
    // console.log(activeSticker.y, activeSticker.x, activeSticker.endY);
    // console.log(dragHeight);
    xMovement = (e.pageX - offsetLeft) - activeSticker.x;
    console.log(xMovement);

    //horizontal deformers: -
    if (xMovement >= 0) {
        leftDeformer = xMovement;
        rightDeformer = 0
    } else {
        rightDeformer = Math.abs(xMovement);
        leftDeformer = 0
    };

    //peeled topRight
    let topRight = dragHeight + activeSticker.y + rightDeformer * 0.8 * dragHeight * 0.01;
    peeledRect.topRighty = clamp(topRight, 0, activeSticker.endY);
    // shadowRect.bottomRighty = clamp(bottomright, 0, activeSticker.endY + activeSticker.y);

    //topLeft
    // let bottomleft = dragHeight + activeSticker.y + leftDeformer * 0.8 * dragHeight * 0.01;
    let topleft = dragHeight + activeSticker.y + leftDeformer * 0.8 * dragHeight * 0.01;
    peeledRect.topLefty = clamp(topleft, 0, activeSticker.endY)

    //bottomRight
    let peeledBottomRightY = dragHeight * 2 + activeSticker.y - clamp(leftDeformer, -dragHeight, dragHeight);   //left deformer is raising the peeled depending on x
    let peeledBottomLeftY = dragHeight * 2 + activeSticker.y - clamp(rightDeformer, -dragHeight, dragHeight);

    var rightLength = Math.floor(Math.hypot(activeSticker.endX - peeledRect.bottomRightx, peeledRect.topRighty - peeledRect.bottomRighty)); 
    // console.log("length of right side is: " + rightLength);

    var leftLength = Math.floor(Math.hypot(activeSticker.x - peeledRect.bottomLeftx, peeledRect.topLefty - peeledRect.bottomLefty));

    // console.log("right side is: " + rightLength + " left side is: " + leftLength);

        // btmRightxDeformer = clamp(xMovement, -dragHeight, dragHeight);

    if (rightLength < activeSticker.h){  // right length x deformer
        // console.log("rightlength is less then sticker height", btmRightxDeformer);
        btmRightxDeformer = clamp(xMovement, -dragHeight, dragHeight);
    }
    else{
        btmRightxDeformer = clamp(xMovement, -dragHeight, dragHeight);
        // let bottomrightYhorizontaldeformer = btmRightxDeformer;
    }


    if (leftLength < activeSticker.h){  //left length x deformer

        btmLeftxDeformer = clamp(xMovement, -dragHeight, dragHeight);
        // console.log("leftlength is less then sticker height", btmLeftxDeformer, " < ",  activeSticker.h);
    }
    else{
                // console.log("leftlength BIGGER ", btmLeftxDeformer, activeSticker.h);
        // btmLeftxDeformer = clamp(xMovement, -dragHeight, dragHeight);
        // btmLeftxDeformer = 0;
        // btmLeftxDeformer = activeSticker.h;
    }

    // activeSticker.h is the computed max value
    // what is the max value for btmLeftXDeformer, to make the leftLength = activeSticker.h
    // length is calculated using the btmRightLeftXDeformer variable. we need to compare the result of leftLength with activeSticker as a constraint


    
    // var leftLength = Math.floor(Math.hypot(activeSticker.x - (peeledRect.bottomLeftx), peeledRect.topLefty - peeledRect.bottomLefty));

    // let btmLeftMax = activeSticker.x btmLeftxDeformer

//here we set the peeled rect coordinates. 
            // console.log('drag', dragHeight, dragHeight/2,peeledRect.topRighty, activeSticker.endY);

    if (peeledRect.topRighty >= activeSticker.endY){
        console.log('yhorizontaldeformer set', dragHeight, activeSticker.y);
        yhorizontaldeformer = clamp(Math.abs(btmRightxDeformer), -activeSticker.y, activeSticker.y)
    }
    else{
        yhorizontaldeformer = 0;
    }

    // console.log(yhorizontaldeformer)
    
    peeledRect.bottomRighty = clamp(peeledBottomRightY, 0, (activeSticker.endY * 2 - activeSticker.y)) - yhorizontaldeformer;
    peeledRect.bottomLefty = clamp(peeledBottomLeftY, 0, (activeSticker.endY * 2 - activeSticker.y)) - Math.abs(btmLeftxDeformer);

    peeledRect.bottomRightx = activeSticker.endX + clamp(btmRightxDeformer, -activeSticker.h, activeSticker.h);
    peeledRect.bottomLeftx = activeSticker.x + clamp(btmLeftxDeformer, -activeSticker.h, activeSticker.h); //these min + max values need to be variables, dependent on the left Length
    // console.log(yhorizontaldeformer);

    // let btmRightxDeformer = clamp(xMovement, -dragHeight, dragHeight);


    // work out the length of the side - distance between two vectors using pythagoras theorem
    //  a = x1 - x2, b = y1 - y2;
    //  var c = Math.sqrt( a*a + b*b );


    //sticker shadow
    let bottomright = dragHeight + activeSticker.y + rightDeformer * 0.8 * dragHeight * 0.01;
    let bottomleft = dragHeight + activeSticker.y + leftDeformer * 0.8 * dragHeight * 0.01;

    shadowRect.bottomRighty = clamp(bottomright, 0, activeSticker.endY);
    shadowRect.bottomLefty = clamp(bottomleft, 0, activeSticker.endY);
}


function returnStickerAnimation() {
    peeledRect.bottomRighty = lerp(peeledRect.bottomRighty, activeSticker.y, 0.05);
    peeledRect.bottomRightx = lerp(peeledRect.bottomRightx, activeSticker.endX, 0.05);
    peeledRect.topRighty = lerp(peeledRect.topRighty, activeSticker.y, 0.05);

    peeledRect.bottomLefty = lerp(peeledRect.bottomLefty, activeSticker.y, 0.05);
    peeledRect.bottomLeftx = lerp(peeledRect.bottomLeftx, activeSticker.x, 0.05);
    peeledRect.topLefty = lerp(peeledRect.topLefty, activeSticker.y, 0.05);

    shadowRect.bottomRighty = lerp(shadowRect.bottomRighty, activeSticker.y, 0.05);
    shadowRect.bottomLefty = lerp(shadowRect.bottomLefty, activeSticker.y, 0.05);

    var refresh = setTimeout(function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw();
    }, 10);
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end
}

function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}
resizeCanvas();