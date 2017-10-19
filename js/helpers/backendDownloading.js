var initialised = null;

//This function checks the admin login is valid before executing database setup demands.
function logout()
{
    firebase.auth().signOut();  
    window.location = '/login.html';
}

function findParticipants(ref)
{
    var min = parseInt(document.getElementById("min").value) || 0;
    var max = parseInt(document.getElementById("max").value) || 5;

    var idList = [];

    ref.child("Participants").orderByChild("sessionsCompleted").startAt(min).endAt(max).once("value",
        function(allParticipants)
        {
            allParticipants.forEach(function(participant)
            {
                if (!participant.val().excluded)
                    idList.push(participant.key.substr(3, 24));
            });
            if (idList.length === 0)
                $("#displayArea").text("Sorry, we didn't find any participants matching those criteria");
            else
            {
                $("#displayArea").text(idList.join(",\n"));
            }
            output("Searched for participants that completed between " + min + " and " + max + " sessions");
        }).catch(function(error)
    {
        output(error);
    });
}


String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function changeExclusionStatus(ref, newStatus)
{         
    var idList = document.getElementById("inputArea").value.replaceAll("[,\n]+","|").split("|");

    for (var i = 0; i < idList.length; i++)
    {
        //returns 1 if successfully edited, 0 if ID does not exist
        ifParticipantExistsThenSetExcluded(ref,
            idList[i],
            newStatus,
            function(result, id)
            {
                if (result)
                {
                    if (newStatus)
                        output("Excluded " + id);
                    else
                        output("Unexcluded " + id);
                }
                else
                    output("Couldn't find " + id);
            });
    }   
    function ifParticipantExistsThenSetExcluded(root, participantId, excluded, callback)
    {
        var ref = root.child("Participants").child("id_" + participantId);
        ref.once("value", function (data)
        {
            if (data.val())
            {
                ref.update({ "excluded": excluded });
                callback(1, participantId);
            }
            else
                callback(0, participantId);
        });   
    }  
}

function showExcludedParticipants(ref)
{
    var idList = [];

    ref.child("Participants").orderByChild("excluded").equalTo(true).once("value",
        function (allParticipants) {
            allParticipants.forEach(function (participant) {
                idList.push(participant.key.substr(3, 24));
            });
            if (idList.length === 0)
                $("#displayArea").text("Sorry, we didn't find any participants matching those criteria");
            else {
                $("#displayArea").text(idList.join(",\n"));
            }
            output("Searched for excluded participants");
        }).catch(function (error) {
        output(error);
    });
}    


/////////////////Downloading functions/////////////////
function getQuestionnaires(ref)
{
    output("Generating Questionnaire report, download should start soon");
    var fullText = "";
    ref.child("Questionnaire").once("value",
        function(allParticipantsSnapshot)
        {
            allParticipantsSnapshot.forEach(function(allSessionsSnapshot)
            {
                allSessionsSnapshot.forEach(function(allQuestionnairesSnapshot)
                {
                    
                    fullText = appendObjectToFullText(allQuestionnairesSnapshot.val(), fullText);
                    
                });
            });
            saveContent(fullText, "QuestionnaireData.csv");
            output("Questionnaire report generated");
        }).catch(function(error)
    {
        debug(error);
    });
}

function getTrials(ref)
{
    output("Generating Trials report, download should start soon");
    var fullText = "";
    ref.child("Trials").once("value",
        function(allParticipantsSnapshot)
        {
            allParticipantsSnapshot.forEach(function(allSessionsSnapshot)
            {
                allSessionsSnapshot.forEach(function(allBlocksSnapshot)
                {
                    allBlocksSnapshot.forEach(function(trialsSnapshot)
                    {
                        fullText = appendObjectToFullText(trialsSnapshot.val(), fullText);
                    });
                });
            });
            saveContent(fullText, "TrialsData.csv");
            output("Trials report generated");
        }).catch(function(error)
    {
        debug(error);
    });
}

function getActivity(ref) {
    output("Generating Activity report, download should start soon");
    var fullText = "";
    ref.child("Activity").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (allSessionsSnapshot) {
                allSessionsSnapshot.forEach(function (sessionSnapshot) {
                    sessionSnapshot.forEach(function (trialsSnapshot) {
                        fullText = appendObjectToFullText(trialsSnapshot.val(), fullText);
                    });
                });
            });
            saveContent(fullText, "ActivityData.csv");
            output("Activity report generated");
        }).catch(function (error) {
        debug(error);
    });
}

function getSessions(ref)
{
    output("Generating Sessions report, download should start soon");
    var fullText = "";
    ref.child("Sessions").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (allSessionsSnapshot) {
                allSessionsSnapshot.forEach(function (sessionSnapshot) {  
                        fullText = appendObjectToFullText(sessionSnapshot.val(), fullText); 
                });
            });
            saveContent(fullText, "SessionsData.csv");
            output("Sessions report generated");
        }).catch(function (error) {
        debug(error);
    });
}

function getParticipants(ref)
{
    output("Generating Participants report, download should start soon");
    var fullText = "";
    ref.child("Participants").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (trialsSnapshot) { 
                    fullText = appendObjectToFullText(trialsSnapshot.val(), fullText); 
            });
            saveContent(fullText, "ParticipantsData.csv");
            output("Participants report generated");
        }).catch(function (error) {
        debug(error);
    });
}












//////////////////////////Utility Functions/////////////////////////
function appendObjectToFullText(object, fullText, participantID, sessionNum, condition) {
    String.prototype.toProperCase = function () {
        return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1); });
    };
    object = flattenObject(object);
    if (fullText.length === 0) {
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++)
            keys[i] = keys[i].toProperCase();
        fullText += (keys.join() + "\n");
    }
    var values = Object.values(object);
    fullText += (values.join() + "\n");
    return fullText;
}

function flattenObject(ob)
{
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object') {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

//Takes text and outputs it to the browser window by appending it to the HTML
function output(text)
{
    var mydiv = document.getElementById("updates");
    var newcontent = document.createElement('div');
    newcontent.innerHTML = "<li>" + text + "</li>";
    while (newcontent.firstChild)
        mydiv.appendChild(newcontent.firstChild);
}

function saveContent(fileContents, fileName)
{
    var blob = new Blob([fileContents], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
}

function clearAllData()
{
    if (initialised === null)
    {
        var config = {
            apiKey: "AIzaSyBFagpiWXN9tTQtanFCMyEdg7g6CvOUqW8",
            authDomain: Main.URL,
            databaseURL: Main.DBURL,
            storageBucket: "project-1770268941460198008.appspot.com"
        };
        initialised = firebase.initializeApp(config);
    }

    //you must disable the rules in the DB using firebase
        output("Deleting EVERYTHING");
        var databaseRef = firebase.database().ref();
        databaseRef.child("Trials").set(null);
        databaseRef.child("Activity").remove();
        databaseRef.child("Sessions").remove();
        databaseRef.child("Questionnaire").remove();
        databaseRef.child("Participants").remove();
}

function output(text) {
    
    var newcontent = document.createElement('span');
    newcontent.innerHTML = "<li>" + text + "</li>";
    $("#updates").prepend(newcontent);
}