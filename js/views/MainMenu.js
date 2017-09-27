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

    if (this.session.getCondition() === Main.CONDITION_THEME)
    {
        this.backgroundFile = "themeLoginBackground.jpg";
        this.createBackground();
    }
    else if (this.session.getCondition() === Main.CONDITION_POINTS)
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
MainMenu.prototype.mainLoop = function (speedfactor)
{
    if (this.condition === Main.CONDITION_POINTS)
    {
        for (var i = 0 ; i < this.balls.length; i++)
            this.balls[i].update(speedfactor);
    }
}

MainMenu.prototype.createMainMenu = function()
{
    this.createTitleText();
    this.createUserDataText(Main.SCREEN_HEIGHT / 2 - 118);
    
    var startButton;
    if (this.session.getCompletionLevel() === Session.COMPLETE_NOTHING)
        startButton = new ClickButton(Main.SCREEN_HEIGHT / 2, "Begin", this.buttonClicked.bind(this, this.nextScreenToGoTo), 0,0.8);
    else if (this.session.getCompletionLevel() === Session.COMPLETE_ALL)
    {
        startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, "Begin", this.buttonClicked.bind(this, this.nextScreenToGoTo), 0, 0.8);
        startButton.disable();
    }
    else
        startButton = new ClickButton(Main.SCREEN_HEIGHT / 2 + 20, "Continue", this.buttonClicked.bind(this, this.session.getNextSessionElementScreenName()), 0, 0.8);

    var downloadInstructions = new ClickButton(Main.SCREEN_HEIGHT / 2 + 90, "Instructions", function ()
    {
        window.open("/task_instructions.pdf");
        focus();
    }, 0, 0.8);

    this.addChild(downloadInstructions);
    this.addChild(startButton);
};

MainMenu.prototype.createUserDataText = function(y)
{
    var self = this;
    DBInterface.getParticipantDetails(this.session.id,
        function()
        {
            var text = "User ID: " + self.session.participant.getID() + "\nSessions Completed: " + self.session.participant.getSessionsCompleted() + "\nReimbursement due: " + formatMoney(self.session.participant.getMoneyEarned());
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

