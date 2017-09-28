
//object for a trial: Stores trial data and subsidiary calculation variables.
function Trial(_session, _overallTrialNumber, _blockTrialNumber, _blockNumber, trialType, staircases, bluePath, yellowPath)
{
    this.session = _session;
    this.participantID = this.session.getID();

    this.overallTrialNumber = _overallTrialNumber + 1;
    this.blockTrialNumber = _blockTrialNumber;
    this.blockNumber = _blockNumber;

    this.colour = trialType[1];
    this.stimulusPath = this.colour === "Y" ? yellowPath : bluePath;

    this.ITIDuration = Math.floor(Math.random() * (Engine.HIGHITI - Engine.LOWITI)) + Engine.LOWITI;
    this.dateTime = Date.now().toString("dd-MM-yyyy HH:mm:ss");

    this.stopTrial = trialType[0] === "s" ? 1: 0;
    this.staircase = trialType[2] || -1;
    this.SSD = this.stopTrial? staircases[this.staircase].getSSD() : -1;
    this.stopTrialVisibility = 0; // 0 = not yet displayed // -1 = hidden //  1 = displayed

    this.pointsGained = 0;
    this.score = -1;
    this.bonus = -1;
    
    this.response = -1;
    this.RTTimingStart = -1;
    this.responseTime = -1;
    this.correct = false;
};


Trial.prototype.startTiming = function ()
{
    this.responseWindowOpen = true;
    this.RTTimingStart = performance.now();
}

Trial.prototype.print = function (verbose)
{
    verbose = verbose || 0;
    if (verbose)
        console.log("T: " + this.id, this.overallTrialNumber, this.blockTrialNumber, this.blockNumber, this.colour, this.stopTrial, this.SSD, this.ITIDuration, this.response, this.responseTime, this.correct);
    else
        console.log("T: " + this.overallTrialNumber, this.colour + " St:" + this.stopTrial, this.stopTrialVisibility, this.SSD, this.staircase + " Cr:" + this.correct, this.responseTime);
}

Trial.prototype.stopTimingAndGetCorrect = function (_keypress)
{
    this.response = _keypress;
    if (this.response)
        this.responseTime = Math.round(performance.now() - this.RTTimingStart);
    this.responseWindowOpen = false;

    if (this.stopTrial === 1)
    {
        if (this.response === "none")
            this.correct = true;
        else
            if (this.stopTrialVisibility === 0 )
                this.stopTrialVisibility = -1;
    }
    else if (this.stopTrial !== 1 && this.colour === this.response)
        this.correct = true;

    return this.correct;
}

Trial.prototype.saveToDB = function ()
{
    this.print();
    DBInterface.saveTrial(this);
}

////////////////////////Setters and Getters



Trial.prototype.getStimulusPath = function()
{
    return this.stimulusPath;
}

Trial.prototype.isStopTrial = function()
{
    return this.stopTrial;
}

Trial.prototype.getSSD = function ()
{
    return this.SSD;
}

Trial.prototype.wasStopTrialHidden = function ()
{
    if (this.stopTrialVisibility === -1)
        return true;
    return false;
}

Trial.prototype.setStopTrialShown = function()
{
    this.stopTrialVisibility = 1;
}

Trial.prototype.wasNoResponse =function()
{
    if (this.responseTime === -1)
        return true;
    return false;
}

Trial.prototype.getResponseTime = function()
{
    return this.responseTime;
}

Trial.prototype.getStaircaseNumber =function()
{
    return this.staircase;
}

Trial.prototype.getITIDuration = function()
{
    return this.ITIDuration;
}

Trial.prototype.isResponseWindowOpen = function()
{
    return this.responseWindowOpen;
}