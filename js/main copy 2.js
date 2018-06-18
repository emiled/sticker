var canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d'),
    bgRectangle = new Path2D(),

    // s t i c k e r    d i m e n s i o n s 

    startX = 200,
    startY = 100,
    stickerWidth = 300,
    stickerHeight = 200,


    // startX,
    // startY,
    // stickerWidth,
    // stickerHeight,

    stickerId = [], //delete
    rect = {},
    shadowRect = {},
    peeledRect = {
        bottomRightx: 0,
        bottomRighty: 0,
        bottomLeftx: 0,
        bottomLefty: 0
    },
    // originalRightX = activeSticker.x + activeSticker.endX,
    originalRightY = startY, //delete
    dragHeight,
    drag = false,
    leftDeformer, rightDeformer,
    stickerCounter = 0,
    startinit = true,
    newSticker;


init();

class Sticker {
    constructor(startX, startY, width, height) {
        this.x = startX;
        this.y = startY;
        this.w = width;
        this.h = height;
        // this.endx = startX+ width;
        // this.endy = startY+ width;
    }
}


function init() {
    bgRectangle.rect(startX, startY, stickerWidth, stickerHeight); //draw bg
    // draw();
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
}



var baseWidth = 0,
    baseHeight = 0;
var stickerContainer = [];
var activeSticker;
var newRun;

function checkforExistingSticker(mouseX, mouseY) {
    for (i = 0; i < stickerContainer.length; i++) {

        // console.log('startX for ' + i +' is: ',stickerContainer[i].x, 'MouseX is: ',mouseX, 'endX is: ',stickerContainer[i].endX);
        // console.log("(", mouseX, stickerContainer[i].endX, "),(", mouseY, stickerContainer[i].endY, ")");
        if (mouseX >= stickerContainer[i].x && mouseX <= stickerContainer[i].endX || mouseX <= stickerContainer[i].x && mouseX >= stickerContainer[i].endX) {
            // console.log('first pass');
            if (mouseY >= stickerContainer[i].y && mouseY <= stickerContainer[i].endY || mouseY <= stickerContainer[i].y && mouseY >= stickerContainer[i].endY) {
                // console.log('starty for ' + i +' is: ',stickerContainer[i].y, 'Mousey is: ',mouseY,'endX is: ',stickerContainer[i].endY);
                // console.log("I N S I D E ****", i);
                return i; //
            }
        }
    }
}

function mouseDown(e) {
    drag = true;
    startX = e.pageX;
    startY = e.pageY;

    // checkforExistingSticker(startX, startY);
    let stickerHit = checkforExistingSticker(e.pageX, e.pageY);
    if (stickerHit == null) { //create new sticker
        newSticker = true;
        console.log("create a new sticker");
        stickerCounter++;
        // currentSticker = 'sticker'+stickerCounter;
        stickerContainer.push(new Sticker(startX, startY, baseWidth, baseHeight));
    } else {
        newSticker = false;
        newRun = true;
        activeSticker = stickerContainer[stickerHit];
        console.log('the sticker to investigate is: ', activeSticker)
        shadowRect.bottomRighty = activeSticker.y;
        shadowRect.bottomLefty = activeSticker.y;


    };
}

function mouseUp() {
    // console.log('mouseUp');
    if (drag) { //if we've been dragging set the end coordinates
        stickerContainer[stickerCounter - 1].endX = startX + baseWidth;
        stickerContainer[stickerCounter - 1].endY = startY + baseHeight;
    }
    drag = false;
    draw();
}

function mouseMove(e) {
    if (drag) {
        if (newSticker) {
            baseWidth = e.pageX - startX;
            baseHeight = e.pageY - startY;
            let currentSticker = stickerCounter - 1;
            stickerContainer[currentSticker].w = e.pageX - startX;
            stickerContainer[currentSticker].h = e.pageY - startY;
            ctx.fillRect(stickerContainer[currentSticker].x, stickerContainer[currentSticker].y, stickerContainer[currentSticker].w, stickerContainer[currentSticker].h);
        } else { // activeSticker
        	if (newRun){
        		offsetTop = (e.pageY - activeSticker.y);
        		offsetLeft = (e.pageX - activeSticker.x);
        		newRun = false;
        	}

            dragHeight = clamp(((e.pageY -  offsetTop) - activeSticker.y), 0, (activeSticker.endY + activeSticker.y));
            console.log('dragHeight',dragHeight);
            if (dragHeight < 0) {
                dragHeight = 0;
            }

            calculateDeformation(e);
            draw();
        }
    }
}



function calculateDeformation(e) {
    xMovement =  (e.pageX -  offsetLeft) - activeSticker.x;
        console.log('xMovement', xMovement )

    //x deformers: 
    if (xMovement >= 0) {
        leftDeformer = xMovement;
        rightDeformer = 0
    } else {
        rightDeformer = Math.abs(xMovement);
        leftDeformer = 0
    };




    let peeledBottomRightY = dragHeight * 2 + 100 - clamp(leftDeformer, -dragHeight, dragHeight);
    let peeledBottomLeftY = dragHeight * 2 + 100 + clamp(xMovement, -dragHeight, dragHeight);


    if (peeledRect.topRighty < (activeSticker.endY + activeSticker.y)) { //if we're inside the height ************************
        peeledRect.bottomRightx = clamp(xMovement, -dragHeight, dragHeight) + (activeSticker.x + activeSticker.endX);
        // console.log('inside', dragHeight)
    } else {
        peeledRect.bottomRightx = clamp(xMovement, -dragHeight / 2, dragHeight / 2) + (activeSticker.x + activeSticker.endX);
    }
    // console.log("xMovement is: "+ xMovement);
    // console.log("dragheight is: "+ dragHeight);
    // console.log("originalRightX is: "+ originalRightX); 
    // console.log("peeledRect.bottomRightx is: "+ (peeledRect.bottomRightx - originalRightX));
    peeledRect.bottomRightx = clamp(xMovement, -dragHeight, dragHeight) + (activeSticker.x + activeSticker.endX);
    peeledRect.bottomRighty = clamp(peeledBottomRightY, 0, activeSticker.endY * 2 + activeSticker.y);

    //peeled bottomLeftX
    peeledRect.bottomLeftx = clamp(xMovement, -dragHeight, dragHeight) + activeSticker.x;
    peeledRect.bottomLefty = clamp(peeledBottomLeftY, 0, activeSticker.endY * 2 + activeSticker.y)


    //peeled topRighty
    let topRight = dragHeight + activeSticker.y + rightDeformer * 0.8 * dragHeight * 0.01;
    peeledRect.topRighty = clamp(topRight, 0, activeSticker.endY + activeSticker.y);

    //topLeft

    let topleft = dragHeight + activeSticker.y + leftDeformer * 0.8 * dragHeight * 0.01;
    peeledRect.topLefty = clamp(topleft, 0, activeSticker.endY + activeSticker.y)


    //shadow ****** ... *******
    let bottomright = dragHeight + activeSticker.y + rightDeformer * 0.8 * dragHeight * 0.01;
    let bottomleft = dragHeight + activeSticker.y + leftDeformer * 0.8 * dragHeight * 0.01;

    shadowRect.bottomRighty = clamp(bottomright, 0, activeSticker.endY + activeSticker.y);
    shadowRect.bottomLefty = clamp(bottomleft, 0, activeSticker.endY + activeSticker.y);
}







function draw() {

    if (activeSticker != null) {

        ctx.fillStyle = '#11f7b0';
        ctx.fill(bgRectangle);

        ctx.beginPath(); //SHADOW STICKER
        ctx.moveTo(activeSticker.x, activeSticker.y); //TOP LEFT
        ctx.lineTo((activeSticker.x + activeSticker.endX), activeSticker.y); //TOP RIGHT
        ctx.lineTo((activeSticker.x + activeSticker.endX), shadowRect.bottomRighty); //BOTTOM RIGHT
        ctx.lineTo(activeSticker.x, shadowRect.bottomLefty); //BOTTOM LEFT
        ctx.closePath();
        // ctx.stroke();
        ctx.fillStyle = "#d4ffee";
        ctx.fill();



        //

        ctx.beginPath(); ////front STICKER
        ctx.moveTo(startX, peeledRect.topLefty); //TOP LEFT
        ctx.lineTo((activeSticker.x + activeSticker.endX), peeledRect.topRighty); //TOP RIGHT
        ctx.lineTo(peeledRect.bottomRightx, peeledRect.bottomRighty); //BOTTOM RIGHT
        ctx.lineTo(peeledRect.bottomLeftx, peeledRect.bottomLefty); //BOTTOM LEFT
        ctx.closePath();
        // ctx.stroke();
        ctx.fillStyle = "#0a5639";
        ctx.fill();
        // bgRectangle.rect(60,100,800,600);

        // ctx.trapezoid(x, y, w, h)
        // var refresh = setInterval(frame, 10);
        var refresh;
        // var id = window.setInterval(play_ani_clickthese, 3000);
        // clearInterval(id);


        if (!drag) { //mouse up
            // console.log('drags false');
            if (peeledRect.bottomRighty > 101) {
                // console.log("bottom right isn't in starting pos");
                // console.log(" peeledRect.bottomRighty = " + peeledRect.bottomRighty + "originalRightY = " + originalRightY);
                peeledRect.bottomRighty = lerp(peeledRect.bottomRighty, activeSticker.y, 0.05);
                peeledRect.bottomRightx = lerp(peeledRect.bottomRightx, (activeSticker.x + activeSticker.endX), 0.05);
                peeledRect.topRighty = lerp(peeledRect.topRighty, activeSticker.y, 0.05);

                peeledRect.bottomLefty = lerp(peeledRect.bottomLefty, activeSticker.y, 0.05);
                peeledRect.bottomLeftx = lerp(peeledRect.bottomLeftx, activeSticker.x, 0.05);
                peeledRect.topLefty = lerp(peeledRect.topLefty, activeSticker.y, 0.05);

                shadowRect.bottomRighty = lerp(shadowRect.bottomRighty, activeSticker.y, 0.05);
                shadowRect.bottomLefty = lerp(shadowRect.bottomLefty, activeSticker.y, 0.05);
                // peeledRect.bottomRightx
                // ctx.clearRect(0, 0, canvas.width, canvas.height);
                // setInterval(function(){draw();}, 60);
                //Event handler
                // clearInterval = true;
                var refresh = setTimeout(function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    draw();
                }, 10);

                // clearInterval(refresh);



                // refresh();
            } else if (peeledRect.bottomRighty <= activeSticker.y + 1) {
                // console.log("we're done");
                // clearInterval(refresh);
                // clearInterval = false;
                // drag = true;
            }


        }
    }

}



function lerp(start, end, amt) {
    // console.log(start, end, amt);
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