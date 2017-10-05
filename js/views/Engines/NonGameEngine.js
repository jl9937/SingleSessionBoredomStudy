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
    this.displayContinueChoice();
}

NonGameEngine.prototype.conditionSpecificProcessing = function (trlObj)
{
    
}

NonGameEngine.prototype.postContinueChoice = function ()
{
    var self = this;
    var time = Engine.BREAKLENGTH;

    var breakTextString1 = "The task will resume in "
    var breakTextString2 = " seconds.\n\nPlease continue responding as fast as you can.";
    var breakText = new PIXI.Text(breakTextString1 + time + breakTextString2, 
        { align: "center", font: "30px Arial", fill: "#FFFFFF" });
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;
    breakText.anchor = new PIXI.Point(0.5, 0.5);
    this.addChild(breakText);

    Utils.doTimer(1000, updateBreaktext.bind(this, breakText, 9));
    function updateBreaktext(text, newtime) {
        if (newtime !== -1) {
            breakText.text = breakTextString1 + newtime + breakTextString2, 
                Utils.doTimer(1000, updateBreaktext.bind(self, breakText, newtime - 1));
        } else {
            self.removeChild(breakText);
            self.startBlock();
        }
    }
}

