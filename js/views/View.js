View.prototype = Object.create(PIXI.Container.prototype);

//Generic View class for a screen on the site
//Handles the generic functions of each screen like construction, deconstruction, and placing a title at the top of the screen.
//Inherits pixi container
function View()
{
    PIXI.Container.call(this);
    this.moveToScreen = -1;
}

View.prototype.createBasic = function (stage, _session)
{
    stage.addChild(this);
    this.session = _session || this.session;

    this.setSkin(this.session);
    this.createBackground();

    this.displayed = true;
}

View.prototype.deconstruct = function (stage)
{
    this.removeChildren();
    stage.removeChild(this);
 
    this.session = null;
    this.displayed = false;
    this.moveToScreen = -1;
}

View.prototype.mainLoop = function (delta)
{
    return;
}

View.prototype.CheckIfMoveToNextScreen = function ()
{
    return this.moveToScreen;
}

View.prototype.createBackground = function ()
{
    var background = new PIXI.Sprite.fromImage("../resources/interface/" + this.backgroundFile);
    this.addChild(background);
}

View.prototype.buttonClicked = function (nextScreenToGoTo)
{
    this.moveToScreen = nextScreenToGoTo;
}

View.prototype.resize = function()
{
    
}

View.prototype.setSkin = function (session)
{
    if (session.getCondition() === Main.CONDITION_NONGAME)
    {
        this.titleText = "Stop Signal Task";
        this.startButtonText = "Start"; this.startButtonText = "Start";
        this.historyButtonText = "View History";
        this.backgroundFile = "background.png"; this.backgroundFile = "background.png";
    }
    else if (session.getCondition() === Main.CONDITION_POINTS)
    {
        this.titleText = "STOPMASTER";
        this.startButtonText = "Start Game";
        this.historyButtonText = "View History";
        this.backgroundFile = "background.png";
    }
    else if (session.getCondition() === Main.CONDITION_THEME)
    {
        this.titleText = "Packathon";
        this.startButtonText = "Start Game";
        this.historyButtonText = "See Map";
        this.backgroundFile = "themeBackground.png";
    }
}

View.prototype.createBottomBar = function ()
{
    var sprite = new PIXI.Sprite.fromImage("../resources/interface/bottombar.png");
    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
    sprite.scale.x = Main.SCREEN_WIDTH / sprite.width;
    sprite.scale.y = sprite.scale.x;
    sprite.x = 0;
    sprite.y = Main.SCREEN_HEIGHT - sprite.height;
    this.addChild(sprite);
};