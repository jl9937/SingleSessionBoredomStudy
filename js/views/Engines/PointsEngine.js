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
}

PointsEngine.prototype.setupBlockOnlyVisuals = function ()
{
    this.addChild(this.zones);
    this.addChild(this.progress);
    
    this.Phighscore = 0;
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


    this.addChild(this.bonusGlow);
    this.createPointsText();
    
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
    this.displayBreak();
}

PointsEngine.prototype.getBreakText = function ()
{
    return "Round completed:\n\nContinue responding as fast as you can\nRemember, sort three balls correctly in a\nrow to grow your multiplier bonus!\n\nThe game will continue\nin ";
}

PointsEngine.prototype.conditionSpecificProcessing = function (trlObj)
{
    this.calculatePointsAndUpdatePointsText(trlObj);
}

PointsEngine.prototype.createPointsText = function ()
{
    var highscoretext = new PIXI.Text("High Score: " + this.Phighscore, { align: "right", font: "bold 35px Arial", fill: "#FFFFFF" });
    highscoretext.anchor = new PIXI.Point(1, 0);
    highscoretext.x = Main.SCREEN_WIDTH - 10;
    highscoretext.y = 10;

    this.PhighscoreText = highscoretext;
    this.PhighscoreText.text = "High Score: " + 0;
    this.Phighscore = 0;
    this.addChild(highscoretext);
    
    var scoretext = new PIXI.Text("Score: " + this.Pscore, { align: "center", font: "bold 60px Arial", fill: "#e3a400" });
    scoretext.anchor = new PIXI.Point(0.5, 0.5);
    scoretext.x = Main.SCREEN_WIDTH / 2;
    scoretext.y = PointsEngine.SCORETEXTY - 10;
    this.PscoreText = scoretext;
    this.addChild(scoretext);

    var bonusText = new PIXI.Text("Bonus: x" + this.Pbonus, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    bonusText.anchor = new PIXI.Point(0.5, 0.5);
    bonusText.x = Main.SCREEN_WIDTH / 2;
    bonusText.y = PointsEngine.SCORETEXTY + 45;
    this.PbonusText = bonusText;
    this.addChild(bonusText);
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
    }

    this.Pscore += trlObj.getTrialPoints();
    if (this.Pscore > this.Phighscore)
    {
        this.Phighscore = this.Pscore;
        this.session.newHighscore = this.Pscore;
    }

    //update all
    this.PbonusText.text = "Bonus: x" + this.Pbonus;
    this.PhighscoreText.text = "High Score: " + this.Phighscore;
    this.PscoreText.text = "Score: " + this.Pscore;
}

PointsEngine.prototype.removePointsText = function ()
{
    this.removeChild(this.PhighscoreText);
    this.removeChild(this.PbonusText);
    this.removeChild(this.PscoreText);
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
    this.addChildAt(glow, 2);
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
    this.addChild(glow);
}
