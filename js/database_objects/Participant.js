function Participant(id, participantData)
{
    if (participantData)
        this.initParticipantFromData(participantData);
    else
        this.initParticipant(id);
    this.print();
    this.saveToDB();
}

Participant.prototype.initParticipant = function(id)
{
    this.id = id;
    this.conditionOrder = this.assignToConditionOrder();
    this.sessionsCompleted = 0;
    this.datetimeRegistered = Date.now().toString("dd-MM-yyyy HH:mm:ss");
    this.moneyEarned = 0;
    this.sessionsBegun = 0;
    this.studyComplete = false;
    this.optionalBlocksCompleted = {"0": 0, "1": 0, "2": 0}
}

Participant.prototype.getID = function()
{
    return this.id;
}

Participant.prototype.getMoneyEarned = function()
{
    return this.moneyEarned;
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

Participant.prototype.initParticipantFromData = function (participantData)
{
    debug("Returning Participant");
    var keys = Object.keys(participantData);
    for (var i = 0; i < keys.length; i++)
        this[keys[i]] = participantData[keys[i]];
}

Participant.prototype.print = function ()
{
    console.log(this);
}

Participant.prototype.saveToDB = function ()
{
    DBInterface.saveParticipant(this);
}



Participant.prototype.assignToConditionOrder = function ()
{
    debug("New Participant -> Assigning to condition");
    return "012";

    //todo Here assign participants to a counterbalanced order, and record it
    //DBInterface.databaseRef.child("Conditions").once("value", function (snapshot)
    //{
    //    var data = snapshot.val();
    //    var assignedCondition;

    //    //Is the DB initialised? If not, initialise it
    //    if (!data)
    //    {
    //        self.databaseRef.child("Conditions").update(
    //        {
    //            "condition1": 0,
    //            "condition2": 0
    //        });
    //        data = {};
    //        data.condition1 = 0;
    //        data.condition2 = 0;
    //    }

    //    //if (data.condition1 < data.condition2)
    //    //    assignedCondition = 1;
    //    //else
    //    //    assignedCondition = 2;
    //    assignedCondition = Math.floor(Math.random() * 2) + 1;

    //    switch (assignedCondition)
    //    {
    //        case 1:
    //            self.databaseRef.child("Conditions").update({ "condition1": data.condition1 + 1 });
    //            break;
    //        case 2:
    //            self.databaseRef.child("Conditions").update({ "condition2": data.condition2 + 1 });
    //            break;
    //    }

    //    callback(assignedCondition);
    //});
}