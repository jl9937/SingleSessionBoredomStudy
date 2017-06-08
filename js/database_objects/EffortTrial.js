EffortTrial.EASY = 1;
EffortTrial.HARD = 2;

//object for a EffortTrial: Stores EffortTrial data and subsidiary calculation variables.
function EffortTrial(_session, _effortTrialNum, difficultyOptions)
{
    this.session = _session;
    this.effortTrialNum = _effortTrialNum;

    this.dateTime = Date.now().toString("dd-MM-yyyy HH:mm:ss");

    this.complete = false;
    this.filled = false;
    this.win = false;
    
    this.buttonPresses = 0;
    
    this.difficulty = difficultyOptions.difficulty;
    this.barGrowthRate = difficultyOptions.barGrowthRate;
    //this.barShrinkSpeed = difficultyOptions.barShrinkSpeed;
    this.maxTime = difficultyOptions.maxTime;
    this.timeTaken = "";
    this.requiredPresses = difficultyOptions.requiredPresses;
    this.probabilityOfWin = difficultyOptions.probabilityOfWin;
    this.reward = difficultyOptions.reward;
    this.id = this.session.getID();
    this.sessionNumber = this.session.getSessionNumber();
};

EffortTrial.prototype.print = function ()
{
    debug("Effort Trial " + this.effortTrialNum + " BP: " + this.buttonPresses + " Diff: " + this.difficulty + " R: " + this.reward + " P: " + this.probabilityOfWin);

}


EffortTrial.prototype.setDecisionTime = function (decisiontime)
{
    this.decisionTime = decisiontime;
}


EffortTrial.prototype.saveToDB = function ()
{
    this.print();
   DBInterface.saveEffortTrial(this);
}

EffortTrial.prototype.endTrial = function ()
{
    this.setComplete();
    if (this.requiredPresses <= this.buttonPresses)
        this.filled = true;
    this.saveToDB(this);
}


EffortTrial.prototype.setTimeTaken = function(timeRemaining)
{
    this.timeTaken = this.maxTime - timeRemaining;
}

EffortTrial.prototype.buttonPressed = function()
{
    this.buttonPresses++;
}

EffortTrial.prototype.getChoiceText =function()
{
    var difficultyString = this.difficulty === EffortTrial.EASY ? "Easy task" : "Hard task";
    return difficultyString + "\nProbability of Win: " + this.probabilityOfWin*100 + "%\n"+ formatMoney(this.reward);
}

EffortTrial.prototype.getDifficulty = function()
{
    return this.difficulty;
}

EffortTrial.prototype.getShrinkSpeed = function()
{
    return this.barShrinkSpeed;
}

EffortTrial.prototype.getBarIncrease = function ()
{
    return this.barGrowthRate;
}

EffortTrial.prototype.getMaxTime = function()
{
    return this.maxTime;
}

EffortTrial.prototype.getTrialNum =function()
{
    return this.effortTrialNum;
}

EffortTrial.prototype.getSpinnerPic = function ()
{
    return "../resources/interface/"+this.probabilityOfWin.toString() + "probWin.png";
}

EffortTrial.prototype.isComplete = function()
{
    return this.complete;
}

EffortTrial.prototype.setComplete = function()
{
    this.complete = true;
}

EffortTrial.prototype.getWin = function ()
{
    return this.win;
}

EffortTrial.prototype.getReward = function()
{
    return this.reward;
}

EffortTrial.prototype.setWin = function(rotation)
{
    var rotmod = ((rotation*180)/Math.PI ) % 360;
    switch (this.probabilityOfWin)
    {
        case 0.12:
            if (rotmod >= 315)
                this.win = true;
            break;
        case 0.5:
            if (rotmod >= 180)
                this.win = true;
            break;
        case 0.88:
            if (rotmod <= 315)
                this.win = true;
            break;
    }
}