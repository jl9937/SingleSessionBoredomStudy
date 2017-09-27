//These two arrays stop the level specific values for animation in the Theme condition
                           //1      2       3       4       5       6       7       8       9       10
ThemeEngine.THEME_YCUTOFFS = [230, 310, 240, 290, 310, 330, 310, 315, 330, 350];
ThemeEngine.THEME_XVELOCITY = [12.5, 13, 12.5, 12.5, 14.5, 13.5, 14, 13, 13.5, 13.3];
ThemeEngine.THEME_yADJUSTMENT = [10, -30, 5, -35, 10, -10, 0, -16, -10, 0];

/////////////////////////////////////Required////////////////////////////////////////
ThemeEngine.prototype = Object.create(Engine.prototype);

function ThemeEngine()
{
    View.call(this);
}

ThemeEngine.prototype.mainLoop = function (speedfactor)
{
    if (this.stimulusSprite !== undefined)
    {
        this.stimulusSprite.x += this.stimulusSprite.vx * speedfactor;
        this.stimulusSprite.y += this.stimulusSprite.vy * speedfactor;

        this.stimulusSprite.alpha += this.stimulusSprite.valpha * speedfactor;
        this.stimulusSprite.vy += this.stimulusSprite.gravity * speedfactor;

        //check for a position then activate rapid fadeout
        if(this.stimulusSprite.x < 280 || this.stimulusSprite.x > Main.SCREEN_WIDTH - 280)
            this.stimulusSprite.valpha = -0.08 * speedfactor;
        if (this.stimulusSprite.y > Main.SCREEN_HEIGHT - Engine.THEME_YCUTOFFS[this.session.levelNum])
            this.stimulusSprite.alpha = 0;
    }
}
/////////////////////////////////////////////////////////////////////////////////

ThemeEngine.prototype.setupForCondition = function ()
{
    this.zones = new PIXI.Sprite.fromImage(Main.themeAssets[0]);
    this.overlayer = new PIXI.Sprite.fromImage("../resources/theme/themeMisc/overlayer.png");
    this.bluePath = Main.themeAssets[1];
    this.yellowPath = Main.themeAssets[2];
}

ThemeEngine.prototype.setBlockForCondition = function (first)
{
    if (this.darkener)
        this.removeChild(this.darkener);

    this.addChild(this.zones);
    this.addChild(this.overlayer);
    this.addChild(this.progress);
    this.runBlock(first);
}

ThemeEngine.prototype.getSlowdownText = function()
{
    return "Don't drop the pace Commander!";
}

ThemeEngine.prototype.getyAdjustment =function()
{
    return Engine.THEME_yADJUSTMENT[this.session.levelNum];
}

ThemeEngine.prototype.startAnimation = function (stimulusSprite, direction)
{
    stimulusSprite.gravity = 1.5;
    stimulusSprite.vx = direction * ThemeEngine.THEME_XVELOCITY[this.session.levelNum];
    stimulusSprite.vy = -17;
}

ThemeEngine.prototype.setupBreakForCondition = function()
{
    this.removeChild(this.progress);
    this.darkener = new PIXI.Sprite.fromImage("../resources/interface/themeDarkener.png");
    this.addChild(this.darkener);
    this.displayBreak();
}

ThemeEngine.prototype.getBreaktext = function()
{
    return  "Round completed:\n\nContinue sorting as fast as you can\n\nThe game will continue\nin ";
}