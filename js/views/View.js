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

    this.setSkin();
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

View.prototype.mainLoop = function ()
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

View.prototype.setSkin = function ()
{
        this.titleText = "Emotion Recognition and\nWell-being Study";
        this.startButtonText = "Start";
        this.backgroundFile = "background.png";
}