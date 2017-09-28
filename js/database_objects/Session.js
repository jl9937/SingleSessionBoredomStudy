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

Session.prototype.getNextBlockRewardString = function()
{
    //todo build this into the task with the money earner etc
    return "63p";
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
    if (this.completionLevel > this.schedule.length)
        return "MAINMENU";
    else
        return this.schedule[this.completionLevel + 1];
}

Session.prototype.setCurrentSessionElementComplete = function ()
{
    this.completionLevel++;
    if (this.completionLevel >= this.schedule.length)
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

Session.prototype.getDayNumber = function ()
{
    return this.participant.getSessionsCompleted() + 1;
}

Session.prototype.getMainMenuText = function ()
{
    var text = "";
    switch (this.getCompletionLevel())
    {
        case Session.COMPLETE_NOTHING:
            switch (this.getDayNumber())
            {
                case 1:
                    text += "\n\nWelcome to your first session\nPlease press 'Begin' to get started";
                    break;
                case 2:
                    text += "\n\nThis is your second session of the study\nPlease press 'Begin' to get started" + this.getTrainingEndDateString();
                    break;
                case 3:
                    text += "\n\nThis is your third and final session\nPlease press 'Begin' to get started" + this.getTrainingEndDateString();
                    break;
            }
            break;
        case Session.COMPLETE_ALL:
            text += "\n\nToday's session has been completed already";
            break;
        default:
            text += "\n\nDid you close the page?\nDon't worry, you can continue\nfrom where you left off";
            break;
    }
    
    return text;
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

Session.prototype.setSchedule = function (_schedule)
{
    this.schedule = _schedule;
}

Session.prototype.getSchedule = function ()
{
    return this.schedule;
}

