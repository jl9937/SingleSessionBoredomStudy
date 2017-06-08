/// <reference path="../pixi.js-master/bin/pixi.js" />
/// <reference path="*.js" /> 

Session.COMPLETE_ALL = 5;
Session.COMPLETE_NOTHING = 0;
Session.STAGE_BASELINE = 0;
Session.STAGE_DAILYTRAINING = 1;
Session.STAGE_IMMEDIATETEST = 2;
Session.STAGE_FINALTEST = 3;

//Rename these conditions before it goes live
Session.CONDITION_REAL = 1;
Session.CONDITION_SHAM = 2;

//SessioN container object. Stores all info on the participant session and also grabs browser/os data
function Session()
{}

Session.prototype.initSession = function (_id, _condition, _callback)
{
    this.id = _id;
    this.condition = _condition;
    this.callback = _callback;
    
    DBInterface.increaseParticipantSessionsBegun(this.id);
    this.SESH_sessionNumber = "?";
    this.PART_studyStage = "";
    this.SESH_completionLevel = Session.COMPLETE_NOTHING;
    this.SESH_date = Date.now().toString("dd-MM-yyyy");
    this.PART_enddate = ""; 

    this.BERT_blocks = [];
    this.BERT_currentBlock = "N/A";
    this.EFF_easyChoices = 0;
    this.EFF_hardChoices = 0;
    this.EFF_calibrationPresses = 0;
    this.moneyWon = 0;

    this.browser = getBrowser();
    this.OS = getOS();
    
    DBInterface.getParticipantDetails(this.id, this.loadParticipantDetails.bind(this));
    return this;
}

Session.prototype.initSessionFromData = function(sessionData, _callback)
{
    this.callback = _callback;

    keys = Object.keys(sessionData);
    for (var i = 0; i < keys.length; i++)
        this[keys[i]] = sessionData[keys[i]];
    this.print();
    if(!this.hasOwnProperty("BERT_blocks"))
        this.BERT_blocks = [];
    this.browser = getBrowser();
    this.OS = getOS();
    DBInterface.getParticipantDetails(this.id, this.loadParticipantDetails.bind(this));
    return this;
}

Session.prototype.loadParticipantDetails = function (participant)
{
    if (this.SESH_sessionNumber === "?")
        this.SESH_sessionNumber = participant.sessionsCompleted + 1;

    this.PART_studyStage = participant.studyStage;
    this.PART_trainingEndDate = participant.trainingEndDate;
    this.PART_enddate = participant.endDate;

    DBInterface.saveSession(this);
    var cl = this.callback;
    delete this.callback;
    cl();
}

Session.prototype.print = function ()
{
    var condition;
    if (this.getCondition() === Session.CONDITION_REAL)
        condition = "Real";
    else
        condition = "Sham";
    debug("ID:" + this.id + ", Session:" + this.SESH_sessionNumber, condition +
        ", EasyChoices:" + this.EFF_easyChoices + ", HardChoices:" + this.EFF_hardChoices+  " " +
        this.SESH_date, this.SESH_completionLevel, this.PART_studyStage);
}

Session.prototype.saveToDB = function()
{
    this.print();
    DBInterface.saveSession(this);
}


/////////////////////////////////////////////////////////////Scheduling Functions//////////////////////////////////////////////////////////////////////
//Completion 		0	1				2			3		4			5
//BASELINE				Questions		EEfRT		2AFC	            Completed all
//DAILYTRAINING			2AFC			                                Completed all
//IMMEDIATETEST 		2AFC			Questions	EEfRT	            Completed all
//FINALTEST 			2AFC(test only)	Questions 	EEfRT 	Engagement  Completed all


Session.prototype.getCompletionLevel = function()
{
    return this.SESH_completionLevel;
}

Session.prototype.getNextSessionElementScreenName =function()
{
    if (this.SESH_completionLevel > SCHEDULE.length)
        return "LOGIN";
    else
        return SCHEDULE[this.SESH_completionLevel];
}

Session.prototype.setCurrentSessionElementComplete = function ()
{
    this.SESH_completionLevel++;
    if (this.SESH_completionLevel >= SCHEDULE.length)
    {
        this.SESH_completionLevel = Session.COMPLETE_ALL;
        DBInterface.updateParticipantDataWithCompletedSession(this);
        debug("Session Complete!", this.SESH_completionLevel);
    }
    DBInterface.saveSession(this);
    debug("Completion Level now ", this.SESH_completionLevel);
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

Session.prototype.getEmotionTaskInitialBlock = function()
{
    if (this.PART_studyStage === Session.STAGE_FINALTEST)
        return Block.TEST;
    else
        return Block.BASELINE;
}

Session.prototype.getMainMenuText = function()
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
        text += "\n\nWe noticed that you left and have returned,\ndon't worry, you can pick up where you left off.\nPlease email us if a technical difficulty forced\nyou to refresh the page, thanks!";
        break;
    }
    switch (this.getParticipantStage())
    {
        case Session.STAGE_BASELINE:
            text += "\n\nWelcome to the first session of this study. Please press 'Begin' to get started";
            break;
        case Session.STAGE_DAILYTRAINING:
            text += "\n\nThis is a training session\nPlease complete before four sessions before " + this.getTrainingEndDateString();
            break;
        case Session.STAGE_IMMEDIATETEST:
            text += "\n\nThis is the last training session\nPlease complete it before " + this.getTrainingEndDateString();
            break;
        case Session.STAGE_FINALTEST:
            text += "\n\nThis is the final test session, it is only completable after "+ this.getEndDateString();
            break;
    }
    return text;
}

Session.prototype.recordChoice = function(difficulty)
{
    if (difficulty === EffortTrial.EASY)
        this.EFF_easyChoices++;
    else 
        this.EFF_hardChoices++;
}



Session.prototype.setCalibrationPresses = function (presses)
{
    this.EFF_calibrationPresses = presses;
    this.saveToDB();
}

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
    return this.id;
}

Session.prototype.getSessionNumber = function ()
{
    return this.SESH_sessionNumber;
}

Session.prototype.getDateSessionString = function ()
{
    return this.SESH_date + "_" + this.SESH_sessionNumber;
}

Session.prototype.setMoneyWon = function(earnings)
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
