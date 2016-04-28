'use script';

const hrundel = Snap("#hrundel");

function animate(obj, stateStart, stateEnd, delay, interval) {
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

/**
*  Движение хвостиком
* */
function moveTail() {
    const tail = Snap.select("#tail");
    const interval = 800;
    const delay = 300;
    animate(
        tail,
        { d: "M660,400 C680,405 675,405 670,408 C665,400 670,400 685,400" },
        { d: "M660,400 C680,395 675,395 670,400 C665,390 670,390 685,385" },
        delay,
        interval
    );
}

moveTail();

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

const buttonNewGame = document.querySelector('.begin-again');
buttonNewGame.addEventListener('click', () => {
    satiety = setState('satiety', 100);
    satietyValueNode.innerHTML = satiety;

    energy = setState('energy', 100);
    energyValueNode.innerHTML = energy;

    mood = setState('mood', 100);
    moodValueNode.innerHTML = mood;
});

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
        mood = changeParam('mood', isMoodUp, mood);
        moodValueNode.innerHTML = mood;
    }, 1000);
    setInterval(() => {
        energy = changeParam('energy', isEnergyUp, energy);
        energyValueNode.innerHTML = energy;
    }, 1000);
    setInterval(() => {
        satiety = changeParam('satiety', isSatietyUp, satiety);
        satietyValueNode.innerHTML = satiety;
    }, 1000);
}

turnOnCounter();
