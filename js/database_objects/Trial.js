
//object for a trial: Stores trial data and subsidiary calculation variables.
function Trial(_id, _overallTrialNumber, _blockTrialNumber, _blockNumber, _colour, _stimulusPath, _stopTrial, _SSD, _staircase, _ITIDuration, _session)
{
    this.id = _id;
    this.session = _session;
    this.overallTrialNumber = _overallTrialNumber;
    this.blockTrialNumber = _blockTrialNumber;
    this.blockNumber = _blockNumber;
    this.colour = _colour;
    this.stimulusPath = _stimulusPath;
    this.stopTrial = _stopTrial;
    this.SSD = _SSD;
    this.staircase = _staircase || -1;
    this.ITIDuration = _ITIDuration;
    this.stopTrialVisibility = 0; // 0 = not yet displayed // -1 = hidden //  1 = displayed

    this.pointsGained = 0;
    this.score = -1;
    this.bonus = -1;

    this.dateTime = Date.now().toString("dd-MM-yyyy HH:mm:ss");


    this.response = -1;
    this.responseTime = -1;
    this.correct = false;

    //calculation only
    this.RTTimingStart = -1;
};

Trial.prototype.startTiming = function ()
{
    this.responseWindowOpen = true;
    this.RTTimingStart = performance.now();
}

Trial.prototype.print = function (verbose)
{
    verbose = verbose || 0;
    console.log(this);
    //IF (verbose)
    //.log("T: " + this.id, this.overallTrialNumber, this.blockTrialNumber, this.blockNumber, this.colour, this.stopTrial, this.SSD, this.ITIDuration, this.date, this.dateTime, this.response, this.responseTime, this.correct);
    //else
    //console.log("T: " + this.overallTrialNumber, this.colour + " St:" + this.stopTrial, this.hiddenStopTrial, this.SSD, this.staircase + " Cr:" + this.correct, this.responseTime);
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
