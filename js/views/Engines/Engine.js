Engine.LOWITI = 300;
Engine.HIGHITI = 700;

Engine.FIXATION = 500;
Engine.STIMULI_DUR = 900;
Engine.SUBBLOCKS = 4;
Engine.BREAKLENGTH = 10;

Engine.TRIALLIMIT = 2;
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

    //setup taask parameters
    this.overallTrialNum = 0;
    this.staircases = [
        new Staircase(100, 0.5), new Staircase(200, 0.5), new Staircase(300, 0.5), new Staircase(400, 0.5)
    ];

    this.currentSubBlockSumRT = 0;
    this.baseSubBlockAverageRT = 1000;

    this.progress = new PIXI.Sprite.fromImage("../resources/interface/markout.png");
    this.progress.y = 5;
    this.progress.height = 5;
    this.setupTaskBackground();
    this.startBlock(1);
};

Engine.prototype.setupBasics = function()
    {};
/////////////////////////////////////////////////////////////////////////////////

Engine.prototype.startBlock = function(first)
{
    longFramesSinceStart = 0;
    this.setupBlockOnlyVisuals();
    this.blockTrialNum = 0;
    this.progress.width = 0;
    this.trialArray = getTrialsForBlock(first);

    this.runTrialorBreakorEndTask();
};

Engine.prototype.runTrialorBreakorEndTask = function()
{
    if (this.blockTrialNum < Engine.TRIALLIMIT && this.blockTrialNum < this.trialArray.length)
        this.startTrial(this.trialArray[this.blockTrialNum]);
    else
        this.setupBreak();
};

Engine.prototype.startTrial = function(trialType)
{
    //Subblock RT shift?
    if (this.overallTrialNum % 16 === 15)
    {
        var currentAVRT = this.currentSubBlockSumRT / 16;
        console.log("Current Av:",
            currentAVRT,
            "Limit:",
            this.baseSubBlockAverageRT + 30,
            "Lastsubblock:",
            this.baseSubBlockAverageRT);
        if (currentAVRT >= this.baseSubBlockAverageRT + 30)
            this.showTextForTimeThenClear(this.getSlowdownText(), 3000, 130);
        this.baseSubBlockAverageRT = currentAVRT;
        this.currentSubBlockSumRT = 0;
    }

    var trlObj = new Trial(this.session,
        this.overallTrialNum,
        this.blockTrialNum,
        this.session.getOptionalBlocksCompleted(),
        trialType,
        this.staircases,
        this.bluePath,
        this.yellowPath);
    this.showForTimeThenCallback("../resources/taskElements/fixation.png",
        Engine.FIXATION,
        this.openResponseWindow.bind(this, trlObj),
        this.getyAdjustment());
};


Engine.prototype.openResponseWindow = function(trlObj)
{
    trlObj.startTiming();
    this.stimulusSprite = this.dispTrialThenCallback(trlObj, this.closeResponseWindow.bind(this, trlObj));

    var left = keyboard(37);
    var right = keyboard(39);
    var processResponse = this.processResponse.bind(this);
    var self = this;

    left.press = function()
    {
        deleteKeyboards([left, right]);
        if (processResponse(trlObj, "Y"))
            self.startAnimation(self.stimulusSprite, -1); //the parameter indicates direction
    };
    right.press = function()
    {
        deleteKeyboards([left, right]);
        if (processResponse(trlObj, "B"))
            self.startAnimation(self.stimulusSprite, 1);
    };

    if (trlObj.isStopTrial())
        Utils.doTimer(trlObj.getSSD(),
            this.showForTimeThenCallback.bind(this,
                "../resources/taskElements/stopsignal.png",
                Engine.STIMULI_DUR - trlObj.getSSD(),
                null,
                this.getyAdjustment()));
};

Engine.prototype.dispTrialThenCallback = function(trlObj, callback)
{
    //stimulus displayed here
    if (trlObj && trlObj.isStopTrial() && trlObj.wasStopTrialHidden())
        return null;
    if (trlObj && trlObj.isStopTrial())
        trlObj.setStopTrialShown();
    return this.showForTimeThenCallback(trlObj.getStimulusPath(),
        Engine.STIMULI_DUR,
        callback,
        this.getyAdjustment(),
        300);
};

Engine.prototype.closeResponseWindow = function(trlObj)
{
    if (trlObj.wasNoResponse())
        this.processResponse(trlObj, "none");

    trlObj.saveToDB(this.db, this.session);
    this.showForTimeThenCallback("../resources/taskElements/transparent.png",
        trlObj.getITIDuration(),
        this.finishTrial.bind(this, trlObj));
};

Engine.prototype.processResponse = function(trlObj, keypressed)
{
    if (!trlObj.isResponseWindowOpen())
        return false;

    var correct = trlObj.stopTimingAndGetCorrect(keypressed);

    if (trlObj.isStopTrial())
        this.staircases[trlObj.getStaircaseNumber()].adjust(correct);
    if (!trlObj.wasNoResponse())
        this.currentSubBlockSumRT += trlObj.getResponseTime();
    this.conditionSpecificProcessing(trlObj);

    return true;
};

Engine.prototype.finishTrial = function()
{
    this.overallTrialNum++;
    this.blockTrialNum++;

    this.progress.width = Main.SCREEN_WIDTH / (Engine.SUBBLOCKS * 16) * this.blockTrialNum;
    this.runTrialorBreakorEndTask();
};

//todo limit this from happening more than 8 times or whatever it is
Engine.prototype.displayContinueChoice = function()
{
    this.removeChild(this.zones);
    this.removeChild(this.progress);
    this.session.blockComplete();

    var self = this;
    var choiceTextString =
        "Block completed!\n\n\nYou are free to end today's session now if you wish.\n\nAlternatively, you may complete another two-minute round of testing and earn an additional " +
            this.session.getBlockRewardString() +
            ".\n\nWould you like to continue?";
    var breakText = new PIXI.Text(choiceTextString,
        { align: "center", font: "30px Arial", fill: "#FFFFFF", wordWrapWidth: Main.WORD_WRAP_WIDTH, wordWrap: true });
    breakText.x = Main.SCREEN_WIDTH / 2;
    breakText.y = Main.SCREEN_HEIGHT / 2;
    breakText.anchor = new PIXI.Point(0.5, 0.5);


    var quitButton = new ClickButton("No",
        this.endTask.bind(this),
        { 'yPos': Main.SCREEN_HEIGHT - 100, 'xPos': breakText.x + 200, 'up_colour': 0xd72c2c });
    var continueButton = new ClickButton("Yes",
        function()
        {
            self.removeChild(breakText);
            self.removeChild(continueButton);
            self.removeChild(quitButton);
            self.postContinueChoice();
        },
        { 'yPos': Main.SCREEN_HEIGHT - 100, 'xPos': breakText.x - 200, 'up_colour': 0x2cd744 });

    this.addChild(continueButton);
    this.addChild(quitButton);
    this.addChild(breakText);
};

Engine.prototype.endTask = function()
{
    this.session.setCurrentSessionElementComplete();
    this.moveToScreen = this.nextScreenToGoTo;
};



//////////////////////////////////////////////////Generic Display Functions/////////////////////////////////////////////////
Engine.prototype.clearPicture = function(sprite, callback, fadeTime)
{
    var self = this;

    //todo animateNicely
    if (fadeTime !== 0 && sprite.vx !== 0)
    {
        sprite.valpha = -0.008;
        Utils.doTimer(fadeTime, finalClear.bind(this));
    } else
        finalClear();
    typeof callback === "function" ? callback() : true;

    function finalClear()
    {
        self.removeChild(sprite);
    }
};

Engine.prototype.showTextForTimeThenClear = function(text, time, yPos)
{
    var textObject = new PIXI.Text(text, { align: "center", font: "bold 30px Arial", fill: "#FFFFFF" });
    textObject.anchor = new PIXI.Point(0.5, 0.5);
    textObject.x = Main.SCREEN_WIDTH / 2;
    textObject.y = yPos;
    this.addChild(textObject);
    var outer = this;
    Utils.doTimer(time, function() { outer.removeChild(textObject); });
};

Engine.prototype.showForTimeThenCallback = function(picture, time, callback, _yadjustment, _fadeTime)
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
};

////////////////////////Get Trials for Block/////////////////////

function getTrialsForBlock(first)
{
    first = first || 0;
    var firstsubblockInit = [
    "gB", "gB", "gB", "gB", "gB", "gB", "gB", "gB",
    "gY", "gY", "gY", "gY", "gY", "gY", "gY", "gY"
    ];
    var subblockInit = [
        "gB", "sB1", "gB", "gB", "gB", "sY3", "gB", "gB",
        "gY", "sY0", "gY", "gY", "sB2", "gY", "gY", "gY"
    ];
    var allTrials = [];
    for (var i = 0; i < Engine.SUBBLOCKS; i++)
    {
        var subblockCopy = subblockInit.slice();
        if (first)
            subblockCopy = firstsubblockInit.slice();
        subblockCopy = shuffleArray(shuffleArray(subblockCopy));
        subblockCopy = shuffleArray(shuffleArray(subblockCopy));
        subblockCopy = shuffleArray(shuffleArray(subblockCopy));
        subblockCopy = shuffleArray(shuffleArray(subblockCopy));
        allTrials.push.apply(allTrials, subblockCopy);
        first = 0;
    }
    return allTrials;

    function shuffleArray(array)
    {
        for (var i = 0; i < array.length; i++)
        {
            var swapIndex = i + Math.floor(Math.random() * (array.length - i));
            var temp = array[i];
            array[i] = array[swapIndex];
            array[swapIndex] = temp;
        }
        return array;
    }
}