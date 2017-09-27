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
            debug("User signed in:", user.displayName, user.uid);
            DBInterface.getParticipantDetails(prolificID, function (data)
            {
                var p = new Participant(prolificID, data, callback);
            });
        }
    }).catch(errorCallback);
    
}

function sendBugToLog(error)
{
    debug(error.message);
}



///////////////////////////////////Savers////////////////////////////////////////
DBInterface.saveSession = function (session)
{
    var _participant = session.participant;
    delete session.participant;

    var json = JSON.parse(JSON.stringify(session));
    DBInterface.databaseRef.child("Sessions")
        .child("id_" + _participant.getID())
        .child(session.getDateSessionString())
        .update(json);

    session.participant = _participant;
}

DBInterface.saveParticipant = function (participant)
{
    var json = JSON.parse(JSON.stringify(participant));
    DBInterface.databaseRef.child("Participants")
        .child("id_" + participant.id)
        .update(json);
}

DBInterface.saveTrial = function (trial)
{
    var session = trial.session;
    delete trial.session;
    delete trial.responseWindowOpen;
    delete trial.RTTimingStart;

   var json = JSON.parse(JSON.stringify(trial));
    DBInterface.databaseRef.child("Trials")
        .child("id_" + session.getID())
        .child(session.getDateSessionString()).child(trial.overallTrialNumber)
        .update(json);

    trial.session = session;
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

DBInterface.getSmallestConditionOrderGroup = function(callback)
{
    function findMinKey(object)
    {
        var keys = Object.keys(object);
        var minKeyIndex = 0;
        for (var i = 0; i < keys.length; i++)
            if(object[keys[i]] < object[keys[minKeyIndex]])
                minKeyIndex = i;
        return keys[minKeyIndex];
    }

    DBInterface.databaseRef.child("Conditions").once("value",
        function(snapshot)
        {
            var data = snapshot.val();
            //Is the DB initialised? If not, initialise it
            if (!data)
            {
                var initialise = {
                    "012": 0,
                    "021": 0,
                    "102": 0,
                    "120": 0,
                    "201": 0,
                    "210": 0
                }
                DBInterface.databaseRef.child("Conditions").update(initialise);
                data = initialise;
            }
            callback(findMinKey(data));
        });
}

DBInterface.incrementConditionCounter = function (condition)
{
    DBInterface.databaseRef.child("Conditions").child(condition).transaction(function(value)
    {
        return (value || 0) + 1;
    });
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



