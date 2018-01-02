'use strict';

//////////////////////////////////////////////
var ijnid = 0;

var aniTime = 50;
var initalPlacement = 10;
//number of body parts plus head
//higher number = longer initial snake = harder
var difficulty = 20;
var snakePartSize = 10;
var moveDist = snakePartSize;
var LEFT = 'left';
var RIGHT = 'right';
var UP = 'up';
var DOWN = 'down';
var currentDirection = RIGHT;
var previousDirection = currentDirection;

var snakeHead = null;
var snakeClasses = ['snake_head', 'snake_body', 'snake_tail'];
var snakeParts = [];

var gameBoard = document.getElementById('gamebg');
var gamebgW = gameBoard.offsetWidth;
var gamebgH = gameBoard.offsetHeight;

var animationInterval = null;

var init = function init() {
    document.addEventListener('keydown', handleArrowKeys, false);
    makeSnake();
    positionSnake();
    initSnake();
    animationInterval = setInterval(animationHandler, aniTime);
};

var makeSnake = function makeSnake() {
    for (var i = 0; i < difficulty; i++) {
        var classname = snakeClasses[1];
        if (i === 0) {
            classname = snakeClasses[0];
            snakeHead = makeElement('div', 'snake ' + classname);
            continue;
        }
        snakeParts.push(makeElement('div', 'snake ' + classname));
    }
};

var makeElement = function makeElement(type, classes) {
    var theElem = document.createElement(type);
    theElem.classList = classes;
    //console.log('making an element: ', theElem);
    return theElem;
};

var positionSnake = function positionSnake() {
    snakeHead.style.top = initalPlacement + 'px';
    snakeHead.style.left = difficulty * initalPlacement + 'px';
    snakeParts.forEach(function (item, index) {
        item.style.top = initalPlacement + 'px';
        item.style.left = difficulty * initalPlacement - (index + 1) * snakePartSize + 'px';
    });
};

var initSnake = function initSnake() {
    gameBoard.appendChild(snakeHead);
    snakeParts.forEach(function (item, index) {
        gameBoard.appendChild(item);
    });
};

var addSnakePart = function addSnakePart() {
    //create new body part and add to array
    snakeParts.splice(snakeParts.length - 1, 0, makeElement('div', 'snake ' + snakeClasses[1]));
    //new body part takes place of old tail
    snakeParts[snakeParts.length - 2].style.top = snakeParts[snakeParts.length - 1].style.top;
    snakeParts[snakeParts.length - 2].style.left = snakeParts[snakeParts.length - 1].style.left;
    //tail moves to rear
    switch (currentDirection) {
        case UP:
            // up
            snakeParts[snakeParts.length - 1].style.top = Number(parseInt(snakeParts[snakeParts.length - 1].style.top, 10) + moveDist) + 'px';
            break;
        case RIGHT:
            // right
            snakeParts[snakeParts.length - 1].style.left = Number(parseInt(snakeParts[snakeParts.length - 1].style.left, 10) - moveDist) + 'px';
            break;
        case DOWN:
            // down
            snakeParts[snakeParts.length - 1].style.top = Number(parseInt(snakeParts[snakeParts.length - 1].style.top, 10) - moveDist) + 'px';
            break;
        case LEFT:
            // left
            snakeParts[snakeParts.length - 1].style.left = Number(parseInt(snakeParts[snakeParts.length - 1].style.left, 10) + moveDist) + 'px';
            break;
        default:
    }
    gameBoard.appendChild(snakeParts[snakeParts.length - 2]);
};

var animationHandler = function animationHandler() {
    /////////////////////////////////////////////////////////
    if (ijnid === 20) {
        addSnakePart();
        ijnid = 0;
    }

    var upMove = Number(parseInt(snakeHead.style.top, 10) - moveDist);
    var rightMove = Number(parseInt(snakeHead.style.left, 10) + moveDist);
    var downMove = Number(parseInt(snakeHead.style.top, 10) + moveDist);
    var leftMove = Number(parseInt(snakeHead.style.left, 10) - moveDist);

    var previousHeadSpot = { top: snakeHead.style.top, left: snakeHead.style.left };

    var collisionDetected = checkCollision(snakeHead);
    console.warn('ijnid ', collisionDetected);
    if (rightMove + snakeHead.offsetWidth - moveDist >= gamebgW || snakeHead.offsetLeft < 1 || downMove + snakeHead.offsetHeight - moveDist >= gamebgH || snakeHead.offsetTop < 1 || collisionDetected) {
        //out of bounds or hit itself so game over
        handleGameOver();
    } else {
        // snake is moving
        switch (currentDirection) {
            case UP:
                // up
                snakeHead.style.top = upMove + 'px';
                break;
            case RIGHT:
                // right
                snakeHead.style.left = rightMove + 'px';
                break;
            case DOWN:
                // down
                snakeHead.style.top = downMove + 'px';
                break;
            case LEFT:
                // left
                snakeHead.style.left = leftMove + 'px';
                break;
            default:
        }
        updateBodyPos(previousHeadSpot);
    }

    //////////////////////////////////
    ijnid++;
};

var checkCollision = function checkCollision(item) {
    var collisionDetected = false;
    var snakeHeadProps = item.getBoundingClientRect();

    for (var i = 2; i < snakeParts.length; i++) {
        var bodyPartProps = snakeParts[i].getBoundingClientRect();
        collisionDetected = !(snakeHeadProps.y + snakeHeadProps.height < bodyPartProps.y || snakeHeadProps.y > bodyPartProps.y + bodyPartProps.height || snakeHeadProps.x + snakeHeadProps.width < bodyPartProps.x || snakeHeadProps.x > bodyPartProps.x + bodyPartProps.width);
        if (collisionDetected) return collisionDetected;
    }
    return collisionDetected;
};

var updateBodyPos = function updateBodyPos(prevPos) {
    snakeParts[snakeParts.length - 1].classList = 'snake snake_body';
    snakeParts.splice(0, 0, snakeParts.pop());
    snakeParts[snakeParts.length - 1].classList = 'snake snake_tail';
    snakeParts[0].style.top = prevPos.top;
    snakeParts[0].style.left = prevPos.left;
};

var handleArrowKeys = function handleArrowKeys(evt) {
    var theKeyCode = evt.keyCode;
    switch (theKeyCode) {
        case 37:
            // left
            if (currentDirection === LEFT || currentDirection === RIGHT) {
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = LEFT;
            break;
        case 38:
            // up
            if (currentDirection === UP || currentDirection === DOWN) {
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = UP;
            break;
        case 39:
            // right
            if (currentDirection === LEFT || currentDirection === RIGHT) {
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = RIGHT;
            break;
        case 40:
            // down
            if (currentDirection === UP || currentDirection === DOWN) {
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = DOWN;
            break;
        default:
    }
};

var handleGameOver = function handleGameOver() {
    clearInterval(animationInterval);
    document.removeEventListener('keydown', handleArrowKeys);
    gameBoard.innerHTML = 'GAME OVER';
};

// get the game started
init();
