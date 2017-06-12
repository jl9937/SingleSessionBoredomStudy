FreeTextScreen.prototype = Object.create(View.prototype);

//Generic VAS Screen: takes a question and two scale ends and generates a VAS response
function FreeTextScreen(_session, _questionnaireTitle, _question, _shortQuestion, _nextScreenToGoTo)
{
    View.call(this);
    this.session = _session;
    this.questionnaireTitle = _questionnaireTitle;
    this.question = _question;
    this.shortQuestion = _shortQuestion;
    this.buttonText = "Next";
    this.nextScreenToGoTo = _nextScreenToGoTo || "";
}

FreeTextScreen.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createScreenText(this.question);
  

    this.textInput = new InputElement(Main.SCREEN_HEIGHT / 2 + 100, 400);
    this.addChild(this.textInput);
    this.textInput.focus();

    this.nextButton = new ClickButton(Main.SCREEN_HEIGHT - 50, this.buttonText, this.buttonClicked.bind(this, this.nextScreenToGoTo), Main.SCREEN_WIDTH - 210, 0.65);
    this.addChild(this.nextButton);
    this.nextButton.disable();
}

FreeTextScreen.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "21px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Math.round(Main.SCREEN_WIDTH / 2,0) ;
    instructions.y = Math.round(Main.SCREEN_HEIGHT / 2 - 100,0);
    this.addChild(instructions);
}

FreeTextScreen.prototype.buttonClicked = function (nextScreenToGoTo)
{
    DBInterface.saveQuestionnaireResultToDb(this.session, this.questionnaireTitle, this.shortQuestion, this.textInput.value);
    this.moveToScreen = nextScreenToGoTo;
}

FreeTextScreen.prototype.mainLoop = function()
{
    //todo this is naughty. Move this to options
    if (this.textInput.getValue().search(/\s*I\s+GIVE\s+CONSENT\s*/i) !== -1)
    {
        this.nextButton.enable();
        this.mainLoop = function() {};
    }
}