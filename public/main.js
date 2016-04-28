'use script';

const hrundel = Snap("#hrundel");

function animateInterval(obj, stateStart, stateEnd, delay, interval) {
    setInterval(function () {
        obj.animate(
            stateStart,
            delay,
            function () {
                obj.animate(
                    stateEnd,
                    delay
                )
            }
        )
    }, interval)
}

function animate(obj, stateStart, delay) {
    obj.animate(
        stateStart,
        delay
    )
}

/**
*  Движение хвостиком
* */
function moveTail() {
    const tail = Snap.select("#tail");
    const interval = 800;
    const delay = 300;
    animateInterval(
        tail,
        { d: "M660,400 C680,405 675,405 670,408 C665,400 670,400 685,400" },
        { d: "M660,400 C680,395 675,395 670,400 C665,390 670,390 685,385" },
        delay,
        interval
    );
}

moveTail();

/**
 *  Работа с сохранением, восстановлением и изменением состояния
 */
let satiety = Cookies.get('satiety');
let energy = Cookies.get('energy');
let mood = Cookies.get('mood');
let isSatietyUp = false;
let isMoodUp = false;
let isEnergyUp = false;
let moodValueNode = document.querySelector('.mood-value');
let satietyValueNode = document.querySelector('.satiety-value');
let energyValueNode = document.querySelector('.energy-value');

function setState(param, value) {
    Cookies.set(param, value, { expires: 7});

    return Cookies.get(param);
}

if (!satiety) {
    satiety = setState('satiety', 100);
    satietyValueNode.innerHTML = satiety;
}
if (!energy) {
    energy = setState('energy', 100);
    energyValueNode.innerHTML = energy;
}
if (!mood) {
    mood = setState('mood', 100);
    moodValueNode.innerHTML = mood;
}

function changeParam(param, paramUp, value) {
    if (!paramUp) {
        value = Math.max(+value - 1, 0);
    } else {
        value = Math.min(+value + 3, 100);
    }
    return setState(param, value)
}

function turnOnCounter() {
    setInterval(() => {
        if (isEnergyUp || isSatietyUp) {
            return;
        }
        mood = changeParam('mood', isMoodUp, mood);
        changeMood();
        moodValueNode.innerHTML = mood;
    }, 1000);
    setInterval(() => {
        if (isSatietyUp) {
            return;
        }
        energy = changeParam('energy', isEnergyUp, energy);
        energyValueNode.innerHTML = energy;
    }, 1000);
    setInterval(() => {
        if (isEnergyUp) {
            return;
        }
        satiety = changeParam('satiety', isSatietyUp, satiety);
        satietyValueNode.innerHTML = satiety;
    }, 1000);
}

turnOnCounter();

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
        isSatietyUp = this.charging ? true : false;
    }
}

/**
 * Обработка возможности начать игру заново
 */
const buttonNewGame = document.querySelector('.begin-again');
buttonNewGame.addEventListener('click', () => {
    satiety = setState('satiety', 100);
    satietyValueNode.innerHTML = satiety;

    energy = setState('energy', 100);
    energyValueNode.innerHTML = energy;

    mood = setState('mood', 100);
    moodValueNode.innerHTML = mood;
});

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
    hidden           = 'mozHidden';
    visibilityState  = 'mozVisibilityState';
    visibilityChange = 'mozvisibilitychange';
} else if ('webkitHidden' in document) {
    hidden           = 'webkitHidden';
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

function sleepingHandler() {
    isEnergyUp = true;
}

function awakeHandler() {
    isEnergyUp = false;
}

/**
 * Обрботка настроения
 */
const mouth = Snap.select("#mouth");

function changeMood() {
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
