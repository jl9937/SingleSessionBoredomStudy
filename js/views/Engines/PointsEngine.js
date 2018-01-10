/////////////////////////////////////Required////////////////////////////////////////
PointsEngine.prototype = Object.create(Engine.prototype);

PointsEngine.BONUSSTREAK = 3;
PointsEngine.SCORETEXTY = Main.SCREEN_HEIGHT / 2 + 200;

function PointsEngine()
{
    View.call(this);
}

PointsEngine.prototype.mainLoop = function (speedfactor)
{
    if (this.stimulusSprite !== undefined)
    {
        this.stimulusSprite.x += this.stimulusSprite.vx * speedfactor;
        this.stimulusSprite.alpha += this.stimulusSprite.valpha * speedfactor;

        if(this.stimulusSprite.x < 280 || this.stimulusSprite.x > Main.SCREEN_WIDTH - 280)
            this.stimulusSprite.valpha = -0.08 * speedfactor;
    }

    if (this.bonusGlow !== null)
    {
        this.bonusGlow.alpha += this.bonusGlow.va;
        if (this.bonusGlow.alpha >= this.bonusGlow.alphaLimit)
            this.bonusGlow.alpha = this.bonusGlow.alphaLimit;
    }
    if (this.bonusGlowRefresh !== null)
    {
        this.bonusGlowRefresh.alpha += this.bonusGlowRefresh.va;
        if (this.bonusGlowRefresh.alpha > 1)
        {
            this.bonusGlowRefresh.alpha = 1;
            this.bonusGlowRefresh.va = -0.05;
        }
    }
    if (this.bonusGlowReset !== null && this.bonusGlowReset !== undefined)
    {
        this.bonusGlowReset.alpha += this.bonusGlowReset.va;
        if (this.bonusGlowReset.alpha > 0.8)
        {
            this.bonusGlowReset.alpha = 0.8;
            this.bonusGlowReset.va = -0.01;
        }
    }

}
/////////////////////////////////////////////////////////////////////////////////

PointsEngine.prototype.setupTaskBackground = function ()
{
    this.zones = new PIXI.Sprite.fromImage("../resources/taskElements/zones.png");
    this.bluePath = "../resources/taskElements/blue.png";
    this.yellowPath = "../resources/taskElements/yellow.png";
    this.Phighscore = 0;
}

PointsEngine.prototype.setupBlockOnlyVisuals = function ()
{
    this.pointsUIElements = new PIXI.Container();

    this.addChild(this.zones);
    this.addChild(this.progress);

    this.highScoreFlasherDisabled = false;
    if (this.session.getBlocksCompleted() === 0)
        this.highScoreFlasherDisabled = true;
    this.Pscore = 0;
    this.Pbonus = 1;
    this.bonusCounter = 0;
    this.bonusAlphaStep = 1 / PointsEngine.BONUSSTREAK;
    this.bonusGlowRefresh = null;

    this.bonusGlow = new PIXI.Sprite.fromImage("../resources/taskElements/bonusGlow.png");
    this.bonusGlow.anchor = new PIXI.Point(0.5, 0.5);
    this.bonusGlow.x = Main.SCREEN_WIDTH / 2;
    this.bonusGlow.y = PointsEngine.SCORETEXTY + 47;
    this.bonusGlow.alpha = 0;
    this.bonusGlow.alphaLimit = 0;
    this.bonusGlow.va = 0.01;


    this.pointsUIElements.addChild(this.bonusGlow);
    this.createPointsText();
    this.addChild(this.pointsUIElements);
}

PointsEngine.prototype.getSlowdownText = function ()
{
    return "Keep sorting as fast as you can!";
}

PointsEngine.prototype.getyAdjustment = function ()
{
    return -40;
}

PointsEngine.prototype.startAnimation = function (stimulusSprite, direction)
{
    stimulusSprite.vx = direction * 25;
}

PointsEngine.prototype.setupBreak = function ()
{
    this.removeChild(this.progress);
    this.removeChild(this.pointsUIElements);
    this.displayContinueChoice();
}

PointsEngine.prototype.postContinueChoice = function()
{
    var self = this;
    var time = Engine.BREAKLENGTH;

    var breakTextContainer = new PIXI.Container();

    var breakTextString1 = "The game will resume in ";
    var breakTextString2 = " seconds.\n\nRemember, sort three balls correctly in a row to grow your multiplier bonus!\nPlease continue responding as fast as you can.";

    var textArray = [
        new PIXI.Text(breakTextString1 + time + breakTextString2,
            { align: "center", font: "30px Arial", fill: "#FFFFFF" }),
        new PIXI.Text("Previous Score", { align: "center", font: "36px Arial Black", fill: "#0094fb" }),
        new PIXI.Text(this.Pscore, { align: "center", font: "45px Arial", fill: "#ffc000" }),
        new PIXI.Text("Current Highscore", { align: "center", font: "36px Arial Black", fill: "#0094fb" }),
        new PIXI.Text(this.Phighscore, { align: "center", font: "65px Arial", fill: "#ffc000", fontWeight: 'bold' }),
        new PIXI.Text("Can you beat your highscore in the next round?",
            { align: "center", font: "36px Arial", fill: "#FFFFFF" })
    ];

    for (var i = 0; i < textArray.length; i++)
    {
        if (i > 0)
            textArray[i].y = textArray[i - 1].y + textArray[i - 1].height + 10;
        else
            textArray[i].y = 0;
        textArray[i].x = Main.SCREEN_WIDTH / 2; 
        textArray[i].anchor = new PIXI.Point(0.5, 0.5);
        breakTextContainer.addChild(textArray[i]);
    }                  
    breakTextContainer.y = Main.SCREEN_HEIGHT / 2 - (textArray[textArray.length-1].y +textArray[textArray.length-1].height)/2 ;

    var countdownText = textArray[0];
    this.addChild(breakTextContainer);        
    Utils.doTimer(1000, updateBreaktext.bind(this, countdownText, 8));


    function updateBreaktext(text, newtime) {
        if (newtime !== -1) {
            countdownText.text = breakTextString1 + newtime + breakTextString2,
                Utils.doTimer(1000, updateBreaktext.bind(self, countdownText, newtime - 1));
        } else {
            this.removeChild(breakTextContainer);
            self.startBlock();
        }
    }


}




PointsEngine.prototype.conditionSpecificProcessing = function (trlObj)
{
    this.calculatePointsAndUpdatePointsText(trlObj);
}

PointsEngine.prototype.createPointsText = function ()
{
    this.PhighscoreText = new PIXI.Text("High Score: " + this.Phighscore, { align: "right", font: "bold 35px Arial", fill: "#FFFFFF" });
    this.PhighscoreText.anchor = new PIXI.Point(1, 0);
    this.PhighscoreText.x = Main.SCREEN_WIDTH - 10;
    this.PhighscoreText.y = 10;
                       
    this.pointsUIElements.addChild(this.PhighscoreText);
    
    var scoretext = new PIXI.Text("Score: " + this.Pscore, { align: "center", font: "bold 60px Arial", fill: "#e3a400" });
    scoretext.anchor = new PIXI.Point(0.5, 0.5);
    scoretext.x = Main.SCREEN_WIDTH / 2;
    scoretext.y = PointsEngine.SCORETEXTY - 10;
    this.PscoreText = scoretext;
    this.pointsUIElements.addChild(scoretext);

    var bonusText = new PIXI.Text("Bonus: x" + this.Pbonus, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    bonusText.anchor = new PIXI.Point(0.5, 0.5);
    bonusText.x = Main.SCREEN_WIDTH / 2;
    bonusText.y = PointsEngine.SCORETEXTY + 45;
    this.PbonusText = bonusText;
    this.pointsUIElements.addChild(bonusText);
}

PointsEngine.prototype.adjustBonusCounter =function(adjustment)
{
    this.bonusCounter += adjustment;
    this.bonusCounter = this.bonusCounter < 0 ? 0 : this.bonusCounter;

    this.bonusGlow.valpha = 0.15;
    this.bonusGlow.alphaLimit = this.bonusAlphaStep * this.bonusCounter;
    
    if (this.bonusCounter >= PointsEngine.BONUSSTREAK)
    {
        this.Pbonus = this.Pbonus + 1;
        this.playerBonusUpgradeAnimation();
        this.adjustBonusCounter(-99);
    }
}

PointsEngine.prototype.calculatePointsAndUpdatePointsText = function (trlObj)
{
    switch (trlObj.calculateScore(this.Pscore, this.Pbonus))
    {
        case -1:
            this.Pbonus = this.Pbonus - 2;
            if (this.Pbonus <= 0)
                this.Pbonus = 1;
            this.adjustBonusCounter(-99);
            this.playerBonusResetAnimation();
            break;
        case 0:
            this.adjustBonusCounter(-99);
            break;
        case 1:
            this.adjustBonusCounter(+1);
            this.showTextForTimeThenClear("+" + trlObj.getTrialPoints(), Engine.LOWITI, Main.SCREEN_HEIGHT / 2 - 55);
            break;
        case 2:
            this.adjustBonusCounter(0);
            break;
    }

    this.Pscore += trlObj.getTrialPoints();
    if (this.Pscore > this.Phighscore)
    {
        this.Phighscore = this.Pscore;
        if (!this.highScoreFlasherDisabled)
        {
            this.showTextForTimeThenClear("New High Score!", 3000, 130);
            this.highScoreFlasherDisabled = true;
        }
    }

    //update all
    this.PbonusText.text = "Bonus: x" + this.Pbonus;
    this.PhighscoreText.text = "High Score: " + this.Phighscore;
    this.PscoreText.text = "Score: " + this.Pscore;
}

PointsEngine.prototype.playerBonusUpgradeAnimation = function ()
{
    var glow = new PIXI.Sprite.fromImage("../resources/taskElements/bonusGlowNew.png");
    glow.anchor = new PIXI.Point(0.5, 0.5);
    glow.x = Main.SCREEN_WIDTH / 2;
    glow.y = PointsEngine.SCORETEXTY + 45;
    glow.alpha = 0.5;
    glow.va = 0.2;
    this.bonusGlowRefresh = glow;
    this.pointsUIElements.addChildAt(glow, 2);
}

PointsEngine.prototype.playerBonusResetAnimation = function ()
{
    var glow = new PIXI.Sprite.fromImage("../resources/taskElements/bonusGlowReset.png");
    glow.anchor = new PIXI.Point(0.5, 0.5);
    glow.x = Main.SCREEN_WIDTH / 2;
    glow.y = PointsEngine.SCORETEXTY + 45;
    glow.alpha = 0;
    glow.va = 0.1;
    this.bonusGlowReset = glow;
    this.pointsUIElements.addChild(glow);
}
