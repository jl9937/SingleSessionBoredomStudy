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
            apiKey: "AIzaSyCh8WYlFXwCehITCUwCbOA_dC747JjiMUA",
            authDomain: Main.URL,
            databaseURL: Main.DBURL,
            projectId: "berti-eea39",
            storageBucket: "berti-eea39.appspot.com",
            messagingSenderId: "275495539195"
        };
        initialised = firebase.initializeApp(config);
    }

    var result = firebase.auth().signInWithEmailAndPassword(id, pw).catch(function (error)
    {
        output("Login Failed");
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

function getBERTTrials(ref)
{
    output("Generating trials report, download should start soon");
    var fullText =
        "ID\t" +
        "Session_Number\t" +
        "Trial_Number\t" +
        "Block_Type\t" +
        "Condition\t" +
        "Classification\t" +
        "Response\t" +
        "Correct\t" +
        "Response_Time\t" +
        "Stimulus_Number\t" +
        "Stimulus_Path\t" +
        "DateTime\t" +
        "Fixation_Duration\n";

    ref.child("BERTTrials").once("value", function (allParticipantsSnapshot)
    {
        allParticipantsSnapshot.forEach(function (allSessionsSnapshot)
        {
            allSessionsSnapshot.forEach(function (allBlocksSnapshot)
            {
                allBlocksSnapshot.forEach(function (singleBlockSnapshot)
                {
                    singleBlockSnapshot.forEach(function (trialsSnapshot)
                    {
                        var trial = trialsSnapshot.val();
                        var line = trial.id + "\t" +
                            trial.sessionNum + "\t" +
                            trial.trialNum + "\t" +
                            trial.blocktype + "\t" +
                            trial.condition + "\t" +
                            trial.classification + "\t" +
                            trial.response + "\t" +
                            trial.correct + "\t" +
                            trial.responseTime + "\t" +
                            trial.stimulusNumber + "\t" +
                            trial.stimulusPath + "\t" +
                            trial.dateTime + "\t" +
                            trial.fixationDuration + "\n";
                        fullText += line;
                    });
                });
            });
        });
        saveContent(fullText, "ERT_TrialsData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { debug(error) });
}

function getEFFORTTrials(ref)
{
    output("Generating trials report, download should start soon");
    var fullText =
        "ID\t" +
    "Session_Number\t" +
    "Trial_Number\t" +
    "Button_Presses\t" +
    "Time_Taken\t" +
    "Bar_Filled\t" +
    "Difficulty\t" +
    "Max_Time\t" +
    "Probability_Of_Win\t" +
    "Decision_Time\t" +
    "Required_Presses\t" +
    "Reward\t" +
    "Trial_Won\t" +
    "Date_Time\n";

    ref.child("EFFORTTrials").once("value", function (allParticipantsSnapshot)
    {
        allParticipantsSnapshot.forEach(function (allSessionsSnapshot)
        {
            allSessionsSnapshot.forEach(function (allTrialsSnapshot)
            {
                allTrialsSnapshot.forEach(function (trialSnapshot)
            {
                    var trial = trialSnapshot.val();
                    var line = trial.id + "\t" +
                        trial.sessionNumber + "\t" +
                        trial.effortTrialNum + "\t" +
                        trial.buttonPresses + "\t" +
                        trial.timeTaken + "\t" +
                        trial.filled + "\t" +
                        trial.difficulty + "\t" +
                        trial.maxTime + "\t" +
                        trial.probabilityOfWin + "\t" +
                        trial.decisionTime + "\t" +
                        trial.requiredPresses + "\t" +
                        trial.reward + "\t" +
                        trial.win + "\t" +
                        trial.dateTime + "\n";
                    fullText += line;
                });
            });
        });
        saveContent(fullText, "EFFORT_TrialsData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { debug(error) });
}

function getSessions(ref)
{
    output("Generating sessions report, download should start soon");

    ref.child("Sessions").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
            "Session_Number\t" +
            "Condition\t" +
            "Session_Completion_Level\t" +
            "Block_Baseline_BalancePoint\t" +
            "Block_Baseline_MedianResponseTime\t" +
            "Block_Training_BalancePoint\t" +
            "Block_Training_MedianResponseTime\t" +
            "Block_Training_AverageHappyAccuracy\t" +
            "Block_Training_AverageSadAccuracy\t" +
            "Block_Testing_BalancePoint\t" +
            "Block_Testing_MedianResponseTime\t" +
            "EFF_CalibrationPresses\t" +
            "EFF_EasyChoices\t" +
            "EFF_HardChoices\t" +
            "Money_Won\t" +
            "OS\t" +
            "Browser\t" +
            "Session_date\n";
        snapshot.forEach(function (idSnapshot)
        {
            idSnapshot.forEach(function (sessionSnapshot)
            {
                var session = sessionSnapshot.val();
                var line = session.id + "\t" +
                    session.sessionNumber + "\t" +
                    session.condition + "\t" +
                    session.completionLevel + "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("0").val() !== null ? sessionSnapshot.child("BERT_blocks").child("0").val().balancePoint : "undefined") + "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("0").val() !== null ? sessionSnapshot.child("BERT_blocks").child("0").val().medianResponseTime : "undefined")+ "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("1").val() !== null ? sessionSnapshot.child("BERT_blocks").child("1").val().balancePoint : "undefined")+ "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("1").val() !== null ? sessionSnapshot.child("BERT_blocks").child("1").val().medianResponseTime : "undefined")+ "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("1").val() !== null ? sessionSnapshot.child("BERT_blocks").child("1").val().averageHappyAccuracy : "undefined")+ "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("1").val() !== null ? sessionSnapshot.child("BERT_blocks").child("1").val().averageSadAccuracy : "undefined")+ "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("2").val() !== null ? sessionSnapshot.child("BERT_blocks").child("2").val().balancePoint : "undefined")+ "\t" +
                    (sessionSnapshot.child("BERT_blocks").child("2").val() !== null ? sessionSnapshot.child("BERT_blocks").child("2").val().medianResponseTime : "undefined") + "\t" +
                    session.EFF_calibrationPresses + "\t" +
                    session.EFF_easyChoices + "\t" +
                    session.EFF_hardChoices + "\t" +
                    session.moneyWon + "\t" +
                    session.OS + "\t" +
                    session.browser + "\t" +
                    session.date + "\n";
                fullText += line;
            });
        });
        saveContent(fullText, "SessionData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { debug(error) });
}

function getParticipants(ref)
{
    output("Generating participants report, download should start soon");

    ref.child("Participants").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
                        "Condition\t" +
                        "studyCompleted\t" +
                        "DateTimeRegistered\t" +
                        "TrainingEndDate\t" +
                        "EndDate\t" +
                        "StudyStage\t" +
                        "SessionsCompleted\t" +
                        "MoneyEarned\t" +
                        "SessionsBegun\n";
        snapshot.forEach(function (idSnapshot)
        {
            var participant = idSnapshot.val();
            var line = participant.id + "\t"
                + participant.condition + "\t"
                + participant.studyCompleted + "\t"
                + participant.datetimeRegistered + "\t"
                + participant.trainingEndDate + "\t"
                + participant.endDate + "\t"
                + participant.studyStage + "\t"
                + participant.sessionsCompleted + "\t"
                + participant.moneyEarned + "\t"
                + participant.sessionsBegun + "\n";
            fullText += line;
        });
        saveContent(fullText, "ParticipantsData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { debug(error) });
}

function getActivity(ref)
{
    output("Generating activity report, download should start soon");

    ref.child("Activity").once("value", function (snapshot)
    {
        var fullText = "ID\t" +
            "SessionNumber\t" +
            "View\t" +
            "OldState\t" +
            "OldStateBegan\t" +
            "NewState\t" +
            "NewStateBegan\t" +
            "DurationOfOldState\n";
        snapshot.forEach(function (idSnapshot)
        {
            idSnapshot.forEach(function (sessionSnapshot)
            {
                sessionSnapshot.forEach(function (activitySnapshot)
                {
                    var activity = activitySnapshot.val();
                    var line = activity.id +
                        "\t" + activity.sessionNumber +
                        "\t" + activity.view +
                        "\t" + activity.oldState +
                        "\t" + activity.oldStateBegan +
                        "\t" + activity.newState +
                        "\t" + activity.newStateBegan +
                        "\t" + activity.durationOfOldState +
                        "\n";
                    fullText += line;
                });
            });
        });
        saveContent(fullText, "ActivityData.txt");
        output("Report generated: To view, copy the contents of the downloaded file straight into Excel. This will format it correctly");
    }).catch(function (error) { debug(error) });
}

/////////////Utility Functions////////////
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
            storageBucket: "project-1770268941460198008.appspot.com",
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