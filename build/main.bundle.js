'use strict';
//snake game
//author: Drew Rogers
//date: 01/03/2018

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var aniTime = 50;
var initalPlacement = 10;
//number of body parts plus head
//higher number = longer initial snake = harder
var difficulty = 50;
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

var foodSpacingCol = 50;
var foodSpacingRow = 40;
var foodWidth = snakePartSize;
var foodRowCount = 1;
//will run to animate snake
var animationInterval = null;
//will run to count down start of game during instructions
var countdownTimerInterval = null;
//how long to show instructions - can be skipped via link below countdown
var instructionsTime = 10;
//pre-game screen stuff
var yesButton = document.getElementById('yesBtn');
var noButton = document.getElementById('noBtn');
var welcomeModal = document.getElementById('welcome');
var welcomeContent = document.getElementById('welcomeTxt');
//if you choose to play a game, instruction screen countdown appears before game start
var yesButtonHandler = function yesButtonHandler(evt) {
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
                                <span id="countdownTxt">' + instructionsTime + '</span><br/> \
                                <span id="skipCountdown">play now</span>';
    document.getElementById('skipCountdown').addEventListener('click', playGame, false);
    countdownTimerInterval = setInterval(countdownTimer, 1000);
};

var countdownTimer = function countdownTimer() {
    instructionsTime--;
    document.getElementById('countdownTxt').innerHTML = instructionsTime;
    if (instructionsTime === 0) {
        playGame();
    }
};
//cleans up instruction stuff and initializes the game
var playGame = function playGame() {
    document.getElementById('skipCountdown').removeEventListener('click', playGame);
    clearInterval(countdownTimerInterval);
    welcomeModal.style.display = 'none';
    //get the game started
    init();
};

var noButtonHandler = function noButtonHandler(evt) {
    cleanUpWelcomeButtons();
    welcomeContent.innerHTML = '<span>OK - Bye</span>';
    setTimeout(function () {
        window.location.href = 'https://www.squarespace.com/';
    }, 1000);
};

yesButton.addEventListener('click', yesButtonHandler, false);
noButton.addEventListener('click', noButtonHandler, false);

var cleanUpWelcomeButtons = function cleanUpWelcomeButtons() {
    yesButton.removeEventListener('click', yesButtonHandler);
    noButton.removeEventListener('click', noButtonHandler);
};
//creates a DOM element og type passed in and adds passed in class names
var makeElement = function makeElement(type, classes) {
    var theElem = document.createElement(type);
    theElem.classList = classes;
    return theElem;
};
//creates and places food, creates snake and begins moving
var init = function init() {
    document.addEventListener('keydown', handleArrowKeys, false);
    makeFood();
    makeSnake();
    positionSnake();
    initSnake();
    animationInterval = setInterval(animationHandler, aniTime);
};
//creates food squares and lays them out on game screen in a mildly random chekerboard-like pattern
var makeFood = function makeFood() {
    for (var i = 0; i < gamebgH; i = i + (foodWidth + foodSpacingRow)) {
        for (var j = 0; j < gamebgW; j = j + (foodWidth + foodSpacingCol)) {
            var food = makeElement('div', 'food');
            food.style.width = foodWidth + 'px';
            food.style.height = foodWidth + 'px';
            food.style.top = i + 'px';
            // randomize alternate row positions a bit
            if (isEven(foodRowCount)) {
                var ranNum = Math.floor(Math.random() * (foodSpacingCol - 2 + 1) + 2);
                food.style.left = j + ranNum + 'px';
            } else {
                food.style.left = j + 'px';
            }
            gameBoard.appendChild(food);
        }
        foodRowCount++;
    }
};

var isEven = function isEven(n) {
    return n % 2 == 0;
};
//creates snake segments, head and tail in an array
//length of initial snake depends on 'difficulty' const
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
//positions snake parts to near top of game screen from r to l starting with head
//tail ending near left edge of screen
var positionSnake = function positionSnake() {
    snakeHead.style.top = initalPlacement + 'px';
    snakeHead.style.left = difficulty * initalPlacement + 'px';
    snakeParts.forEach(function (item, index) {
        item.style.top = initalPlacement + 'px';
        item.style.left = difficulty * initalPlacement - (index + 1) * snakePartSize + 'px';
    });
};
//adds snake parts to DOM
var initSnake = function initSnake() {
    gameBoard.appendChild(snakeHead);
    snakeParts.forEach(function (item, index) {
        gameBoard.appendChild(item);
    });
};
//adds a new snake body segment when food is eaten, pushing tail back to make snake grow longer
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
//interval handler - moves snake head according to arrow keys
//checks for collisions with itself and edges and ends game if so
var animationHandler = function animationHandler() {
    var upMove = Number(parseInt(snakeHead.style.top, 10) - moveDist);
    var rightMove = Number(parseInt(snakeHead.style.left, 10) + moveDist);
    var downMove = Number(parseInt(snakeHead.style.top, 10) + moveDist);
    var leftMove = Number(parseInt(snakeHead.style.left, 10) - moveDist);

    var previousHeadSpot = { top: snakeHead.style.top, left: snakeHead.style.left };

    var eatFood = checkFoodCollision(snakeHead);
    if (eatFood) addSnakePart();
    var collisionDetected = checkCollision(snakeHead);

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
};
//loops through all remaining food objects on game board to detect if head has eaten one
//removes food from board if eaten
var checkFoodCollision = function checkFoodCollision(item) {
    var collisionDetected = false;
    var snakeHeadProps = item.getBoundingClientRect();
    var allFoodElements = document.getElementsByClassName('food');
    var allFood = [].concat(_toConsumableArray(allFoodElements));
    for (var i = 0; i < allFood.length; i++) {
        var foodProps = allFood[i].getBoundingClientRect();
        collisionDetected = !(snakeHeadProps.y + snakeHeadProps.height < foodProps.y || snakeHeadProps.y > foodProps.y + foodProps.height || snakeHeadProps.x + snakeHeadProps.width < foodProps.x || snakeHeadProps.x > foodProps.x + foodProps.width);
        if (collisionDetected) {
            gameBoard.removeChild(allFood[i]);
            return collisionDetected;
        }
    }
    return collisionDetected;
};
//loops through all body segments [after first few since head can't really collide with those]
//detects and returns if head is in collision with any
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
//after head moves, this takes tail and moves it to old head position
//simulates animation of all body parts. switches styles from tail to regular body part
//and new last body part styled as tail
var updateBodyPos = function updateBodyPos(prevPos) {
    snakeParts[snakeParts.length - 1].classList = 'snake snake_body';
    snakeParts.splice(0, 0, snakeParts.pop());
    snakeParts[snakeParts.length - 1].classList = 'snake snake_tail';
    snakeParts[0].style.top = prevPos.top;
    snakeParts[0].style.left = prevPos.left;
};
//listens for arrow keys and reports which direction snake should move in
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
//if snake collides with edges or itself, this cleans up game and displays a game over screen
var handleGameOver = function handleGameOver() {
    clearInterval(animationInterval);
    document.removeEventListener('keydown', handleArrowKeys);
    gameBoard.innerHTML = '<div id="gameOver">game over</div> \
                    <div id="replayBtn">replay</div>';
    document.getElementById('replayBtn').addEventListener('click', function (evt) {
        window.location.reload();
    }, false);
};
