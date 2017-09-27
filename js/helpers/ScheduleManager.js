function buildTodaysScreens(session)
{



    switch (session.getDayNumber())
    {
        case 1:
            session.setSchedule(["MAINMENU", "CONSENT", "TASK", "QUESTIONNAIRE", "DEMOGRAPHICS", "POSTSESSION"]);
            break;
        case 2:
            session.setSchedule(["MAINMENU", "TASK", "QUESTIONNAIRE", "POSTSESSION"]);
            break;
        case 3:
            session.setSchedule(["MAINMENU", "TASK", "QUESTIONNAIRE", "POSTSESSION", "POSTSTUDY"]);
            break;
        default:
            session.setSchedule(["MAINMENU", "CONSENT", "TASK", "QUESTIONNAIRE", "DEMOGRAPHICS", "POSTSESSION"]);
            break;
    }
    makeScreens(session);
}

function makeScreens(session)
{
    var screenbuilderMap = {
        "MAINMENU": this.makeMainMenu, //done
        "CONSENT": this.makeConsent, //done
        "TASK": this.makeTask, //done
        "QUESTIONNAIRE": this.makeQuestionnaire,
        "DEMOGRAPHICS": this.makeDemographics,
        "POSTSESSION": this.makePostSession, //done
        "POSTSTUDY": this.makePostStudy //done
    }

    var schedule = session.getSchedule();
    for (var i = 0; i < schedule.length; i++)
        screenbuilderMap[schedule[i]](schedule[i], schedule[i + 1], session);
}


function makeMainMenu(name, nextpage, session)
{
    VMan.addScreen(name, new MainMenu(nextpage, session));
}

function makeConsent(name, nextpage, session)
{
    VMan.addScreen(name, new ConsentForm(session.condition, "CONSENTFORM",
   "Before we begin the study proper, we must ask you for your informed consent.\n\n " +
   "By completing the box below, you confirm you have read the study description " +
   "on Prolific Academic.com and are happy to take part. You also confirm that you are:\n\n" +
   "1) Over 18 years of age\n2) Have English as a first language\n3) Are happy for your data to be anonymised and made publicly available\n\n" +
         "If you are happy to proceed, please press the button below. If not, please just close this window.", "consent", nextpage));
}

function makePostSession(name, _nextpage, session)
{
    VMan.addScreen(name,
        new GenericScreen(session.getCondition(),
        {
            text:
                "You have completed today's session!\nWe will send out Prolific Academic invites for the next part of the study shortly, please keep an eye on your mailbox\n\Click below to return to complete your submission of this session.",
            buttonText: "Submit",
            nextScreenToGoTo: "MAINMENU",
            special: Main.COMPLETION_LINKS[session.getDayNumber() - 1]
        }));
}

function makePostStudy(name, _nextpage, session)
{
    VMan.addScreen(name,
        new GenericScreen(session.getCondition(),
        {
            text:
                "You have completed the final session of the study, thank you for taking part!\n. We will be processing acceptions and rejections over the coming days. \nClick below to return to complete your submission of this session.",
            buttonText: "Submit",
            nextScreenToGoTo: "MAINMENU",
            special: Main.COMPLETION_LINKS[session.getDayNumber() - 1]
        }));
}

function makeTask(name, nextpage, session)
{
    switch (session.getCondition())
    {
        case Main.CONDITION_NONGAME:
            VMan.addScreens("TASK", [
               new GenericScreen(session.getCondition(), {
                   picture1: "../resources/interface/instructions1.png",
                   buttonText: "Next page",
                   nextScreenToGoTo: "INSTRUCTIONS2",
                   buttonYPos: Main.SCREEN_HEIGHT - 30,
                   buttonXPos: Main.SCREEN_WIDTH - 210,
                   buttonScale: 0.65
               }),
               new GenericScreen(session.getCondition(), {
                   picture1: "../resources/interface/instructions2.png",
                   buttonText: "Next page",
                   nextScreenToGoTo: "INSTRUCTIONS3",
                   buttonYPos: Main.SCREEN_HEIGHT - 30,
                   buttonXPos: Main.SCREEN_WIDTH - 210,
                   buttonScale: 0.65
               }),
               new GenericScreen(session.getCondition(), {
                   picture1: "../resources/interface/instructions3.png",
                   buttonText: "Start!",
                   nextScreenToGoTo: "ENGINE",
                   buttonYPos: Main.SCREEN_HEIGHT - 70
               }),
               new NonGameEngine()
            ], nextpage);
            break;
        case Main.CONDITION_POINTS:
            VMan.addScreens("TASK", [
               new GenericScreen(session.getCondition(), {
                   background: "../resources/interface/background.png",
                   picture1: "../resources/interface/Points_instructions1.png",
                   buttonText: "Next page",
                   buttonYPos: Main.SCREEN_HEIGHT - 30,
                   buttonXPos: Main.SCREEN_WIDTH - 210,
                   buttonScale: 0.65
               }),
               new GenericScreen(session.getCondition(), {
                   background: "../resources/interface/background.png",
                   picture1: "../resources/interface/Points_instructions2.png",
                   buttonText: "Next page",
                   buttonYPos: Main.SCREEN_HEIGHT - 30,
                   buttonXPos: Main.SCREEN_WIDTH - 210,
                   buttonScale: 0.65
               }),
               new GenericScreen(session.getCondition(), {
                   background: "../resources/interface/background.png",
                   picture1: "../resources/interface/Points_instructions3.png",
                   buttonText: "Next page",
                   buttonYPos: Main.SCREEN_HEIGHT - 30,
                   buttonXPos: Main.SCREEN_WIDTH - 210,
                   buttonScale: 0.65
               }),
               new GenericScreen(session.getCondition(), {
                   background: "../resources/interface/background.png",
                   picture1: "../resources/interface/Points_instructions4.png",
                   buttonText: "Start!",
                   buttonYPos: Main.SCREEN_HEIGHT - 60,
                   buttonScale: 0.8
               }),
               new PointsEngine()
            ], nextpage);
            break;
        case Main.CONDITION_THEME:
            var todaysBackground = "../resources/theme/Packville.png";
            var todaysTextFilePath = "../resources/theme/screenText/Packville.txt";

            VMan.addScreens("TASK",
            [
                new GenericScreen(session.getCondition(),
                {
                    picture1: "../resources/interface/Theme_instructions1.png",
                    buttonText: "Next page",
                    buttonYPos: Main.SCREEN_HEIGHT - 60,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(session.getCondition(),
                {
                    background: todaysBackground,
                    picture1: "../resources/interface/themeDarkener.png",
                    picture2: "../resources/interface/Theme_instructions2.png",
                    buttonText: "Next page",
                    buttonYPos: Main.SCREEN_HEIGHT - 60,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(session.getCondition(),
                {
                    background: todaysBackground,
                    picture1: "../resources/interface/themeDarkener.png",
                    picture2: "../resources/interface/Theme_instructions3.png",
                    buttonText: "Next page",
                    buttonYPos: Main.SCREEN_HEIGHT - 60,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(session.getCondition(),
                {
                    background: todaysBackground,
                    picture1: "../resources/interface/themeDarkener.png",
                    picture2: "../resources/interface/Theme_instructions4.png",
                    buttonText: "Next page",
                    buttonYPos: Main.SCREEN_HEIGHT - 60,
                    buttonXPos: Main.SCREEN_WIDTH - 210,
                    buttonScale: 0.65
                }),
                new GenericScreen(session.getCondition(),
                {
                    background: todaysBackground,
                    picture1: "../resources/interface/textspace.png",
                    textFilepath: todaysTextFilePath,
                    buttonText: "Start sorting!",
                    buttonYPos: Main.SCREEN_HEIGHT - 100
                }),
                new ThemeEngine()
            ], nextpage);
            break;
    }
}


//todo finish this
function makeQuestionnaire(name, nextpage, session)
{
    VMan.addScreen(name, new EmbeddedGForm(session, {
        text: "Thank you for completing those questionnaires, please click below to move onto the next part of the session",
        buttonText: "Next",
        nextScreenToGoTo: nextpage,
        buttonYPos: Main.SCREEN_HEIGHT - 80,
        form: EmbeddedGForm.MOOD_MERGED
    }));
}

function makeDemographics(name, nextpage, session)
{
    VMan.addScreen(name, new EmbeddedGForm(session, {
        text: "Thank you for completing the questionnaire\nPlease press the button below to start the Emotion Recognition Task",
        buttonText: "Begin",
        form: EmbeddedGForm.IMS_PRE,
        nextScreenToGoTo: nextpage,
        buttonYPos: Main.SCREEN_HEIGHT - 80
    }));
}