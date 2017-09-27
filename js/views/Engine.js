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
    this.setupForCondition();
    this.setBlockForCondition(1);
}

Engine.prototype.setupBasics = function ()
{
    this.overallTrialNum = 0;
    this.blockNum = 0;
    this.staircases = [new Staircase(200, 0.5), new Staircase(300, 0.5), new Staircase(400, 0.5), new Staircase(450, 0.5)];

    this.progress = new PIXI.Sprite.fromImage("../resources/interface/markout.png");
    this.progress.y = 5;
    this.progress.height = 5;

    this.currentSubBlockSumRT = 0;
    this.baseSubBlockAverageRT = 1000;
}


//bug sorting animation sometimes doesn't render on chrome Version 50.0.2661.86 (64-bit) (non-game mode)
//bug check with hardware acceleration off and on on chrome

Engine.prototype.mainLoop = function (speedfactor)
{
    if (this.stimulusSprite !== undefined)
    {
        this.stimulusSprite.x += this.stimulusSprite.vx * speedfactor;
        this.stimulusSprite.y += this.stimulusSprite.vy * speedfactor;

        this.stimulusSprite.alpha += this.stimulusSprite.valpha * speedfactor;
        this.stimulusSprite.vy += this.stimulusSprite.gravity * speedfactor;

        //check for a position then activate rapid fadeout
        if(this.stimulusSprite.x < 280 || this.stimulusSprite.x > Main.SCREEN_WIDTH - 280)
            this.stimulusSprite.valpha = -0.08;
        if (this.stimulusSprite.y > Main.SCREEN_HEIGHT - Engine.THEME_YCUTOFFS[this.session.levelNum])
            this.stimulusSprite.alpha = 0;

    }
}
/////////////////////////////////////////////////////////////////////////////////

Engine.prototype.runBlock = function(first)
{
    this.blockTrialNum = 0;
    this.trialArray = getTrialsForBlock(first);

    if (this.blockTrialNum < Engine.TRIALLIMIT && this.blockTrialNum < this.trialArray.length)
        this.startTrial(this.trialArray[this.blockTrialNum]);
    else
    {
        //console.log("block complete");
        this.blockNum++;
        if (this.blockNum === Engine.BLOCKS)
        {
            //console.log("Task complete");
            if (this.condition === Main.CONDITION_POINTS)
                this.session.score = this.Pscore;
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
    var trialObject = new Trial(this.session.id, this.overallTrialNum, this.blockTrialNum, this.blockNum, colour, stimulus, stopTrial, SSD, trialType[2], ITIDuration);


    this.displayStimulusThenCallback("../resources/taskElements/fixation.png", Engine.FIXATION, this.openResponseWindow.bind(this, trialObject, this.getyAdjustment()), this.getyAdjustment());
}


Engine.prototype.openResponseWindow = function (trialObject, yAdjustment)
{
    trialObject.responseWindowOpen = true;
    trialObject.RTTimingStart = +Date.now();
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
        doTimer(trialObject.SSD, this.displayStimulusThenCallback.bind(this, "../resources/taskElements/stopsignal.png", (Engine.STIMULI_DUR - trialObject.SSD), null, yAdjustment, trialObject));
}

Engine.prototype.displayStimulusThenCallback = function (picture, time, callback, yAdjustment, _trialObject)
{
    var trialObject = _trialObject || null;
    if (trialObject && trialObject.stopTrial === 1 && trialObject.stopTrialVisibility === -1)
        return null;
    showForTimeThenThenCallback(picture, time, callback, yAdjustment);
    if (trialObject && trialObject.stopTrial === 1)
        trialObject.stopTrialVisibility = 1;
    return sprite;
}

Engine.prototype.startAnimation = function (stimulusSprite, direction)
{
    if (this.session.getCondition() !== Main.CONDITION_THEME)
        stimulusSprite.vx = direction * 25;
    else
    {
        stimulusSprite.gravity = 1.5;
        stimulusSprite.vx = direction * Engine.THEME_XVELOCITY[this.session.levelNum];
        stimulusSprite.vy = -17;
    }
}

Engine.prototype.closeResponseWindow = function (trialObject)
{
    if (trialObject.responseTime === -1)
        this.processResponse(trialObject, "none");

    if (this.condition === Main.CONDITION_POINTS)
        this.calculatePointsAndUpdatePointsText(trialObject);

    trialObject.saveToDB(this.db, this.session);
    this.displayStimulusThenCallback("../resources/taskElements/transparent.png", trialObject.ITIDuration, this.finishTrial.bind(this, trialObject));
}

Engine.prototype.processResponse = function (trialObject, keypressed)
{
    if (trialObject.responseWindowOpen === false)
    {
        //console.log("response window not open?");
        return false;
    }

    var correct = false;

    if (keypressed !== "none")
    {
        var datenow = +Date.now();
        var RT = datenow - trialObject.RTTimingStart;
        this.currentSubBlockSumRT += RT;
    }
    //console.log(keypressed + ": RT: " + datenow + "-" + trialObject.RTTimingStart + "=" + RT + "  S:" + trialObject.stopTrial);

    if (trialObject.stopTrial === 1)
    {
        if (keypressed === "none")
        {
            correct = true;
        } else
        {
            //this should only be set before the brackets appear
            if (trialObject.stopTrialVisibility === 0 )
                trialObject.stopTrialVisibility = -1;
        }
        this.staircases[(trialObject.staircase)].adjust(correct);
    }
    else if (trialObject.stopTrial !== 1 && trialObject.colour === keypressed)
    {
        correct = true;
    }
    
    trialObject.setResponse(keypressed, RT, correct);
    trialObject.responseWindowOpen = false;

    return true;
}

Engine.prototype.finishTrial = function (trialObject)
{
    this.overallTrialNum++;
    this.blockTrialNum++;

    this.progress.width = (Main.SCREEN_WIDTH / (Engine.BLOCKS * Engine.SUBBLOCKS * 16)) * this.overallTrialNum;
    this.runBlock();
}

Engine.prototype.displayBreak = function ()
{
    this.removePointsText();
    var time = Engine.BREAKLENGTH;
    var breakText = new PIXI.Text(this.getBreakText() + time + " seconds",
                                   { align: "center", font: "30px Arial", fill: "#FFFFFF" });
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;
    breakText.anchor = new PIXI.Point(0.5, 0.5);
    this.addChild(breakText);


    doTimer(1000, updateBreaktext.bind(this, breakText, 9));
    function updateBreaktext(text, time)
    {
        if (time !== -1)
        {
            breakText.text = this.getBreakText() + time + " seconds";
            doTimer(1000, updateBreaktext.bind(this, breakText, time - 1));
        } else
        {
            this.removeChild(breakText);
            this.createBlock();
        }
    }
}


//////////////////////////////////////////////////Generic Display Functions/////////////////////////////////////////////////


Engine.prototype.clearPicture = function (sprite, callback)
{
    this.removeChild(sprite);
    typeof callback == "function" ? callback() : true;
}

Engine.prototype.showTextForTimeThenClear = function (text, time, yPos)
{
    var textObject = new PIXI.Text(text, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    textObject.anchor = new PIXI.Point(0.5, 0.5);
    textObject.x = Main.SCREEN_WIDTH / 2;
    textObject.y = yPos;
    this.addChild(textObject);
    var outer = this;
    doTimer(time, function () { outer.removeChild(textObject) });
}

Engine.prototype.showForTimeThenThenCallback = function (picture, time, callback, _yadjustment)
{
    var yadjustment = _yadjustment || 0;
    var sprite = new PIXI.Sprite.fromImage(picture);
    sprite.anchor = new PIXI.Point(0.5, 0.5);
    sprite.y = Main.SCREEN_HEIGHT / 2 + yadjustment;
    sprite.x = Main.SCREEN_WIDTH / 2;
    sprite.vx = sprite.vy = sprite.gravity = sprite.valpha = 0;

    this.addChild(sprite);
    doTimer(time, this.clearPicture.bind(this, sprite, callback));

    return sprite;
}
