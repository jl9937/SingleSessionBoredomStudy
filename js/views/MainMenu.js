﻿//This is the login screen. Handles the creation of the login interface and the login process itself.

MainMenu.prototype = Object.create(View.prototype);

function MainMenu(nextpage, _session)
{
    View.call(this);
    this.nextScreenToGoTo = nextpage;
    this.session = _session;
    this.condition = this.session.getCondition();
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

    var startButtony = Main.SCREEN_HEIGHT / 2 + 20;

    if (this.session.getCompletionLevel() === Session.COMPLETED_NOTHING)
        startButton = new ClickButton("Begin", this.buttonClicked.bind(this, this.nextScreenToGoTo), { yPos: startButtony });
    else
        startButton = new ClickButton("Continue", this.buttonClicked.bind(this, this.session.getNextSessionElementScreenName()), { yPos: startButtony });
    if (this.session.getCompletionLevel() === Session.COMPLETED_ALL)
        startButton.disable();
    
    var downloadInstructions = new ClickButton("Study Information", function ()
    {
        window.open("/task_instructions.pdf");
        focus();
    }, { yPos: startButtony + 145});

    this.addChild(downloadInstructions);
    this.addChild(startButton);
};

MainMenu.prototype.createUserDataText = function(y)
{
    var urlid = getUrlVars(["prolific_pid"]);
    urlid = urlid.prolific_pid;
    var text = "User ID: " + urlid + "\nSessions Completed: " + this.session.participant.getSessionsCompleted();
    text = text + this.session.getMainMenuText();

    var dataText = new PIXI.Text(text, { align: "center", font: "16px Arial", fill: "#FFFFFF" });
    dataText.x = Main.SCREEN_WIDTH / 2;
    dataText.anchor = new PIXI.Point(0.5, 0);
    dataText.y = Math.round(y - (dataText.height / 2));
    this.addChild(dataText);
};

MainMenu.prototype.createTitleText = function()
{
    var instructions = new PIXI.Text(this.titleText, { align: "center", font: "100px Verdana", fill: "#ffc000", stroke: "#000000", strokeThickness: 8, mitrelimit: 20 });
    instructions.anchor = new PIXI.Point(0.5, 0);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = 20;
    this.addChild(instructions);
};

