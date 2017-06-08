Trial.HAPPY = 1;
Trial.SAD = 2;

//object for a trial: Stores trial data and subsidiary calculation variables.
function Trial(_session, _trialNum, _block, _stimulusNumber)
{
    this.session = _session;
    this.trialNum = _trialNum;
    this.block = _block;
    this.stimulusNumber = _stimulusNumber;
    this.stimulusPath = "../resources/faces/face_" + this.stimulusNumber + ".jpg";

    this.fixationDuration = Math.floor(Math.random() * (Engine.HIGHITI - Engine.LOWITI)) + Engine.LOWITI;
    this.dateTime = Date.now().toString("dd-MM-yyyy HH:mm:ss");
    
    this.response = -1;
    this.responseTime = -1;
    this.correct = -1;

    this.classification = this.getClassification();

    //calculation only
    this.RTTimingStart = -1;

    switch (this.block.getBlocktype())
    {
        case Block.BASELINE:
            this.blocktype = "Baseline";
            break;
        case Block.TRAINING:
            this.blocktype = "Training";
            break;
        case Block.TEST:
            this.blocktype = "Test";
            break;
    };
    this.id = this.session.getID();
    this.sessionNum = this.session.getSessionNumber();
    this.condition = this.session.getCondition();
};

Trial.prototype.print = function ()
{
    var blocktype = "";
    switch (this.block.getBlocktype())
    {
    case Block.BASELINE:
        blocktype = "Baseline";
        break;
    case Block.TRAINING:
            blocktype = "Training";
            break;
    case Block.TEST:
            blocktype = "Test";
            break;
    };
    var response = this.response === Trial.HAPPY ? "Happy" : "Sad";
    debug(blocktype + " T:" + this.trialNum + " Face:" + this.stimulusNumber + " R:" + response, this.responseTime + "ms Cr: " + this.correct + " Classif: " + this.classification);
}

Trial.prototype.saveToDB = function ()
{
    this.print();
    DBInterface.saveTrial(this);
}

Trial.prototype.getFixationDuration = function()
{
    return this.fixationDuration;
}

Trial.prototype.getClassification = function ()
{
    if (this.block.getBlocktype() !== Block.TRAINING)
        return "N/A";

    if (this.stimulusNumber <= this.block.calculateBalancePoint())
        return Trial.HAPPY;
    if (this.stimulusNumber > this.block.calculateBalancePoint())
        return Trial.SAD;

    //Some stimulus are fixed regardless of balance point
    if (this.stimulusNumber < 4)
        return Trial.HAPPY;
    if (this.stimulusNumber > 13)
        return Trial.SAD;
}

Trial.prototype.getResponse = function()
{
    return this.response;
}

Trial.prototype.getCorrect = function()
{
    return this.correct;
}

Trial.prototype.getStimulusPath = function()
{
    return this.stimulusPath;
}

Trial.prototype.startTiming = function()
{
    this.RTTimingStart = Date.now().getTime();
}

Trial.prototype.getFeedbackPicture = function ()
{
    if (this.getCorrect())
        return "../resources/interface/correct.png";
    else
        return "../resources/interface/incorrect.png";
}

Trial.prototype.getCategorisationPicture = function ()
{
    if (this.classification === Trial.HAPPY)
        return "../resources/interface/thatFaceWasHappy.png";
    else
        return "../resources/interface/thatFaceWasSad.png";
}

Trial.prototype.submitResponse = function (_response)
{
    this.response = _response;
    this.responseTime = Date.now().getTime() - this.RTTimingStart;
    this.correct = this.classification === this.response ? true : false;
    if (this.block.getBlocktype() !== Block.TRAINING)
        this.correct = "N/A";
    this.saveToDB();
}
