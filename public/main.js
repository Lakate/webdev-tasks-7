const INITIAL_STATE = {
    energy: 100,
    mood: 100,
    satiety: 100
};

const STATUS_BOARD = {
    satiety: document.querySelector('.satiety-value'),
    mood: document.querySelector('.mood-value'),
    energy: document.querySelector('.energy-value')
};

'use strict';

function Hrundel (state) {
    this.state = state || Object.assign({}, INITIAL_STATE);
    this.action = 'nothing';
}

Hrundel.prototype.changeAction = function (newAction) {
    if (newAction !== 'nothing' && newAction !== 'satiety' && newAction !== 'mood' && newAction !== 'energy') {
        return;
    }
    if (this.action === 'nothing' || newAction === 'nothing') {
        this.action = newAction;
    }
};

Hrundel.prototype.changeParam = function () {
    Object.keys(this.state).forEach((function (key) {
        if (this.action === 'nothing') {
            this.state[key] = Math.max(0, this.state[key] - 1);
        } else if (key === this.action) {
            this.state[key] = Math.min(100, this.state[key] + 3);
        }
        setState(this.state);
    }).bind(this));

    if (this.action === 'nothing' || this.action === 'mood') {
        changeMood(this.state.mood);
    }
};

Hrundel.prototype.startCounter = function () {
    if (this.counterId) {
        return;
    }

    this.counterId = setInterval(this.changeParam.bind(this), 1000);
};

Hrundel.prototype.printState = function (statusBoard) {
    let zeroCounter = 0;

    Object.keys(this.state).forEach((function (key) {
        statusBoard[key].innerHTML = this.state[key];
        zeroCounter = this.state[key] === 0 ? zeroCounter + 1 : zeroCounter;
    }).bind(this));

    if (zeroCounter > 1) {
        tears.style.opacity = 1;
        dieLog.style.display = "block";
        speechLog.style.display = "none";
        this.die();
    }
};

Hrundel.prototype.startPrinter = function (statusBoard) {
    if (this.printerId) {
        return;
    }

    this.printerId = setInterval(this.printState.bind(this, statusBoard), 1000);
};

Hrundel.prototype.die = function () {
    clearInterval(hrun.counterId);
    clearInterval(hrun.printerId);
};
/**
 *  Работа восстановлением состояния
 */
function getStateFromCookie() {
    const satiety = Cookies.get('satiety');
    const energy = Cookies.get('energy');
    const mood = Cookies.get('mood');

    if (satiety && energy && mood) {
        return {
            satiety,
            energy,
            mood
        }
    }
}

/**
 *  Работа с сохранением и изменением состояния
 */
function setState(state) {
    Object.keys(state).forEach((function (key) {
        Cookies.set(key, state[key], { expires: 7});
    }));
}

/**
 *  Создание новой игры, начальные состояния всего
 */
let hrun;
let dieLog = document.querySelector('.die-log');
const tears = document.querySelector('#tears');

function newGame(state) {
    if (state) {
        hrun = new Hrundel(state);
    } else {
        hrun = new Hrundel();
    }

    hrun.startCounter();
    hrun.startPrinter(STATUS_BOARD);

    moveTail();
    tears.style.opacity = 0;
    dieLog.style.display = "none";
    speechLog.style.display = "block";
}

/**
 * Обработка кнопки возможности начать игру заново
 */
const buttonNewGame = document.querySelector('.begin-again');

buttonNewGame.addEventListener('click', () => {
    setState(INITIAL_STATE);

    hrun.die();
    newGame();
});

/**
 * Обработка кнопки возможности покормить хрюнделя
 */
const buttonGiveFood = document.querySelector('.give-food');
let eatId;

buttonGiveFood.addEventListener('click', () => {
    eatId = haveDinner();
    hrun.changeAction('satiety');

    let dinnerId = setInterval(function () {
        if (hrun.state.satiety === 100) {
            hrun.changeAction('nothing');
            stopEating(eatId);
            clearInterval(dinnerId);
        }
    }, 1000);
});

/**
 * Питание хрюнделя
 */
if (navigator.getBattery) {
    navigator
        .getBattery()
        .then(initBattery);

    function initBattery(battery) {
        battery.onchargingchange = updateCharging;
        battery.onchargingchange();
    }

    function updateCharging() {
        if (this.charging) {
            hrun.changeAction('satiety');
            eatId = haveDinner();
        } else {
            hrun.changeAction('nothing');
            stopEating(eatId);
        }
    }
}

/**
 * Работа с разными вкладками
 *
 * Засыпать, когда вы уходите с вкладки и просыпаться когда вы возвращаетесь,
 * либо когда в комнате становится очень темно. При этом процесс засыпания и
 * пробуждения должен сопровождаться анимацией.
 * Во время сна восстанавливается энергия.
 */

let hidden = null;
let visibilityState  = null;
let visibilityChange = null;

if ('hidden' in document) {
    hidden = 'hidden';
    visibilityState  = 'visibilityState';
    visibilityChange = 'visibilitychange';
} else if ('mozHidden' in document) {
    hidden = 'mozHidden';
    visibilityState  = 'mozVisibilityState';
    visibilityChange = 'mozvisibilitychange';
} else if ('webkitHidden' in document) {
    hidden = 'webkitHidden';
    visibilityState  = 'webkitVisibilityState';
    visibilityChange = 'webkitvisibilitychange';
}

document.addEventListener(visibilityChange, function () {
    console.log([
        '----------------',
        'Hidden: ' + document[hidden],
        'State : ' + document[visibilityState],
        '----------------'
    ].join('\n'));
    if (document[hidden]) {
        sleepingHandler();
    } else {
        awakeHandler();
    }
});

const sleep = document.querySelector("#sleep");

function sleepingHandler() {
    hrun.changeAction('energy');
    sleep.style.opacity = 1;
}

function awakeHandler() {
    hrun.changeAction('nothing');
    sleep.style.opacity = 0;
}

/**
 * Распознование речи
 */
const speechLog = document.querySelector('.speech-log');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognizer = new SpeechRecognition();

recognizer.lang = 'en-US';
recognizer.continuous = true;

function stopTalkingHandler () {
    recognizer.stop();
    hrun.changeAction('nothing');
    speechLog.innerHTML = '<br>Click to start talking with me!';
}

speechLog.onclick = function () {
    speechLog.innerHTML = 'Let\'s go!';
    hrun.changeAction('mood');
    recognizer.start();

    let conversationId = setInterval(function () {
        if (hrun.state.mood === 100) {
            stopTalkingHandler();
            clearInterval(conversationId);
        }
    }, 1000);
};

recognizer.onresult = function (e) {
    const index = e.resultIndex;
    const result = e.results[index][0].transcript.trim();

    if (result.toLowerCase() === 'stop') {
        stopTalkingHandler();
    } else {
        speechLog.innerHTML = result;
        hrun.changeAction('mood');
    }
};

newGame(getStateFromCookie());


const hrundel = Snap("#hrundel");

/**
 *  Движение хвостиком
 * */
function moveTail() {
    const tail = Snap.select("#tail");

    setInterval(function () {
        tail.animate(
            { d: "M660,400 C680,405 675,405 670,408 C665,400 670,400 685,400" },
            300,
            function () {
                tail.animate(
                    { d: "M660,400 C680,395 675,395 670,400 C665,390 670,390 685,385" },
                    300
                )
            }
        )
    }, 800)
}

/**
 * Питание хрнделя
 */
const mouth = Snap.select("#mouth");
const coctail = document.querySelector('.eat');

function haveDinner() {

    coctail.style.opacity = 1;

    return setInterval(function () {
        mouth.animate(
            { d: "M523,406 C540,420 548,420 552,406" },
            300,
            function () {
                mouth.animate(
                    { d: "M540,416 543,416" },
                    300
                )
            }
        )
    }, 800)

}

function stopEating(eatId) {
    clearInterval(eatId);
    coctail.style.opacity = 0;
}

/**
 * Изменение настроения
 */
function changeMood (mood) {

    if (mood < 50) {
        animate(
            mouth,
            { d: "M523,410 L552,410" },
            300
        );
    }

    if (mood < 20) {
        animate(
            mouth,
            { d: "M523,416 C540,406 548,406 552,416" },
            300
        );
    }

    if (mood >= 50) {
        animate(
            mouth,
            { d: "M523,406 C540,420 548,420 552,406" },
            300
        );
    }
}

/**
 *  Слезы
 */
function moveTears () {
    const tearOne = Snap.select("#tear-1");
    const tearTwo = Snap.select("#tear-2");

    const statesForTearOne = [{
        d: "M565,385 C558,394 558,402 563,403 C566,404 566,404 567,403 C572,402 572,395 565,385",
        opacity: 1
    }, {
        d: "M565,425 C558,434 558,442 563,443 C566,444 566,444 567,443 C572,442 572,435 565,425",
        opacity: 0
    }, {
        d: "M565,385 C558,394 558,402 563,403 C566,404 566,404 567,403 C572,402 572,395 565,385",
        opacity: 0
    }];
    const statesForTearTwo = [{
        d: "M510,385 C503,394 503,402 508,403 C511,404 511,404 512,403 C517,402 517,395 510,385",
        opacity: 1
    }, {
        d: "M510,425 C503,434 503,442 508,443 C511,444 511,444 512,443 C517,442 517,435 510,425",
        opacity: 0
    }, {
        d: "M510,385 C503,394 503,402 508,403 C511,404 511,404 512,403 C517,402 517,395 510,385",
        opacity: 0
    }];

    animateManyStates(tearOne, statesForTearOne, 0);
    animateManyStates(tearTwo, statesForTearTwo, 0);
}

moveTears();

function moveSleepingZZZ () {
    const sleepingZ = Snap.select("#z");
    const sleepingZZ = Snap.select("#zz");
    const sleepingZZZ = Snap.select("#zzz");

    const statesForSlepingZ = [{
        "transform" : "t0 0",
        opacity: 1
    }, {
        "transform" : "t-10 -30",
        opacity: 0
    }, {
        "transform" : "t0 0",
        opacity: 0
    }];

    animateManyStates(sleepingZ, statesForSlepingZ, 0);
    animateManyStates(sleepingZZ, statesForSlepingZ, 0);
    animateManyStates(sleepingZZZ, statesForSlepingZ, 0);
}

moveSleepingZZZ();

function animate (obj, stateStart, delay) {
    obj.animate(
        stateStart,
        delay
    )
}

function animateManyStates(el, states, i) {
    el.animate(states[i], 1500, function() {
        animateManyStates(el, states, ++i in states ? i : 0);
    })
}
