//Handles all DB related functionality.

function DBInterface()
{
    DBInterface.databaseRef = firebase.database().ref();
    //firebase.database.enableLogging(true);
 };

/////////////////////////Login///////////////////////////
DBInterface.logUserIn = function (prolificID, callback)
{
    var username = prolificID + "@berti.com";
    var password = prolificID.slice(12, 24);

    //wipe the current user auth
    firebase.auth().signOut().then(function ()
    {
        //attempt a signin
        DBInterface.firebaseSignin(username, password, prolificID, callback, function(error)
        {
            //If the signin fails, it's because the user doesn't exist. So create the user
            debug(error.code + " login failed, so creating a new user instead");
            firebase.auth().createUserWithEmailAndPassword(username, password).then(function (user)
            {
                //After this, update their profile to include their prolific ID as their display name
                debug("New user created");
                user.updateProfile({ displayName: prolificID }).then(function()
                {
                    //stupidly, you then need to relog in order for the update to work.... But, relog and we're good to go
                    firebase.auth().signOut().then(function()
                    {
                        DBInterface.firebaseSignin(username, password, prolificID, callback, sendBugToLog);
                    });
                });
            }
            ).catch(sendBugToLog);
        });
    });
}

DBInterface.firebaseSignin = function (username, password, prolificID, callback, errorCallback)
{
    //attempt a signin
    firebase.auth().signInWithEmailAndPassword(username, password).then(function (user)
    {
        if (user)
        {
            debug("user signed in:", user.displayName, user.uid);
            //Try to get the participant's details.
            //If they don't exist, then make a new participant
            //If they do exist, then pass the details back to the main menu
            DBInterface.getParticipantDetails(prolificID, function (data)
            {
                if (!data)
                {
                    debug("New Participant -> Assigning to condition");
                    DBInterface.assignToCondition(function (newlyAssignedcondition)
                    {
                        DBInterface.createNewParticipant(newlyAssignedcondition, prolificID);
                        callback(prolificID, newlyAssignedcondition);
                    });
                }
                else
                {
                    debug("Returning Participant");
                    callback(data.id, data.condition);
                }
            });
        }
    }).catch(errorCallback);
    
}

function sendBugToLog(error)
{
    debug(error.message);
}

DBInterface.assignToCondition = function (callback)
{
    var self = this;
    DBInterface.databaseRef.child("Conditions").once("value", function (snapshot)
    {
        var data = snapshot.val();
        var assignedCondition;

        //Is the DB initialised? If not, initialise it
        if (!data)
        {
            self.databaseRef.child("Conditions").update(
            {
                "condition1": 0,
                "condition2": 0
            });
            data = {};
            data.condition1 = 0;
            data.condition2 = 0;
        }

        //if (data.condition1 < data.condition2)
        //    assignedCondition = 1;
        //else
        //    assignedCondition = 2;
        assignedCondition = Math.floor(Math.random() * 2)+1;
        
        switch (assignedCondition)
        {
            case 1:
                self.databaseRef.child("Conditions").update({ "condition1": data.condition1 + 1 });
                break;
            case 2:
                self.databaseRef.child("Conditions").update({ "condition2": data.condition2 + 1 });
                break;
        }

        callback(assignedCondition);
    });
}

///////////////////////////////////Savers////////////////////////////////////////
DBInterface.saveSession = function (session)
{
    var blocks = session.BERT_blocks;
    for (var i = 0; i < blocks.length; i++)
    {
        delete blocks[i].session;
        delete blocks[i].stimuli;
        delete blocks[i].trials;
    }
    var currblock = session.BERT_currentBlock;
    delete session.BERT_currentBlock;

    var stage = session.PART_studyStage;
    var enddate = session.PART_enddate;
    var trainingenddate = session.PART_trainingEndDate;
    delete session.PART_studyStage;
    delete session.PART_enddate;
    delete session.PART_trainingEndDate;

    var json = JSON.parse(JSON.stringify(session));
    DBInterface.databaseRef.child("Sessions")
        .child("id_" + session.id)
        .child(session.getDateSessionString())
        .update(json);

    session.BERT_currentBlock = currblock;
    session.PART_studyStage = stage;
    session.PART_enddate = enddate;
    session.PART_trainingEndDate = trainingenddate;
}

DBInterface.saveTrial = function (trial)
{
    var session = trial.session;
    var block = trial.block;
    var RTTimingStart = trial.RTTimingStart;

    delete trial.session;
    delete trial.block;
    delete trial.RTTimingStart;

    var json = JSON.parse(JSON.stringify(trial));
    DBInterface.databaseRef.child("BERTTrials")
        .child("id_" + session.id)
        .child(session.getDateSessionString()).child(block.getBlocktypeString()).child(trial.trialNum)
        .update(json);

    trial.session = session;
    trial.block = block;
    trial.RTTimingStart = RTTimingStart;
}

DBInterface.saveEffortTrial = function (trial)
{
    var session = trial.session;
    delete trial.session;
    delete trial.complete;

    var barShrinkSpeed = trial.barShrinkSpeed;
    var barGrowthRate = trial.barGrowthRate;
    trial.barShrinkSpeed
    delete trial.barGrowthRate;

    var json = JSON.parse(JSON.stringify(trial));
    DBInterface.databaseRef.child("EFFORTTrials")
        .child("id_" + session.id)
        .child(session.getDateSessionString()).child(trial.effortTrialNum)
        .update(json);

    trial.session = session;
    trial.barShrinkSpeed = barShrinkSpeed;
    trial.barGrowthRate = barGrowthRate;
}

DBInterface.saveVisabilityActivity = function (session, id, data)
{
    var id_path = "id_" + session.id;
    DBInterface.databaseRef.child("Activity")
        .child("id_" + session.id)
        .child(session.getDateSessionString())
        .push(data);
}

DBInterface.saveBypassButtonPress = function (session, questionnaireType)
{
    var id_path = "id_" + session.getID();
    var dateTime = Date.now().toString("dd-MM-yyyy_HH:m:ss");
    DBInterface.databaseRef.child("Questionnaire")
        .child(id_path)
        .child(session.getDateSessionString())
        .child(dateTime)
        .set(questionnaireType +" bypassed");
}


///////////////////////////////////Participants////////////////////////////////////////
DBInterface.getParticipantDetails = function (id, callback)
{
    DBInterface.databaseRef.child("Participants").child("id_" + id).once("value", function (snapshot)
    {
        var data = snapshot.val();
        callback(data);
    });
}

DBInterface.createNewParticipant = function (condition, id)
{
    var id_path = "id_" + id;
    var dateRegistered = Date.now();
    var trainingEndDate = new Date(dateRegistered).add(7).days();
    //this is cumulative
    var enddate = new Date(dateRegistered).add(21).days();

    DBInterface.databaseRef.child("Participants").child(id_path).update(
        {
            "condition": condition,
            "datetimeRegistered": dateRegistered.toString("dd-MM-yyyy HH:mm:ss"),
            "id": id,
            "moneyEarned": 0,
            "sessionsCompleted": 0,
            "sessionsBegun": 0,
            "studyCompleted": false,
            "studyStage": 0,
            "endDate": enddate.toString("dd-MM-yyyy"),
            "trainingEndDate": trainingEndDate.toString("dd-MM-yyyy")
        }
    );
}

DBInterface.increaseParticipantSessionsBegun = function (id)
{
    var ref = DBInterface.databaseRef.child("Participants").child("id_" + id).child('sessionsBegun');
    ref.transaction(function (sessionsBegun)
    {
        if (sessionsBegun)
            sessionsBegun += 1;
        return (sessionsBegun || 0) + 1;
    });
}

DBInterface.updateParticipantDataWithCompletedSession = function (session)
{
    //get participant details from database
    var id = session.id;
    var self = this;
    var id_path = "id_" + id;
    DBInterface.getParticipantDetails(id, function (details)
    {
        if (details)
        {
            var studyCompleted = false;
            var sessionsCompleted = details.sessionsCompleted + 1;
            var moneyEarned = details.moneyEarned + session.moneyWon;
            var studyStage = Session.STAGE_BASELINE;

            switch (details.studyStage)
            {
                case Session.STAGE_BASELINE:
                    studyStage = Session.STAGE_DAILYTRAINING;
                    break;
                case Session.STAGE_DAILYTRAINING:
                    if (sessionsCompleted >= 3)
                        studyStage = Session.STAGE_IMMEDIATETEST;
                    else
                        studyStage = Session.STAGE_DAILYTRAINING;
                    break;
                case Session.STAGE_IMMEDIATETEST:
                    studyStage = Session.STAGE_FINALTEST;
                    break;
                case Session.STAGE_FINALTEST:
                    //todo Payment scheme set here
                    moneyEarned += 10;
                    studyCompleted = true;
                    studyStage = Session.STAGE_FINALTEST;
                    break;
            }
            self.databaseRef.child("Participants").child(id_path).update(
            {
                "moneyEarned": moneyEarned,
                "lastSessionCompleted": Date.now().toString("dd-MM-yyyy"),
                "sessionsCompleted": sessionsCompleted,
                "studyCompleted": studyCompleted,
                "studyStage": studyStage
            });
        }
    });
}



///////////////////////////////////Questionnaires////////////////////////////////////////


DBInterface.saveQuestionnaireResultToDb = function (session, questionnaire, question, value)
{
    this.databaseRef.child("Questionnaire").child("id_" + session.getID()).child(session.getDateSessionString()).child(questionnaire).child(question).set(value);
};


///////////////////////////////////Fetchers///////////////////////////////////
DBInterface.getTodaysSessions = function (id, callback)
{
    var today = Date.now().toString("dd-MM-yyyy");
    var query = this.databaseRef.child("Sessions").child("id_" + id).orderByKey().startAt(today).endAt(today + "\uf8ff");
    query.once("value", function (snapshot)
    {
        var data = snapshot.val();
        if (data === null || data === undefined)
            callback(null);
        else
        {
            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i++)
            {
                callback(data[keys[i]]);
                return;
            }
        }


    });

}


