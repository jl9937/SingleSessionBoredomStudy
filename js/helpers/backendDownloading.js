var initialised = null;

//This function checks the admin login is valid before executing database setup demands.
function checkLogin(callback)
{
    
    var id = document.getElementById("username").value;
    var pw = document.getElementById("password").value;
    if (id === "" || pw === "")
    {
        output("Login Failed");
        return;
    }

    if (initialised === null)
    {
        var config = {
            apiKey: "AIzaSyACCRI2t52ESEl-CkFiKGY6dWSpzysJ_js",
            authDomain: Main.URL,
            databaseURL: Main.DBURL,
            projectId: "mindgamesmkii",
            storageBucket: "mindgamesmkii.appspot.com",
            messagingSenderId: "275495539195"
        };
        initialised = firebase.initializeApp(config);
    }

    var result = firebase.auth().signInWithEmailAndPassword(id, pw).catch(function (error)
    {
        output("Login Failed" + error);
    }
       );
    result.then(function (user)
    {
        if (user)
        {
            var ref = firebase.database().ref();
            output("Login correct");
            output("Drawing from: " + Main.DBURL);
            callback(ref);
        }
    });
}


/////////////////Button functions/////////////////
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