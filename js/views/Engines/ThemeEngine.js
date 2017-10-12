/////////////////////////////////////Required////////////////////////////////////////
ThemeEngine.prototype = Object.create(Engine.prototype);

function ThemeEngine()
{
    View.call(this);
    this.themeHolder = new ThemeHolder();
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
        if (this.stimulusSprite.y > Main.SCREEN_HEIGHT - this.themeHolder.data.yCutOff)
            this.stimulusSprite.alpha = 0;
    }
}
/////////////////////////////////////////////////////////////////////////////////

ThemeEngine.prototype.setupTaskBackground = function ()
{
    this.zones = new PIXI.Sprite.fromImage(this.themeHolder.data.background);
    this.overlayer = new PIXI.Sprite.fromImage("../resources/theme/themeMisc/overlayer.png");
    this.bluePath = this.themeHolder.data.bluePath;
    this.yellowPath = this.themeHolder.data.yellowPath;
}

ThemeEngine.prototype.setupBlockOnlyVisuals = function ()
{
    if (this.darkener)
        this.removeChild(this.darkener);

    this.addChild(this.zones);
    this.addChild(this.overlayer);
    this.addChild(this.progress);
}

ThemeEngine.prototype.getSlowdownText = function()
{
    return "Don't drop the pace Commander!";
}

ThemeEngine.prototype.getyAdjustment =function()
{
    return this.themeHolder.data.yAdjustment;
}

ThemeEngine.prototype.startAnimation = function (stimulusSprite, direction)
{
    stimulusSprite.gravity = 1.5;
    stimulusSprite.vx = direction * this.themeHolder.data.xVelocity;
    stimulusSprite.vy = -17;
}

ThemeEngine.prototype.setupBreak = function()
{
    this.removeChild(this.progress);
    this.darkener = new PIXI.Sprite.fromImage("../resources/interface/themeDarkener.png");
    this.addChild(this.darkener);
    this.displayContinueChoice();
}

ThemeEngine.prototype.getBreakText = function()
{
    return  "Round completed:\n\nContinue sorting as fast as you can\n\nThe game will continue\nin ";
}

ThemeEngine.prototype.conditionSpecificProcessing = function(trlObj)
{         
}

ThemeEngine.prototype.postContinueChoice = function () {
    var self = this;
    var choiceTextString =
        "Good to hear you're still on board Commander!\n\nSadly the world is still is a right mess, so where would you like to sort out next?";
    var breakText = new PIXI.Text(choiceTextString,
        { align: "center", font: "30px Arial", fill: "#FFFFFF", wordWrapWidth: Main.WORD_WRAP_WIDTH, wordWrap: true });
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;
    breakText.anchor = new PIXI.Point(0.5, 0.5);

    var left = this.themeHolder.getNextLevelChoice();
    var right = this.themeHolder.getNextLevelChoice();

    var leftChoice =null, rightChoice = null;

    leftChoice = new ClickButton(this.themeHolder.getLevelname(left), function()
    {
        self.removeChild(rightChoice);
        self.removeChild(leftChoice);
        self.removeChild(breakText);
        self.themeHolder.setLevelChoice(left, right, self.displayLevelText.bind(self));  
    },
        { 'yPos': Main.SCREEN_HEIGHT - 200, 'xPos': breakText.x + 200, 'up_colour': 0x8c69ef });

    rightChoice = new ClickButton(this.themeHolder.getLevelname(right), function () {
        self.removeChild(rightChoice);
        self.removeChild(leftChoice);
            self.removeChild(breakText);
        self.themeHolder.setLevelChoice(right, left, self.displayLevelText.bind(self));},
        { 'yPos': Main.SCREEN_HEIGHT - 200, 'xPos': breakText.x - 200, 'up_colour': 0xefa569 });

    this.addChild(leftChoice);
    this.addChild(rightChoice);
    this.addChild(breakText);
}

ThemeEngine.prototype.displayLevelText = function()
{
    var self = this;
    //Set Level here:
    this.bluePath = this.themeHolder.data.bluePath;
    this.yellowPath = this.themeHolder.data.yellowPath;
    this.zones = new PIXI.Sprite.fromImage(this.themeHolder.data.background);
    this.overlayer = new PIXI.Sprite.fromImage("../resources/theme/themeMisc/overlayer.png");


    var instructions = new PIXI.Text(this.themeHolder.data.screenText,
        { align: "center", font: "28px Arial", fill: "#FFFFFF", wordWrapWidth: Main.WORD_WRAP_WIDTH, wordWrap: true });
    instructions.anchor = new PIXI.Point(0.5, 0.5);
    instructions.x = Main.SCREEN_WIDTH / 2;
    instructions.y = Main.SCREEN_HEIGHT / 2 - 50;

    var mainimage = new PIXI.Sprite.fromImage("../resources/interface/textspace.png");
    mainimage.height = 730;
    mainimage.width = 1024;

    this.addChild(this.zones);
    this.removeChild(this.darkener);
    this.addChild(mainimage);
    this.addChild(instructions);

    var button = this.addChild(new ClickButton("Begin!",
        function () {
            self.removeChild(self.zones);
            self.removeChild(button);
            self.removeChild(instructions);
            self.removeChild(mainimage);
            self.startBlock();
        }));
}
