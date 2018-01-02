'use strict';
//////////////////////////////////////////////
let ijnid = 0;

const aniTime = 50;
const initalPlacement = 10;
//number of body parts plus head
//higher number = longer initial snake = harder
const difficulty = 20;
const snakePartSize = 10;
const moveDist = snakePartSize;
const LEFT = 'left';
const RIGHT = 'right';
const UP = 'up';
const DOWN = 'down';
let currentDirection = RIGHT;
let previousDirection = currentDirection;

let snakeHead = null;
let snakeClasses = ['snake_head','snake_body','snake_tail'];
let snakeParts = [];

const gameBoard = document.getElementById('gamebg');
let gamebgW = gameBoard.offsetWidth;
let gamebgH = gameBoard.offsetHeight;

let animationInterval = null;
let countdownTimerInterval = null;
let instructionsTime = 10;

const yesButton = document.getElementById('yesBtn');
const noButton = document.getElementById('noBtn');
const welcomeModal = document.getElementById('welcome');
const welcomeContent = document.getElementById('welcomeTxt');

const yesButtonHandler = (evt) => {
    cleanUpWelcomeButtons();
    welcomeContent.innerHTML = 'SNAKE is a game where you move a snake around the<br/> \
                                screen with your arrow buttons.</p> \
                                If you eat food, the snake will grow longer.<br/> \
                                If the snake touches any edges of the game area<br/> \
                                OR<br/> \
                                if the snake runs into itself...<br/> \
                                it is GAME OVER.<br/> \
                                <p><span>READY PLAYER ONE</span></p> \
                                <span style="font-size:12px">[coming soon to a theatre near you this Spring]</span><br/> \
                                <span id="countdownTxt">'+instructionsTime+'</span>';
    countdownTimerInterval = setInterval(countdownTimer, 1000);
};

const countdownTimer = () => {
    instructionsTime--;
    document.getElementById('countdownTxt').innerHTML = instructionsTime;
    if(instructionsTime === 0){
        clearInterval(countdownTimerInterval);
        welcomeModal.style.display = 'none';
        // get the game started
        init();
    }
};

const noButtonHandler = (evt) => {
    cleanUpWelcomeButtons();
    welcomeContent.innerHTML = '<span>OK - Bye</span>';
    setTimeout(() => {window.location.href = 'https://www.squarespace.com/';}, 1000);
};

yesButton.addEventListener('click', yesButtonHandler, false);
noButton.addEventListener('click', noButtonHandler, false);

const cleanUpWelcomeButtons = () => {
    yesButton.removeEventListener('click', yesButtonHandler);
    noButton.removeEventListener('click', noButtonHandler);
};

const init = () => {
    document.addEventListener('keydown', handleArrowKeys, false);
    makeSnake();
    positionSnake();
    initSnake();
    animationInterval = setInterval(animationHandler, aniTime);
}

const makeSnake = () => {
    for(let i = 0; i < difficulty; i++){
        let classname = snakeClasses[1];
        if(i === 0){
            classname = snakeClasses[0];
            snakeHead = makeElement('div', 'snake '+classname);
            continue;
        }
        snakeParts.push(makeElement('div', 'snake '+classname));
    }
};

const makeElement = (type, classes) => {
    let theElem = document.createElement(type);
    theElem.classList = classes;
    //console.log('making an element: ', theElem);
    return theElem;
};

const positionSnake = () => {
    snakeHead.style.top = initalPlacement+'px';
    snakeHead.style.left = (difficulty*initalPlacement)+'px';
    snakeParts.forEach((item, index) => {
        item.style.top = initalPlacement+'px';
        item.style.left = ((difficulty*initalPlacement)-((index+1)*snakePartSize))+'px';
    });
};

const initSnake = () => {
    gameBoard.appendChild(snakeHead);
    snakeParts.forEach((item, index) => {
        gameBoard.appendChild(item);
    });
};

const addSnakePart = () => {
    //create new body part and add to array
    snakeParts.splice(snakeParts.length-1, 0, makeElement('div', 'snake '+snakeClasses[1]));
    //new body part takes place of old tail
    snakeParts[snakeParts.length-2].style.top = snakeParts[snakeParts.length-1].style.top;
    snakeParts[snakeParts.length-2].style.left = snakeParts[snakeParts.length-1].style.left;
    //tail moves to rear
    switch(currentDirection) {
        case UP: // up
            snakeParts[snakeParts.length-1].style.top = Number(parseInt(snakeParts[snakeParts.length-1].style.top, 10)+moveDist)+'px';
            break;
        case RIGHT: // right
            snakeParts[snakeParts.length-1].style.left = Number(parseInt(snakeParts[snakeParts.length-1].style.left, 10)-moveDist)+'px';
            break;
        case DOWN: // down
            snakeParts[snakeParts.length-1].style.top = Number(parseInt(snakeParts[snakeParts.length-1].style.top, 10)-moveDist)+'px';
            break;
        case LEFT:  // left
            snakeParts[snakeParts.length-1].style.left = Number(parseInt(snakeParts[snakeParts.length-1].style.left, 10)+moveDist)+'px';
            break;
        default:
    }
    gameBoard.appendChild(snakeParts[snakeParts.length-2]);
};

const animationHandler = () => {
/////////////////////////////////////////////////////////
    if(ijnid === 20){
        addSnakePart();
        ijnid = 0;
    }
  

    const upMove = Number(parseInt(snakeHead.style.top, 10)-moveDist);
    const rightMove = Number(parseInt(snakeHead.style.left, 10)+moveDist);
    const downMove = Number(parseInt(snakeHead.style.top, 10)+moveDist);
    const leftMove = Number(parseInt(snakeHead.style.left, 10)-moveDist);

    const previousHeadSpot = {top: snakeHead.style.top, left: snakeHead.style.left};

    let collisionDetected = checkCollision(snakeHead);

    if ((rightMove+snakeHead.offsetWidth-moveDist) >= gamebgW 
        || snakeHead.offsetLeft < 1
        || (downMove+snakeHead.offsetHeight-moveDist) >= gamebgH
        || snakeHead.offsetTop < 1
        || collisionDetected
    ){
        //out of bounds or hit itself so game over
        handleGameOver();
    }
    else{
        // snake is moving
        switch(currentDirection) {
            case UP: // up
                snakeHead.style.top = upMove+'px';
                break;
            case RIGHT: // right
                snakeHead.style.left = rightMove+'px';
                break;
            case DOWN: // down
                snakeHead.style.top = downMove+'px';
                break;
            case LEFT:  // left
                snakeHead.style.left = leftMove+'px';
                break;
            default:
        }
        updateBodyPos(previousHeadSpot);
    }

//////////////////////////////////
    ijnid++;
};

const checkCollision = (item) => {
    let collisionDetected = false;
    let snakeHeadProps = item.getBoundingClientRect();

    for(let i = 2; i < snakeParts.length; i++){
        let bodyPartProps = snakeParts[i].getBoundingClientRect();
        collisionDetected = !(
            ((snakeHeadProps.y + snakeHeadProps.height) < (bodyPartProps.y)) ||
            (snakeHeadProps.y > (bodyPartProps.y + bodyPartProps.height)) ||
            ((snakeHeadProps.x + snakeHeadProps.width) < bodyPartProps.x) ||
            (snakeHeadProps.x > (bodyPartProps.x + bodyPartProps.width))
        );
        if(collisionDetected) return collisionDetected;   
    }
    return collisionDetected
};

const updateBodyPos = (prevPos) => {
    snakeParts[snakeParts.length-1].classList = 'snake snake_body';
    snakeParts.splice(0, 0, snakeParts.pop());
    snakeParts[snakeParts.length-1].classList = 'snake snake_tail';
    snakeParts[0].style.top = prevPos.top;
    snakeParts[0].style.left = prevPos.left;
};

const handleArrowKeys = (evt) => {
    let theKeyCode = evt.keyCode;
    switch(theKeyCode) {
        case 37:  // left
            if(currentDirection === LEFT || currentDirection === RIGHT){
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = LEFT;
            break;
        case 38: // up
            if(currentDirection === UP || currentDirection === DOWN){
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = UP;
            break;
        case 39: // right
            if(currentDirection === LEFT || currentDirection === RIGHT){
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = RIGHT;
            break;
        case 40: // down
            if(currentDirection === UP || currentDirection === DOWN){
                //already going that way or can't go back on itself
                break;
            }
            previousDirection = currentDirection;
            currentDirection = DOWN;
            break;
        default:
    }
};

const handleGameOver = () => {
    clearInterval(animationInterval);
    document.removeEventListener('keydown', handleArrowKeys);
    gameBoard.innerHTML = '<div id="gameOver">game over</div>';
};