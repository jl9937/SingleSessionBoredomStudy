//This is the login screen. Handles the creation of the login interface and the login process itself.

MainMenu.prototype = Object.create(View.prototype);

function MainMenu(nextpage, _session)
{
    View.call(this);
    this.nextScreenToGoTo = nextpage;
    this.session = _session;
    this.condition = this.session.condition;
}

MainMenu.prototype.create = function(stage, session)
{
    this.createBasic(stage, session);

    if (this.session.condition === Main.CONDITION_THEME)
    {
        this.backgroundFile = "themeLoginBackground.jpg";
        this.createBackground();
    }
    else if (this.session.condition === Main.CONDITION_POINTS)
    {
        this.backgroundFile = "pointsbackground.png";
        this.createBackground();
    }

    this.createBottomBar();
    this.createMainMenu();
    this.displayed = true;

    if (this.condition === Main.CONDITION_POINTS)
        this.createPointsDetails();

};

MainMenu.prototype.createPointsDetails = function ()
{
    var instructions = new PIXI.Text("How well can you control your actions?", { align: "center", font: "20px Verdana", fill: "#FFFFFF", stroke: "#000000", strokeThickness: 3, mitrelimit: 20 });
    instructions.anchor = new PIXI.Point(0.5, 0);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = 140;
    this.addChild(instructions);

    this.balls = [];
    this.createBallLoop(0);
}

MainMenu.prototype.createBallLoop = function (slot)
{
    if (this.displayed === true)
    {

        var ball = new FallingBall(this);
        this.addChildAt(ball, 4);
        this.balls[slot] = ball;

        var timeout = Math.floor(Math.random() * 4000) + 800;
        setTimeout(this.createBallLoop.bind(this, (slot + 1 % 8)), timeout);
    }
}
MainMenu.prototype.mainLoop = function ()
{
    if (this.condition === Main.CONDITION_POINTS)
    {
        for (var i = 0 ; i < this.balls.length; i++)
            this.balls[i].update();
    }
}

MainMenu.prototype.createBottomBar = function()
{
    var sprite = new PIXI.Sprite.fromImage("../resources/interface/bottombar.png");
    sprite.x = 0;
    sprite.y = 689;
    this.addChild(sprite);
};
MainMenu.prototype.createMainMenu = function()
{
    this.createTitleText();
    this.createUserDataText(Main.SCREEN_HEIGHT / 2 - 118);

    var trainingWeekOver = false;

    if ((Date.today() > new Date.parseExact(this.session.getTrainingEndDateString(), "dd-MM-yyyy")) || this.session.getParticipantStage() === Session.STAGE_FINALTEST)
        trainingWeekOver = true;
    if(this.session.getParticipantStage() === Session.STAGE_FINALTEST && Date.today() >= new Date.parseExact(this.session.getEndDateString(), "dd-MM-yyyy"))
        trainingWeekOver = false;

   
    var startButton;
    if (this.session.getCompletionLevel() === Session.COMPLETE_NOTHING && !trainingWeekOver)
        startButton = new ClickButton(Main.SCREEN_HEIGHT / 2, "Begin", this.buttonClicked.bind(this, this.nextScreenToGoTo), 0,0.8);
    else if (this.session.getCompletionLevel() === Session.COMPLETE_ALL || trainingWeekOver)
    {
        startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, "Begin", this.buttonClicked.bind(this, this.nextScreenToGoTo), 0, 0.8);
        startButton.disable();
    }
    else
        startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, "Continue", this.buttonClicked.bind(this, this.session.getNextSessionElementScreenName()), 0, 0.8);
    
    var secondBlocky = Main.SCREEN_HEIGHT / 2 + 170;

    var linkExplanation = new PIXI.Text("The link below is your UNIQUE link to the study, please make a note of it. If you forget the link for any reason, simply come back to this page through Prolific Academic",
        { align: "center", font: "17px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: Main.WORD_WRAP_WIDTH });

   


    //todo ad the history button back in
    linkExplanation.x = Math.round(Main.SCREEN_WIDTH / 2, 0) - Math.round(linkExplanation.width / 2, 0);
    linkExplanation.y = secondBlocky;
    

    

    var options2 = { text: { font: "15px Arial" }, valign: "middle", borderRadius: 0, borderWidth: 2, backgroundColor: "#d9d9d9", readonly: true, padding: 10, width: 600 }
    //this.link = new PIXI.Input(options2, 1);

    var solidBox = PIXI.Texture.fromImage("../resources/interface/textBackground.png");

    //todo make this readonly somehow
    this.link = new PIXI.UI.TextInput({
        value: Main.URL + "/task.html?prolific_pid=" + this.session.getID(),
        style: { fill: '#000000', fontSize: 15, fontFamily: 'Arial', align:'center' },
        background: new PIXI.UI.Sprite(solidBox),
        width: 600,
        height: 35,
        padding: 5,
        tabIndex: 1,
        multiLine: false,
        lineHeight: 27
    });
    
    //textInput.on("focusChanged", function (focus)
    //{
    //    textInput.background.alpha = focus ? 0.4 : 0.2;
    //});
//    textInput.on("change", function ()
//    {
//        //console.log("Change:", this.value);
//    });
    //this.addChild(this.link);

    this.link.x = Main.SCREEN_WIDTH / 2 - this.link.width / 2;
    this.link.y = secondBlocky + 65;


    var self = this;
    var copytoclipboard = new ClickButton(secondBlocky + 140, "Copy link", function ()
    {
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.style.display = 'hidden';
        dummy.setAttribute("id", "dummy_id");
        document.getElementById("dummy_id").value = self.link.value;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }, 0, 0.36);


    var downloadInstructions = new ClickButton(Main.SCREEN_HEIGHT / 2 + 90, "Instructions", function ()
    {
        window.open("/task_instructions.pdf");
        focus();
    }, 0, 0.8);

    var uiStage = new PIXI.UI.Stage(window.innerWidth, window.innerHeight);
    uiStage.minHeight = 315;
    uiStage.minWidth = 500;

    var container = new PIXI.UI.Container();
    container.anchorBottom = container.anchorTop = container.anchorRight = container.anchorLeft = 10;
    container.minHeight = 285;
    container.addChild(this.link);

    uiStage.addChild(container);
    this.addChild(uiStage);



    this.addChild(downloadInstructions);
    this.addChild(linkExplanation);
    this.addChild(copytoclipboard);
    //this.addChild(this.link);
    this.addChild(startButton);
};

MainMenu.prototype.createUserDataText = function(y)
{
    var self = this;
    DBInterface.getParticipantDetails(this.session.id,
        function(details)
        {
            var text = "User ID: " + self.session.id + "\nSessions Completed: " + details.sessionsCompleted + "\nReimbursement due: " + formatMoney(details.moneyEarned);
            text = text + self.session.getMainMenuText();

            var dataText = new PIXI.Text(text, { align: "center", font: "17px Arial", fill: "#FFFFFF" });
            dataText.x = Main.SCREEN_WIDTH / 2;
            dataText.anchor = new PIXI.Point(0.5, 0);
            dataText.y = Math.round(y - (dataText.height / 2));
            self.addChild(dataText);
        });
};
MainMenu.prototype.createTitleText = function()
{
    var instructions = new PIXI.Text(this.titleText, { align: "center", font: "100px Verdana", fill: "#ffc000", stroke: "#000000", strokeThickness: 8, mitrelimit: 20 });
    instructions.anchor = new PIXI.Point(0.5, 0);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = 20;
    this.addChild(instructions);
};

