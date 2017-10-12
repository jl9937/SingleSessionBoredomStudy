LikertScreen.prototype = Object.create(View.prototype);

//Generic VAS Screen: takes a question and two scale ends and generates a VAS response
function LikertScreen(_session, _questionnaireTitle, _question, _shortQuestion)
{
    View.call(this);
    this.questionnaireTitle = _questionnaireTitle;
    this.session = _session;
    this.question = _question;
    this.shortQuestion = _shortQuestion;
    this.lowend = "Not at all";
    this.middle = "Moderately";
    this.highend = "Extremely";
    this.buttonText = "Next";
    this.nextScreenToGoTo = "";
}

LikertScreen.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createScreenText(this.question);
    this.lik = new Likert(this.lowend, this.middle, this.highend, this.showButton.bind(this));
    this.addChild(this.lik);
}

LikertScreen.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "30px Arial", fill: "#FFFFFF"});
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = Main.SCREEN_HEIGHT / 2 - 150;
    this.addChild(instructions);
}

LikertScreen.prototype.showButton = function ()
{
    this.nextButton = new ClickButton(this.buttonText, this.buttonClicked.bind(this, this.nextScreenToGoTo));
    this.addChild(this.nextButton);
}

LikertScreen.prototype.buttonClicked = function (nextScreenToGoTo)
{
    DBInterface.saveQuestionnaireResultToDb(this.session, this.questionnaireTitle, this.shortQuestion, this.lik.mark);
    this.moveToScreen = nextScreenToGoTo;
}
