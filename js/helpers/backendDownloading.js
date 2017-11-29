var initialised = null;

//This function checks the admin login is valid before executing database setup demands.
function logout() {
    firebase.auth().signOut();
    window.location = '/login.html';
}

function findParticipants(ref) {
    var min = parseInt(document.getElementById("min").value);
    var max = parseInt(document.getElementById("max").value);
    if (min === NaN || max === NaN) {
        $("#inputArea").val("Sorry, we didn't find any participants matching those criteria");
        return;
    }

    var idList = [];

    ref.child("Participants").orderByChild("sessionsCompleted").startAt(min).endAt(max).once("value",
        function (allParticipants) {
            allParticipants.forEach(function (participant) {
                if (!participant.val().excluded)
                    idList.push(participant.key.substr(3, 28));
            });
            if (idList.length === 0)
                $("#inputArea").val("Sorry, we didn't find any participants matching those criteria");
            else {
                writeIDstoTextBox(idList);
            }
            output("Found " + idList.length + " participants that completed between " + min + " and " + max + " sessions");
        }).catch(function (error) {
            output(error);
        });
}

function changeExclusionStatus(ref, newStatus) {
    var idList = getIDsfromTextBox();
    for (var i = 0; i < idList.length; i++)
        if (idList[i].length > 2)
            ifParticipantExistsThenSetValue(ref, idList[i], "excluded", newStatus);
}

function setParticipantStage(ref) {
    var newStudyStage = parseInt(document.getElementById("stage").value);

    if (newStudyStage !== newStudyStage || newStudyStage < 1 || newStudyStage > 6) {
        output("Sorry, that's not a valid study stage");
        return;
    }

    var idList = getIDsfromTextBox();
    for (var i = 0; i < idList.length; i++)
        if (idList[i].length > 2)
            ifParticipantExistsThenSetValue(ref, idList[i], "studyStage", newStudyStage);
}

function ifParticipantExistsThenSetValue(root, participantId, keyname, value) {
    var ref = root.child("Participants").child("id_" + participantId);
    ref.once("value", function (data) {
        if (data.val()) {
            var obj = {};
            obj[keyname] = value;
            ref.update(obj);
            output("Set " + participantId + " to " + value);
        }
        else
            output("Couldn't find " + participantId);
    });
}

function getExcludedParticipants(ref, callback) {
    var idList = [];
    ref.child("Participants").orderByChild("excluded").equalTo(true).once("value",
        function (allParticipants) {
            allParticipants.forEach(function (participant) {
                idList.push(participant.key.substr(3, 28));
            });
            callback(idList);
        }).catch(function (error) {
            output(error);
        });
}

function showExcludedParticipants(ref) {
    output("Searched for excluded participants");
    getExcludedParticipants(ref,
        function (idList) {
            if (idList.length === 0)
                $("#inputArea").val("Sorry, we didn't find any participants matching those criteria");
            else {
                for (var i = 0; i < idList.length; i++)
                    idList[i] = idList[i];
                writeIDstoTextBox(idList);
            }
        });
}

function queryCurrentParticipants(ref) {
    var IDs = getIDsfromTextBox();
    var fullText = "";

    if (IDs.length > 0) {
        fullText += "ID\t\t\t\tSeshsCompleted\tLastSession\tStage\n";
        ref.child("Participants").once("value",
            function (allParticipants) {
                allParticipants.forEach(function (participant) {
                    var participantID = participant.key.substr(3, 28);
                    if (isPresentOnList(participantID, IDs)) {
                        //append to array here
                        fullText += convertType(participantID, 1) + "\t" + participant.val().sessionsCompleted + "\t\t" + participant.val().lastSessionCompleted + "\t" + participant.val().studyStage + "\n";
                    }
                });
                output("Query ran");
                $("#inputArea").val(fullText);
            }).catch(function (error) {
                output(error);
            });
    }
}

/////////////////Downloading functions/////////////////
function downloadData(getFunction, ref) {
    if ($("#togBtn")[0].checked) {
        output("Excluded participants INCLUDED");
        getFunction(ref, []);
    }
    else {
        getExcludedParticipants(ref,
            function (excludedList) {
                for (var i = 0; i < excludedList.length; i++)
                    excludedList[i] = "id_" + excludedList[i];
                //output("Excluded participants have been removed from the data download");
                getFunction(ref, excludedList);
            });
    }
}

function isPresentOnList(string, list) {
    for (var i = 0; i < list.length; i++)
        if (string === list[i])
            return true;
    return false;
}

function getTrials(ref, excludedList) {
    output("Collating Trials data, please wait");
    var fullText = "";
    ref.child("Trials").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (allSessionsSnapshot) {
                if (!isPresentOnList(allSessionsSnapshot.key, excludedList)) {
                    allSessionsSnapshot.forEach(function (allBlocksSnapshot) {
                        allBlocksSnapshot.forEach(function (trialsSnapshot) {   
                                fullText = appendObjectToFullText(trialsSnapshot.val(), fullText);
                        });
                    });
                }
            });
            saveContent(fullText, "TrialsData.csv");
            output("Trials data downloaded");
        }).catch(function (error) {
            debug(error);
        });
}


function getQuestionnaires(ref, excludedList)
{
    output("Collating Questionnaire data, please wait");
    var fullText = "";
    ref.child("Questionnaire").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (allSessionsSnapshot) {
                if (!isPresentOnList(allSessionsSnapshot.key, excludedList))
                    allSessionsSnapshot.forEach(function (sessionSnapshot) {
                        if (Object.keys(sessionSnapshot.val()).length >= 5)
                            fullText = appendObjectToFullText(sessionSnapshot.val(), fullText);
                    });
            });
            saveContent(fullText, "QuestionnaireData.csv");
            output("Questionnaire data downloaded");
        }).catch(function (error) {
        debug(error);
    });
}

function getActivity(ref, excludedList) {
    output("Collating Activity data, please wait");
    var fullText = "";
    ref.child("Activity").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (allSessionsSnapshot) {
                if (!isPresentOnList(allSessionsSnapshot.key, excludedList))
                    allSessionsSnapshot.forEach(function (sessionSnapshot) {
                        sessionSnapshot.forEach(function (trialsSnapshot) {
                            fullText = appendObjectToFullText(trialsSnapshot.val(), fullText);
                        });
                    });
            });
            saveContent(fullText, "ActivityData.csv");
            output("Activity data downloaded");
        }).catch(function (error) {
            debug(error);
        });
}

function getSessions(ref, excludedList) {
    output("Collating Sessions data, please wait");
    var fullText = "";
    ref.child("Sessions").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (allSessionsSnapshot) {
                if (!isPresentOnList(allSessionsSnapshot.key, excludedList))
                    allSessionsSnapshot.forEach(function (sessionSnapshot) {
                        fullText = appendObjectToFullText(sessionSnapshot.val(), fullText);
                    });
            });
            saveContent(fullText, "SessionsData.csv");
            output("Sessions data downloaded");
        }).catch(function (error) {
            debug(error);
        });
}

function getParticipants(ref, excludedList) {
    output("Collating Participants data, please wait");
    var fullText = "";
    ref.child("Participants").once("value",
        function (allParticipantsSnapshot) {
            allParticipantsSnapshot.forEach(function (trialsSnapshot) {
                if (!isPresentOnList(trialsSnapshot.key, excludedList))
                    fullText = appendObjectToFullText(trialsSnapshot.val(), fullText);
            });
            saveContent(fullText, "ParticipantsData.csv");
            output("Participants data downloaded");
        }).catch(function (error) {
            debug(error);
        });
}

//////////////////////////Utility Functions/////////////////////////
function rewriteList() {
    writeIDstoTextBox(getIDsfromTextBox());
}

//mode = 0 : reading in
//mode = 1 : writing out
function convertType(id, mode) {
    id = id.trim();
    if (id.length < 2)
        return "";

    if (id.length !== 24 && id.length !== 28)
        return "Error: could not convert " + id;

    if (mode) {
        if ($("#dealinProlific")[0].checked) {
            //if it's not a prolific ID
            if (id.length === 28) {
                if (fbIDtoProlificIDMap[id])
                    return fbIDtoProlificIDMap[id];
                else
                    return "Error: could not convert " + id;
            }
        }
    }
    else {
        //if it's a prolific ID
        if (id.length === 24)
            if (prolificIDtoFbIDMap[id])
                return prolificIDtoFbIDMap[id];
            else
                return "Error: could not convert " + id;
        //it's a prolificID so return  a UID
    }

    return id;
}

function getIDsfromTextBox() {
    var IDs = $("#inputArea").val();
    IDs = IDs.split(/[,\n]+/);

    for (var i = 0; i < IDs.length; i++)
        IDs[i] = convertType(IDs[i], 0);

    return IDs;
}

function writeIDstoTextBox(IDs) {
    var joinString = "\n";
    if ($("#commas")[0].checked)
        joinString = ",\n";

    for (var i = 0; i < IDs.length; i++)
        IDs[i] = convertType(IDs[i], 1);

    $("#inputArea").val(IDs.join(joinString));
}

function appendObjectToFullText(object, fullText) {
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

function flattenObject(ob) {
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
function output(text) {
    var mydiv = document.getElementById("updates");
    var newcontent = document.createElement('div');
    newcontent.innerHTML = "<li>" + text + "</li>";
    while (newcontent.firstChild)
        mydiv.appendChild(newcontent.firstChild);
}

function saveContent(fileContents, fileName) {
    var timeString = new Date().toLocaleDateString();
    var blob = new Blob([fileContents], { type: "text/plain;charset=utf-8" });
    //saveAs(blob, timeString+"_"+fileName);
    saveAs(blob, fileName);
}

function clearAllData() {
    if (initialised === null) {
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



var fbIDtoProlificIDMap = [];
var prolificIDtoFbIDMap = [];
function getIDMap(ref) {
    ref.child("LinkList").once("value", function (snapshot) {
        var data = snapshot.val();
        if (data) {
            for (var i = 0; i < Object.keys(data).length; i++) {
                var obj = data[Object.keys(data)[i]];
                fbIDtoProlificIDMap[obj.uid] = obj.proid;
                prolificIDtoFbIDMap[obj.proid] = obj.uid;
            };
        }
    }).catch(function (error) {
        output("Permissions Error: " + error);
    });

}



function output(text) {
    var timestamp = new Date();

    var newcontent = document.createElement('span');
    newcontent.innerHTML = "<li>" + timestamp.toDateString() + " " + timestamp.toLocaleTimeString() + ": " + text + "</li>";
    $("#updates").append(newcontent);
}


