/// <reference path="../pixi.js-master/bin/pixi.js" />
/// <reference path="*.js" /> 

Session.COMPLETE_NOTHING = 0;
Session.COMPLETE_TASK = 1;
Session.COMPLETE_ALL = 2;

//SessioN container object. Stores all info on the participant session and also grabs browser/os data
function Session(sessionData, participant, forcedCondition)
{
    this.participant = participant;
    this.sessionNumber = this.participant.sessionsCompleted + 1;
    if (sessionData === null)
        this.initSession(forcedCondition);
    else
        this.initSessionFromData(sessionData);
    DBInterface.saveSession(this);
}

Session.prototype.initSession = function (participant, forcedCondition)
{
    this.participant.newSessionBegun();

    this.summaryData = { "medianRT": -1, "stopAccuracy": -1, "goAccuracy": -1 };
    this.metadata = {"browser": getBrowser(), "versionHash": this.getVersionHash(), "OS": getOS(), "screenSize": getScreenSize()}

    this.optionalBlocksCompleted = 0;
    this.condition = parseInt(forcedCondition) || parseInt(this.participant.conditionOrder[this.participant.sessionsCompleted]);
    this.completionLevel = Session.COMPLETE_NOTHING;
    this.date = Date.now().toString("dd-MM-yyyy");
}

Session.prototype.initSessionFromData = function (sessionData)
{
    var keys = Object.keys(sessionData);
    for (var i = 0; i < keys.length; i++)
        this[keys[i]] = sessionData[keys[i]];
}

Session.prototype.getVersionHash = function ()
{
    var self = this;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (xhttp.readyState === 4 && xhttp.status === 200)
            self.versionHash = xhttp.responseText.slice(0, xhttp.responseText.length - 2);
    };
    xhttp.open("GET", "version.html", true);
    xhttp.send();
}

Session.prototype.printSelf = function ()
{
    console.log(this);
}

Session.prototype.saveToDB = function ()
{
    this.printSelf();
    DBInterface.saveSession(this);
}

Session.prototype.getCompletionLevel = function ()
{
    return this.completionLevel;
}

Session.prototype.getNextSessionElementScreenName = function ()
{
    if (this.completionLevel > SCHEDULE.length)
        return "MAINMENULOGIN";
    else
        return SCHEDULE[this.completionLevel];
}

Session.prototype.setCurrentSessionElementComplete = function ()
{
    this.completionLevel++;
    if (this.completionLevel >= SCHEDULE.length)
    {
        this.completionLevel = Session.COMPLETE_ALL;
        DBInterface.updateParticipantDataWithCompletedSession(this);
        debug("Session Complete!", this.completionLevel);
    }
    DBInterface.saveSession(this);
    debug("Completion Level now ", this.completionLevel);


    totalLoopTime = 0;
    longFramesSinceStart = 0;
    loopCounter = 0;
}




/////////////////////////////////////////////////////////////Setters and getters//////////////////////////////////////////////////////////////////////
Session.prototype.getTrainingEndDateString = function ()
{
    return this.PART_trainingEndDate;
}

Session.prototype.getEndDateString = function ()
{
    return this.PART_enddate;
}

Session.prototype.getParticipantStage = function ()
{
    return this.PART_studyStage;
}

Session.prototype.getEmotionTaskInitialBlock = function ()
{
    if (this.PART_studyStage === Session.STAGE_FINALTEST)
        return Block.TEST;
    else
        return Block.BASELINE;
}

Session.prototype.getMainMenuText = function ()
{
    var text = "";
    switch (this.getCompletionLevel())
    {
        case Session.COMPLETE_NOTHING:
            text += "";
            break;
        case Session.COMPLETE_ALL:
            text += "\n\nToday's session has been completed already";
            break;
        default:
            text += "\n\nWe noticed that you left and have returned,\ndon't worry, you can pick up where you left off";
            break;
    }
    switch (this.getParticipantStage())
    {
        case Session.STAGE_BASELINE:
            text += "\n\nWelcome to the first session of this study.\nPlease press 'Begin' to get started";
            break;
        case Session.STAGE_DAILYTRAINING1:
            text += "\n\nThis is your second session of the study\nPlease press 'Begin' to get started" + this.getTrainingEndDateString();
            break;
        case Session.STAGE_DAILYTRAINING2:
            text += "\n\nThis is your third and final session of the study\nPlease press 'Begin' to get started" + this.getTrainingEndDateString();
            break;
    }
    return text;
}

Session.prototype.recordAverageBPS = function (bps, trialNumber)
{
    if (this.EFF_averageBPS === 0)
        this.EFF_averageBPS = bps;
    else
        this.EFF_averageBPS = (((trialNumber - 1) * this.EFF_averageBPS) + bps) / trialNumber;
};
Session.prototype.recordChoice = function (difficulty)
{
    if (difficulty === EffortTrial.EASY)
        this.EFF_easyChoices++;
    else
        this.EFF_hardChoices++;
}

//todo make changes here
Session.prototype.setCalibrationPresses = function (trialNumber, presses)
{
    switch (trialNumber)
    {
        case 1:
            this.EFF_calibration.easyPresses = presses;
            break;
        case 2:
            this.EFF_calibration.hardPresses = presses;
            break;
        case 3:
            this.EFF_calibration.mediumPresses = presses;
            break;
        case 4:
            this.EFF_calibration.finalCalibrationPresses = presses;
            break;
    }
    this.saveToDB();
}

Session.prototype.setAverageCalibrationBPS = function (calibration_bps)
{
    this.EFF_calibration.averageBPS = calibration_bps;
    this.saveToDB();
}

Session.prototype.getAverageCalibrationBPS = function ()
{
    return this.EFF_calibration.averageBPS;
}

Session.prototype.getRequiredHardPresses = function ()
{
    var requiredPresses = this.EFF_calibration.averageBPS * 20 * 1.10;
    if (requiredPresses > 300)
        requiredPresses = 300;
    if (requiredPresses < 50)
        requiredPresses = 50;
    return requiredPresses;
};

Session.prototype.setCurrentBlock = function (block)
{
    this.BERT_blocks[block.getBlocktype()] = block;
    this.BERT_currentBlock = block.getBlocktype();
}

Session.prototype.getBaselineBP = function ()
{
    return this.BERT_blocks[Block.BASELINE].calculateBalancePoint();
}

Session.prototype.getCondition = function ()
{
    return this.condition;
}

Session.prototype.getID = function ()
{
    return this.participant.id;
}

Session.prototype.getSessionNumber = function ()
{
    return this.sessionNumber;
}

Session.prototype.getDateSessionString = function ()
{
    return this.date + "_" + this.sessionNumber;
}

Session.prototype.setMoneyWon = function (earnings)
{
    this.moneyWon = earnings;
}

Session.prototype.getNextBlock = function ()
{
    switch (this.BERT_currentBlock)
    {
        case Block.BASELINE:
            return Block.TRAINING;
        case Block.TRAINING:
            return Block.TEST;
    };
}
