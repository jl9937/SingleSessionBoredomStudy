function Participant(id, participantData, _callback)
{
    this.callback = _callback;
    if (participantData)
        this.initParticipantFromData(participantData);
    else
        this.initParticipant(id);
}

Participant.prototype.loaded = function()
{
    //this.printSelf();
    this.saveToDB();
    this.callback(this);
}

Participant.prototype.initParticipant = function(id)
{
    this.id = id;
    this.sessionsCompleted = 0;
    this.datetimeRegistered = new Date();
    this.lastSessionCompleted = "";
    this.sessionsBegun = 0;
    this.studyComplete = false;
    this.excluded = false;
    this.blocksCompleted = { "0": 0, "1": 0, "2": 0 }
    this.assignToConditionOrder(this.loaded.bind(this));
}

Participant.prototype.getID = function()
{
    return this.id;
}

Participant.prototype.getMoneyEarned = function()
{
    var moneyEarned = 0;
    for (var i = 0; i < 3; i++)
    {
        var blocks = this.blocksCompleted[i];
        for (var j = 0; j < blocks; j++)
            moneyEarned += getBlockReward(j);
    }
    moneyEarned += (0.5 * this.getSessionsCompleted());
    moneyEarned = Math.round((moneyEarned + 0.00001) * 100) / 100;
    return moneyEarned;
}

Participant.prototype.getSessionsCompleted = function()
{
    return this.sessionsCompleted;
}


Participant.prototype.newSessionBegun =function()
{
    this.sessionsBegun += 1;
    this.saveToDB();
}

Participant.prototype.sessionComplete = function()
{
    this.lastSessionCompleted = getSimpleDateString();
    this.sessionsCompleted++;   
    if (this.sessionsCompleted === 3)
        this.studyComplete = true;

    this.saveToDB();
}

Participant.prototype.initParticipantFromData = function (participantData)
{
    debug("Returning Participant");
    var keys = Object.keys(participantData);
    for (var i = 0; i < keys.length; i++)
        this[keys[i]] = participantData[keys[i]];
    this.loaded();
}

Participant.prototype.printSelf = function ()
{
    debug(this);
}

Participant.prototype.saveToDB = function ()
{
    DBInterface.saveParticipant(this);
}


Participant.prototype.assignToConditionOrder = function(callback)
{
    var self = this;
    debug("New Participant -> Assigning to condition");                 
    DBInterface.getSmallestConditionOrderGroup(function(_conditionOrder)
    {
        self.conditionOrder = _conditionOrder;
        DBInterface.incrementConditionCounter(self.conditionOrder);
        callback();
    });
}


Participant.prototype.getblocksCompleted =function(condition)
{
    return this.blocksCompleted[condition];
}

Participant.prototype.blockComplete = function(condition)
{    
    this.blocksCompleted[condition] += 1; 
    debug("BlocksCompleted " + this.blocksCompleted[condition]);
    this.saveToDB();
}
