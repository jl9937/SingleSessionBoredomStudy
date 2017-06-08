function buildTodaysScreens(session)
{
    switch (session.getParticipantStage())
    {
    case Session.STAGE_BASELINE:
        makeBaselineScreens(session);
        break;
    case Session.STAGE_DAILYTRAINING:
        makeAdLibScreens(session);
        break;
    case Session.STAGE_IMMEDIATETEST:
        makeImmediateTestScreens(session);
        break;
    default:
        makeBaselineScreens(session);
        break;
    }
}

function makeBaselineScreens(session)
{
    SCHEDULE = ["MOOD_QUESTIONNAIRES", "EFFORT_START", "ERT_START"];

    VMan.addScreen("LOGIN", new MainMenu("CONSENT", session));
    addConsentScreen("CONSENT", "INTRO", session);
    addIntroScreen("INTRO", "MOOD_QUESTIONNAIRES", session);
    //addMoodQuestionnaires("MOOD_QUESTIONNAIRES", "EFFORT_START", session);
    //addEffortTask("EFFORT_START", "ERT_START", session);
    //addERTandIMS("ERT_START", "POSTSESSION", session);
    //VMan.addScreen("POSTSESSION", new GenericScreen(session.condition, {
    //    text: "You have completed today's session!\nPlease ensure you complete 3 more sessions before " + session.getTrainingEndDateString() + "\n\nDon't worry, we will send you reminders via the Prolific Academic messaging system\n\nPlease BOOKMARK this page so that you can return easily\n\nPlease click below to return to complete your submission and reserve your place in the study for the next three weeks",
    //    buttonText: "Submit",
    //    nextScreenToGoTo: "LOGIN",
    //    special: Main.COMPLETION_LINK,
    //    buttonYPos: Main.SCREEN_HEIGHT - 160
    //}));
}

function makeAdLibScreens(session)
{
    SCHEDULE = ["ERT_START"];

    VMan.addScreen("LOGIN", new MainMenu("INTRO", session));
    addShortIntroScreen("INTRO", "ERT_START", session);
    addERTandIMS("ERT_START", "POSTSESSION", session);
    VMan.addScreen("POSTSESSION", new GenericScreen(session.condition, {
        text: "You have completed today's session!\nPlease ensure you have completed 4 sessions before " + session.getTrainingEndDateString() + "\n\nDon't worry, we will send you reminders via the Prolific Academic messaging system\n\nPlease BOOKMARK this page so that you can return easily",
        buttonText: "Main Menu",
        nextScreenToGoTo: "LOGIN",
        buttonYPos: Main.SCREEN_HEIGHT - 160
    }));
}

function makeImmediateTestScreens(session)
{
    SCHEDULE = ["ERT_START", "MOOD_QUESTIONNAIRES", "EFFORT_START"];

    VMan.addScreen("LOGIN", new MainMenu("INTRO", session));
    addIntroScreen("INTRO", "ERT_START", session);
    addERTandIMS("ERT_START", "MOOD_QUESTIONNAIRES", session);
    addMoodQuestionnaires("MOOD_QUESTIONNAIRES", "EFFORT_START", session);
    addEffortTask("EFFORT_START", "POSTSESSION", session);
    VMan.addScreen("POSTSESSION", new GenericScreen(session.condition, {
       text: "You have completed today's session, Well done!\n\nWe will send you a reminder on " + session.getEndDateString() + " to come back for the final test session, after which you will be paid!\n\nMany thanks for taking part so far, you may now close this window.",
        buttonText: "Next",
        nextScreenToGoTo: "LOGIN",
        buttonYPos: Main.SCREEN_HEIGHT - 160
    }));
}

function makeFinalTestScreens(session)
{
    SCHEDULE = ["ERT_START", "MOOD_QUESTIONNAIRES", "EFFORT_START", "ENGAGEMENT_QUEST"];

    VMan.addScreen("LOGIN", new MainMenu("INTRO", session));
    addIntroScreen("INTRO", "ERT_START", session);
    addERTandIMS("ERT_START", "MOOD_QUESTIONNAIRES", session);
    addMoodQuestionnaires("MOOD_QUESTIONNAIRES", "EFFORT_START", session);
    addEffortTask("EFFORT_START", "ENGAGEMENT_QUEST", session);
    VMan.addScreen("ENGAGEMENT_QUEST", new EmbeddedGForm(session, {
        text: "Thank you for completing this final questionnaire!",
        buttonText: "Next",
        nextScreenToGoTo: "POSTSESSION",
        buttonYPos: Main.SCREEN_HEIGHT - 80,
        form: EmbeddedGForm.ENG_DEMO
    }));
    VMan.addScreen("POSTSESSION", new GenericScreen(session.condition, {
        text: "You have completed today's session, and the whole experiment. Well done!\n\nWe will be processing reimbursements via Prolific Academic as soon as possible.\nMany thanks for taking part, you may now close this window.",
        buttonText: "Next",
        nextScreenToGoTo: "LOGIN",
        buttonYPos: Main.SCREEN_HEIGHT - 160
    }));
}

//------------------------- Component Builders -------------------------//
function addConsentScreen(name, nextpage, session)
{
    VMan.addScreen("CONSENT", new FreeTextScreen(session.condition, "CONSENTFORM",
   "Before we begin the study proper, we must ask you for your informed consent.\n\n " +
   "By completing the box below, you confirm you have read the study description " +
   "on Prolific Academic.com and are happy to take part. You also confirm that you are:\n\n" +
   "1) Over 18 years of age\n2) Have English as a first language\n3) Have not consumed alcohol within the last 12 hours\n4)Are happy for this data to be anonymised and made publicly available\n\n" +
         "If you are happy to proceed, please type 'I give consent' in the box below. If not, please just close this window.", "consent", nextpage));
}

function addIntroScreen(name, nextpage, session)
{
    VMan.addScreen(name,
    new GenericScreen(session.condition, {
        text: "This test session will take around 35 minutes to complete.\n\nYou will need to complete several questionnaires, followed by a button pressing task and an emotion recognition task.\n\nIf at any point in the session something goes wrong and you get stuck, just refresh the page and try again. You shouldn't lose too much progress!",
        buttonText: "Next",
        nextScreenToGoTo: nextpage,
        buttonYPos: Main.SCREEN_HEIGHT - 50,
        buttonXPos: Main.SCREEN_WIDTH - 210,
        buttonScale: 0.65
    }));
}

function addShortIntroScreen(name, nextpage, session)
{
    VMan.addScreen(name,
    new GenericScreen(session.condition, {
        text: "This test session will take around 10 minutes to complete.\n\nYou will need to complete two short questionnaires and the emotion recognition task\n\nIf at any point in the session something goes wrong and you get stuck, just refresh the page and try again. You shouldn't lose too much progress!",
        buttonText: "Next",
        nextScreenToGoTo: nextpage,
        buttonYPos: Main.SCREEN_HEIGHT - 50,
        buttonXPos: Main.SCREEN_WIDTH - 210,
        buttonScale: 0.65
    }));
}

function addEffortTask(entryname, nextpage, session)
{
    VMan.addScreen(entryname, new GenericScreen(session.condition,
      {
          text:
              "On the next page you will see a sequence of keys at the bottom of the screen, and a timer at the top. We need you to repeatedly type this sequence of keys as fast as you can until the timer runs out.",
          buttonText: "Begin!",
          nextScreenToGoTo: "EFFORT_CALIBRATION",
          buttonYPos: Main.SCREEN_HEIGHT - 300
      }));
    VMan.addScreen("EFFORT_CALIBRATION", new EffortTestCalibration(session.condition));
    VMan.addScreens("EFFORT_INSTRUCTIONS",
  [
      new GenericScreen(session.condition,
      {
          picture1: "../resources/interface/effort_instructions_1.png",
          buttonText: "Next",
          nextScreenToGoTo: "EFFORT_INSTRUCTIONS2",
          buttonYPos: Main.SCREEN_HEIGHT - 50,
          buttonXPos: Main.SCREEN_WIDTH - 210,
          buttonScale: 0.65
      }),
      new GenericScreen(session.condition,
          {
              picture1: "../resources/interface/effort_instructions_2.png",
              buttonText: "Next",
              nextScreenToGoTo: "EFFORT_INSTRUCTIONS3",
              buttonYPos: Main.SCREEN_HEIGHT - 50,
              buttonXPos: Main.SCREEN_WIDTH - 210,
              buttonScale: 0.65
          }),
      new GenericScreen(session.condition,
          {
              picture1: "../resources/interface/effort_instructions_3.png",
              buttonText: "Begin",
              nextScreenToGoTo: "EFFORTTEST",
              buttonYPos: Main.SCREEN_HEIGHT - 50,
              buttonXPos: Main.SCREEN_WIDTH - 210,
              buttonScale: 0.65
          })
  ]);
    VMan.addScreen("EFFORTTEST", new EffortTest(nextpage));
}

function addMoodQuestionnaires(entryname, nextpage, session)
{
    VMan.addScreen(entryname, new EmbeddedGForm(session, {
        text: "Thank you for completing those questionnaires, please click below to move onto the next part of the session",
        buttonText: "Next",
        nextScreenToGoTo: nextpage,
        buttonYPos: Main.SCREEN_HEIGHT - 80,
        form: EmbeddedGForm.MOOD_MERGED
    }));
}

function addERTandIMS(entryname, nextpage, session)
{
    VMan.addScreen(entryname, new GenericScreen(session.condition, {
        text: "Please click the button below to begin a brief questionnaire followed by the emotion recognition task",
        buttonText: "Next",
        nextScreenToGoTo: "IMS1",
        buttonYPos: Main.SCREEN_HEIGHT - 80
    }));
    VMan.addScreen("IMS1", new EmbeddedGForm(session, {
        text: "Thank you for completing the questionnaire\nPlease press the button below to start the Emotion Recognition Task",
        buttonText: "Begin",
        form: EmbeddedGForm.IMS_PRE,
        nextScreenToGoTo: "2AFC_INSTRUCTIONS",
        buttonYPos: Main.SCREEN_HEIGHT - 80
    }));
    VMan.addScreen("2AFC_INSTRUCTIONS", new GenericScreen(session.condition, {
        text: "This task is made up of several trials: In each trial, you will see a face appear briefly on the screen.\n\nYour job is to decide what emotion the face is showing: happy or sad.\n\nPlease try to respond as quickly as possible!",
        buttonText: "Begin",
        nextScreenToGoTo: "ENGINE",
        buttonYPos: Main.SCREEN_HEIGHT - 50,
        buttonXPos: Main.SCREEN_WIDTH - 210,
        buttonScale: 0.65
    }));
    VMan.addScreen("ENGINE", new Engine("POSTTASK"));
    VMan.addScreen("POSTTASK", new GenericScreen(session.condition, {
        text: "3/3 sections completed, well done!\n\nPlease press the button below to complete another brief questionnaire",
        buttonText: "Next",
        nextScreenToGoTo: "IMS2",
        buttonYPos: Main.SCREEN_HEIGHT - 80
    }));
    VMan.addScreen("IMS2", new EmbeddedGForm(session, {
        text: "Thank you for completing the questionnaire\n",
        buttonText: "Next",
        form: EmbeddedGForm.IMS_POST,
        nextScreenToGoTo: nextpage,
        buttonYPos: Main.SCREEN_HEIGHT - 80
    }));
}

