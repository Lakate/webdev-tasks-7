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
