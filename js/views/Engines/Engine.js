Engine.LOWITI = 500;
Engine.HIGHITI = 1000;

Engine.FIXATION = 500;
Engine.STIMULI_DUR = 900;
Engine.BLOCKS = 5;
Engine.SUBBLOCKS = 3;
Engine.BREAKLENGTH = 10;
Engine.BONUSSTREAK = 3;
Engine.SCORETEXTY = Main.SCREEN_HEIGHT / 2 + 200;


Engine.TRIALLIMIT = 1000;
Engine.ALLSTOP = 0;

/////////////////////////////////////Required////////////////////////////////////////
Engine.prototype = Object.create(View.prototype);
function Engine(_condition)
{
    View.call(this);
    this.condition = _condition;
}
Engine.prototype.create = function(stage, db, session)
{
    this.createBasic(stage, db, session);
    this.setupBasics();
    this.setupTaskBackground();
    this.setupBlock(1);
    this.blockTrialNum = 0;
    this.trialArray = getTrialsForBlock(1);

    this.runTrial();
}

Engine.prototype.setupBasics = function ()
{
    this.overallTrialNum = 0;
    this.blockNum = 0;
    this.staircases = [new Staircase(150, 0.5), new Staircase(250, 0.5), new Staircase(350, 0.5), new Staircase(400, 0.5)];

    this.progress = new PIXI.Sprite.fromImage("../resources/interface/markout.png");
    this.progress.y = 5;
    this.progress.height = 5;

    this.currentSubBlockSumRT = 0;
    this.baseSubBlockAverageRT = 1000;
}
/////////////////////////////////////////////////////////////////////////////////

Engine.prototype.runTrial = function()
{
    if (this.blockTrialNum < Engine.TRIALLIMIT && this.blockTrialNum < this.trialArray.length)
        this.startTrial(this.trialArray[this.blockTrialNum]);
    else
    {
        this.blockNum++;
        if (this.blockNum === Engine.BLOCKS)
        {
            this.session.endOfSession();
            this.moveToScreen = "POSTTASK";
        }
        else
            this.displayBreak();
    }
}

Engine.prototype.startTrial = function (trialType)
{
    //Subblock shift
    if (this.overallTrialNum % 16 === 15)
    {
        var currentAVRT = this.currentSubBlockSumRT / 16;
        console.log("Current Av:", currentAVRT, "Limit:", this.baseSubBlockAverageRT + 30, "Lastsubblock:", this.baseSubBlockAverageRT);
        if (currentAVRT >= this.baseSubBlockAverageRT + 30)
            this.showTextForTimeThenClear(this.getSlowdownText(), 3000, 130);
        this.baseSubBlockAverageRT = currentAVRT;
        this.currentSubBlockSumRT = 0;
    }

    //////////////Set up trial//////////////
    var stopTrial = 0;
    var SSD = -1;
    if (trialType[0] === "s")
    {
        stopTrial = 1;
        SSD = this.staircases[trialType[2]].getSSD();
    }
    var stimulus = trialType[1] === "Y" ? this.yellowPath : this.bluePath;
    var colour = trialType[1];
    var ITIDuration = Math.floor(Math.random() * (Engine.HIGHITI - Engine.LOWITI)) + Engine.LOWITI;
    //todo build all this into the Trial object generation, so it's neater
    var trialObject = new Trial(this.session.getID(), this.overallTrialNum, this.blockTrialNum, this.blockNum, colour, stimulus, stopTrial, SSD, trialType[2], ITIDuration, this.session);


    this.showForTimeThenThenCallback("../resources/taskElements/fixation.png", Engine.FIXATION, this.openResponseWindow.bind(this, trialObject, this.getyAdjustment()), this.getyAdjustment());
}


Engine.prototype.openResponseWindow = function (trialObject, yAdjustment)
{
    trialObject.startTiming();
    var stimulusSprite = this.stimulusSprite = this.displayStimulusThenCallback(trialObject.stimulusPath, Engine.STIMULI_DUR, this.closeResponseWindow.bind(this, trialObject), yAdjustment); //stimulus displayed here

    var left = keyboard(37);
    var right = keyboard(39);
    var processResponse = this.processResponse.bind(this);
    var self = this;
    left.press = function ()
    {
        deleteKeyboards([left, right]);
        if (processResponse(trialObject, "Y"))
            self.startAnimation(stimulusSprite, -1); //the parameter indicates direction
    };
    right.press = function ()
    {
        deleteKeyboards([left, right]);
        if(processResponse(trialObject, "B"))
            self.startAnimation(stimulusSprite, 1);
    };
    if (trialObject.stopTrial === 1)
        Utils.doTimer(trialObject.SSD, this.showForTimeThenThenCallback.bind(this, "../resources/taskElements/stopsignal.png", (Engine.STIMULI_DUR - trialObject.SSD), null, yAdjustment));
}

Engine.prototype.displayStimulusThenCallback = function (picture, time, callback, yAdjustment, _trialObject)
{
    var trialObject = _trialObject || null;
    if (trialObject && trialObject.stopTrial === 1 && trialObject.stopTrialVisibility === -1)
        return null;
    if (trialObject && trialObject.stopTrial === 1)
        trialObject.stopTrialVisibility = 1;
    return this.showForTimeThenThenCallback(picture, time, callback, yAdjustment, 300);
}

Engine.prototype.startAnimation = function (stimulusSprite, direction)
{
    stimulusSprite.vx = direction * 25;
}

Engine.prototype.closeResponseWindow = function (trialObject)
{
    console.log("Closed");
    if (trialObject.responseTime === -1)
        this.processResponse(trialObject, "none");

    trialObject.saveToDB(this.db, this.session);
    this.displayStimulusThenCallback("../resources/taskElements/transparent.png", trialObject.ITIDuration, this.finishTrial.bind(this, trialObject));
}

Engine.prototype.processResponse = function (trialObject, keypressed)
{
    if (trialObject.responseWindowOpen === false)
        return false;

    var correct = trialObject.stopTimingAndGetCorrect(keypressed);

    if (trialObject.stopTrial)
        this.staircases[(trialObject.staircase)].adjust(correct);
    if (trialObject.responseTime !== -1)
        this.currentSubBlockSumRT += trialObject.responseTime;

    return true;
}

Engine.prototype.finishTrial = function (trialObject)
{
    this.overallTrialNum++;
    this.blockTrialNum++;

    this.progress.width = (Main.SCREEN_WIDTH / (Engine.BLOCKS * Engine.SUBBLOCKS * 16)) * this.overallTrialNum;
    this.runTrial();
}

Engine.prototype.displayBreak = function ()
{
    var time = Engine.BREAKLENGTH;
    var breakText = new PIXI.Text(this.getBreakText() + time + " seconds",
                                   { align: "center", font: "30px Arial", fill: "#FFFFFF" });
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;
    breakText.anchor = new PIXI.Point(0.5, 0.5);
    this.addChild(breakText);


    Utils.doTimer(1000, updateBreaktext.bind(this, breakText, 9));
    function updateBreaktext(text, time)
    {
        if (time !== -1)
        {
            breakText.text = this.getBreakText() + time + " seconds";
            Utils.doTimer(1000, updateBreaktext.bind(this, breakText, time - 1));
        } else
        {
            this.removeChild(breakText);
            this.createBlock();
        }
    }
}


//////////////////////////////////////////////////Generic Display Functions/////////////////////////////////////////////////


Engine.prototype.clearPicture = function (sprite, callback, fadeTime)
{
    var self = this;

    //todo animateNicely
    if (fadeTime !== 0 && sprite.vx !== 0)
    {
        sprite.valpha = -0.008;
        Utils.doTimer(fadeTime, finalClear.bind(this));
    }
    else
        finalClear();
    typeof callback == "function" ? callback() : true;

    function finalClear()
    {
        self.removeChild(sprite);
    }
}

Engine.prototype.showTextForTimeThenClear = function (text, time, yPos)
{
    var textObject = new PIXI.Text(text, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    textObject.anchor = new PIXI.Point(0.5, 0.5);
    textObject.x = Main.SCREEN_WIDTH / 2;
    textObject.y = yPos;
    this.addChild(textObject);
    var outer = this;
    Utils.doTimer(time, function () { outer.removeChild(textObject) });
}

Engine.prototype.showForTimeThenThenCallback = function (picture, time, callback, _yadjustment, _fadeTime)
{
    var yadjustment = _yadjustment || 0;
    var fadeTime = _fadeTime || 0;
    var sprite = new PIXI.Sprite.fromImage(picture);
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.y = Main.SCREEN_HEIGHT / 2 + yadjustment;
    sprite.x = Main.SCREEN_WIDTH / 2;
    sprite.vx = sprite.vy = sprite.gravity = sprite.valpha = 0;

    this.addChild(sprite);
    Utils.doTimer(time, this.clearPicture.bind(this, sprite, callback, fadeTime));

    return sprite;
}
