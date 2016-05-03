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