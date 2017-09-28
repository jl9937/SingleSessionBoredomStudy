/////////////////////////////////////Required////////////////////////////////////////
NonGameEngine.prototype = Object.create(Engine.prototype);

function NonGameEngine()
{
    View.call(this);
}

NonGameEngine.prototype.mainLoop = function (speedfactor)
{
    if (this.stimulusSprite !== undefined)
    {
        this.stimulusSprite.x += this.stimulusSprite.vx * speedfactor;
        this.stimulusSprite.alpha += this.stimulusSprite.valpha * speedfactor;

        if(this.stimulusSprite.x < 280 || this.stimulusSprite.x > Main.SCREEN_WIDTH - 280)
            this.stimulusSprite.valpha = -0.08 * speedfactor;
    }
}
/////////////////////////////////////////////////////////////////////////////////

NonGameEngine.prototype.setupTaskBackground = function ()
{
    this.zones = new PIXI.Sprite.fromImage("../resources/taskElements/zones.png");
    this.bluePath = "../resources/taskElements/blue.png";
    this.yellowPath = "../resources/taskElements/yellow.png";
}

NonGameEngine.prototype.setupBlockOnlyVisuals = function ()
{
    this.addChild(this.zones);
    this.addChild(this.progress);
}

NonGameEngine.prototype.getSlowdownText = function ()
{
    return "Keep sorting as fast as you can!";
}

NonGameEngine.prototype.getyAdjustment = function ()
{
    return -40;
}

NonGameEngine.prototype.startAnimation = function (stimulusSprite, direction)
{
    stimulusSprite.vx = direction * 25;
}

NonGameEngine.prototype.setupBreak = function ()
{
    this.removeChild(this.progress);
    this.displayBreak();
}

NonGameEngine.prototype.getBreakText = function ()
{
    return "Block completed:\n\nContinue responding as fast as you can\n\nThe task will continue\nin ";
}

NonGameEngine.prototype.conditionSpecificProcessing = function (trlObj)
{
    
}