ConsentForm.prototype = Object.create(View.prototype);

//Generic VAS Screen: takes a question and two scale ends and generates a VAS response
function ConsentForm(_session, _questionnaireTitle, _question, _shortQuestion, _nextScreenToGoTo)
{
    View.call(this);
    this.session = _session;
    this.questionnaireTitle = _questionnaireTitle;
    this.question = _question;
    this.shortQuestion = _shortQuestion;
    this.buttonText = "I give consent";
    this.nextScreenToGoTo = _nextScreenToGoTo || "";
}

ConsentForm.prototype.create = function (stage, db, session)
{
    this.createBasic(stage, db, session);
    this.createScreenText(this.question);
 
    this.nextButton = new ClickButton(this.buttonText, this.buttonClicked.bind(this, this.nextScreenToGoTo));
    this.addChild(this.nextButton);

}

ConsentForm.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "21px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Math.round(Main.SCREEN_WIDTH / 2,0) ;
    instructions.y = Math.round(Main.SCREEN_HEIGHT / 2 - 100,0);
    this.addChild(instructions);
}

ConsentForm.prototype.buttonClicked = function (nextScreenToGoTo)
{
    DBInterface.saveQuestionnaireResultToDb(this.session, this.questionnaireTitle, this.shortQuestion, "I give consent");
    this.session.setCurrentSessionElementComplete();
    this.moveToScreen = nextScreenToGoTo;
}

