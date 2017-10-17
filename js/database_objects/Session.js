Session.COMPLETED_NOTHING = "NOTHING";
Session.COMPLETED_TASK = "TASK";
Session.COMPLETED_ALL = "ALL";

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

    this.condition = parseInt(forcedCondition) || parseInt(this.participant.conditionOrder[this.participant.sessionsCompleted]);
    this.completionLevel = Session.COMPLETED_NOTHING;
    this.date = Date.now().toString("dd-MM-yyyy");
}

Session.prototype.getBlockReward = function(blockNum)
{
    var rewardArray = [0.75, 0.66, 0.57, 0.48, 0.39, 0.3, 0.21, 0.12, 0.03];
    return rewardArray[blockNum];
}

Session.prototype.getBlockRewardString = function()
{
    return formatMoney(this.getBlockReward(this.getBlocksCompleted()));
}

Session.prototype.initSessionFromData = function (sessionData)
{
    var keys = Object.keys(sessionData);
    for (var i = 0; i < keys.length; i++)
        this[keys[i]] = sessionData[keys[i]];
    if (this.getBlocksCompleted() > 0 && this.completionLevel === Session.COMPLETED_NOTHING)
        this.completionLevel = Session.COMPLETED_TASK;
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

Session.prototype.getBlocksCompleted = function () {
    return this.participant.getblocksCompleted(this.getCondition());
}
           
Session.prototype.setCurrentSessionElementComplete = function ()
{
    switch (this.completionLevel)
    {
    case Session.COMPLETED_NOTHING:
        this.completionLevel = Session.COMPLETED_TASK;
        break;
    case Session.COMPLETED_TASK:
        this.completionLevel = Session.COMPLETED_ALL;
        this.participant.sessionComplete(this);           
        debug("Session Complete!", this.completionLevel);
        break;
    }
         
    this.saveToDB();
    this.participant.saveToDB();
    console.log("Completion Level now ", this.completionLevel);
    
    totalLoopTime = 0;
    longFramesSinceStart = 0;
    loopCounter = 0;
}

Session.prototype.blockComplete = function ()
{
    this.participant.blockComplete(this.getCondition(), this.getBlockReward(this.participant.getblocksCompleted(this.getCondition())));
    this.saveToDB();
}


/////////////////////////////////////////////////////////////Setters and getters//////////////////////////////////////////////////////////////////////
Session.prototype.getDayNumber = function ()
{
    return this.participant.getSessionsCompleted() + 1;
}

Session.prototype.getNextSessionElementScreenName = function () {
    switch (this.completionLevel)
    {
    case Session.COMPLETED_NOTHING:
        return this.schedule[1];
    case Session.COMPLETED_TASK:
        return "POSTTASK";

    case Session.COMPLETED_ALL:
        return "MAINMENU";
    }
}

Session.prototype.getMainMenuText = function ()
{
    var text = "";
    switch (this.getCompletionLevel())
    {
        case Session.COMPLETED_NOTHING:
            switch (this.getDayNumber())
            {
                case 1:
                    text += "\n\nWelcome to your first session\nPlease press 'Begin' to get started";
                    break;
                case 2:
                    text += "\n\nThis is your second session of the study\nThings may look a little different...\nPlease press 'Begin' to get started";
                    break;
                case 3:
                    text += "\n\nThis is your third and final session\nThings may look a little different...\nPlease press 'Begin' to get started";
                    break;
            }
            break;
        case Session.COMPLETED_ALL:
            text += "\n\nToday's session is completed!";
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

Session.prototype.setSchedule = function (_schedule)
{
    this.schedule = _schedule;
}

Session.prototype.getSchedule = function ()
{
    return this.schedule;
}

