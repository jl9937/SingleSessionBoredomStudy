EmbeddedGForm.prototype = Object.create(View.prototype);

EmbeddedGForm.IMS_PRE = {
    "name": "IMS_PRE",
    "url": "https://docs.google.com/forms/d/e/1FAIpQLSeq8iGbL-Up0483-xB8lBY1UCzF7XxPPwNmxo3TEHQ7aLRZdg/viewform?usp=pp_url",
    "prolificIDString": "&entry.1610714413=",
    "sessionIDString": "&entry.1638891083=",
    "hidetop": true,
    "advancesSessionStage": false
}

EmbeddedGForm.IMS_POST = {
    "name": "IMS_POST",
    "url": "https://docs.google.com/forms/d/e/1FAIpQLScmhItjRBFOtWQlVXMfyTUfPv-AJ7tRTvdhclTsowqFbup_ew/viewform?usp=pp_url",
    "prolificIDString": "&entry.1610714413=",
    "sessionIDString": "&entry.1638891083=",
    "hidetop": true,
    "advancesSessionStage": true
}

EmbeddedGForm.MOOD_MERGED = {
    "name": "MOOD_MERGED",
    "url": "https://docs.google.com/forms/d/e/1FAIpQLSfGwIR7QqOHD6ITQuJQnmMRlVMYysBa2cTm81rCvK_-GFpkIg/viewform?usp=pp_url",
    "prolificIDString":"&entry.34672029=",
    "sessionIDString": "&entry.1447752923=",
    "hidetop": false,
    "advancesSessionStage": true
}

EmbeddedGForm.ENG_DEMO = {
    "name": "ENG_DEMO",
    "url": "https://docs.google.com/forms/d/e/1FAIpQLScSVuOYtgTKf6kDm8eL0IEa63UakB1MqgR6PFtd7MfUjst-BA/viewform?usp=pp_url",
    "prolificIDString": "&entry.768252546=",
    "sessionIDString": "&entry.837619486=",
    "hidetop": true,
    "advancesSessionStage": true
}

function EmbeddedGForm(_session, _options)
{
    View.call(this);
    this.session = _session;
    this.options = _options;
    this.form = this.options.form;

    //important options-------
    //questionnaireType
}

//opens page and then opens iframe on top of page.
//waits until signal recieved from the submission of the google form, then iframe hides and the participant can progress.
//Cannot progress until submission is completed

EmbeddedGForm.prototype.create = function (stage, db, session)
{
    this.formComplete = false;
    this.createBasic(stage, db, session);
    this.createQuestionnaire();
    

    this.loadingText = new PIXI.Text("Loading questionnaire....", { align: "center", font: "22px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
    this.loadingText.anchor = new PIXI.Point(0.5, 0.5);
    this.loadingText.x = Math.round(Main.SCREEN_WIDTH / 2, 0);
    this.loadingText.y = Math.round(Main.SCREEN_HEIGHT / 2 - 100, 0);
    this.addChild(this.loadingText);


    var self = this;
    var counter = 0;
    this.waitOnQuestionnaire = DBInterface.databaseRef.child("Questionnaire").child("id_" + this.session.getID()).child(this.session.getDateSessionString());
    this.waitOnQuestionnaire.on("value", function (snapshot)
    {
        var data = snapshot.val();
        if (counter !== 0 && data !== null && data !== undefined)
            self.hideQuestionnaire();
        counter++;
    });
    document.getElementById('gFormsiframe').onload = function ()
    {
        $("#game-canvas").hide();
        $("#embeddedQuestionnaire").show();
        self.createBypassButton();
        document.getElementById('gFormsiframe').onload = function() {};
    }
}

EmbeddedGForm.prototype.createQuestionnaire = function()
{
    var iframe = document.createElement("IFRAME");
    iframe.width = 640;
    iframe.seamless = true;
    iframe.setAttribute("id", "gFormsiframe");
    iframe.src = this.form.url + this.form.prolificIDString + this.session.getID() + this.form.sessionIDString + this.session.getSessionNumber();
    if (this.form.hidetop)
    {
        iframe.height = 860 + 580;
        iframe.style.cssText = "margin-top: -580px;";
    }
    else
        iframe.height = 860;

    $("#embeddedQuestionnaire").empty();
    $("#embeddedQuestionnaire").append(iframe);
}

EmbeddedGForm.prototype.hideQuestionnaire = function ()
{
    if (!this.formComplete)
    {
        this.formComplete = true;
        this.removeChild(this.loadingText);
        this.waitOnQuestionnaire.off();
        this.createScreenText(this.options.text);
        this.nextButton = new ClickButton(Main.SCREEN_HEIGHT - 50,
            this.options.buttonText,
            this.buttonClicked.bind(this, this.options.nextScreenToGoTo),
            Main.SCREEN_WIDTH - 210,
            0.65);
        this.addChild(this.nextButton);
        $("#embeddedQuestionnaire").hide();
        $("#game-canvas").show();
        $("#bypassInstructions").remove();
        if (this.form.advancesSessionStage)
        {
            this.session.setCurrentSessionElementComplete();
            this.session.saveToDB();
        }
    }
}

EmbeddedGForm.prototype.createScreenText = function (text)
{
    var instructions = new PIXI.Text(text, { align: "center", font: "22px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Math.round(Main.SCREEN_WIDTH / 2,0) ;
    instructions.y = Math.round(Main.SCREEN_HEIGHT / 2 - 100,0);
    this.addChild(instructions);
}

EmbeddedGForm.prototype.createBypassButton = function ()
{
    var self = this;
    $('<p>', {
        text: "When you submit this questionnaire the study should continue automatically. If it does not, then press this button below. Please do not press this button until you have submitted the questionnaire: ",
        id: 'bypassInstructions'
    }).appendTo("#inner");
    $("#bypassInstructions").css({ 'position': 'relative', 'z-index': 3000, 'color': 'white', 'font': '12px Arial', 'line-height': '180%' });

    $('<button/>', {
        text: "Continue",
        id: "bypassButton",
        click: function()
        {
            DBInterface.saveBypassButtonPress(self.session, self.form.name);
            self.hideQuestionnaire();
        }
    }).appendTo("#bypassInstructions");
    $("#bypassButton").css({
        'margin-left': '5px',
        'background-color': '#2dabf9',
        'border-radius': '13px',
        'display': 'inline',
        'color': '#ffffff',
        'font-family': 'Arial',
        'font-size': '12px',
        'padding': '0 25px'
    });
}


   
EmbeddedGForm.prototype.buttonClicked = function (nextScreenToGoTo)
{
    if (this.options.special)
    {
        window.open(this.options.special);
        focus();
    }
    this.moveToScreen = nextScreenToGoTo;
}
