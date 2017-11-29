
//object for a trial: Stores trial data and subsidiary calculation variables.
function Trial(_session, _overallTrialNumber, _blockTrialNum, _blockNumber, trialType, staircases, bluePath, yellowPath)
{
    this.session = _session;

    this.sessionNum = this.session.getSessionNumber();
    this.condition = this.session.getCondition();
    this.participantID = this.session.getID();

    this.overallTrialNumber = _overallTrialNumber + 1;
    this.blockTrialNum = _blockTrialNum;
    this.blockNumber = _blockNumber;

    this.colour = trialType[1];
    this.stimulusPath = this.colour === "Y" ? yellowPath : bluePath;

    this.ITIDuration = Math.floor(Math.random() * (Engine.HIGHITI - Engine.LOWITI)) + Engine.LOWITI;
    this.dateTime = new Date();

    this.stopTrial = trialType[0] === "s" ? 1: 0;
    this.staircase = this.stopTrial === 1? parseInt(trialType[2]) : -1;
    this.SSD = this.stopTrial? staircases[this.staircase].getSSD() : -1;
    this.stopTrialVisibility = 0; // 0 = not yet displayed // -1 = hidden //  1 = displayed

    this.pointsGained = 0;
    this.score = -1;
    this.bonus = -1;
    
    this.response = -1;
    this.RTTimingStart = -1;
    this.responseTime = -1;
    this.correct = 0;
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
        debug("T: " + this.id, this.overallTrialNumber, this.blockTrialNum, this.blockNumber, this.colour, this.stopTrial, this.SSD, this.ITIDuration, this.response, this.responseTime, this.correct);
    else
        debug("T: " + this.overallTrialNumber, this.colour + " St:" + this.stopTrial, this.stopTrialVisibility, this.SSD, this.staircase + " Cr:" + this.correct, this.responseTime);
}

Trial.prototype.stopTimingAndGetCorrect = function (_keypress)
{
    this.response = _keypress;
    if (this.response !== "none")
        this.responseTime = Math.round(performance.now() - this.RTTimingStart);
    this.responseWindowOpen = false;

    if (this.stopTrial === 1 && this.response === "none")
            this.correct = 1;
    else if (this.stopTrial !== 1 && this.colour === this.response)
        this.correct = 1;

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
    if (this.stopTrialVisibility === 0)
        this.stopTrialVisibility = 1;
}

Trial.prototype.setStopTrialHidden = function () {
   if (this.stopTrialVisibility === 0)
        this.stopTrialVisibility = -1;
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

//Returns -1, 0, 1
//  1 : Correct Go Trial or HiddenStopTrial
//  0 : Incorrect Go Trial or HiddenStopTrial
// -1 : Failed inhibition 

Trial.prototype.calculateScore = function(currentscore, currentbonus)
{
    this.score = currentscore;
    this.bonus = currentbonus;

    this.pointsGained = 0;
    if ((this.correct && !this.isStopTrial()) || this.wasStopTrialHidden() && this.response === this.colour)
    {
        this.pointsGained = currentbonus * Math.floor((Engine.STIMULI_DUR - this.getResponseTime()) / 5);
        return 1;
    }
    if (!this.correct && this.isStopTrial() && !this.wasStopTrialHidden())
        return -1;
    if (!this.correct)
        return 0;
}

Trial.prototype.getTrialPoints = function ()
{
    return this.pointsGained;
}