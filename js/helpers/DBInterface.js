//Handles all DB related functionality.

function DBInterface()
{
    DBInterface.databaseRef = firebase.database().ref();
    //firebase.database.enableLogging(true);
 };

/////////////////////////Login///////////////////////////
DBInterface.logUserIn = function(prolificID, callback)
{
    var username = prolificID + "@berti.com";
    var password = prolificID.slice(12, 24);

    //wipe the current user auth
    firebase.auth().signOut().then(function()
    {
        //attempt a signin
        firebase.auth().signInWithEmailAndPassword(username, password).then(function(user)
        {
            onSignin(user);
        }).catch(function(error)
            {
                debug(error.code + " login failed, so creating a new user instead");
                firebase.auth().createUserWithEmailAndPassword(username, password).then(function(user)
                    {
                        debug("New user created");
                        pushData(DBInterface.databaseRef.child("LinkList"), { uid: user.uid, proid: prolificID });
                        onSignin(user);
                    }
                ).catch(debug("Creating new user failed"));
            }
        );
    });


    function onSignin(user)
    {
        if (user)
        {
            debug("User signed in:", user.uid);
            DBInterface.getParticipantDetails(user.uid,
                function(data)
                {  
                    var p = new Participant(user.uid, data, callback);
                });
        }
        else
            debug("Sign in failed??!");
    }
}
  
function updateData(ref, data)
{
    ref.update(data).catch(
        function(error)
        {
            handleError(error, ref, data);
        });
}

function pushData(ref, data) {
    ref.push(data).catch(
        function (error) {
            handleError(error, ref.child(), data);
        });
}

function handleError(error, ref, data)
{
    debug(error);
    var keyString = ref.key.toString();
    var packagedData = {};
    packagedData[keyString] = data;

    DBInterface.databaseRef.child("Errors").child(getSimpleDateString()).push({
        "Error": error.code,
        "Location": ref.toString().substring(37),
        "Data": packagedData,
        "Time": new Date().toString(),
        "StringData": JSON.stringify(data).replace(/"/g, "'")
    });
}

///////////////////////////////////Savers////////////////////////////////////////
DBInterface.saveSession = function (session)
{
    session.participantID = session.participant.id;
    var _participant = session.participant;
    var _schedule = session.schedule;
    delete session.participant;
    delete session.schedule;

    var json = JSON.parse(JSON.stringify(session));
    var seshref = DBInterface.databaseRef.child("Sessions").child("id_" + _participant.getID()).child(session.getDateSessionString());
    updateData(seshref, json);
   
    session.participant = _participant;
    session.schedule = _schedule;
    delete session.participantID;
}

DBInterface.saveParticipant = function (participant)
{
    var json = JSON.parse(JSON.stringify(participant));
    var partref = DBInterface.databaseRef.child("Participants").child("id_" + participant.id);
    updateData(partref, json);
}

DBInterface.saveTrial = function (trial)
{
    var session = trial.session;
    delete trial.session;
    delete trial.responseWindowOpen;
    delete trial.RTTimingStart;

    var json = JSON.parse(JSON.stringify(trial));
    var trialref  = DBInterface.databaseRef.child("Trials").child("id_" + session.getID()).child(session.getDateSessionString());
    pushData(trialref, json);
    trial.session = session;
}

DBInterface.saveVisabilityActivity = function (session, id, data)
{
    pushData(
        DBInterface.databaseRef.child("Activity").child("id_" + id).child(session.getDateSessionString()),
        data
    );
}

DBInterface.saveBypassButtonPress = function (session, questionnaireType)
{
    var id_path = "id_" + session.getID();
    var dateTime = new Date(); 
    var bypassref = DBInterface.databaseRef.child("Questionnaire").child(id_path).child(session.getDateSessionString()).child(dateTime)
    updateData(bypassref, questionnaireType + " bypassed");
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
      
///////////////////////////////////Questionnaires////////////////////////////////////////

          
DBInterface.saveQuestionnaireResultToDb = function (session, questionnaire, question, value)
{
    var ref = this.databaseRef.child("Questionnaire").child("id_" + session.getID()).child(session.getDateSessionString());
    updateData(ref, { "SessionNum": session.getSessionNumber(), "ParticipantID": session.getID(), "Condition": session.getCondition() });

    var questionData = {}
    questionData[question] = value;
    updateData(ref.child(questionnaire), questionData);  
};


///////////////////////////////////Fetchers///////////////////////////////////
DBInterface.getTodaysSessions = function (id, callback)
{
    var today = getSimpleDateString();
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



