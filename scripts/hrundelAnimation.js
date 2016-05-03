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
